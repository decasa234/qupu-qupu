// Shape-count chart figure for WMI-19F2A-Q4.
// The scattered figure contains: circles 10, squares 7, triangles 4, bars 6.
// Answer C: Circle 10, Square 7, Triangle 4, Bar 6.
// (In the scanned paper the 6-count shape is a long thin rectangle / bar, and the
//  triangles include three up-pointing and one down-pointing — four in all.)
export type G2ShapeKind = 'circle' | 'square' | 'triangle' | 'bar'

export interface G2ShapeRow {
  kind: G2ShapeKind
  count: number
  symbol: string
  color: string
}

export const G2_SHAPE_ROWS: G2ShapeRow[] = [
  { kind: 'circle', count: 10, symbol: '○', color: '#2563EB' },
  { kind: 'square', count: 7, symbol: '□', color: '#059669' },
  { kind: 'triangle', count: 4, symbol: '△', color: '#D97706' },
  { kind: 'bar', count: 6, symbol: '▬', color: '#7C3AED' },
]

export const G2_VIEW_W = 420
export const G2_VIEW_H = 220

// ---- Scatter (left) layout -------------------------------------------------
const SCATTER_X0 = 14
const SCATTER_Y0 = 18
const SCATTER_COLS = 5
const SCATTER_DX = 30
const SCATTER_DY = 34
const SCATTER_W = G2_VIEW_W * 0.46

interface G2ScatterItem {
  kind: G2ShapeKind
  cx: number
  cy: number
  color: string
}

/** A deterministic, mildly-jittered scatter of all shapes grouped by kind. */
export function g2ScatterItems(): G2ScatterItem[] {
  const out: G2ScatterItem[] = []
  let n = 0
  for (const row of G2_SHAPE_ROWS) {
    for (let i = 0; i < row.count; i++) {
      const col = n % SCATTER_COLS
      const line = Math.floor(n / SCATTER_COLS)
      // tiny deterministic jitter so it reads as a "group", not a grid
      const jx = ((n * 7) % 5) - 2
      const jy = ((n * 13) % 5) - 2
      out.push({
        kind: row.kind,
        cx: SCATTER_X0 + col * SCATTER_DX + 12 + jx,
        cy: SCATTER_Y0 + line * SCATTER_DY + 12 + jy,
        color: row.color,
      })
      n++
    }
  }
  return out
}

function G2ScatterShape({ item, dim }: { item: G2ScatterItem; dim: boolean }) {
  const o = dim ? 0.18 : 1
  const r = 9
  switch (item.kind) {
    case 'circle':
      return <circle cx={item.cx} cy={item.cy} r={r} fill={item.color} opacity={o} />
    case 'square':
      return <rect x={item.cx - r} y={item.cy - r} width={r * 2} height={r * 2} rx={2} fill={item.color} opacity={o} />
    case 'triangle':
      return (
        <polygon
          points={`${item.cx},${item.cy - r} ${item.cx - r},${item.cy + r} ${item.cx + r},${item.cy + r}`}
          fill={item.color}
          opacity={o}
        />
      )
    case 'bar':
      return <rect x={item.cx - r} y={item.cy - 4} width={r * 2} height={8} rx={2} fill={item.color} opacity={o} />
  }
}

// ---- Bar chart (right) layout ---------------------------------------------
const CHART_X = SCATTER_W + 30
const CHART_Y0 = 28
const ROW_H = 40
const BAR_H = 22
const UNIT = 11 // px per unit count
const AXIS_MAX = 10

export interface G2ShapeChartProps {
  /** Index of the row currently being counted/grown (0..3); null = show all full. */
  activeRow?: number | null
  /** When true, every bar is drawn at full length regardless of activeRow. */
  showAll?: boolean
}

const HILITE_STROKE = '#D97706'

