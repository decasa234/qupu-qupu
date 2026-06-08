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
      for (const choices of [rendered.choices_en, rendered.choices_id]) {
        const answerChoice = choices?.find((c) => c.label === rendered.answer)
        expect(answerChoice).toBeDefined()
        expect(answerChoice?.text).toBe(String(params.n))
      }
    }
  })

  test('MC: exactly four choices with distinct labels/texts and correct answer label', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = concept.render(concept.generate(mulberry32(seed)))
      expect(r.answer_type).toBe('multiple_choice')
      for (const choices of [r.choices_en, r.choices_id]) {
        expect(choices).toHaveLength(4)
        const labels = (choices ?? []).map((c) => c.label)
        const texts = (choices ?? []).map((c) => c.text)
        expect(new Set(labels).size).toBe(4)
        expect(new Set(texts).size).toBe(4)
        expect(labels).toContain(r.answer)
      }
    }
  })

  test('correct answer label varies by generated offset', () => {
    const labels = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const r = concept.render(concept.generate(mulberry32(seed)))
      labels.add(r.answer)
    }
    expect(labels.size).toBeGreaterThan(1)
  })

  test('grades include 1', () => {
    expect(concept.meta.grades).toContain(1)
  })
})
