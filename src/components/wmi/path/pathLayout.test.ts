import { describe, expect, it } from 'vitest'
import { nodeOffsets } from './pathLayout'

describe('nodeOffsets', () => {
  it('returns one point per node with sequential row indices', () => {
    const pts = nodeOffsets(7)
    expect(pts).toHaveLength(7)
    pts.forEach((p, i) => expect(p.y).toBe(i))
  })

  it('returns an empty array for zero nodes', () => {
    expect(nodeOffsets(0)).toEqual([])
  })

  it('keeps every x within the [0.2, 0.8] lane', () => {
    for (const p of nodeOffsets(25)) {
      expect(p.x).toBeGreaterThanOrEqual(0.2)
      expect(p.x).toBeLessThanOrEqual(0.8)
    }
  })

  it('alternates center / left / center / right', () => {
    const xs = nodeOffsets(8).map((p) => p.x)
    expect(xs).toEqual([0.5, 0.22, 0.5, 0.78, 0.5, 0.22, 0.5, 0.78])
  })
})
