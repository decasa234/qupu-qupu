import { describe, test, expect } from 'vitest'
import {
  BAR_H,
  U,
  buildLengthLayout,
  buildLengthMeasureSteps,
  coerceLengthParams,
  xAt,
  type LengthParams,
} from './lengthMeasureSteps'

// The static figure's own maths, replayed here so the two can never drift.
// Mirrors src/components/wmi/concepts/length-measure-compare/index.tsx.
function figureGeometry(p: LengthParams) {
  const single = p.items.length === 1
  const padL = 22 + (single ? 0 : 78)
  const padR = 22
  if (p.medium === 'unit-chain') {
    const widest = p.items.reduce((m, it) => Math.max(m, it.length), 1)
    const topPad = single ? 24 : 12
    const rowH = 54
    const rowGap = 12
    return {
      width: padL + widest * U + padR,
      height: topPad + p.items.length * rowH + (p.items.length - 1) * rowGap + 8,
      rows: p.items.map((it, i) => {
        const rowTop = topPad + i * (rowH + rowGap)
        return { barY: rowTop, x0: padL, x1: padL + it.length * U, stripY: rowTop + 26 }
      }),
    }
  }
  const xA = (v: number) => padL + v * U
  const topPad = single ? 26 : 12
  const rowH = 26
  const rowGap = 10
  const objectsH = p.items.length * rowH + (p.items.length - 1) * rowGap
  const rulerTop = topPad + objectsH + 14
  return {
    width: padL + p.rulerMax * U + padR,
    height: rulerTop + 46 + 8,
    rulerTop,
    rows: p.items.map((it, i) => {
      const rowTop = topPad + i * (rowH + rowGap)
      return {
        barY: rowTop + 4,
        x0: xA(it.start),
        x1: xA(it.start + it.length),
        stripY: 0,
      }
    }),
  }
}

const OFFSET_ONE: LengthParams = {
  medium: 'offset-ruler',
  unitLabel: 'cm',
  ask: 'measure-one',
  rulerMax: 12,
  items: [{ name: 'pita', start: 3, length: 8 }],
  focusA: 0,
  focusB: 0,
}

const CHAIN_ONE: LengthParams = {
  medium: 'unit-chain',
  unitLabel: 'petak',
  ask: 'measure-one',
  rulerMax: 6,
  items: [{ name: 'krayon', start: 0, length: 6 }],
  focusA: 0,
  focusB: 0,
}

const OFFSET_LONGEST: LengthParams = {
  medium: 'offset-ruler',
  unitLabel: 'cm',
  ask: 'longest',
  rulerMax: 13,
  // ranting stops farthest right (12) but is shorter than pensil (8)
  items: [
    { name: 'pensil', start: 1, length: 8 },
    { name: 'ranting', start: 6, length: 6 },
  ],
  focusA: 0,
  focusB: 0,
}

const OFFSET_DIFF: LengthParams = {
  medium: 'offset-ruler',
  unitLabel: 'cm',
  ask: 'difference',
  rulerMax: 12,
  items: [
    { name: 'tali', start: 2, length: 4 },
    { name: 'sedotan', start: 1, length: 7 },
  ],
  focusA: 1, // sedotan is the longer one the question asks about first
  focusB: 0,
}

describe('buildLengthLayout — pinned to the static figure', () => {
  test('single offset ruler: exact coordinates', () => {
    const l = buildLengthLayout(OFFSET_ONE)
    expect(l.kind).toBe('ruler')
    expect(l.padL).toBe(22)
    expect(l.topPad).toBe(26)
    expect(l.rulerTop).toBe(66)
    expect(l.rulerH).toBe(46)
    expect(l.width).toBe(22 + 12 * 22 + 22)
    expect(l.height).toBe(66 + 46 + 8)
    expect(l.rows[0]).toMatchObject({ top: 26, barY: 30, x0: 88, x1: 264, start: 3, end: 11, length: 8 })
    expect(xAt(l, 0)).toBe(22)
    expect(xAt(l, 11)).toBe(264)
  })

  test('single unit chain: bar sits ON the row top, strip 26px below', () => {
    const l = buildLengthLayout(CHAIN_ONE)
    expect(l.kind).toBe('chain')
    expect(l.topPad).toBe(24)
    expect(l.rows[0]).toMatchObject({ top: 24, barY: 24, stripY: 50, x0: 22, x1: 22 + 6 * 22 })
    expect(l.height).toBe(24 + 54 + 8)
    expect(BAR_H).toBe(18)
  })

  test('multi-object boards use the 78px name gutter', () => {
    const l = buildLengthLayout(OFFSET_LONGEST)
    expect(l.padL).toBe(100)
    expect(l.topPad).toBe(12)
    expect(l.rulerTop).toBe(12 + (2 * 26 + 10) + 14)
    expect(l.rows[1].top).toBe(12 + 36)
  })

  test('every medium/ask combination matches the figure maths exactly', () => {
    for (const p of [OFFSET_ONE, CHAIN_ONE, OFFSET_LONGEST, OFFSET_DIFF]) {
      const l = buildLengthLayout(p)
      const f = figureGeometry(p)
      expect(l.width).toBe(f.width)
      expect(l.height).toBe(f.height)
      if (f.rulerTop !== undefined) expect(l.rulerTop).toBe(f.rulerTop)
      l.rows.forEach((row, i) => {
        expect(row.barY).toBe(f.rows[i].barY)
        expect(row.x0).toBe(f.rows[i].x0)
        expect(row.x1).toBe(f.rows[i].x1)
        expect(row.stripY).toBe(f.rows[i].stripY)
      })
    }
  })
})

