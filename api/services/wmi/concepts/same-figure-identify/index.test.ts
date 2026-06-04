import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { normalize } from './index.js'

type Cell = [number, number]
const ser = (cells: Cell[]) => JSON.stringify(normalize(cells))
const rot90 = (cells: Cell[]): Cell[] => cells.map(([x, y]) => [y, -x])
function rotationSet(cells: Cell[]): Set<string> {
  const out = new Set<string>()
  let c = cells
  for (let i = 0; i < 4; i++) {
    out.add(ser(c))
    c = rot90(c)
  }
  return out
}

describe('same-figure-identify', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly the answer option is a rotation of the target; others are reflections', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      const rots = rotationSet(p.target as Cell[])
      ;(p.options as Cell[][]).forEach((opt, i) => {
        expect(rots.has(ser(opt))).toBe(i === p.validIndex)
      })
      expect(r.answer).toBe(['A', 'B', 'C', 'D'][p.validIndex])
      expect(new Set((p.options as Cell[][]).map(ser)).size).toBe(4)
    }
  })
})
