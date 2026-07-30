import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  buildBalanceSubstitutionSteps,
  chunkItems,
  deriveWeights,
  readBalanceParams,
  type BalanceParams,
  type BalanceStoryboard,
} from './balanceSubstitutionSteps'
import BalanceSubstitutionIllustration, {
  BALANCE_INK,
  CUBE_BOX,
  FIGURE_PAN_DROP,
  SCALE_GEOM,
  SHAPE_BOX,
  STAR_SIN54,
  balanceFigureAriaLabel,
  hangerPath,
  scaleFrame,
  starPoints,
  type ScaleData,
  type ShapeKind,
} from '../balance-substitution'
import BalanceSubstitutionExplainer from './BalanceSubstitutionExplainer'

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

// ---------------------------------------------------------------------------
// The figure's aria-label
// ---------------------------------------------------------------------------

const ALL_PARAMS = [valueOfOne, valueOfOneShared, balanceGroup] as const

/** Every run of digits in a string, as numbers. */
function digitsIn(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number)
}

/** What the picture actually puts on the pans, in reading order. */
function drawnCounts(scales: readonly ScaleData[]): number[] {
  const out: number[] = []
  for (const scale of scales) {
    for (const side of [scale.left, scale.right]) {
      for (const n of [side.a, side.b, side.unit]) if (n > 0) out.push(n)
    }
  }
  return out
}

describe('balanceFigureAriaLabel', () => {
  test('says there are two level scales and what sits on each pan', () => {
    expect(balanceFigureAriaLabel(valueOfOne)).toBe(
      'Dua timbangan, keduanya seimbang dengan lengan mendatar. ' +
        'Timbangan pertama: piring kiri berisi 2 segitiga, piring kanan berisi 4 kubus. ' +
        'Timbangan kedua: piring kiri berisi 3 segitiga, piring kanan berisi 1 bintang.',
    )
    expect(balanceFigureAriaLabel(balanceGroup)).toBe(
      'Dua timbangan, keduanya seimbang dengan lengan mendatar. ' +
        'Timbangan pertama: piring kiri berisi 1 persegi, piring kanan berisi 4 kubus. ' +
        'Timbangan kedua: piring kiri berisi 2 bintang, piring kanan berisi 4 kubus.',
    )
  })

  test('every number it speaks is a count the picture draws — nothing is derived', () => {
    for (const params of ALL_PARAMS) {
      const label = balanceFigureAriaLabel(params)
      expect(digitsIn(label)).toEqual(drawnCounts(params.scales))
      // it never states what one shape is worth, nor how many balance the group
      expect(label).not.toMatch(/seimbang dengan \d/)
      expect(label).not.toContain('=')
    }
  })

  test('reads the counts the figure clamps to, and calls an empty pan empty', () => {
    const label = balanceFigureAriaLabel({
      shapeA: 'circle',
      shapeB: 'square',
      scales: [
        // a raw count past what the figure can draw, and a pan with nothing on it
        { left: { a: 99, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 0 } },
        { left: { a: 1, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 2 } },
      ],
    })
    expect(label).toContain('piring kiri berisi 6 lingkaran, piring kanan berisi kosong')
    expect(label).not.toContain('99')
  })

  test('same params in, identical label out', () => {
    expect(balanceFigureAriaLabel(valueOfOne)).toBe(balanceFigureAriaLabel(valueOfOne))
  })
})

// ---------------------------------------------------------------------------
// Figure ↔ explainer: one set of glyphs and one frame, not two copies
// ---------------------------------------------------------------------------

const figureHtml = (p: unknown) =>
  renderToStaticMarkup(createElement(BalanceSubstitutionIllustration, { params: p }))

const explainerHtml = (p: unknown, step: number) =>
  renderToStaticMarkup(
    createElement(BalanceSubstitutionExplainer, { params: p, correctAnswer: '6', lang: 'id', step }),
  )

