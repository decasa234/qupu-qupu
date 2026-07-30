import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { LABELS, answerLabel, distractorValues, optionValues } from './index.js'

// What the child actually sees: the "Find:" / "Cari:" section label is stripped
// by the renderer and the blank lines collapse to single spaces. Highlight
// phrases must match THIS, not the raw body. (Mirrors stripSectionLabels for
// the two labels this stem uses; the SSR smoke checks the real thing.)
const display = (body: string) =>
  body.replace(/\b(Find|Cari)\s*:\s*/g, '').replace(/\s+/g, ' ').trim()

describe('solve-symbol-equations', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('300 seeds: recompute ★ and ● independently, and audit the four options', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const r = concept.render(p)

      // Solve exactly the way a learner would, from the two rendered totals.
      const total1 = p.n * p.s
      const total2 = p.s + p.c
      const star = total1 / p.n
      const dot = total2 - star
      expect(Number.isInteger(star)).toBe(true)

      // Four ascending, distinct, non-negative options; the answer is a LABEL.
      const values = optionValues(p)
      expect(values).toHaveLength(4)
      expect(new Set(values).size).toBe(4)
      expect(values.every((v) => v >= 0)).toBe(true)
      expect([...values].sort((a, b) => a - b)).toEqual(values)

      expect(r.answer_type).toBe('multiple_choice')
      expect(LABELS).toContain(r.answer)
      expect(r.choices_id).not.toBeNull()
      expect(r.choices_id!.map((ch) => ch.label)).toEqual([...LABELS])
      // The labelled choice really is the circle's value.
      const picked = r.choices_id!.find((ch) => ch.label === r.answer)!
      expect(picked.text).toBe(String(dot))
      expect(picked.text).toBe(String(p.c))
      expect(r.answer).toBe(answerLabel(p))

      // Every breakdown highlight phrase must be a substring of the DISPLAY body.
      const breakdown = r.breakdown!
      for (const h of breakdown.highlights) {
        expect(display(r.body_en)).toContain(h.phrase_en)
        expect(display(r.body_id)).toContain(h.phrase_id)
      }
      expect(breakdown.answer.form).toBe('choice')
      expect(breakdown.answer.value).toBe(r.answer)

      // The stem never prints a bare symbol glyph — the figure draws those.
      expect(r.body_en + r.body_id).not.toMatch(/[★●]/)

      // No hint line may quote the answer before its own last line.
      expect(r.hint_steps_id![2]).toContain(String(p.c))
      expect(r.hint_steps_en![2]).toContain(String(p.c))
    }
  })

  test('each distractor encodes its named mistake', () => {
    const p = { s: 4, c: 7, n: 3, slip: -1 as const, totalKind: 'second' as const }
    const d = distractorValues(p)
    expect(d.otherSymbol).toBe(4) // answered the STAR, the easy equation's answer
    expect(d.offByOne).toBe(6) // read the star as 5, so 11 − 5 = 6
    expect(d.equationTotal).toBe(11) // gave the second equation's total, never subtracted
    expect(optionValues(p)).toEqual([4, 6, 7, 11])
    expect(answerLabel(p)).toBe('C')
  })

  test('the correct answer is not stuck in one slot', () => {
    const slots = new Set<string>()
    for (let seed = 1; seed <= 400; seed++) {
      slots.add(concept.render(concept.generate(mulberry32(seed))).answer)
    }
    expect(slots).toEqual(new Set(['A', 'B', 'C', 'D']))
  })

  test('worked example: s=5, c=7, n=3 -> 3 stars = 15 and star + circle = 12', () => {
    const r = concept.render({ s: 5, c: 7, n: 3, slip: 1, totalKind: 'first' })
    expect(r.body_en).toContain('3 stars add up to 15')
    expect(r.body_en).toContain('One star and one circle add up to 12')
    expect(r.body_id).toContain('3 bintang berjumlah 15')
    // options: circle 7, star 5, off-by-one 8, first total 15
    expect(r.choices_en!.map((ch) => ch.text)).toEqual(['5', '7', '8', '15'])
    expect(r.answer).toBe('B')
  })
})
