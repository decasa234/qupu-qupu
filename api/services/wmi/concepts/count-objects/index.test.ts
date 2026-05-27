import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('count-objects', () => {
  test('determinism: same seed -> same params', () => {
    expect(concept.generate(mulberry32(42))).toEqual(concept.generate(mulberry32(42)))
  })

  test('100 seeds produce schema-valid params + correct answers', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const params = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(params)).not.toThrow()
      const rendered = concept.render(params)
      const answerChoice = rendered.choices_en?.find((c) => c.label === rendered.answer)
      expect(answerChoice).toBeDefined()
      expect(answerChoice?.text).toBe(String(params.n))
    }
  })

  test('MC: choices contain the answer label, all four labels distinct', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = concept.render(concept.generate(mulberry32(seed)))
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
    }
  })

  test('grades include 0', () => {
    expect(concept.meta.grades).toContain(0)
  })
})