export function ShapeCountG2Chart({ activeRow = null, showAll = false }: G2ShapeChartProps) {
  return (
    <svg
      viewBox={`0 0 ${G2_VIEW_W} ${G2_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Divider between scatter and chart */}
      <line x1={SCATTER_W + 12} y1={10} x2={SCATTER_W + 12} y2={G2_VIEW_H - 10} stroke="#E2E8F0" strokeWidth={2} />

      {/* Scatter group */}
      {g2ScatterItems().map((it, i) => (
        <G2ScatterShape key={i} item={it} dim={activeRow != null && !showAll && G2_SHAPE_ROWS[activeRow].kind !== it.kind} />
      ))}

      {/* Chart axis */}
      <line
        x1={CHART_X}
        y1={CHART_Y0 - 8}
        x2={CHART_X}
        y2={CHART_Y0 + G2_SHAPE_ROWS.length * ROW_H - 8}
        stroke="#94A3B8"
        strokeWidth={2}
      />

      {/* Chart rows */}
      {G2_SHAPE_ROWS.map((row, i) => {
        const grown = showAll || activeRow == null ? true : i <= activeRow
        const len = grown ? row.count * UNIT : 0
        const y = CHART_Y0 + i * ROW_H
        const active = !showAll && activeRow === i
        return (
          <g key={row.kind}>
            <text x={CHART_X - 6} y={y + BAR_H / 2} textAnchor="end" dominantBaseline="central" fontSize={16} fill={row.color} fontWeight={800}>
              {row.symbol}
            </text>
            <rect
              x={CHART_X + 2}
              y={y}
              width={Math.max(len, 0.001)}
              height={BAR_H}
              rx={3}
              fill={row.color}
              opacity={grown ? 1 : 0}
              stroke={active ? HILITE_STROKE : 'none'}
              strokeWidth={active ? 2.5 : 0}
            />
            {grown && (
              <text x={CHART_X + len + 8} y={y + BAR_H / 2} dominantBaseline="central" fontSize={14} fontWeight={800} fill="#1F2937">
                {row.count}
              </text>
            )}
          </g>
        )
      })}

      {/* Axis tick label */}
      <text x={CHART_X + AXIS_MAX * UNIT} y={CHART_Y0 + G2_SHAPE_ROWS.length * ROW_H + 4} textAnchor="middle" fontSize={11} fill="#94A3B8">
        {AXIS_MAX}
      </text>
    </svg>
  )
}

// ---- Illustration: scatter only (the question is to COUNT the jumble) -------
// The in-card figure shows just the scattered shapes — NO chart. The four bar
// charts are the A–D answer options (rendered by ShapeCountOption); a chart in
// the figure would pre-reveal the answer. Shapes are spread full-width and
// jumbled (a coprime permutation) so counting each kind is a real task.
const ILLUS_W = 420
const ILLUS_H = 168
const ILLUS_COLS = 9
const ILLUS_ROWS = 3 // 9 × 3 = 27 = total shape count
const ILLUS_MX = 30
const ILLUS_MY = 26

function illusScatterItems(): G2ScatterItem[] {
  const flat: { kind: G2ShapeKind; color: string }[] = []
  for (const row of G2_SHAPE_ROWS) for (let i = 0; i < row.count; i++) flat.push({ kind: row.kind, color: row.color })
  const N = flat.length // 27
  const dx = (ILLUS_W - 2 * ILLUS_MX) / ILLUS_COLS
  const dy = (ILLUS_H - 2 * ILLUS_MY) / ILLUS_ROWS
  return flat.map((s, n) => {
    const cell = (n * 7) % N // gcd(7, 27) = 1 → a bijection that jumbles the kinds
    const col = cell % ILLUS_COLS
    const line = Math.floor(cell / ILLUS_COLS)
    const jx = ((n * 11) % 7) - 3
    const jy = ((n * 5) % 7) - 3
    return {
      kind: s.kind,
      color: s.color,
      cx: ILLUS_MX + col * dx + dx / 2 + jx,
      cy: ILLUS_MY + line * dy + dy / 2 + jy,
    }
  })
}

export default function ShapeCountG2Illustration() {
  const label = G2_SHAPE_ROWS.map((r) => `${r.kind} ${r.count}`).join(', ')
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A jumbled group of shapes to count and organise: ${label}.`}
    >
      <svg
        viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`}
        width="100%"
        style={{ maxWidth: ILLUS_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {illusScatterItems().map((it, i) => (
          <G2ScatterShape key={i} item={it} dim={false} />
        ))}
      </svg>
    </div>
  )
}
