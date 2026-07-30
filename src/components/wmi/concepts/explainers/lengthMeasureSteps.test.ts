import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, test, expect } from 'vitest'
import LengthMeasureCompareIllustration, {
  lengthFigureGeometry,
  xAt as figureXAt,
  U as FIGURE_U,
  BAR_H as FIGURE_BAR_H,
} from '../length-measure-compare'
import {
  BAR_H,
  U,
  buildLengthLayout,
  buildLengthMeasureSteps,
  coerceLengthParams,
  countingStops,
  xAt,
  type LengthParams,
} from './lengthMeasureSteps'

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

/** Every medium × ask, plus the widest boards the generator can emit. */
const ALL_CASES: LengthParams[] = [
  OFFSET_ONE,
  CHAIN_ONE,
  OFFSET_LONGEST,
  OFFSET_DIFF,
  { ...OFFSET_ONE, medium: 'ruler', items: [{ name: 'pensil', start: 0, length: 10 }], rulerMax: 13 },
  { ...CHAIN_ONE, items: [{ name: 'tali', start: 0, length: 10 }], rulerMax: 10 },
  {
    medium: 'unit-chain',
    unitLabel: 'petak',
    ask: 'longest',
    rulerMax: 8,
    items: [
      { name: 'pita', start: 0, length: 5 },
      { name: 'tali', start: 0, length: 8 },
      { name: 'krayon', start: 0, length: 3 },
    ],
    focusA: 0,
    focusB: 0,
  },
  {
    medium: 'offset-ruler',
    unitLabel: 'cm',
    ask: 'longest',
    rulerMax: 14,
    items: [
      { name: 'pensil', start: 1, length: 8 },
      { name: 'ranting', start: 4, length: 7 },
      { name: 'sedotan', start: 3, length: 3 },
    ],
    focusA: 0,
    focusB: 0,
  },
  {
    medium: 'ruler',
    unitLabel: 'cm',
    ask: 'difference',
    rulerMax: 12,
    items: [
      { name: 'pita', start: 0, length: 9 },
      { name: 'krayon', start: 0, length: 3 },
    ],
    focusA: 0,
    focusB: 1,
  },
]

describe('buildLengthLayout — one copy of the geometry, shared with the figure', () => {
  test('the constants are literally the figure’s', () => {
    expect(U).toBe(FIGURE_U)
    expect(BAR_H).toBe(FIGURE_BAR_H)
    expect(U).toBe(22)
    expect(BAR_H).toBe(18)
  })

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
  })

  test('multi-object boards use the 78px name gutter', () => {
    const l = buildLengthLayout(OFFSET_LONGEST)
    expect(l.padL).toBe(100)
    expect(l.topPad).toBe(12)
    expect(l.rulerTop).toBe(12 + (2 * 26 + 10) + 14)
    expect(l.rows[1].top).toBe(12 + 36)
  })

  test('the explainer layout IS the figure geometry, for every medium × ask', () => {
    for (const p of ALL_CASES) {
      const l = buildLengthLayout(p)
      const f = lengthFigureGeometry(p)
      expect(l).toEqual(f)
      for (let v = 0; v <= f.rulerMax; v++) expect(xAt(l, v)).toBe(figureXAt(f, v))
      l.rows.forEach((row, i) => expect(row.x1 - row.x0).toBe(p.items[i].length * U))
    }
  })

  // The real anti-drift guard: the geometry above is only worth anything if the
  // figure actually DRAWS on it. Render it and read the coordinates back out.
  test('the rendered figure draws its ticks and bars on those exact coordinates', () => {
    for (const p of ALL_CASES) {
      const g = lengthFigureGeometry(p)
      const html = renderToStaticMarkup(
        createElement(LengthMeasureCompareIllustration, { params: p }),
      )
      expect(html).toContain(`viewBox="0 0 ${g.width} ${g.height}"`)

      // both ends of every object drop a dashed guide line
      const dropX = new Set(
        svgTags(html, 'line')
          .filter((a) => a['stroke-dasharray'] === '3 3')
          .map((a) => Number(a.x1)),
      )
      for (const row of g.rows) {
        expect(dropX).toContain(row.x0)
        expect(dropX).toContain(row.x1)
      }

      if (g.kind === 'ruler') {
        // every printed tick sits on xAt(v)
        const drawn = new Set(
          svgTags(html, 'line')
            .filter((a) => Number(a.y1) === g.rulerTop && a.x1 === a.x2)
            .map((a) => Number(a.x1)),
        )
        const expected = new Set(
          Array.from({ length: g.rulerMax + 1 }, (_, v) => figureXAt(g, v)),
        )
        expect(drawn).toEqual(expected)
      } else {
        // every unit square sits edge to edge along the object, on stripY
        for (const row of g.rows) {
          const squares = svgTags(html, 'rect')
            .filter(
              (a) =>
                Number(a.width) === U && Number(a.height) === U && Number(a.y) === row.stripY,
            )
            .map((a) => Number(a.x))
          const expected = Array.from({ length: row.length }, (_, j) => row.x0 + j * U)
          expect([...new Set(squares)].sort((a, b) => a - b)).toEqual(expected)
        }
      }
    }
  })
})