describe('the explainer draws the figure, not a copy of it', () => {
  test('both SSR renders agree on the glyphs, the frame and the palette', () => {
    const p: BalanceParams = { ...valueOfOne }
    const fig = figureHtml(p)
    // shape B only reaches a pan on the closing beat, so read the whole story
    const exp = build(p).steps.map((_, i) => explainerHtml(p, i)).join('')

    // the star polygon comes from one `starPoints` call, not two
    const half = SHAPE_BOX / 2
    const star = starPoints(half, 0, -half * STAR_SIN54)
    expect(fig).toContain(`points="${star}"`)
    expect(exp).toContain(`points="${star}"`)

    // the triangle glyph, drawn in the same box
    const triangle = `0,${-SHAPE_BOX} ${-half},0 ${half},0`
    expect(fig).toContain(`points="${triangle}"`)
    expect(exp).toContain(`points="${triangle}"`)

    // the three cube faces, at the shared cube size
    const d = CUBE_BOX * 0.28
    const fw = CUBE_BOX - d
    const x0 = -CUBE_BOX / 2
    const cubeTop = `${x0},${-fw} ${x0 + d},${-fw - d} ${x0 + d + fw},${-fw - d} ${x0 + fw},${-fw}`
    expect(fig).toContain(`points="${cubeTop}"`)
    expect(exp).toContain(`points="${cubeTop}"`)

    // the standing frame: same beam span and pivot on both, whatever the drop
    expect(fig).toContain(`x1="${SCALE_GEOM.leftX}"`)
    expect(exp).toContain(`x1="${SCALE_GEOM.leftX}"`)
    expect(fig).toContain(`x2="${SCALE_GEOM.rightX}"`)
    expect(exp).toContain(`x2="${SCALE_GEOM.rightX}"`)
    expect(fig).toContain(`stroke-width="${SCALE_GEOM.beamWidth}"`)
    expect(exp).toContain(`stroke-width="${SCALE_GEOM.beamWidth}"`)

    // the hanger wires: same curve, only the drop differs between the two
    const figTray = SCALE_GEOM.beamY + FIGURE_PAN_DROP
    const expTray = SCALE_GEOM.beamY + 78
    expect(fig).toContain(hangerPath(SCALE_GEOM.leftX, figTray, -1))
    expect(exp).toContain(hangerPath(SCALE_GEOM.leftX, expTray, -1))

    // one palette
    for (const ink of [
      BALANCE_INK.frame,
      BALANCE_INK.shapeA,
      BALANCE_INK.shapeB,
      BALANCE_INK.cubeFront,
      BALANCE_INK.cubeTop,
      BALANCE_INK.cubeSide,
      BALANCE_INK.cream,
    ]) {
      expect(fig).toContain(ink)
      expect(exp).toContain(ink)
    }
  })

  test('the frame maths is one formula: the drop fixes the post and the cell height', () => {
    expect(scaleFrame(104)).toEqual({ trayY: 104, postBottom: 140, height: 158 })
    expect(scaleFrame(122)).toEqual({ trayY: 122, postBottom: 158, height: 176 })
    // the figure's own cell, straight from the shared constants
    const cell = scaleFrame(SCALE_GEOM.beamY + FIGURE_PAN_DROP)
    expect(figureHtml(valueOfOne)).toContain(
      `viewBox="0 0 ${SCALE_GEOM.width} ${cell.height * 2}"`,
    )
  })

  test('every shape kind renders deterministically in both languages', () => {
    const kinds: ShapeKind[] = ['circle', 'triangle', 'square', 'star']
    for (const shapeA of kinds) {
      for (const shapeB of kinds) {
        const p = { ...valueOfOne, shapeA, shapeB }
        expect(figureHtml(p)).toBe(figureHtml(p))
        expect(explainerHtml(p, 0)).toBe(explainerHtml(p, 0))
      }
    }
  })
})
