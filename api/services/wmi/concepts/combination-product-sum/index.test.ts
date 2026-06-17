import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { FIND_SUM_PRODUCTS, COUNT_PAIRS_PRODUCTS } from './index.js'

describe('combination-product-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  // ─── find-larger mode (original) ───────────────────────────────────────────

  test('find-larger: y > x, fill_in, answer = larger number, sum/product consistent', () => {
    const p = { mode: 'find-larger' as const, x: 4, y: 7 }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    const r = concept.render(p)
    expect(r.answer_type).toBe('fill_in')
    expect(r.answer).toBe('7')
    expect(r.body_en).toContain('sum of 11')
    expect(r.body_en).toContain('product of 28')
  })

  // ─── find-sum mode ─────────────────────────────────────────────────────────

  // Taxonomy example: 43 × 47 = 2021; 43 + 47 = 90
  test('find-sum: 43×47=2021, sum=90 (taxonomy acceptance test)', () => {
    const idx = FIND_SUM_PRODUCTS.findIndex((e) => e.product === 2021)
    expect(idx).toBeGreaterThanOrEqual(0)
    const p = { mode: 'find-sum' as const, idx }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    const r = concept.render(p)
    expect(r.answer).toBe('90')
    expect(r.body_en).toContain('2021')
    expect(r.answer_type).toBe('fill_in')
  })

  test('find-sum: 31×37=1147, sum=68', () => {
    const idx = FIND_SUM_PRODUCTS.findIndex((e) => e.product === 1147)
    expect(idx).toBeGreaterThanOrEqual(0)
    const r = concept.render({ mode: 'find-sum', idx })
    expect(r.answer).toBe('68')
  })

  test('find-sum: 41×43=1763, sum=84', () => {
    const idx = FIND_SUM_PRODUCTS.findIndex((e) => e.product === 1763)
    expect(idx).toBeGreaterThanOrEqual(0)
    const r = concept.render({ mode: 'find-sum', idx })
    expect(r.answer).toBe('84')
  })

  test('find-sum: all table entries have correct product and sum', () => {
    for (const entry of FIND_SUM_PRODUCTS) {
      expect(entry.a * entry.b).toBe(entry.product)
      expect(entry.a + entry.b).toBe(entry.sum)
      expect(entry.a).toBeGreaterThanOrEqual(10)
      expect(entry.b).toBeGreaterThanOrEqual(10)
      expect(entry.a).toBeLessThanOrEqual(99)
      expect(entry.b).toBeLessThanOrEqual(99)
      expect(entry.a).toBeLessThan(entry.b)
    }
  })

  // ─── count-pairs mode ──────────────────────────────────────────────────────

  // Hand-verified: pairs (a<b) with a×b=120 are:
  // (1,120),(2,60),(3,40),(4,30),(5,24),(6,20),(8,15),(10,12) → count=8
  test('count-pairs: n=120 has 8 unordered pairs (enumeration acceptance test)', () => {
    const idx = COUNT_PAIRS_PRODUCTS.findIndex((e) => e.n === 120)
    expect(idx).toBeGreaterThanOrEqual(0)
    const p = { mode: 'count-pairs' as const, idx }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    const r = concept.render(p)
    expect(r.answer).toBe('8')
    expect(r.body_en).toContain('120')
    expect(r.answer_type).toBe('fill_in')
  })

  // Hand-verified: pairs (a<b) with a×b=60 are:
  // (1,60),(2,30),(3,20),(4,15),(5,12),(6,10) → count=6
  test('count-pairs: n=60 has 6 unordered pairs', () => {
    const idx = COUNT_PAIRS_PRODUCTS.findIndex((e) => e.n === 60)
    expect(idx).toBeGreaterThanOrEqual(0)
    const r = concept.render({ mode: 'count-pairs', idx })
    expect(r.answer).toBe('6')
  })

  // Hand-verified: pairs (a<b) with a×b=360 are:
  // (1,360),(2,180),(3,120),(4,90),(5,72),(6,60),(8,45),(9,40),(10,36),(12,30),(15,24),(18,20) → count=12
  test('count-pairs: n=360 has 12 unordered pairs', () => {
    const idx = COUNT_PAIRS_PRODUCTS.findIndex((e) => e.n === 360)
    expect(idx).toBeGreaterThanOrEqual(0)
    const r = concept.render({ mode: 'count-pairs', idx })
    expect(r.answer).toBe('12')
  })

  test('count-pairs: table counts match computed divisor enumeration', () => {
    for (const entry of COUNT_PAIRS_PRODUCTS) {
      let computed = 0
      for (let a = 1; a * a < entry.n; a++) {
        if (entry.n % a === 0) computed++
      }
      expect(computed).toBe(entry.count)
    }
  })

  // ─── Seed loop: unique correct answer across all modes ────────────────────

  test('100 seeds: valid params, unique correct answer, fill_in', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      // answer is a positive integer string
      expect(parseInt(r.answer, 10)).toBeGreaterThan(0)
      expect(String(parseInt(r.answer, 10))).toBe(r.answer)

      if (p.mode === 'find-larger') {
        expect(r.answer).toBe(String(p.y))
        expect(r.body_en).toContain(`sum of ${p.x + p.y}`)
        expect(r.body_en).toContain(`product of ${p.x * p.y}`)
      }
      if (p.mode === 'find-sum') {
        const entry = FIND_SUM_PRODUCTS[p.idx]
        expect(r.answer).toBe(String(entry.sum))
        expect(r.body_en).toContain(String(entry.product))
      }
      if (p.mode === 'count-pairs') {
        const entry = COUNT_PAIRS_PRODUCTS[p.idx]
        expect(r.answer).toBe(String(entry.count))
        expect(r.body_en).toContain(String(entry.n))
      }
    }
  })
})
