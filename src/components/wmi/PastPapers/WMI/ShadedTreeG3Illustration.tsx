// Shaded-area "tree" on a unit grid for WMI-19F3A-Q11.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q11.jpg: a 7×4 grid
// (each cell 1 cm²) with a tree of three flat-topped tiers + a trunk. Row by
// row the shaded area counts 2 + 3 + 4 + 1 = 10 cm² (whole squares plus halves
// that pair up).

export const ST_COLS = 7
export const ST_ROWS = 4

/** Tree pieces in grid units (x right, y down). Row areas: 2, 3, 4, 1. */
export const TREE_PIECES: ReadonlyArray<{ pts: Array<[number, number]>; row: number; area: number }> = [
  { pts: [[3, 0], [4, 0], [5, 1], [2, 1]], row: 0, area: 2 }, // top tier: (1+3)/2
  { pts: [[3, 1], [4, 1], [6, 2], [1, 2]], row: 1, area: 3 }, // middle tier: (1+5)/2
  { pts: [[3, 2], [4, 2], [7, 3], [0, 3]], row: 2, area: 4 }, // bottom tier: (1+7)/2
  { pts: [[3, 3], [4, 3], [4, 4], [3, 4]], row: 3, area: 1 }, // trunk: 1×1
]

export const ST_TOTAL = TREE_PIECES.reduce((s, p) => s + p.area, 0) // 10

export const ST_VIEW_W = 360
export const ST_VIEW_H = 220
const PAD_X = 26
const PAD_Y = 8
export const ST_CELL = (ST_VIEW_W - PAD_X * 2) / ST_COLS
const gx = (u: number) => PAD_X + u * ST_CELL
const gy = (v: number) => PAD_Y + v * ST_CELL

const INK = '#1F2937'
const SHADE = '#9CA3AF'
const GREEN = '#10B981'

export interface ShadedTreeFigureProps {
  /** Highlight this grid row (0..3) while counting, or null. */
  activeRow?: number | null
  /** Per-row counts revealed so far (rows 0..n-1 show their area chip). */
  countedRows?: number
}

export function ShadedTreeFigure({ activeRow = null, countedRows = 0 }: ShadedTreeFigureProps) {
  return (
    <svg viewBox={`0 0 ${ST_VIEW_W} ${ST_VIEW_H}`} width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* row highlight band */}
      {activeRow !== null && (
        <rect x={gx(0) - 3} y={gy(activeRow) - 3} width={ST_COLS * ST_CELL + 6} height={ST_CELL + 6} rx={6} fill="rgba(245,158,11,0.12)" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" />
      )}

      {/* shaded tree pieces */}
      {TREE_PIECES.map((p, i) => (
        <polygon
          key={i}
          points={p.pts.map(([u, v]) => `${gx(u)},${gy(v)}`).join(' ')}
          fill={activeRow === p.row ? '#FCD34D' : SHADE}
          stroke={INK}
          strokeWidth={1}
          opacity={activeRow === null || activeRow === p.row ? 1 : 0.45}
        />
      ))}

      {/* grid lines on top */}
      {Array.from({ length: ST_ROWS + 1 }).map((_, r) => (
        <line key={`h${r}`} x1={gx(0)} y1={gy(r)} x2={gx(ST_COLS)} y2={gy(r)} stroke={INK} strokeWidth={1.5} />
      ))}
      {Array.from({ length: ST_COLS + 1 }).map((_, c) => (
        <line key={`v${c}`} x1={gx(c)} y1={gy(0)} x2={gx(c)} y2={gy(ST_ROWS)} stroke={INK} strokeWidth={1.5} />
      ))}

      {/* per-row count chips */}
      {TREE_PIECES.map((p, i) =>
        i < countedRows ? (
          <text key={`c${i}`} x={gx(ST_COLS) + 14} y={gy(p.row) + ST_CELL / 2} dominantBaseline="central" fontSize={15} fontWeight={900} fill={GREEN} className="font-display">
            {p.area}
          </text>
        ) : null,
      )}
    </svg>
  )
}

export default function ShadedTreeG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A tree shape shaded on a grid of unit squares (7 by 4). Counting whole and half squares row by row gives ${ST_TOTAL} square centimetres.`}
    >
      <ShadedTreeFigure />
    </div>
  )
}