/** Pull `<name …>` tags out of rendered markup as plain attribute maps. */
function svgTags(html: string, name: string): Record<string, string>[] {
  const out: Record<string, string>[] = []
  for (const tag of html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? []) {
    const attrs: Record<string, string> = {}
    for (const m of tag.matchAll(/([a-zA-Z][\w-]*)="([^"]*)"/g)) attrs[m[1]] = m[2]
    out.push(attrs)
  }
  return out
}

describe('the figure’s aria-label — describe the picture, never the answer', () => {
  const ariaOf = (p: LengthParams) => {
    const html = renderToStaticMarkup(
      createElement(LengthMeasureCompareIllustration, { params: p }),
    )
    return /aria-label="([^"]*)"/.exec(html)?.[1] ?? ''
  }

  test('names the objects and the measuring instrument', () => {
    const ruler = ariaOf(OFFSET_ONE)
    expect(ruler).toContain('Penggaris')
    expect(ruler).toContain('Pita')
    expect(ruler).toContain('Ujung kirinya tidak di angka 0')

    const chain = ariaOf(CHAIN_ONE)
    expect(chain).toContain('petak satuan')
    expect(chain).toContain('Krayon')
    expect(chain).toContain('rapat tanpa celah')

    expect(ariaOf({ ...OFFSET_ONE, medium: 'ruler', items: [{ name: 'pita', start: 0, length: 8 }] }))
      .toContain('Ujung kirinya tepat di angka 0')
  })

  test('labels the choices on a "longest" board without hinting the winner', () => {
    const aria = ariaOf(OFFSET_LONGEST)
    expect(aria).toContain('A. Pensil')
    expect(aria).toContain('B. Ranting')
    expect(aria).not.toMatch(/paling panjang|lebih panjang|terpanjang|longest/i)
  })

  test('speaks no number except the 0 on the ruler — no length, end reading or difference', () => {
    for (const p of ALL_CASES) {
      const aria = ariaOf(p)
      expect(aria.length).toBeGreaterThan(40)
      // the only digit allowed anywhere is the ruler's own 0
      expect(aria.replace(/0/g, '')).not.toMatch(/\d/)
      for (const it of p.items) {
        expect(aria).not.toContain(String(it.length))
        expect(aria).not.toContain(String(it.start + it.length))
      }
    }
  })
})

