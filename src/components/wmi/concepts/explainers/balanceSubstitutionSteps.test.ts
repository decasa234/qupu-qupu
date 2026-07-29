import { describe, test, expect } from 'vitest'
import {
  buildBalanceSubstitutionSteps,
  chunkItems,
  deriveWeights,
  readBalanceParams,
  type BalanceParams,
  type BalanceStoryboard,
} from './balanceSubstitutionSteps'

// value-of-one: 2 triangles = 4 cubes, and 3 triangles = 1 star. wA 2, wB 6.
const valueOfOne: BalanceParams = {
  shapeA: 'triangle',
  shapeB: 'star',
  wA: 2,
  wB: 6,
  scales: [
    { left: { a: 2, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 4 } },
    { left: { a: 3, b: 0, unit: 0 }, right: { a: 0, b: 1, unit: 0 } },
  ],
  ask: 'value-of-one',
  askShape: 'B',
  askCount: 1,
}

// value-of-one with a halving on the SECOND scale: 1 circle = 2 cubes,
// 3 circles = 2 squares. wA 2, wB 3.
const valueOfOneShared: BalanceParams = {
  shapeA: 'circle',
  shapeB: 'square',
  wA: 2,
  wB: 3,
  scales: [
    { left: { a: 1, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 2 } },
    { left: { a: 3, b: 0, unit: 0 }, right: { a: 0, b: 2, unit: 0 } },
  ],
  ask: 'value-of-one',
  askShape: 'B',
  askCount: 1,
}

// balance-group: 1 square = 4 cubes, 2 stars = 4 cubes. 2 squares = 4 stars.
const balanceGroup: BalanceParams = {
  shapeA: 'square',
  shapeB: 'star',
  wA: 4,
  wB: 2,
  scales: [
    { left: { a: 1, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 4 } },
    { left: { a: 0, b: 2, unit: 0 }, right: { a: 0, b: 0, unit: 4 } },
  ],
  ask: 'balance-group',
  askShape: 'A',
  askCount: 2,
}

const build = (p: BalanceParams, lang: 'en' | 'id' = 'en') => buildBalanceSubstitutionSteps(p, lang)
const phases = (sb: BalanceStoryboard) => sb.steps.map((s) => s.phase)

describe('deriveWeights', () => {
  test('re-earns both weights from the shown scales alone', () => {
    expect(deriveWeights(valueOfOne)).toEqual({ wA: 2, wB: 6 })
    expect(deriveWeights(valueOfOneShared)).toEqual({ wA: 2, wB: 3 })
    expect(deriveWeights(balanceGroup)).toEqual({ wA: 4, wB: 2 })
  })

  test('never leans on the hidden weights when the scales are readable', () => {
    // Lie about the hidden weights: the derivation must ignore them entirely.
    const lied = { ...valueOfOne, wA: 99, wB: 99 } as unknown as BalanceParams
    expect(deriveWeights(readBalanceParams(lied))).toEqual({ wA: 2, wB: 6 })
  })
})

describe('chunkItems', () => {
  test('splits a pan into even clusters', () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `c${i}`,
      kind: 'cube' as const,
      shape: null,
      role: null,
      fresh: false,
    }))
    expect(chunkItems(items, 2).map((g) => g.length)).toEqual([3, 3])
    expect(chunkItems(items, 1)).toHaveLength(1)
  })
})

describe('buildBalanceSubstitutionSteps — every board balances', () => {
  for (const [name, params] of [
    ['value-of-one', valueOfOne],
    ['value-of-one (shared second scale)', valueOfOneShared],
    ['balance-group', balanceGroup],
  ] as const) {
    test(`${name} keeps the beam level on every beat`, () => {
      for (const lang of ['en', 'id'] as const) {
        const sb = build(params, lang)
        expect(sb.steps.length).toBeGreaterThanOrEqual(4)
        for (const beat of sb.steps) {
          expect(beat.board.level).toBe(true)
          expect(beat.board.left.weight).toBe(beat.board.right.weight)
          expect(beat.caption).not.toMatch(/undefined|NaN/)
        }
      }
    })
  }
})

