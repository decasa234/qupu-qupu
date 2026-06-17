import { describe, expect, test } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { render, answer } from './index.js'

describe('visual-pattern-next', () => {
  // ── Backward-compat ────────────────────────────────────────────────────────

  test('answer() projects cycle for flat (legacy) params', () => {
    // Existing assertion from new-g1-g2-concepts.test.ts — must not regress.
    // cycle=['circle','triangle'], shown=5: 5 % 2 = 1 → 'triangle'
    expect(answer({ cycle: ['circle', 'triangle'], shown: 5 })).toBe('triangle')
  })

  // ── simple mode ────────────────────────────────────────────────────────────

  test('simple: render projects cycle correctly', () => {
    // cycle=['circle','triangle'], shown=5: 5 % 2 = 1 → triangle → label B
    const r = render({ mode: 'simple', cycle: ['circle', 'triangle'], shown: 5 })
    expect(r.answer).toBe('B')
    const choice = r.choices_en?.find((c) => c.label === r.answer)
    expect(choice?.text).toBe('△')
  })

  test('simple: answer label is in choices', () => {
    const r = render({ mode: 'simple', cycle: ['circle', 'square'], shown: 6 })
    // 6 % 2 = 0 → circle → label A
    expect(r.answer).toBe('A')
    expect(r.choices_en?.map((c) => c.label)).toContain(r.answer)
  })

  // ── long-cycle mode ────────────────────────────────────────────────────────

  test('long-cycle: 3-shape cycle, shown 7 → index 1 → triangle → label B', () => {
    // cycle=['circle','triangle','square'], shown=7: 7 % 3 = 1 → triangle → B
    const r = render({ mode: 'long-cycle', cycle: ['circle', 'triangle', 'square'], shown: 7 })
    expect(r.answer).toBe('B')
    const choice = r.choices_en?.find((c) => c.label === r.answer)
    expect(choice?.text).toBe('△')
  })

  test('long-cycle: 4-shape cycle, shown 9 → index 1', () => {
    // cycle=['circle','triangle','square','star'], shown=9: 9 % 4 = 1 → triangle → B
    const r = render({ mode: 'long-cycle', cycle: ['circle', 'triangle', 'square', 'star'], shown: 9 })
    expect(r.answer).toBe('B')
  })

  test('long-cycle: body contains the sequence row', () => {
    const r = render({ mode: 'long-cycle', cycle: ['circle', 'square', 'triangle'], shown: 7 })
    expect(r.body_en).toContain('?')
    expect(r.body_en).toContain('Find')
  })

  // ── two-attr mode ──────────────────────────────────────────────────────────

  test('two-attr: correct answer is always label A (placed first)', () => {
    // cycle=[{circle,red},{triangle,blue},{square,red}], shown=7
    // 7 % 3 = 1 → {triangle, blue} → "blue △"
    // Correct is placed at index 0 → label A
    const r = render({
      mode: 'two-attr',
      cycle: [
        { shape: 'circle', colour: 'red' },
        { shape: 'triangle', colour: 'blue' },
        { shape: 'square', colour: 'red' },
      ],
      shown: 7,
    })
    expect(r.answer).toBe('A')
    const correctChoice = r.choices_en?.find((c) => c.label === 'A')
    expect(correctChoice?.text).toBe('blue △')
  })

  test('two-attr: 2-item cycle, shown=6 → index 0', () => {
    // cycle=[{circle,red},{triangle,blue}], shown=6: 6 % 2 = 0 → {circle,red} → "red ○"
    const r = render({
      mode: 'two-attr',
      cycle: [
        { shape: 'circle', colour: 'red' },
        { shape: 'triangle', colour: 'blue' },
      ],
      shown: 6,
    })
    expect(r.answer).toBe('A')
    const correctChoice = r.choices_en?.find((c) => c.label === 'A')
    expect(correctChoice?.text).toBe('red ○')
  })

  test('two-attr: body contains the "?" marker', () => {
    const r = render({
      mode: 'two-attr',
      cycle: [
        { shape: 'circle', colour: 'green' },
        { shape: 'star', colour: 'yellow' },
      ],
      shown: 6,
    })
    expect(r.body_en).toContain('?')
    expect(r.body_id).toContain('?')
  })

  test('two-attr: exactly 4 choices, all distinct', () => {
    const r = render({
      mode: 'two-attr',
      cycle: [
        { shape: 'circle', colour: 'red' },
        { shape: 'triangle', colour: 'blue' },
        { shape: 'square', colour: 'green' },
      ],
      shown: 8,
    })
    expect(r.choices_en).toHaveLength(4)
    const texts = r.choices_en!.map((c) => c.text)
    expect(new Set(texts).size).toBe(4)
  })

  // ── breakdown consistency ──────────────────────────────────────────────────

  test('breakdown answer.value matches render answer (all modes)', () => {
    const cases: Parameters<typeof render>[0][] = [
      { mode: 'simple', cycle: ['circle', 'triangle'], shown: 5 },
      { mode: 'long-cycle', cycle: ['circle', 'triangle', 'square'], shown: 7 },
      {
        mode: 'two-attr',
        cycle: [
          { shape: 'circle', colour: 'red' },
          { shape: 'triangle', colour: 'blue' },
        ],
        shown: 6,
      },
    ]
    for (const p of cases) {
      const r = render(p)
      expect(r.breakdown?.answer.value).toBe(r.answer)
    }
  })

  test('breakdown highlights are substrings of body (simple + long-cycle)', () => {
    const cases: Parameters<typeof render>[0][] = [
      { mode: 'simple', cycle: ['circle', 'triangle'], shown: 5 },
      { mode: 'long-cycle', cycle: ['circle', 'triangle', 'square'], shown: 7 },
    ]
    for (const p of cases) {
      const r = render(p)
      for (const h of r.breakdown?.highlights ?? []) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  // ── seed loop: every generated instance is valid ───────────────────────────

  test('100 seeds: paramsSchema valid, unique correct answer label in choices', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      // All labels distinct
      expect(new Set(labels).size).toBe(labels.length)
      // Answer label is present in choices
      expect(labels).toContain(r.answer)
      // Exactly 4 choices
      expect(labels).toHaveLength(4)
    }
  })

  test('determinism: same seed → same params', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })
})