describe('coerceLengthParams', () => {
  test('keeps focusA/focusB (the figure throws them away, the story needs them)', () => {
    expect(coerceLengthParams(OFFSET_DIFF).focusA).toBe(1)
    expect(coerceLengthParams(OFFSET_DIFF).focusB).toBe(0)
  })

  test('falls back to the signature offset sample on junk', () => {
    const p = coerceLengthParams({ medium: 'nope', items: 'bad' })
    expect(p.medium).toBe('offset-ruler')
    expect(p.items).toHaveLength(1)
    expect(p.items[0].length).toBe(8)
  })

  test('unit-chain always measures in petak', () => {
    expect(coerceLengthParams({ ...CHAIN_ONE, unitLabel: 'cm' }).unitLabel).toBe('petak')
  })
})

describe('buildLengthMeasureSteps — offset ruler, measure one', () => {
  const sb = buildLengthMeasureSteps(OFFSET_ONE, 'id')

  test('answer is the span, never the right-end reading', () => {
    expect(sb.answer).toBe('8')
    expect(sb.answer).not.toBe('11')
  })

  test('start beat, end beat, then the trap gets a beat of its own', () => {
    const phases = sb.steps.map((s) => s.phase)
    expect(phases.slice(0, 4)).toEqual(['intro', 'start', 'end', 'trap'])
    const trap = sb.steps[3].trap
    expect(trap).toEqual({ wrong: 11, from: 0, to: 3 })
    // the trap's tempting number is the end reading, and it is NOT the answer
    expect(String(trap?.wrong)).not.toBe(sb.answer)
    expect(sb.steps[3].caption).toContain('11')
    expect(sb.steps[3].caption).toContain('0 sampai 3')
  })

  test('the span is swept one unit at a time and stops one short of the total', () => {
    const counts = sb.steps.filter((s) => s.phase === 'count').map((s) => s.countTo)
    expect(counts).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(sb.steps.every((s) => s.countTo <= 8)).toBe(true)
  })

  test('only the last beat lands the answer', () => {
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.countTo).toBe(8)
    expect(last.caption).toBe('Panjang = 11 − 3 = 8 cm.')
    expect(sb.steps.slice(0, -1).some((s) => s.result)).toBe(false)
    expect(sb.steps.slice(0, -1).some((s) => s.caption.includes('Panjang ='))).toBe(false)
  })

  test('at least three beats and no measured-bar strip for a single object', () => {
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
    expect(sb.compare).toBe(false)
  })
})

describe('buildLengthMeasureSteps — aligned ruler and unit chain', () => {
  test('aligned ruler still deduces end − 0 rather than asserting', () => {
    const sb = buildLengthMeasureSteps(
      { ...OFFSET_ONE, medium: 'ruler', items: [{ name: 'pensil', start: 0, length: 7 }] },
      'id',
    )
    expect(sb.answer).toBe('7')
    expect(sb.steps.some((s) => s.phase === 'trap')).toBe(false)
    expect(sb.steps[1].caption).toContain('mulai tepat di angka 0')
    expect(sb.steps[sb.finalIndex].caption).toBe('Panjang = 7 − 0 = 7 cm.')
  })

  test('unit chain counts the squares with a running tally up to the length', () => {
    const sb = buildLengthMeasureSteps(CHAIN_ONE, 'id')
    const tallies = sb.steps.filter((s) => s.phase === 'count').map((s) => s.tally)
    expect(tallies).toEqual([1, 2, 3, 4, 5])
    const last = sb.steps[sb.finalIndex]
    expect(last.countTo).toBe(6) // counted squares === the object's length
    expect(last.tally).toBe(6)
    expect(last.caption).toBe('Hitungan terakhir 6, jadi panjangnya 6 petak.')
    expect(sb.steps.some((s) => s.trap !== null)).toBe(false)
  })

  test('english uses singular/plural square wording', () => {
    const sb = buildLengthMeasureSteps(CHAIN_ONE, 'en')
    expect(sb.steps.find((s) => s.phase === 'count')?.caption).toBe('Count: 1 square')
    expect(sb.steps[sb.finalIndex].caption).toBe('The last count is 6, so it is 6 squares long.')
  })
})

