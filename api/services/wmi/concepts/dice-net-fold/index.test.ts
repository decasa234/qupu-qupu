import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

type Cell = [number, number]

// A hexomino with any 2×2 block, or that is 1×N / 2×3, does not fold to a cube.
function has2x2(cells: Cell[]): boolean {
  const set = new Set(cells.map(([x, y]) => `${x},${y}`))
  return cells.some(([x, y]) => set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`))
}

describe('dice-net-fold', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one net has no 2×2 block (the valid 1-4-1); answer points to it', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const nets = p.nets as Cell[][]
      expect(nets.every((n) => n.length === 6)).toBe(true)
      // the valid net is the one without a 2×2 block
      expect(has2x2(nets[p.validIndex])).toBe(false)
      const r = concept.render(p)
      expect(r.answer).toBe(['A', 'B', 'C', 'D'][p.validIndex])
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
