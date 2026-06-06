import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { resultTime, fmtTime } from './index.js'

describe('clock-time-after', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: params valid, fill_in, answer is a H:MM time', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const rt = resultTime(p)
      expect(r.answer).toBe(fmtTime(rt.hour, rt.minute))
      expect(rt.hour).toBeGreaterThanOrEqual(1)
      expect(rt.hour).toBeLessThanOrEqual(12)
      expect(rt.minute).toBeGreaterThanOrEqual(0)
      expect(rt.minute).toBeLessThanOrEqual(59)
      expect(r.answer).toMatch(/^\d{1,2}:\d{2}$/)
    }
  })

  test('minutes carry into the hour and the hour wraps past 12', () => {
    expect(concept.render({ hour: 10, minute: 45, addHour: 2, addMin: 30 }).answer).toBe('1:15')
    expect(concept.render({ hour: 9, minute: 0, addHour: 1, addMin: 15 }).answer).toBe('10:15')
    expect(concept.render({ hour: 11, minute: 30, addHour: 1, addMin: 45 }).answer).toBe('1:15')
  })

  test('the question mentions minutes', () => {
    const r = concept.render({ hour: 3, minute: 15, addHour: 2, addMin: 30 })
    expect(r.body_en).toContain('minutes')
    expect(r.body_en).toContain('3:15')
  })
})
