// In-card figure for WMI-23P3A-Q5 (2023 Grade-3 Semifinal, Paper A, question 5).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q5.jpg (NOT embedded):
// four shapes drawn on 1 cm grid paper. "Each square is 1 cm² — which shape has
// an area of exactly 12 cm²?"  Answer: A.
//
//   A (pink "flag"): a 4×4 block with a triangular V-notch cut into its right
//                    edge (depth 2). Area = 16 − ½·4·2 = 12 cm².  ✓
//   B (blue plus)  : a symmetric cross — vertical bar 1×5 and horizontal bar
//                    5×1 overlapping in one cell → 5 + 5 − 1 = 9 cm².
//   C (green right-trapezoid): top 5, bottom 2, height 4, slant leaning
//                    down-left → (5+2)/2·4 = 14 cm².
//   D (orange rectangle): 5 wide × 3 tall = 15 cm².
//
// Each shape's area is computed deterministically from its polygon (shoelace),
// so the "= 12" target is verified, not asserted. The static figure is
// PROBLEM-ONLY: it shows the four shapes on the grid, never which one wins.
// Pure render, SSR-safe, deterministic.

type Pt = [number, number] // grid coordinates (x → right, y → down), 1 unit = 1 cm

export interface GridShape {
  label: string
  /** Polygon outline in grid units, traced in order. */
  poly: Pt[]
  fill: string
  stroke: string
  /** grid-space offset of the whole shape from the grid origin */
  origin: Pt
  /** where the letter label sits, in grid units relative to `origin` */
  labelAt: Pt
}

/** Signed polygon area via the shoelace formula; absolute value = area in cm². */
export function polygonArea(poly: Pt[]): number {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

// ---- the four shapes, in local grid units -----------------------------------

const A_POLY: Pt[] = [
  [0, 0],
  [4, 0],
  [2, 2], // notch apex (cut inward)
  [4, 4],
  [0, 4],
]
// Blue plus / cross (as in the scan): a vertical bar 1 wide × 5 tall crossed by
// a horizontal bar 5 wide × 1 tall through the middle. Cells = 5 + 5 − 1 = 9 cm².
const B_POLY: Pt[] = [
  [2, 0],
  [3, 0],
  [3, 2],
  [5, 2],
  [5, 3],
  [3, 3],
  [3, 5],
  [2, 5],
  [2, 3],
  [0, 3],
  [0, 2],
  [2, 2],
]
const C_POLY: Pt[] = [
  [0, 0],
  [5, 0], // top edge = 5
  [2, 4], // slanted edge down-left to the bottom
  [0, 4], // bottom edge = 2
]
const D_POLY: Pt[] = [
  [0, 0],
  [5, 0],
  [5, 3],
  [0, 3],
]

export const SHAPES: GridShape[] = [
  { label: 'A', poly: A_POLY, fill: '#F4C7CC', stroke: '#C0414C', origin: [1, 1], labelAt: [1.5, 2.2] },
  { label: 'B', poly: B_POLY, fill: '#AEDCF3', stroke: '#3F86B5', origin: [7, 1], labelAt: [2.5, 2.5] },
  { label: 'C', poly: C_POLY, fill: '#CFE08A', stroke: '#7A9A1F', origin: [14, 1], labelAt: [1.4, 2.4] },
  { label: 'D', poly: D_POLY, fill: '#F8D6A0', stroke: '#C98A2E', origin: [22, 2], labelAt: [2.5, 1.5] },
]

/** Area (cm²) of each shape, keyed by label — derived, used by the explainer. */
export const SHAPE_AREAS: Record<string, number> = Object.fromEntries(
  SHAPES.map((s) => [s.label, polygonArea(s.poly)]),
)
export const TARGET_AREA = 12

// ---- pixel layout -----------------------------------------------------------
const CELL = 26
const PAD = 10
const COLS = 28
const ROWS = 8
const VIEW_W = PAD * 2 + COLS * CELL
const VIEW_H = PAD * 2 + ROWS * CELL

const GRID = '#C9CDD2'
const INK = '#2A2A2A'

function toPx(origin: Pt, p: Pt): Pt {
  return [PAD + (origin[0] + p[0]) * CELL, PAD + (origin[1] + p[1]) * CELL]
}

export interface ShapeGridProps {
  /** Label of the shape currently being measured (rings it + dims the rest). */
  focus?: string | null
  /** Show "= N" area badges next to shapes that have been measured. */
  measured?: string[]
  /** Label of the winning shape to ring in green (explainer's result beat). */
  winner?: string | null
}

export function ShapeGrid({ focus = null, measured = [], winner = null }: ShapeGridProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* grid */}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line key={`v${c}`} x1={PAD + c * CELL} y1={PAD} x2={PAD + c * CELL} y2={PAD + ROWS * CELL} stroke={GRID} strokeWidth={1} />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line key={`h${r}`} x1={PAD} y1={PAD + r * CELL} x2={PAD + COLS * CELL} y2={PAD + r * CELL} stroke={GRID} strokeWidth={1} />
      ))}

      {SHAPES.map((s) => {
        const dim = focus != null && focus !== s.label
        const isFocus = focus === s.label
        const isWinner = winner === s.label
        const pts = s.poly.map((p) => toPx(s.origin, p).join(',')).join(' ')
        const [lx, ly] = toPx(s.origin, s.labelAt)
        const isMeasured = measured.includes(s.label)
        // place the area badge above the shape's top-left vertex
        const [bx, by] = toPx(s.origin, [0, 0])
        return (
          <g key={s.label} opacity={dim ? 0.32 : 1}>
            <polygon
              points={pts}
              fill={s.fill}
              stroke={isWinner ? '#1D7A46' : isFocus ? '#2f6df0' : s.stroke}
              strokeWidth={isWinner || isFocus ? 3.5 : 2}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={16} fontStyle="italic" fontWeight={700} fill={INK}>
              {s.label}
            </text>
            {isMeasured && (
              <g>
                <rect x={bx - 4} y={by - 24} width={48} height={20} rx={5} fill="#FFFFFF" stroke={isWinner ? '#1D7A46' : '#2f6df0'} strokeWidth={2} />
                <text
                  x={bx + 20}
                  y={by - 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={900}
                  fill={isWinner ? '#1D7A46' : '#2f6df0'}
                >
                  {`= ${SHAPE_AREAS[s.label]}`}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P23G3Q5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four shapes A, B, C and D drawn on 1 cm grid paper: a pink notched block, a blue cross, a green trapezoid and an orange rectangle."
    >
      <ShapeGrid />
    </div>
  )
}
