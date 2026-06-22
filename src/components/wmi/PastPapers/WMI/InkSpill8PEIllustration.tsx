// IKMC 2022 Pre-Ecolier Q8 — "Some ink spilled on a piece of squared paper."
//
// PROBLEM ONLY: shows a 5-column × 4-row squared-paper grid with an irregular
// blue ink blob covering all 20 squares.  The answer (E = 20) is NOT revealed here —
// the static figure is exactly what appears in the paper.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
//
// Co-exported primitives used by InkSpill8PEExplainer:
//   GridLines        — the squared-paper grid lines (dark blue, 5×4)
//   InkBlob          — the irregular ink blob path
//   INK_FILL         — blob fill colour token
//   COLS / ROWS      — grid dimensions
//   CELL / PAD       — layout constants
//   SVG_W / SVG_H    — viewBox dimensions

// ── layout constants ──────────────────────────────────────────────────────────────
export const SVG_W = 280
export const SVG_H = 200
export const COLS = 5
export const ROWS = 4
export const PAD = 12
export const CELL = (SVG_W - PAD * 2) / COLS // 51.2

/** Grid x-coordinate for column index c (0 = left edge). */
export const gx = (c: number): number => PAD + c * CELL
/** Grid y-coordinate for row index r (0 = top edge). */
export const gy = (r: number): number => PAD + r * CELL

// ── colour tokens ─────────────────────────────────────────────────────────────────
export const INK_FILL = '#5BB8E8'    // cornflower-blue matching the original
export const INK_STROKE = '#3A8DC0'  // slightly darker outline
export const GRID_COLOR = '#2A4D80'  // dark navy matching the original grid lines
export const GRID_BG = '#FFFFFF'

// ── ink blob primitive ────────────────────────────────────────────────────────────
//
// The original figure shows a large, smooth organic blob that touches all four
// walls of the grid interior. It is re-created as a cubic-bezier closed path
// that fills roughly 80 % of the grid area with a lumpy perimeter — matching
// the squiggly-edged ink spill in the source image.
//
// Anchors are expressed in SVG coordinates so the explainer can overlay
// row-highlight rects in the same coordinate system.

export function InkBlob({ opacity = 1 }: { opacity?: number }) {
  // The blob hugs the interior walls and bulges outward near each edge midpoint,
  // with small indentations at corners (so corners look barely-touched, not missed).
  const x0 = gx(0)  // left wall
  const x5 = gx(COLS) // right wall
  const y0 = gy(0)  // top wall
  const y4 = gy(ROWS) // bottom wall
  const cx = (x0 + x5) / 2
  const cy = (y0 + y4) / 2

  // Key perimeter points (clock-wise from top-left corner):
  const tl = { x: x0 + 14, y: y0 + 10 }   // top-left near-corner
  const tm = { x: cx, y: y0 + 2 }          // top midpoint (bump up)
  const tr = { x: x5 - 12, y: y0 + 8 }    // top-right near-corner
  const rm = { x: x5 - 2, y: cy - 8 }     // right upper mid
  const rb = { x: x5 - 4, y: cy + 18 }    // right lower mid  (bump right)
  const br = { x: x5 - 10, y: y4 - 8 }    // bottom-right near-corner
  const bm = { x: cx + 10, y: y4 - 2 }    // bottom-right-mid
  const bl = { x: x0 + 18, y: y4 - 6 }   // bottom-left near-corner
  const lm = { x: x0 + 2, y: cy + 12 }   // left lower mid (bump left)
  const lt = { x: x0 + 6, y: cy - 10 }   // left upper mid

  const d = [
    `M ${tl.x} ${tl.y}`,
    // top-left → top-mid
    `C ${tl.x + 20} ${y0 - 4},  ${tm.x - 30} ${y0 - 6},  ${tm.x} ${tm.y}`,
    // top-mid → top-right
    `C ${tm.x + 28} ${y0 - 6},  ${tr.x - 14} ${y0 - 4},  ${tr.x} ${tr.y}`,
    // top-right → right upper mid
    `C ${x5 + 4} ${tl.y + 8},   ${x5 + 6} ${rm.y - 14},  ${rm.x} ${rm.y}`,
    // right upper → right lower  (big bulge right)
    `C ${x5 + 8} ${rm.y + 10},  ${x5 + 10} ${rb.y - 10}, ${rb.x} ${rb.y}`,
    // right lower → bottom-right
    `C ${x5 + 6} ${rb.y + 10},  ${x5 + 2} ${br.y + 4},   ${br.x} ${br.y}`,
    // bottom-right → bottom mid
    `C ${br.x - 10} ${y4 + 6},  ${bm.x + 14} ${y4 + 8},  ${bm.x} ${bm.y}`,
    // bottom mid → bottom-left
    `C ${bm.x - 20} ${y4 + 8},  ${bl.x + 18} ${y4 + 6},  ${bl.x} ${bl.y}`,
    // bottom-left → left lower
    `C ${x0 - 6} ${bl.y - 4},   ${x0 - 8} ${lm.y + 10},  ${lm.x} ${lm.y}`,
    // left lower → left upper
    `C ${x0 - 8} ${lm.y - 10},  ${x0 - 4} ${lt.y + 10},  ${lt.x} ${lt.y}`,
    // left upper → top-left
    `C ${x0 - 2} ${lt.y - 10},  ${tl.x - 10} ${y0 + 2},  ${tl.x} ${tl.y}`,
    'Z',
  ].join(' ')

  return (
    <path
      d={d}
      fill={INK_FILL}
      fillOpacity={opacity}
      stroke={INK_STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  )
}

// ── grid-lines primitive ──────────────────────────────────────────────────────────

export function GridLines() {
  const lines: React.ReactElement[] = []

  // Horizontal lines (ROWS+1)
  for (let r = 0; r <= ROWS; r++) {
    lines.push(
      <line
        key={`h-${r}`}
        x1={gx(0)} y1={gy(r)}
        x2={gx(COLS)} y2={gy(r)}
        stroke={GRID_COLOR}
        strokeWidth={2}
        strokeLinecap="square"
      />,
    )
  }

  // Vertical lines (COLS+1)
  for (let c = 0; c <= COLS; c++) {
    lines.push(
      <line
        key={`v-${c}`}
        x1={gx(c)} y1={gy(0)}
        x2={gx(c)} y2={gy(ROWS)}
        stroke={GRID_COLOR}
        strokeWidth={2}
        strokeLinecap="square"
      />,
    )
  }

  return <g>{lines}</g>
}

// ── default export ────────────────────────────────────────────────────────────────

/**
 * InkSpill8PEIllustration
 *
 * Static stem figure for IKMC-22-PE-Q8.
 * Shows: a 5×4 squared-paper grid with a large blue ink blob covering all 20 squares.
 * Does NOT indicate the answer or highlight individual rows.
 */
export default function InkSpill8PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A piece of squared paper (5 columns by 4 rows) with a large blue ink blob covering all of the squares."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        style={{ maxWidth: '100%', display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={GRID_BG} />

        {/* ink blob — drawn first so grid lines render on top */}
        <InkBlob />

        {/* squared-paper grid lines */}
        <GridLines />
      </svg>
    </div>
  )
}
