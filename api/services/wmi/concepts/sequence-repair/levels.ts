// Level ladder for sequence-repair. Two axes the schema already carries: what
// kind of damage the child has to repair (missing term → intruder to throw out
// → a run hidden behind dots that must be COUNTED) and how hard the underlying
// rule is to read (one steady step → two interleaved families).
// Every level runs through the concept's own `isSound`, so the ambiguity proofs
// (single possible repair, no duplicate terms, terms inside 0–100) still hold;
// a hand-checked sound fallback covers the rare case where sampling misses.
import type { Rng } from '../types.js'
import { cleanTerms, isSound } from './index.js'
import type { Params } from './index.js'

const UP = 'up' as const

/** L1: skip-count by 1, 2 or 5 up to 30, one interior term missing. */
function level1(rng: Rng): Params {
  const step = rng.pick([1, 2, 5] as const)
  const length = 5
  const span = (length - 1) * step
  const start = step * rng.int(1, Math.floor((30 - span) / step))
  return {
    rule: { kind: 'arithmetic', start, step, direction: UP },
    length,
    defect: { kind: 'interior-blank', at: rng.int(1, length - 2) },
  }
}

/** L2: same repair, but bigger steps, longer run, and it may count DOWN. */
function level2(rng: Rng): Params {
  const length = rng.int(6, 7)
  const step = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10] as const)
  const span = (length - 1) * step
  const direction = rng.int(1, 4) === 1 ? ('down' as const) : UP
  const start = direction === UP ? rng.int(0, 100 - span) : rng.int(span, 100)
  return {
    rule: { kind: 'arithmetic', start, step, direction },
    length,
    defect: { kind: 'interior-blank', at: rng.int(1, length - 2) },
  }
}

/** L3: nothing is missing — an extra number hides in order and must be found. */
function level3(rng: Rng): Params | null {
  const length = rng.int(5, 7)
  const step = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10] as const)
  const span = (length - 1) * step
  const start = rng.int(0, 100 - span)
  const at = rng.int(1, length - 1)
  const seed: Params = {
    rule: { kind: 'arithmetic', start, step, direction: UP },
    length,
    defect: { kind: 'intruder', at, value: 0 },
  }
  // Wedged strictly between its neighbours, so only the step exposes it.
  const value = cleanTerms(seed)[at - 1] + rng.int(1, step - 1)
  return { ...seed, defect: { kind: 'intruder', at, value } }
}

/** L4: dots swallow a stretch — the answer is HOW MANY terms are hidden. */
function level4(rng: Rng): Params {
  const count = rng.int(2, 4)
  const length = rng.int(count + 4, 9)
  const step = rng.pick([1, 2, 3, 4, 5, 10] as const)
  const span = (length - 1) * step
  return {
    rule: { kind: 'arithmetic', start: rng.int(0, 100 - span), step, direction: UP },
    length,
    defect: { kind: 'hidden-run', from: rng.int(2, length - count - 2), count },
  }
}

/** L5: two families take turns, so the rule must be split before it is used. */
function level5(rng: Rng): Params | null {
  const length = rng.int(6, 8)
  const nA = Math.ceil(length / 2)
  const nB = Math.floor(length / 2)
  const stepA = rng.pick([1, 2, 3, 4, 5] as const)
  const startA = rng.int(1, 9)
  const stepB = rng.pick([6, 7, 8, 9, 10] as const)
  const startB = startA + (nA - 1) * stepA + rng.int(2, 12)
  if (startB + (nB - 1) * stepB > 100) return null
  const rule = { kind: 'interleaved' as const, startA, stepA, startB, stepB }
  if (rng.int(1, 10) <= 7) {
    return { rule, length, defect: { kind: 'interior-blank', at: rng.int(1, length - 2) } }
  }
  const at = rng.int(1, length - 1)
  const clean = cleanTerms({ rule, length, defect: { kind: 'intruder', at, value: 0 } })
  const value = clean[rng.int(1, 2) === 1 ? at - 1 : at] + rng.pick([-3, -2, -1, 1, 2, 3] as const)
  if (value < 0 || value > 100) return null
  // An intruder must belong to NEITHER family, otherwise it is a legal term.
  if (Math.abs(value - startA) % stepA === 0) return null
  if (Math.abs(value - startB) % stepB === 0) return null
  return { rule, length, defect: { kind: 'intruder', at, value } }
}

// Hand-checked sound puzzles, one per level, used only if sampling misses.
const FALLBACK: Record<1 | 2 | 3 | 4 | 5, Params> = {
  1: { rule: { kind: 'arithmetic', start: 2, step: 2, direction: UP }, length: 5, defect: { kind: 'interior-blank', at: 2 } },
  2: { rule: { kind: 'arithmetic', start: 10, step: 5, direction: UP }, length: 7, defect: { kind: 'interior-blank', at: 3 } },
  3: { rule: { kind: 'arithmetic', start: 5, step: 5, direction: UP }, length: 5, defect: { kind: 'intruder', at: 2, value: 11 } },
  4: { rule: { kind: 'arithmetic', start: 2, step: 2, direction: UP }, length: 8, defect: { kind: 'hidden-run', from: 2, count: 2 } },
  5: { rule: { kind: 'interleaved', startA: 2, stepA: 2, startB: 20, stepB: 8 }, length: 6, defect: { kind: 'interior-blank', at: 2 } },
}

export function sequenceRepairLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const attempt = { 1: level1, 2: level2, 3: level3, 4: level4, 5: level5 }[level]
  for (let i = 0; i < 60; i++) {
    const candidate = attempt(rng)
    if (candidate && isSound(candidate)) return candidate
  }
  return FALLBACK[level]
}
