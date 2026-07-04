import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { countByFormula } from './index.js'

// Independent brute-force simulation: iterate every unit cube by its (x, y, z)
// coordinate in 0..n-1, count how many of the 3 coordinates sit on the outer
// boundary (0 or n-1) -- that's the number of painted faces for that cube --
// then tally how many cubes have exactly k painted faces.
function bruteForceCount(n: number, k: number): number {
  let tally = 0
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      for (let z = 0; z < n; z++) {
        let painted = 0
        if (x === 0 || x === n - 1) painted++
        if (y === 0 || y === n - 1) painted++
        if (z === 0 || z === n - 1) painted++
        if (painted === k) tally++
      }
    }
  }
  return tally
}

describe('painted-cube-faces-count', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: formula matches brute-force cube simulation', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const expected = bruteForceCount(p.n, p.k)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(expected))
      expect(r.answer).toBe(String(countByFormula(p.n, p.k)))

      for (const h of r.breakdown!.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('k=1 renders grammatical singular "1 painted face"', () => {
    // find a seed with k===1
    let found = false
    for (let seed = 1; seed <= 200 && !found; seed++) {
      const p = concept.generate(mulberry32(seed))
      if (p.k !== 1) continue
      found = true
      const r = concept.render(p)
      expect(r.body_en).toContain('1 painted face?')
      expect(r.body_en).not.toContain('1 painted faces')
    }
    expect(found).toBe(true)
  })

  test('worked example: n=3, k=3 (corners) -> 8', () => {
    expect(countByFormula(3, 3)).toBe(8)
    expect(bruteForceCount(3, 3)).toBe(8)
  })

  test('worked example: n=4, k=1 (face centers) -> 24', () => {
    expect(countByFormula(4, 1)).toBe(24)
    expect(bruteForceCount(4, 1)).toBe(24)
  })

  test('worked example: n=5, k=0 (interior) -> 27', () => {
    expect(countByFormula(5, 0)).toBe(27)
    expect(bruteForceCount(5, 0)).toBe(27)
  })
})
