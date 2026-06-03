import { describe, test, expect } from 'vitest'
import { mulberry32 } from './rng.js'

describe('mulberry32', () => {
  test('same seed produces identical sequence', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      expect(a.int(1, 1_000_000)).toBe(b.int(1, 1_000_000))
    }
  })

  test('int respects inclusive bounds', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r.int(3, 8)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(8)
    }
  })

  test('pick returns an element from the input array', () => {
    const r = mulberry32(99)
    const items = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(r.pick(items))
    }
  })

  test('shuffle returns a permutation (same length, same multiset)', () => {
    const r = mulberry32(1)
    const items = [1, 2, 3, 4, 5]
    const shuffled = r.shuffle(items)
    expect(shuffled.length).toBe(items.length)
    expect([...shuffled].sort()).toEqual([...items].sort())
  })

  test('shuffle does not mutate the input', () => {
    const r = mulberry32(2)
    const items = [1, 2, 3, 4, 5]
    const ref = [...items]
    r.shuffle(items)
    expect(items).toEqual(ref)
  })
})
