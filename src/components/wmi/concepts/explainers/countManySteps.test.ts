import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CountManyObjectsIllustration from '../count-many-objects/index'
import {
  buildCountManyGroups,
  buildCountManySteps,
  countManyFigure,
  countManyGrouping,
  scatterScanOrder,
  type CountManyLayout,
  type Dot,
} from './countManySteps'

const LAYOUTS: CountManyLayout[] = ['rows', 'scatter', 'grouped-tens']

/** Every `translate(x y)` the real question figure emits, in draw order. */
function figureDots(layout: CountManyLayout, total: number, perRow: number): Dot[] {
  const html = renderToStaticMarkup(
    createElement(CountManyObjectsIllustration, { params: { icon: 'star', layout, total, perRow } }),
  )
  const out: Dot[] = []
  const re = /translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) out.push({ x: Number(m[1]), y: Number(m[2]) })
  return out
}

function distToSeg(p: Dot, a: Dot, b: Dot): number {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const L2 = vx * vx + vy * vy
  if (L2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2))
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy))
}

function distToPath(p: Dot, pts: Dot[]): number {
  if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y)
  let min = Infinity
  for (let i = 1; i < pts.length; i++) min = Math.min(min, distToSeg(p, pts[i - 1], pts[i]))
  return min
}

describe('countManySteps — geometry is pinned to the question figure', () => {
  test('every icon lands on the exact coordinate the figure draws', () => {
    const cases: [CountManyLayout, number, number][] = [
      ['rows', 34, 8],
      ['rows', 15, 5],
      ['rows', 65, 10],
      ['rows', 40, 10],
      ['scatter', 22, 5],
      ['scatter', 37, 7],
      ['scatter', 65, 9],
      ['scatter', 15, 6],
      ['grouped-tens', 15, 6],
      ['grouped-tens', 38, 7],
      ['grouped-tens', 60, 5],
      ['grouped-tens', 65, 8],
    ]
    for (const [layout, total, perRow] of cases) {
      const fig = countManyFigure(layout, total, perRow)
      const drawn = figureDots(layout, total, perRow)
      expect(drawn.length, `${layout}/${total}/${perRow} icon count`).toBe(total)
      expect(fig.dots.length).toBe(total)
      fig.dots.forEach((d, i) => {
        expect(Number(d.x.toFixed(2)), `${layout}/${total} dot ${i}.x`).toBe(drawn[i].x)
        expect(Number(d.y.toFixed(2)), `${layout}/${total} dot ${i}.y`).toBe(drawn[i].y)
      })
    }
  })
})

describe('countManyGrouping — agrees with the concept hint steps', () => {
  test('rows chunk by perRow, tens by 10, scatter by 5', () => {
    expect(countManyGrouping('rows', 34, 8)).toEqual({ step: 8, chunks: 4, leftover: 2 })
    expect(countManyGrouping('grouped-tens', 38, 7)).toEqual({ step: 10, chunks: 3, leftover: 8 })
    expect(countManyGrouping('scatter', 22, 5)).toEqual({ step: 5, chunks: 4, leftover: 2 })
  })

  test('step * chunks + leftover === total for the whole param space', () => {
    for (const layout of LAYOUTS) {
      for (let perRow = 5; perRow <= 10; perRow++) {
        for (let total = 15; total <= 65; total++) {
          const { step, chunks, leftover } = countManyGrouping(layout, total, perRow)
          expect(step * chunks + leftover).toBe(total)
          expect(leftover).toBeLessThan(step)
        }
      }
    }
  })
})