describe('buildLengthMeasureSteps — longest', () => {
  const sb = buildLengthMeasureSteps(OFFSET_LONGEST, 'id')

  test('the object that stops farthest right is not the longest — and gets the trap beat', () => {
    expect(sb.farthestEndIndex).toBe(1) // ranting ends at 12
    expect(sb.longestIndex).toBe(0) // pensil is 8 long
    expect(sb.answer).toBe('A')
    const trap = sb.steps.find((s) => s.trap !== null)
    expect(trap?.trap).toEqual({ wrong: 12, from: 0, to: 6 })
  })

  test('measures every object, then lines the bars up before deciding', () => {
    const phases = sb.steps.map((s) => s.phase)
    expect(phases.filter((ph) => ph === 'span')).toHaveLength(2)
    expect(phases[phases.length - 2]).toBe('compare')
    const compare = sb.steps[sb.finalIndex - 1]
    expect(compare.measured).toEqual([8, 6])
    expect(sb.compare).toBe(true)
  })

  test('only the final beat names the choice letter', () => {
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('→ A')
    expect(sb.steps.slice(0, -1).some((s) => s.caption.includes('→'))).toBe(false)
  })
})

describe('buildLengthMeasureSteps — difference', () => {
  const sb = buildLengthMeasureSteps(OFFSET_DIFF, 'id')

  test('respects focusA/focusB so the subtraction runs in the asked order', () => {
    expect(sb.aIndex).toBe(1)
    expect(sb.bIndex).toBe(0)
    expect(sb.answer).toBe('3') // sedotan 7 − tali 4
    expect(sb.steps[sb.finalIndex].caption).toBe('Selisihnya: 7 − 4 = 3 cm.')
  })

  test('trap fires on the asked object and its wrong value is that end reading', () => {
    const trap = sb.steps.find((s) => s.trap !== null)
    expect(trap?.trap).toEqual({ wrong: 8, from: 0, to: 1 })
    expect(String(trap?.trap?.wrong)).not.toBe(sb.answer)
  })

  test('both objects are measured before the comparison beat', () => {
    const compare = sb.steps[sb.finalIndex - 1]
    expect(compare.phase).toBe('compare')
    expect(compare.measured).toEqual([4, 7])
    expect(sb.steps.slice(0, -1).some((s) => s.caption.includes('Selisih'))).toBe(false)
  })
})

describe('buildLengthMeasureSteps — invariants', () => {
  const cases: LengthParams[] = [OFFSET_ONE, CHAIN_ONE, OFFSET_LONGEST, OFFSET_DIFF]

  test('deterministic, ≥3 beats, exactly one result beat, no NaN', () => {
    for (const p of cases) {
      for (const lang of ['id', 'en'] as const) {
        const a = buildLengthMeasureSteps(p, lang)
        const b = buildLengthMeasureSteps(p, lang)
        expect(JSON.stringify(a.steps)).toBe(JSON.stringify(b.steps))
        expect(a.steps.length).toBeGreaterThanOrEqual(3)
        expect(a.steps.filter((s) => s.result)).toHaveLength(1)
        expect(a.steps[a.finalIndex].result).toBe(true)
        expect(a.finalIndex).toBe(a.steps.length - 1)
        for (const s of a.steps) {
          expect(s.caption).not.toMatch(/undefined|NaN/)
          expect(Number.isFinite(s.countTo)).toBe(true)
          expect(Number.isFinite(s.hold)).toBe(true)
        }
      }
    }
  })

  test('measured lengths only ever grow, and always equal the real length', () => {
    for (const p of cases) {
      const sb = buildLengthMeasureSteps(p, 'id')
      let prev = sb.steps[0].measured.filter((v) => v !== null).length
      for (const s of sb.steps) {
        const known = s.measured.filter((v) => v !== null).length
        expect(known).toBeGreaterThanOrEqual(prev)
        prev = known
        s.measured.forEach((v, i) => {
          if (v !== null) expect(v).toBe(p.items[i].length)
        })
      }
    }
  })

  test('every offset-ruler case gets a trap beat; no other medium does', () => {
    for (const p of cases) {
      const sb = buildLengthMeasureSteps(p, 'id')
      const traps = sb.steps.filter((s) => s.trap !== null)
      expect(traps.length).toBe(p.medium === 'offset-ruler' ? 1 : 0)
      for (const s of traps) {
        // the tempting value is a right-end reading on the ruler …
        expect(sb.layout.rows.map((r) => r.end)).toContain(s.trap?.wrong)
        // … and never the answer
        expect(String(s.trap?.wrong)).not.toBe(sb.answer)
        expect(s.trap?.from).toBe(0)
      }
    }
  })
})
