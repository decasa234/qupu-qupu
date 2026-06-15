// "How many shapes are divided into equal parts?" — WMI-21P3A-Q10.
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g3-a-q10.jpg: a strip of six
// boxed shapes, each cut by some lines.
//   1 pink circle    — one OFF-CENTRE chord → 2 UNEQUAL parts (trap)
//   2 blue triangle  — Y-split from the centroid → 3 EQUAL parts ✓
//   3 yellow bar     — 4 EQUAL horizontal strips ✓
//   4 purple ▽ tri   — two slanted cuts → 3 UNEQUAL parts (trap)
//   5 orange square  — one diagonal → 2 EQUAL triangles ✓
//   6 green bar      — narrow middle strip + two ends → 3 UNEQUAL parts (trap)
// Exactly 3 are split into equal parts → answer B.
//
// The static figure shows ONLY the shapes (no equal/unequal verdicts).
import type { CSSProperties } from 'react'

export interface ShapeCell {
  id: string
  /** True when the shape is divided into equal parts. */
  equal: boolean
  /** Number of parts the shape is cut into. */
  parts: number
}

export const SHAPE_CELLS: ShapeCell[] = [
  { id: 'circle', equal: false, parts: 2 },
  { id: 'triangle', equal: true, parts: 3 },
  { id: 'yellowBar', equal: true, parts: 4 },
  { id: 'invTriangle', equal: false, parts: 3 },
  { id: 'square', equal: true, parts: 2 },
  { id: 'greenBar', equal: false, parts: 3 },
]

export const EQUAL_COUNT = SHAPE_CELLS.filter((c) => c.equal).length // 3

const STROKE = '#1F2937'
const PINK = '#F9C9DE'
const BLUE = '#BFE0F2'
const YELLOW = '#F7CE46'
const PURPLE = '#C9BFEA'
const ORANGE = '#F0A878'
const GREEN = '#AFD46A'

const CELL = 110
export const Q10_VIEW_W = CELL * SHAPE_CELLS.length // 660
export const Q10_VIEW_H = 150
const CY = 70 // vertical centre of a shape inside its cell

/** Draw one shape centred in its cell box. cx is the cell's left edge. */
function ShapeGlyph({ id, x0 }: { id: string; x0: number }) {
  const cx = x0 + CELL / 2
  switch (id) {
    case 'circle': {
      const r = 40
      return (
        <g>
          <circle cx={cx} cy={CY} r={r} fill={PINK} stroke={STROKE} strokeWidth={2.5} />
          {/* off-centre chord (NOT a diameter) → unequal halves */}
          <line x1={cx - r * 0.78} y1={CY + r * 0.62} x2={cx + r * 0.5} y2={CY - r * 0.84} stroke={STROKE} strokeWidth={2.5} />
        </g>
      )
    }
    case 'triangle': {
      // upward equilateral-ish triangle, Y-split from the centroid
      const top: [number, number] = [cx, CY - 42]
      const bl: [number, number] = [cx - 44, CY + 36]
      const br: [number, number] = [cx + 44, CY + 36]
      const cen: [number, number] = [cx, CY + 10] // centroid-ish
      const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      return (
        <g>
          <polygon points={`${top} ${bl} ${br}`} fill={BLUE} stroke={STROKE} strokeWidth={2.5} />
          <line x1={cen[0]} y1={cen[1]} x2={mid(top, bl)[0]} y2={mid(top, bl)[1]} stroke={STROKE} strokeWidth={2.2} />
          <line x1={cen[0]} y1={cen[1]} x2={mid(top, br)[0]} y2={mid(top, br)[1]} stroke={STROKE} strokeWidth={2.2} />
          <line x1={cen[0]} y1={cen[1]} x2={mid(bl, br)[0]} y2={mid(bl, br)[1]} stroke={STROKE} strokeWidth={2.2} />
        </g>
      )
    }
    case 'yellowBar': {
      const w = 40
      const h = 84
      const top = CY - h / 2
      return (
        <g>
          <rect x={cx - w / 2} y={top} width={w} height={h} fill={YELLOW} stroke={STROKE} strokeWidth={2.5} />
          {[1, 2, 3].map((k) => (
            <line key={k} x1={cx - w / 2} y1={top + (h / 4) * k} x2={cx + w / 2} y2={top + (h / 4) * k} stroke={STROKE} strokeWidth={2.2} />
          ))}
        </g>
      )
    }
    case 'invTriangle': {
      // downward triangle with two slanted cuts → unequal pieces
      const tl: [number, number] = [cx - 48, CY - 26]
      const tr: [number, number] = [cx + 48, CY - 26]
      const bot: [number, number] = [cx, CY + 42]
      return (
        <g>
          <polygon points={`${tl} ${tr} ${bot}`} fill={PURPLE} stroke={STROKE} strokeWidth={2.5} />
          {/* two cuts from the top edge down to the bottom vertex, off-centre → unequal */}
          <line x1={cx - 14} y1={CY - 26} x2={bot[0]} y2={bot[1]} stroke={STROKE} strokeWidth={2.2} />
          <line x1={cx + 6} y1={CY - 26} x2={bot[0]} y2={bot[1]} stroke={STROKE} strokeWidth={2.2} />
        </g>
      )
    }
    case 'square': {
      const s = 78
      const left = cx - s / 2
      const top = CY - s / 2
      return (
        <g>
          <rect x={left} y={top} width={s} height={s} fill={ORANGE} stroke={STROKE} strokeWidth={2.5} />
          <line x1={left} y1={top + s} x2={left + s} y2={top} stroke={STROKE} strokeWidth={2.2} />
        </g>
      )
    }
    case 'greenBar': {
      // wide bar split into: end, narrow middle, end → unequal widths
      const w = 90
      const h = 46
      const left = cx - w / 2
      const top = CY - h / 2
      return (
        <g>
          <rect x={left} y={top} width={w} height={h} fill={GREEN} stroke={STROKE} strokeWidth={2.5} />
          <line x1={left + w * 0.42} y1={top} x2={left + w * 0.42} y2={top + h} stroke={STROKE} strokeWidth={2.2} />
          <line x1={left + w * 0.56} y1={top} x2={left + w * 0.56} y2={top + h} stroke={STROKE} strokeWidth={2.2} />
        </g>
      )
    }
    default:
      return null
  }
}