describe('buildCountManyGroups — a partition, and rings that hug their own icons', () => {
  test('every icon belongs to exactly one group or the leftover', () => {
    for (const layout of LAYOUTS) {
      for (let perRow = 5; perRow <= 10; perRow++) {
        for (let total = 15; total <= 65; total++) {
          const fig = countManyFigure(layout, total, perRow)
          const { groups, leftoverGroup } = buildCountManyGroups(layout, total, perRow, fig)
          const seen = new Set<number>()
          for (const g of [...groups, ...(leftoverGroup ? [leftoverGroup] : [])]) {
            for (const i of g.members) {
              expect(seen.has(i), `${layout}/${total}/${perRow} icon ${i} twice`).toBe(false)
              seen.add(i)
            }
          }
          expect(seen.size).toBe(total)
        }
      }
    }
  })

  test('scatter scan order is a permutation with only short hops', () => {
    for (let perRow = 5; perRow <= 10; perRow++) {
      for (let total = 15; total <= 65; total++) {
        const fig = countManyFigure('scatter', total, perRow)
        const cols = Math.max(perRow, Math.ceil(total / 8))
        const order = scatterScanOrder(total, cols)
        expect(new Set(order).size).toBe(total)
        const { groups } = buildCountManyGroups('scatter', total, perRow, fig)
        for (const g of groups) {
          for (let k = 1; k < g.members.length; k++) {
            const a = fig.dots[g.members[k - 1]]
            const b = fig.dots[g.members[k]]
            // one lattice step (28) plus stagger and jitter — never a jump
            // across the board, which is what keeps the lasso tight.
            expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(45)
          }
        }
      }
    }
  })

  test('a ring contains its own icons and never touches a stranger', () => {
    const cases: [CountManyLayout, number, number][] = [
      ['rows', 34, 8],
      ['rows', 65, 10],
      ['scatter', 22, 5],
      ['scatter', 58, 8],
      ['grouped-tens', 47, 6],
      ['grouped-tens', 65, 8],
    ]
    for (const [layout, total, perRow] of cases) {
      const fig = countManyFigure(layout, total, perRow)
      const { groups, leftoverGroup } = buildCountManyGroups(layout, total, perRow, fig)
      const all = [...groups, ...(leftoverGroup ? [leftoverGroup] : [])]
      for (const g of all) {
        const own = new Set(g.members)
        if (g.ring.kind === 'rect') {
          const { x, y, w, h } = g.ring
          for (const i of g.members) {
            const d = fig.dots[i]
            expect(d.x - fig.r).toBeGreaterThanOrEqual(x)
            expect(d.x + fig.r).toBeLessThanOrEqual(x + w)
            expect(d.y - fig.r).toBeGreaterThanOrEqual(y)
            expect(d.y + fig.r).toBeLessThanOrEqual(y + h)
          }
          for (let i = 0; i < total; i++) {
            if (own.has(i)) continue
            const d = fig.dots[i]
            const inside =
              d.x + fig.r > x && d.x - fig.r < x + w && d.y + fig.r > y && d.y - fig.r < y + h
            expect(inside, `${layout}/${total}: stranger ${i} touches ring ${g.index}`).toBe(false)
          }
        } else {
          const pts = g.ring.points
          const half = g.ring.width / 2
          for (const i of g.members) {
            // members are the rope's own vertices, so they sit dead centre
            expect(distToPath(fig.dots[i], pts)).toBeLessThanOrEqual(half - fig.r)
          }
          for (let i = 0; i < total; i++) {
            if (own.has(i)) continue
            expect(
              distToPath(fig.dots[i], pts),
              `${layout}/${total}: stranger ${i} clipped by ring ${g.index}`,
            ).toBeGreaterThan(half + fig.r)
          }
        }
      }
    }
  })
})