describe('buildBalanceSubstitutionSteps — value-of-one', () => {
  test('reads, shares, reads, swaps, then lands the answer', () => {
    const sb = build(valueOfOne)
    expect(phases(sb)).toEqual(['read', 'share', 'read', 'swap', 'swap', 'result'])
    expect(sb.wA).toBe(2)
    expect(sb.answer).toBe(6)
  })

  test('only the last beat carries the answer', () => {
    const sb = build(valueOfOne)
    sb.steps.slice(0, -1).forEach((beat) => {
      expect(beat.reveal).toBeNull()
      expect(beat.result).toBe(false)
    })
    const last = sb.steps[sb.finalIndex]
    expect(last.reveal).toBe(6)
    expect(last.result).toBe(true)
    expect(last.hold).toBe(0)
    expect(last.caption).toContain('6')
  })

  test('the sharing beat splits both pans into one cluster per shape', () => {
    const share = build(valueOfOne).steps[1]
    expect(share.board.left.groups).toBe(2)
    expect(share.board.right.groups).toBe(2)
    expect(share.caption).toContain('Each triangle = 2 cubes')
  })

  test('the swap beats trade shapes for cubes without changing the weight', () => {
    const sb = build(valueOfOne)
    const [first, second] = [sb.steps[3], sb.steps[4]]
    // 3 triangles → 2 triangles + 2 cubes → 6 cubes, all weighing 6.
    expect(first.board.left.items.filter((i) => i.kind === 'shape')).toHaveLength(2)
    expect(first.board.left.items.filter((i) => i.kind === 'cube')).toHaveLength(2)
    expect(second.board.left.items.every((i) => i.kind === 'cube')).toBe(true)
    expect(second.board.left.items).toHaveLength(6)
    expect(first.board.left.weight).toBe(6)
    expect(second.board.left.weight).toBe(6)
    // the shape that left the pan flies into the swap tray, same identity
    expect(first.traded.map((i) => i.id)).toEqual(['s2la2'])
    expect(second.traded.map((i) => i.id)).toEqual(['s2la0', 's2la1', 's2la2'])
  })

  test('a second-scale halving is shown as a share, not asserted', () => {
    const sb = build(valueOfOneShared)
    expect(phases(sb)).toEqual(['read', 'read', 'swap', 'swap', 'result'])
    const last = sb.steps[sb.finalIndex]
    expect(last.board.left.groups).toBe(2)
    expect(last.board.right.groups).toBe(2)
    expect(sb.answer).toBe(3)
    expect(last.caption).toContain('each square = 3 cubes')
    // 3 is never claimed before the last beat
    sb.steps.slice(0, -1).forEach((beat) => expect(beat.reveal).toBeNull())
  })
})

describe('buildBalanceSubstitutionSteps — balance-group', () => {
  test('builds a scale that is true by inspection, then swaps twice', () => {
    const sb = build(balanceGroup)
    expect(phases(sb)).toEqual(['read', 'read', 'share', 'mirror', 'swap', 'swap', 'swap', 'result'])
    expect(sb.answer).toBe(4)
  })

  test('the mirror beat puts the same group on both sides', () => {
    const mirror = build(balanceGroup).steps[3]
    expect(mirror.board.index).toBeNull()
    expect(mirror.board.left.items).toHaveLength(2)
    expect(mirror.board.right.items).toHaveLength(2)
    expect(mirror.board.left.weight).toBe(mirror.board.right.weight)
  })

  test('the left pan never changes once the work scale is built', () => {
    const sb = build(balanceGroup)
    const work = sb.steps.slice(3)
    const ids = work.map((s) => s.board.left.items.map((i) => i.id).join(','))
    expect(new Set(ids).size).toBe(1)
  })

  test('the final pan holds the answer as shape B glyphs', () => {
    const last = build(balanceGroup).steps.at(-1)!
    expect(last.result).toBe(true)
    expect(last.reveal).toBe(4)
    expect(last.board.right.items).toHaveLength(4)
    expect(last.board.right.items.every((i) => i.role === 'B')).toBe(true)
    expect(last.board.spotlight).toBe('right')
  })

  test('Indonesian captions stay short and name the shapes', () => {
    const sb = build(balanceGroup, 'id')
    expect(sb.steps[0].caption).toBe('Timbangan 1: 1 persegi seimbang dengan 4 kubus.')
    expect(sb.steps[3].caption).toContain('Sama persis, pasti seimbang')
    expect(sb.steps.at(-1)!.caption).toContain('4 bintang seimbang dengan 2 persegi')
  })
})

describe('buildBalanceSubstitutionSteps — defensive', () => {
  test('nonsense params still produce a playable storyboard', () => {
    for (const raw of [null, undefined, {}, { scales: 'nope' }, { shapeA: 'blob', askCount: 99 }]) {
      const sb = build(raw as unknown as BalanceParams)
      expect(sb.steps.length).toBeGreaterThanOrEqual(4)
      sb.steps.forEach((beat) => {
        expect(beat.board.level).toBe(true)
        expect(beat.caption).not.toMatch(/undefined|NaN/)
      })
    }
  })

  test('token ids are unique within a beat, so nothing shares an identity', () => {
    for (const params of [valueOfOne, valueOfOneShared, balanceGroup]) {
      for (const beat of build(params).steps) {
        const ids = [...beat.board.left.items, ...beat.board.right.items, ...beat.traded].map((i) => i.id)
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })
})
