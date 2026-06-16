// In-card figure for WMI-22P3A-Q18 (2022 WMI Semifinal Grade 3, Paper A, Q18).
//
// Reconstructed from db/seed/wmi/figures/2022-semifinal-g3-a-q18.jpg:
// a large rectangle divided into a 4-column x 2-row grid of 8 small green
// rectangles (each 36 cm^2). A white "check-mark" (tick) shape is cut out of
// the green, drawn as a single polygon: a deep V on the left and a long arm
// sweeping up to the top-right corner.
//
// The figure shows ONLY the problem (the grid + the white tick + the "36 cm²"
// fact). It does NOT reveal the answer (white area = 72 cm²).
//
// Exported primitive `CheckGridFigure` is re-used by the explainer.

const GREEN = '#DCE8C0'      // light olive-green fill (matches the scan)
const GREEN_DARK = '#9DAE73' // grid lines / border
const INK = '#1F2937'
const WHITE = '#FFFFFF'

// --- geometry (SVG units; the grid is 4 wide x 2 tall) ------------------------

export const SMALL_AREA_CM2 = 36
export const N_SMALL = 8
export const TOTAL_CM2 = SMALL_AREA_CM2 * N_SMALL // 288
export const WHITE_CM2 = TOTAL_CM2 / 4            // 72 (answer D) — NOT shown statically

const COLS = 4
const ROWS = 2
const CELL = 78          // pixel size of one small rectangle (square-ish in px)
const PAD = 14           // padding around the grid (viewBox headroom)

const GRID_W = COLS * CELL // 312
const GRID_H = ROWS * CELL // 156

export const Q18_VIEW_W = GRID_W + PAD * 2
export const Q18_VIEW_H = GRID_H + PAD * 2

// Top-left of the grid inside the viewBox.
const OX = PAD
const OY = PAD

// Named corner points of the white tick, in grid coordinates (0..GRID_W, 0..GRID_H).
// Read off the scan: tip at the top-left corner, the V dips to mid, a short
// stub to the right, then the long arm rises to the top-right corner and the
// bottom point of the V sits low-centre.
function gx(col: number) {
  return OX + col * CELL
}
function gy(row: number) {
  return OY + row * CELL
}

// The white check-mark as a closed polygon (clockwise). Coordinates use the
// grid columns/rows so the shape lines up with the 4x2 lattice.
export const TICK_POINTS: ReadonlyArray<[number, number]> = [
  [gx(0.05), gy(0.05)], // top-left tip
  [gx(1.55), gy(1.05)], // inner elbow of the V (mid)
  [gx(4.0), gy(0.02)],  // long arm up to the top-right corner
  [gx(1.35), gy(2.0)],  // bottom point of the V (low-centre)
  [gx(0.55), gy(0.95)], // left edge back up
]

function tickPath(): string {
  return TICK_POINTS.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export interface CheckGridFigureProps {
  /** Show the "= 288 cm²" total-area note above the grid. */
  showTotal?: boolean
  /** Highlight the white tick region (deeper outline) — used by the explainer. */
  emphasizeWhite?: boolean
  /** Optional caption text for the white region (e.g. "72 cm²") — explainer only. */
  whiteLabel?: string
}

export function CheckGridFigure({ showTotal = false, emphasizeWhite = false, whiteLabel }: CheckGridFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${Q18_VIEW_W} ${Q18_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* green grid background */}
      <rect x={OX} y={OY} width={GRID_W} height={GRID_H} fill={GREEN} stroke={INK} strokeWidth={2.4} />

      {/* internal grid lines: 3 verticals, 1 horizontal */}
      {Array.from({ length: COLS - 1 }).map((_, i) => (
        <line key={`v${i}`} x1={gx(i + 1)} y1={OY} x2={gx(i + 1)} y2={OY + GRID_H} stroke={GREEN_DARK} strokeWidth={1.6} />
      ))}
      {Array.from({ length: ROWS - 1 }).map((_, i) => (
        <line key={`h${i}`} x1={OX} y1={gy(i + 1)} x2={OX + GRID_W} y2={gy(i + 1)} stroke={GREEN_DARK} strokeWidth={1.6} />
      ))}

      {/* white check-mark cut-out */}
      <polygon
        points={tickPath()}
        fill={WHITE}
        stroke={INK}
        strokeWidth={emphasizeWhite ? 3 : 2}
        strokeLinejoin="round"
      />

      {/* "36 cm²" tag inside one green cell so the fact is visible */}
      <text x={gx(3.5)} y={gy(1.5)} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#5C6B3A">
        36
      </text>
      <text x={gx(3.5)} y={gy(1.5) + 14} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="#5C6B3A">
        cm²
      </text>

      {showTotal && (
        <text x={Q18_VIEW_W / 2} y={OY - 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill="#2f6df0">
          {`8 × 36 = ${TOTAL_CM2} cm²`}
        </text>
      )}

      {whiteLabel && (
        <text x={gx(1.25)} y={gy(1.0)} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#065F46">
          {whiteLabel}
        </text>
      )}
    </svg>
  )
}

export default function P22G3Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A large rectangle split into 8 small green rectangles in a 4-by-2 grid, each 36 square centimetres. A white check-mark shape is cut out of the green. Find the white area."
    >
      <CheckGridFigure />
    </div>
  )
}