describe('countingStops', () => {
  test('short spans are still counted one unit at a time', () => {
    expect(countingStops(1)).toEqual([])
    expect(countingStops(2)).toEqual([1])
    expect(countingStops(4)).toEqual([1, 2, 3])
    expect(countingStops(5)).toEqual([1, 2, 3, 4])
  })

  test('long spans jump in equal steps instead of one beat per unit', () => {
    expect(countingStops(6)).toEqual([2, 4])
    expect(countingStops(8)).toEqual([2, 4, 6])
    expect(countingStops(10)).toEqual([3, 6, 9])
    expect(countingStops(20)).toEqual([5, 10, 15])
  })

  test('never more than 4 stops, always climbing, never reaching the total', () => {
    for (let L = 1; L <= 20; L++) {
      const stops = countingStops(L)
      expect(stops.length).toBeLessThanOrEqual(4)
      expect(stops.every((k) => k >= 1 && k < L)).toBe(true)
      expect([...stops].sort((a, b) => a - b)).toEqual(stops)
      expect(new Set(stops).size).toBe(stops.length)
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

  test('both ends in one beat, then the trap gets a beat of its own', () => {
    const phases = sb.steps.map((s) => s.phase)
    expect(phases.slice(0, 3)).toEqual(['intro', 'start', 'trap'])
    expect(sb.steps[1].caption).toBe('Pita mulai di angka 3, bukan 0, dan berhenti di angka 11.')
    expect(sb.steps[1].markStart && sb.steps[1].markEnd).toBe(true)
    const trap = sb.steps[2].trap
    expect(trap).toEqual({ wrong: 11, from: 0, to: 3 })
    // the trap's tempting number is the end reading, and it is NOT the answer
    expect(String(trap?.wrong)).not.toBe(sb.answer)
    expect(sb.steps[2].caption).toContain('11')
    expect(sb.steps[2].caption).toContain('0 sampai 3')
  })

  test('an 8-unit span is swept in jumps, tally climbing, stopping short of 8', () => {
    const counts = sb.steps.filter((s) => s.phase === 'count').map((s) => s.countTo)
    expect(counts).toEqual([2, 4, 6])
    expect(sb.steps.filter((s) => s.phase === 'count').map((s) => s.tally)).toEqual([2, 4, 6])
    expect(sb.steps.every((s) => s.countTo <= 8)).toBe(true)
    expect(sb.steps[3].caption).toBe('Hitung: 2 cm')
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
    expect(sb.steps[1].caption).toBe('Pensil mulai tepat di angka 0 dan berhenti di angka 7.')
    expect(sb.steps[sb.finalIndex].caption).toBe('Panjang = 7 − 0 = 7 cm.')
  })

  test('a 6-square chain counts 2, 4 and then lands 6', () => {
    const sb = buildLengthMeasureSteps(CHAIN_ONE, 'id')
    const tallies = sb.steps.filter((s) => s.phase === 'count').map((s) => s.tally)
    expect(tallies).toEqual([2, 4])
    const last = sb.steps[sb.finalIndex]
    expect(last.countTo).toBe(6) // counted squares === the object's length
    expect(last.tally).toBe(6)
    expect(last.caption).toBe('Hitungan terakhir 6, jadi panjangnya 6 petak.')
    expect(sb.steps.some((s) => s.trap !== null)).toBe(false)
  })

  test('a 4-square chain is still counted one square at a time', () => {
    const sb = buildLengthMeasureSteps(
      { ...CHAIN_ONE, rulerMax: 4, items: [{ name: 'krayon', start: 0, length: 4 }] },
      'id',
    )
    expect(sb.steps.filter((s) => s.phase === 'count').map((s) => s.tally)).toEqual([1, 2, 3])
    expect(sb.steps[2].caption).toBe('Hitung: 1 petak')
  })

  test('english uses singular/plural square wording', () => {
    const sb = buildLengthMeasureSteps(CHAIN_ONE, 'en')
    expect(sb.steps.find((s) => s.phase === 'count')?.caption).toBe('Count: 2 squares')
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

  test('one measuring beat per object, then the bars line up before deciding', () => {
    const phases = sb.steps.map((s) => s.phase)
    expect(phases.filter((ph) => ph === 'span')).toHaveLength(2)
    expect(phases[phases.length - 2]).toBe('compare')
    expect(sb.steps.find((s) => s.phase === 'span')?.caption).toBe(
      'Pensil dari 1 sampai 9, jadi 9 − 1 = 8 cm.',
    )
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
  test('deterministic, ≥3 beats, exactly one result beat, no NaN', () => {
    for (const p of ALL_CASES) {
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

  test('no storyboard runs longer than 8 beats', () => {
    for (const p of ALL_CASES) {
      for (const lang of ['id', 'en'] as const) {
        expect(buildLengthMeasureSteps(p, lang).steps.length).toBeLessThanOrEqual(8)
      }
    }
  })

  test('measured lengths only ever grow, and always equal the real length', () => {
    for (const p of ALL_CASES) {
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
    for (const p of ALL_CASES) {
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