export interface Q10StripProps {
  /** Index (0..5) of the cell currently under inspection (highlight ring). -1 = none. */
  focusIdx?: number
  /** Cells whose equal/unequal verdict badge is revealed. */
  verdictIdx?: number[]
  /** Running count of equal shapes found so far. null = hide. */
  equalSoFar?: number | null
}

export function Q10Strip({ focusIdx = -1, verdictIdx = [], equalSoFar = null }: Q10StripProps) {
  const verdicts = new Set(verdictIdx)
  return (
    <svg
      viewBox={`0 0 ${Q10_VIEW_W} ${Q10_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 660, display: 'block', margin: '0 auto' } as CSSProperties}
      aria-hidden="true"
    >
      {SHAPE_CELLS.map((c, i) => {
        const x0 = i * CELL
        const focused = i === focusIdx
        const showVerdict = verdicts.has(i)
        return (
          <g key={c.id}>
            <rect
              x={x0 + 2}
              y={6}
              width={CELL - 4}
              height={Q10_VIEW_H - 40}
              fill="none"
              stroke={focused ? '#2f6df0' : '#D1D5DB'}
              strokeWidth={focused ? 3 : 1.5}
              rx={6}
            />
            <ShapeGlyph id={c.id} x0={x0} />
            {showVerdict && (
              <g>
                <circle cx={x0 + CELL / 2} cy={Q10_VIEW_H - 20} r={13} fill={c.equal ? '#D1FAE5' : '#FEE2E2'} stroke={c.equal ? '#10B981' : '#EF4444'} strokeWidth={2} />
                <text
                  x={x0 + CELL / 2}
                  y={Q10_VIEW_H - 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                  fontWeight={900}
                  fill={c.equal ? '#065F46' : '#991B1B'}
                >
                  {c.equal ? '✓' : '✕'}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {equalSoFar != null && (
        <text x={Q10_VIEW_W - 8} y={18} textAnchor="end" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#10B981">
          {`equal: ${equalSoFar}`}
        </text>
      )}
    </svg>
  )
}

export default function P21G3Q10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Six boxed shapes, each cut by some lines: a circle, a triangle, a tall bar, an inverted triangle, a square and a wide bar."
    >
      <Q10Strip />
    </div>
  )
}