describe('buildCountManySteps — the storyboard deduces, never asserts', () => {
  const params = { icon: 'star', layout: 'scatter', total: 58, perRow: 8, distractorDeltas: [-4, -2, 2] }

  test('beats run intro → slip → plan → skip-count → leftover → total', () => {
    const sb = buildCountManySteps(params, 'id')
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
    expect(sb.steps.map((s) => s.id).slice(0, 3)).toEqual(['intro', 'slip', 'plan'])
    expect(sb.steps[sb.finalIndex].id).toBe('total')
    expect(sb.steps.filter((s) => s.id === 'count')).toHaveLength(sb.chunks)
    expect(sb.steps.filter((s) => s.id === 'rest')).toHaveLength(1)
  })

  test('the running totals skip-count by the group size and sum to the total', () => {
    const sb = buildCountManySteps(params, 'id')
    expect(sb.step).toBe(5)
    expect(sb.chunks).toBe(11)
    expect(sb.leftover).toBe(3)
    const counts = sb.steps.filter((s) => s.id === 'count').map((s) => s.running)
    expect(counts).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
    const sizes = [...sb.groups.map((g) => g.size), ...(sb.leftoverGroup ? [sb.leftoverGroup.size] : [])]
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(sb.total)
    expect(sb.steps[sb.finalIndex].running).toBe(58)
    expect(sb.steps[sb.finalIndex].equation).toBe('55 + 3 = 58')
  })

  test('only the last beat lands the answer', () => {
    const sb = buildCountManySteps(params, 'id')
    expect(sb.answerLabel).toBe('C') // 54, 56, 58, 60 → 58 sits third
    sb.steps.slice(0, sb.finalIndex).forEach((s) => {
      expect(s.answerLabel).toBeNull()
      expect(s.result).toBe(false)
      expect(s.running === null || s.running < sb.total).toBe(true)
      expect(s.caption).not.toContain(String(sb.total))
    })
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.answerLabel).toBe('C')
    expect(last.caption).toContain('Jawabannya C')
  })

  test('with no leftover the final jump IS the landing beat', () => {
    const sb = buildCountManySteps(
      { icon: 'ball', layout: 'rows', total: 40, perRow: 8, distractorDeltas: [-2, 2, 4] },
      'id',
    )
    expect(sb.leftover).toBe(0)
    expect(sb.steps.filter((s) => s.id === 'rest')).toHaveLength(0)
    expect(sb.steps.filter((s) => s.id === 'count')).toHaveLength(sb.chunks - 1)
    const last = sb.steps[sb.finalIndex]
    expect(last.running).toBe(40)
    expect(last.caption).toContain('Tidak ada sisa')
    sb.steps.slice(0, sb.finalIndex).forEach((s) => expect(s.running === null || s.running < 40).toBe(true))
  })

  test('the near-miss note names the number a one-by-one count lands on', () => {
    const sb = buildCountManySteps(params, 'id')
    expect(sb.trap).toBe(56)
    expect(sb.steps[sb.finalIndex].note).toContain('56')
    sb.steps.slice(0, sb.finalIndex).forEach((s) => expect(s.note).toBeNull())
  })

  test('language switch: id is the primary voice, en mirrors it', () => {
    const id = buildCountManySteps(params, 'id')
    const en = buildCountManySteps(params, 'en')
    expect(id.steps[0].caption).toContain('bintangnya banyak')
    expect(en.steps[0].caption).toContain('stars')
    expect(id.steps[2].caption).toBe('Lingkari 5-5 dulu.')
    expect(en.steps[2].caption).toBe('Ring off 5 at a time.')
    expect(en.steps[en.finalIndex].caption).toContain('The answer is C')
    expect(id.steps.length).toBe(en.steps.length)
  })

  test('an explicit correctAnswer wins over the computed label', () => {
    const sb = buildCountManySteps(params, 'id', 'B')
    expect(sb.steps[sb.finalIndex].answerLabel).toBe('B')
  })

  test('deterministic and SSR-safe: same params in, same storyboard out', () => {
    const a = buildCountManySteps(params, 'id')
    const b = buildCountManySteps({ ...params }, 'id')
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  test('handles all three layouts across totals 15–65 without holes', () => {
    for (const layout of LAYOUTS) {
      for (let perRow = 5; perRow <= 10; perRow++) {
        for (let total = 15; total <= 65; total++) {
          const sb = buildCountManySteps(
            { icon: 'leaf', layout, total, perRow, distractorDeltas: [-2, 1, 3] },
            'id',
          )
          expect(sb.steps.length).toBeGreaterThanOrEqual(3)
          expect(sb.dots).toHaveLength(total)
          expect(sb.steps[sb.finalIndex].running).toBe(total)
          expect(sb.steps[sb.finalIndex].answerLabel).toBe('B') // total-2, total, total+1, total+3
          sb.steps.forEach((s) => {
            expect(s.caption).not.toMatch(/undefined|NaN/)
            expect(Number.isFinite(s.hold)).toBe(true)
          })
        }
      }
    }
  })

  test('malformed params fall back to the figure sample instead of throwing', () => {
    const sb = buildCountManySteps({ icon: 'nope', layout: 'weird', total: 'x' }, 'id')
    expect(sb.icon).toBe('star')
    expect(sb.layout).toBe('rows')
    expect(sb.total).toBe(34)
    expect(sb.answerLabel).toBeNull()
    expect(sb.steps[sb.finalIndex].caption).not.toContain('undefined')
  })
})
