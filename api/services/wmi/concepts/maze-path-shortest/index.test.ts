import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { shortestSteps } from './index.js'

type Cell = [number, number]

describe('maze-path-shortest', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: solvable, walls exclude corners, answer = BFS distance >= manhattan', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const walls = p.walls as Cell[]
      const wallSet = new Set(walls.map(([x, y]) => `${x},${y}`))
      expect(wallSet.has('0,0')).toBe(false)
      expect(wallSet.has(`${p.cols - 1},${p.rows - 1}`)).toBe(false)
      const d = shortestSteps(p.cols, p.rows, walls)
      expect(Number.isFinite(d)).toBe(true)
      expect(d).toBeGreaterThanOrEqual(p.cols - 1 + (p.rows - 1)) // never shorter than Manhattan
      const r = concept.render(p)
      expect(r.answer).toBe(String(d))
    }
  })

  test('known tiny cases', () => {
    expect(shortestSteps(3, 1, [])).toBe(2) // straight line of 3 cells
    expect(shortestSteps(3, 3, [])).toBe(4) // open grid -> Manhattan
    expect(shortestSteps(3, 3, [[1, 0]])).toBe(4) // one wall, reroute keeps Manhattan
    expect(shortestSteps(2, 2, [[1, 0], [0, 1]])).toBe(Infinity) // end corner trapped
  })
})
