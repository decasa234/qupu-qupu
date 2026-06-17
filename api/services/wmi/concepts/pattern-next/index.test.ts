import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { render } from './index.js'

describe('pattern-next', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(3))).toEqual(concept.generate(mulberry32(3)))
  })

  test('100 seeds: paramsSchema valid, answer label is in choices, correct value matches', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
      // The answer choice text must be a positive integer
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(Number(answerChoice?.text)).toBeGreaterThan(0)
    }
  })

  // ── arithmetic mode ──────────────────────────────────────────────────────────

  test('arithmetic: next term = start + 3*step', () => {
    const r = render({ mode: 'arithmetic', start: 3, step: 4 })
    // seq: 3, 7, 11 → next: 15
    const answerText = (r.choices_en ?? []).find((c) => c.label === r.answer)?.text
    expect(answerText).toBe('15')
  })

  // ── second-diff mode ─────────────────────────────────────────────────────────

  test('second-diff: 1, 3, 7, 13 → next is 21 (answer label A)', () => {
    // start=1, diff0=2, diffStep=2
    // gaps: 2, 4, 6, 8
    // seq:  1, 3, 7, 13, ? = 21
    const r = render({ mode: 'second-diff', start: 1, diff0: 2, diffStep: 2 })
    const answerText = (r.choices_en ?? []).find((c) => c.label === r.answer)?.text
    expect(answerText).toBe('21')
    // The answer is placed first in values array, so label must be 'A'
    expect(r.answer).toBe('A')
  })

  test('second-diff: gaps 3,5,7 → next gap 9', () => {
    // start=2, diff0=3, diffStep=2
    // seq: 2, 5, 10, 17, ? = 17+9 = 26
    const r = render({ mode: 'second-diff', start: 2, diff0: 3, diffStep: 2 })
    const answerText = (r.choices_en ?? []).find((c) => c.label === r.answer)?.text
    expect(answerText).toBe('26')
  })

  // ── alt-rule mode ────────────────────────────────────────────────────────────

  test('alt-rule: ×2 then +3 alternating — 2, 4, 7, 14 → next is 17', () => {
    // start=2, mulK=2, addK=3
    // steps: ×2→4, +3→7, ×2→14, +3→17
    const r = render({ mode: 'alt-rule', start: 2, addK: 3, mulK: 2 })
    const answerText = (r.choices_en ?? []).find((c) => c.label === r.answer)?.text
    expect(answerText).toBe('17')
    expect(r.answer).toBe('A')
  })

  test('alt-rule: ×3 then +4 — 1, 3, 7, 21 → next is 25', () => {
    // start=1, mulK=3, addK=4
    // steps: ×3→3, +4→7, ×3→21, +4→25
    const r = render({ mode: 'alt-rule', start: 1, addK: 4, mulK: 3 })
    const answerText = (r.choices_en ?? []).find((c) => c.label === r.answer)?.text
    expect(answerText).toBe('25')
  })

  // ── breakdown consistency ────────────────────────────────────────────────────

  test('breakdown answer.value matches render answer (all modes)', () => {
    const cases = [
      { mode: 'arithmetic' as const, start: 5, step: 3 },
      { mode: 'second-diff' as const, start: 1, diff0: 2, diffStep: 2 },
      { mode: 'alt-rule' as const, start: 2, addK: 3, mulK: 2 },
    ]
    for (const p of cases) {
      const r = render(p)
      expect(r.breakdown?.answer.value).toBe(r.answer)
    }
  })

  test('breakdown phrases are substrings of the body (all modes)', () => {
    const cases = [
      { mode: 'arithmetic' as const, start: 5, step: 3 },
      { mode: 'second-diff' as const, start: 1, diff0: 2, diffStep: 2 },
      { mode: 'alt-rule' as const, start: 2, addK: 3, mulK: 2 },
    ]
    for (const p of cases) {
      const r = render(p)
      for (const h of r.breakdown?.highlights ?? []) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })
})
