import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('place-value', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('100 seeds: n in [10,99], answer = tens digit * 10', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const tens = Math.floor(p.n / 10) * 10
      const r = concept.render(p)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(tens))
    }
  })

  test('every n has 4 distinct choices and the answer is not always A', () => {
    const answerLabels = new Set<string>()
    for (let n = 10; n <= 99; n++) {
      const r = concept.render({ n })
      const en = (r.choices_en ?? []).map((c) => c.text)
      const id = (r.choices_id ?? []).map((c) => c.text)
      expect(en.length).toBe(4)
      expect(new Set(en).size, `n=${n} EN choices: ${en.join(',')}`).toBe(4)
      expect(new Set(id).size, `n=${n} ID choices: ${id.join(',')}`).toBe(4)
      answerLabels.add(r.answer)
    }
    expect(answerLabels.size).toBeGreaterThan(1)
  })
})
