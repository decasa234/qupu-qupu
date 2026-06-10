// Unit tests for the pure batching pieces of the konsep session commit
// (P1.5). The critical invariant: applyAnswers(prev, seq) MUST produce the
// exact same state as N sequential single-answer upsertConceptProgress
// calls — verified against an independent oracle that transcribes the
// pre-batching per-call math verbatim.

import { describe, it, expect } from 'vitest'
import { computeComprehension } from './comprehension.js'
import {
  EMPTY_PROGRESS,
  applyAnswers,
  type ConceptProgressState,
  type ConceptProgressNext,
} from './conceptProgress.js'
import { groupResultsBySlug } from './session.js'

// ── Oracle: the OLD single-answer upsert math, verbatim ────────────────────
// (read row → recent.slice(-10) → computeComprehension → GREATEST guards).
const RECENT_KEEP = 10

function oracleStep(prev: ConceptProgressState, isCorrect: boolean): ConceptProgressNext {
  const recent = [...(prev.recent ?? []), isCorrect].slice(-RECENT_KEEP)
  const attempts = prev.attempts + 1
  const correct = prev.correct + (isCorrect ? 1 : 0)
  const c = computeComprehension({ attempts, correct, recent })
  return {
    attempts,
    correct,
    recent,
    best_tier: Math.max(prev.best_tier, c.tier),
    comprehension_pct: Math.max(prev.comprehension_pct, c.pct),
    current_streak: c.streak,
  }
}

function oracleSequential(prev: ConceptProgressState, results: boolean[]): ConceptProgressNext {
  let state: ConceptProgressNext = { ...prev, current_streak: 0 }
  for (const r of results) state = oracleStep(state, r)
  return state
}

// Deterministic PRNG so the property-style sweep is reproducible.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('applyAnswers', () => {
  it('matches a single oracle step for one answer', () => {
    for (const isCorrect of [true, false]) {
      expect(applyAnswers(EMPTY_PROGRESS, [isCorrect])).toEqual(
        oracleStep(EMPTY_PROGRESS, isCorrect),
      )
    }
  })

  it('matches N sequential single applications for fixed sequences', () => {
    const sequences: boolean[][] = [
      [],
      [true],
      [false],
      [true, true, true, true, true],
      [false, false, false, false],
      [true, false, true, false, true, false, true, false],
      Array.from({ length: 20 }, (_, i) => i % 3 !== 0),
      Array.from({ length: 20 }, () => true),
    ]
    for (const seq of sequences) {
      expect(applyAnswers(EMPTY_PROGRESS, seq)).toEqual(oracleSequential(EMPTY_PROGRESS, seq))
    }
  })

  it('property sweep: random prev states + sequences match sequential oracle', () => {
    const rand = mulberry32(20260610)
    for (let trial = 0; trial < 200; trial++) {
      const prevAttempts = Math.floor(rand() * 30)
      const prevCorrect = Math.floor(rand() * (prevAttempts + 1))
      const prevRecent = Array.from(
        { length: Math.min(prevAttempts, Math.floor(rand() * (RECENT_KEEP + 1))) },
        () => rand() < 0.6,
      )
      const prevComp = computeComprehension({
        attempts: prevAttempts, correct: prevCorrect, recent: prevRecent,
      })
      const prev: ConceptProgressState = {
        attempts: prevAttempts,
        correct: prevCorrect,
        recent: prevRecent,
        // Seed bests at or above the current computation, like a real row.
        best_tier: Math.min(4, prevComp.tier + (rand() < 0.3 ? 1 : 0)),
        comprehension_pct: Math.min(100, prevComp.pct + Math.floor(rand() * 10)),
      }
      const seq = Array.from({ length: Math.floor(rand() * 21) }, () => rand() < 0.5)

      expect(applyAnswers(prev, seq)).toEqual(oracleSequential(prev, seq))
    }
  })

  it('keeps the PEAK tier/pct when the recent window slides back down', () => {
    // 8 correct in a row → mahir (tier 3); then 7 wrong → raw tier drops,
    // but best_tier / comprehension_pct must hold the peak (monotonic).
    const up = applyAnswers(EMPTY_PROGRESS, Array.from({ length: 8 }, () => true))
    expect(up.best_tier).toBe(3)

    const seq = [
      ...Array.from({ length: 8 }, () => true),
      ...Array.from({ length: 7 }, () => false),
    ]
    const down = applyAnswers(EMPTY_PROGRESS, seq)
    expect(down.best_tier).toBe(3)
    expect(down.comprehension_pct).toBeGreaterThanOrEqual(up.comprehension_pct)
    // And still identical to sequential application.
    expect(down).toEqual(oracleSequential(EMPTY_PROGRESS, seq))
  })

  it('caps recent at the keep window', () => {
    const out = applyAnswers(EMPTY_PROGRESS, Array.from({ length: 25 }, () => true))
    expect(out.recent).toHaveLength(RECENT_KEEP)
    expect(out.attempts).toBe(25)
    expect(out.correct).toBe(25)
  })

  it('does not mutate the previous state', () => {
    const prev: ConceptProgressState = {
      attempts: 3, correct: 2, recent: [true, false, true], best_tier: 1, comprehension_pct: 20,
    }
    const frozen = JSON.parse(JSON.stringify(prev))
    applyAnswers(prev, [true, false, true, true])
    expect(prev).toEqual(frozen)
  })
})

describe('groupResultsBySlug', () => {
  it('groups interleaved answers per slug, preserving in-session order', () => {
    const graded = [
      { conceptSlug: 'a', isCorrect: true },
      { conceptSlug: 'b', isCorrect: false },
      { conceptSlug: 'a', isCorrect: false },
      { conceptSlug: 'c', isCorrect: true },
      { conceptSlug: 'b', isCorrect: true },
      { conceptSlug: 'a', isCorrect: true },
    ]
    const grouped = groupResultsBySlug(graded)
    expect([...grouped.keys()]).toEqual(['a', 'b', 'c']) // first-touch order
    expect(grouped.get('a')).toEqual([true, false, true])
    expect(grouped.get('b')).toEqual([false, true])
    expect(grouped.get('c')).toEqual([true])
  })

  it('returns an empty map for no answers', () => {
    expect(groupResultsBySlug([]).size).toBe(0)
  })

  it('grouped fold equals per-answer fold across concepts (commute check)', () => {
    // Applying each concept's grouped sequence must equal replaying the
    // whole session answer-by-answer per concept — the exact claim the
    // batched commit relies on.
    const rand = mulberry32(42)
    const slugs = ['x', 'y', 'z']
    const session = Array.from({ length: 20 }, () => ({
      conceptSlug: slugs[Math.floor(rand() * slugs.length)],
      isCorrect: rand() < 0.5,
    }))

    // Batched: group then one fold per concept.
    const grouped = groupResultsBySlug(session)
    const batched = new Map(
      [...grouped].map(([slug, seq]) => [slug, applyAnswers(EMPTY_PROGRESS, seq)]),
    )

    // Old loop: one oracle step per answer in session order.
    const sequential = new Map<string, ConceptProgressNext>()
    for (const a of session) {
      const prev = sequential.get(a.conceptSlug) ?? { ...EMPTY_PROGRESS, current_streak: 0 }
      sequential.set(a.conceptSlug, oracleStep(prev, a.isCorrect))
    }

    expect(batched).toEqual(sequential)
  })
})
