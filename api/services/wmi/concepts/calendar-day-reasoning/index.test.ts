import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { DAYS_EN, DAYS_ID, dayIndex } from './index.js'

describe('calendar-day-reasoning', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('100 seeds: answer is (startDay+delta)%7, choices are valid, highlights are substrings', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // delta must never be a multiple of 7 — otherwise the answer equals the start day.
      expect(p.delta % 7).not.toBe(0)

      const expectedIdx = (p.startDay + p.delta) % 7
      expect(dayIndex(p)).toBe(expectedIdx)

      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      expect(r.choices_en).not.toBeNull()
      expect(r.choices_id).not.toBeNull()
      const choicesEn = r.choices_en!
      const choicesId = r.choices_id!

      // 4 distinct day choices in each language, mapping the same label -> day index.
      expect(choicesEn).toHaveLength(4)
      expect(choicesId).toHaveLength(4)
      const enTexts = new Set(choicesEn.map((c) => c.text))
      const idTexts = new Set(choicesId.map((c) => c.text))
      expect(enTexts.size).toBe(4)
      expect(idTexts.size).toBe(4)

      // The label -> day index mapping is identical across languages.
      for (let i = 0; i < 4; i++) {
        const enIdx = DAYS_EN.indexOf(choicesEn[i].text as (typeof DAYS_EN)[number])
        const idIdx = DAYS_ID.indexOf(choicesId[i].text as (typeof DAYS_ID)[number])
        expect(choicesEn[i].label).toBe(choicesId[i].label)
        expect(enIdx).toBe(idIdx)
      }

      // The answer label maps to the correct day in both languages.
      const answerChoiceEn = choicesEn.find((c) => c.label === r.answer)
      const answerChoiceId = choicesId.find((c) => c.label === r.answer)
      expect(answerChoiceEn).toBeDefined()
      expect(answerChoiceId).toBeDefined()
      expect(answerChoiceEn!.text).toBe(DAYS_EN[expectedIdx])
      expect(answerChoiceId!.text).toBe(DAYS_ID[expectedIdx])

      // Every highlight phrase is a substring of the matching-language body.
      const breakdown = r.breakdown!
      expect(breakdown).toBeTruthy()
      for (const h of breakdown.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }

      expect(breakdown.answer.form).toBe('choice')
      expect(breakdown.answer.value).toBe(r.answer)
    }
  })

  test('worked example: Sunday + 10 days -> Wednesday', () => {
    const p = { startDay: 0, delta: 10 }
    expect(dayIndex(p)).toBe(3)
    expect(DAYS_EN[dayIndex(p)]).toBe('Wednesday')
    expect(DAYS_ID[dayIndex(p)]).toBe('Rabu')
  })
})
