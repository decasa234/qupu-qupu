import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { LABELS, answerValue, optionValues, sumOf } from './index.js'

describe('consecutive-integer-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('200 seeds: run is real, options are sound, and the label points at the asked end', () => {
    const seenLabels = new Set<string>()
    const seenParity = new Set<string>()
    const seenAsk = new Set<string>()

    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      seenParity.add(p.n % 2 === 1 ? 'odd' : 'even')
      seenAsk.add(p.ask)

      // Independently recompute the sum from the n consecutive numbers.
      const numbers = Array.from({ length: p.n }, (_, i) => p.start + i)
      const independentSum = numbers.reduce((a, b) => a + b, 0)
      expect(independentSum).toBe(sumOf(p))

      // Numbers are truly consecutive.
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBe(numbers[i - 1] + 1)
      }

      // The asked end, recomputed from the run itself.
      const expected = p.ask === 'smallest' ? numbers[0] : numbers[numbers.length - 1]
      expect(answerValue(p)).toBe(expected)

      const opts = optionValues(p)
      expect(opts).toHaveLength(4)
      expect(new Set(opts).size).toBe(4) // all distinct
      expect(opts).toEqual([...opts].sort((a, b) => a - b)) // ascending
      expect(opts.every((v) => Number.isInteger(v) && v > 0)).toBe(true)

      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      expect(LABELS).toContain(r.answer as (typeof LABELS)[number])
      seenLabels.add(r.answer)

      // The labelled choice carries exactly the recomputed answer.
      const picked = r.choices_id!.find((c) => c.label === r.answer)
      expect(picked?.text).toBe(String(expected))
      expect(r.choices_en!.map((c) => c.text)).toEqual(opts.map(String))
      expect(r.breakdown!.answer.form).toBe('choice')
      expect(r.breakdown!.answer.value).toBe(r.answer)

      // Every highlight phrase must be a substring of the rendered body.
      for (const h of r.breakdown!.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }

    // The correct option is not stuck in one slot, and both run parities and
    // both question ends actually get generated.
    expect([...seenLabels].sort()).toEqual(['A', 'B', 'C', 'D'])
    expect([...seenParity].sort()).toEqual(['even', 'odd'])
    expect([...seenAsk].sort()).toEqual(['largest', 'smallest'])
  })

  test('worked example: 4 consecutive numbers summing to 34 -> smallest 7, largest 10', () => {
    const p = { n: 4, start: 7, ask: 'smallest', neighbour: 'low' } as const
    expect(sumOf(p)).toBe(34)
    // options: 6 (just before the run), 7, 8 (lower middle), 10 (largest)
    expect(optionValues(p)).toEqual([6, 7, 8, 10])
    expect(concept.render(p).answer).toBe('B')

    const q = { n: 4, start: 7, ask: 'largest', neighbour: 'high' } as const
    // options: 7 (smallest), 8 (lower middle), 10, 11 (just after the run)
    expect(optionValues(q)).toEqual([7, 8, 10, 11])
    expect(concept.render(q).answer).toBe('C')
  })
})
