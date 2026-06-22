/**
 * IKMC-23-EC-Q9 — "The shape on the right is covered with 5 pieces. Which piece
 * will cover the dot?" (answer A — the parallelogram piece).
 *
 * Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2023.imgs/:
 *   025.jpg — the stem figure: a backwards-L shape made of square grid cells,
 *              with a dot (•) on the 4th cell from the left in the bottom row.
 *   026.jpg — option A: a 3-unit parallelogram (slanted left)
 *   027.jpg — option B: an inverted triangle divided horizontally into 2 halves
 *   028.jpg — option C: a right triangle with 2 inner squares (top-right area)
 *   029.jpg — option D: a narrow kite/diamond shape divided horizontally
 *   030.jpg — option E: a rectangle with a diagonal cut on the right (trapezoid)
 *
 * Shape geometry (on a 1-unit grid):
 *   The L-shape = bottom row (5 units wide × 1 unit tall) + right column
 *   (1 unit wide × 2 extra units tall, above the shared bottom-right corner).
 *   Total: 5 + 2 = 7 cells, laid out like:
 *
 *       col:  0  1  2  3  4
 *   row  0:                 [R]
 *   row  1:                 [R]
 *   row  2:  [ ][ ][ ][•][ ]
 *
 *   where [•] is the dot cell (col 3, row 2).
 *   [R] marks the two extra right-column cells above the bottom row.
 *
 * The 5 pieces tile the L-shape. Piece A (parallelogram) covers the dot region.
 *
 * Co-exports:
 *   ShapePrimitive   — reusable L-shape SVG (with optional dot and piece highlight)
 *   CoveredShape9ECOption — CHOICE_RENDERERS entry, renders one A–E piece
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ────────────────────────────────────────────────────────────
const PIECE_FILL = '#7FB4D8'      // light blue fill (matches source scan colour)
const PIECE_STROKE = '#2D6B9A'    // darker blue outline
const GRID_LINE = '#5A8FB5'       // internal division lines
const DOT_FILL = '#1F2937'        // the bullet dot on the stem
const HIGHLIGHT = '#FF6B35'       // piece-A highlight in explainer

// ─── unit dimensions ─────────────────────────────────────────────────────────
/** Grid cell size in SVG units. */
const U = 36
const PAD = 10

// ─── stem figure geometry ────────────────────────────────────────────────────
// Grid layout (cells × U px each):
//   Col:   0   1   2   3   4
//   Row 0:               [ ] ← right-column top (col 4)
//   Row 1:               [ ] ← right-column middle (col 4)
//   Row 2: [ ] [ ] [ ] [•] [ ] ← bottom row (cols 0–4)
//
// Origin (0,0) = top-left of the right-column top cell (col 4, row 0).
// The bottom-row y = 2 * U from the top, left edge = 0 from x-origin = -4*U.

// We'll use a viewBox where:
//   x=0 corresponds to the left edge of the bottom row (col 0)
//   y=0 corresponds to the top of the right-column (row 0)

const STEM_W = PAD * 2 + 5 * U       // 5 columns wide
const STEM_H = PAD * 2 + 3 * U       // 3 rows tall

// L-shape outline polygon (in viewBox coords, no padding):
//   start top-left of right column:
//     TL of right col top = (4*U, 0)
//   going clockwise:
//     (5*U, 0) → (5*U, 3*U) → (0, 3*U) → (0, 2*U) → (4*U, 2*U) → (4*U, 0)

function lShapePoints(ox: number, oy: number, u: number): string {
  return [
    [4 * u, 0],   // top-left of right column
    [5 * u, 0],   // top-right
    [5 * u, 3 * u], // bottom-right
    [0, 3 * u],   // bottom-left of bottom row
    [0, 2 * u],   // top-left of bottom row
    [4 * u, 2 * u], // inner corner
  ]
    .map(([x, y]) => `${ox + x},${oy + y}`)
    .join(' ')
}

// The dot cell is at col=3, row=2 (in the bottom row).
// Dot centre (relative to shape origin, no pad):
const DOT_CX_REL = 3 * U + U / 2  // 3.5 * U
const DOT_CY_REL = 2 * U + U / 2  // 2.5 * U

// Grid dividers inside the shape (for fidelity to the source):
// Horizontal line across the bottom row at row 2 top = y = 2*U (already the shape edge)
// Horizontal internal lines in the right column: at y = U (between row 0 and row 1)
// Vertical dividers in the bottom row: at x = U, 2U, 3U, 4U
// Vertical divider in the right column: none (1 cell wide)
function gridLines(ox: number, oy: number, u: number): Array<[number, number, number, number]> {
  const lines: Array<[number, number, number, number]> = []
  // Internal horizontal in right column (between row 0 and row 1): y = U, x = 4U..5U
  lines.push([ox + 4 * u, oy + u, ox + 5 * u, oy + u])
  // Internal verticals in bottom row: x = U, 2U, 3U (at cols 1,2,3); x=4U is shared corner
  for (let c = 1; c <= 3; c++) {
    lines.push([ox + c * u, oy + 2 * u, ox + c * u, oy + 3 * u])
  }
  return lines
}

// ─── ShapePrimitive ──────────────────────────────────────────────────────────
/**
 * The stem L-shape with optional dot and optional piece-A region highlight.
 * `showDot`     — render the bullet mark (true for stem illustration)
 * `highlightA`  — tint the parallelogram-A region orange (used in explainer)
 */
export function ShapePrimitive({
  showDot = true,
  highlightA = false,
}: {
  showDot?: boolean
  highlightA?: boolean
}) {
  const ox = PAD
  const oy = PAD

  // Piece-A parallelogram region: covers bottom-row cells col 2, 3, 4
  // (the right side of the bottom row including the dot at col 3).
  // In the actual tiling, piece A (a parallelogram) covers this region,
  // and the dot (col 3, row 2) sits within it.
  // The parallelogram in piece A slants left, so in the shape it maps to:
  //   bottom strip: cols 2–4 of bottom row (a 3×1 rectangle in the grid).
  const pieceAPoints = [
    [2 * U, 2 * U],
    [5 * U, 2 * U],
    [5 * U, 3 * U],
    [2 * U, 3 * U],
  ]
    .map(([x, y]) => `${ox + x},${oy + y}`)
    .join(' ')

  const gLines = gridLines(ox, oy, U)

  return (
    <svg
      viewBox={`0 0 ${STEM_W} ${STEM_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: STEM_W }}
      aria-hidden="true"
    >
      {/* L-shape fill */}
      <polygon
        points={lShapePoints(ox, oy, U)}
        fill={PIECE_FILL}
        stroke={PIECE_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* piece-A region highlight */}
      {highlightA && (
        <polygon
          points={pieceAPoints}
          fill={HIGHLIGHT}
          opacity={0.4}
        />
      )}

      {/* internal grid dividers */}
      {gLines.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={GRID_LINE}
          strokeWidth={1.5}
        />
      ))}

      {/* the dot • */}
      {showDot && (
        <circle
          cx={ox + DOT_CX_REL}
          cy={oy + DOT_CY_REL}
          r={5}
          fill={DOT_FILL}
        />
      )}
    </svg>
  )
}

// ─── stem illustration (default export) ──────────────────────────────────────
export default function CoveredShape9ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bentuk huruf L yang dibuat dari petak-petak kotak, dengan sebuah titik di baris bawah pada kolom keempat dari kiri."
    >
      <ShapePrimitive showDot />
    </div>
  )
}

// ─── option piece shapes ──────────────────────────────────────────────────────
// Each piece is a polygon path, reconstructed from the source scan images.
// All pieces drawn in a consistent viewBox (80 × 80).

const OP = 6   // option padding
const OU = 32  // option unit

/**
 * Piece A — parallelogram: 3 cells wide, slanting left.
 * From 026.jpg: a horizontal parallelogram with 2 internal dividers.
 * Left and right edges are diagonal (slanting same direction).
 */
function PieceA() {
  // Slant offset: each side leans right by half a unit.
  // Shape: left-top at (s, 0), right-top at (3U+s, 0),
  //        right-bot at (3U, U), left-bot at (0, U).
  const s = OU * 0.5  // slant
  const w = 3 * OU + s + OP * 2
  const h = OU + OP * 2
  // Points (no padding added yet; shift by OP):
  const pts = [
    [s, 0],
    [3 * OU + s, 0],
    [3 * OU, OU],
    [0, OU],
  ]
    .map(([x, y]) => `${OP + x},${OP + y}`)
    .join(' ')

  // Internal dividers (vertical lines slanted between top and bottom):
  // At 1/3 and 2/3 width: top at s + OU, bot at OU; top at s + 2*OU, bot at 2*OU
  const dividers = [
    { x1: OP + s + OU, y1: OP, x2: OP + OU, y2: OP + OU },
    { x1: OP + s + 2 * OU, y1: OP, x2: OP + 2 * OU, y2: OP + OU },
  ]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', maxWidth: w }}
      aria-hidden="true"
    >
      <polygon points={pts} fill={PIECE_FILL} stroke={PIECE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      {dividers.map((d, i) => (
        <line key={i} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={GRID_LINE} strokeWidth={1.5} />
      ))}
    </svg>
  )
}

/**
 * Piece B — inverted equilateral triangle divided horizontally into 2 parts.
 * From 027.jpg: a downward-pointing triangle, wider at top, with one horizontal
 * mid-line dividing it into top half and bottom point.
 */
function PieceB() {
  const w = 2 * OU + OP * 2
  const h = 2 * OU + OP * 2
  // Triangle: top-left (0,0), top-right (2U,0), bottom-tip (U, 2U)
  const pts = [
    [0, 0],
    [2 * OU, 0],
    [OU, 2 * OU],
  ]
    .map(([x, y]) => `${OP + x},${OP + y}`)
    .join(' ')

  // Horizontal divider at y = U (mid-height):
  // At y = U, the triangle width = U (half of full width)
  // Left edge at y=U: x = U/2; right edge: x = 3U/2
  const midLeft = OP + OU * 0.5
  const midRight = OP + OU * 1.5
  const midY = OP + OU

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', maxWidth: w }}
      aria-hidden="true"
    >
      <polygon points={pts} fill={PIECE_FILL} stroke={PIECE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      <line x1={midLeft} y1={midY} x2={midRight} y2={midY} stroke={GRID_LINE} strokeWidth={1.5} />
    </svg>
  )
}

/**
 * Piece C — right triangle with 2 interior squares (top-right area).
 * From 028.jpg: a large right triangle (right angle at bottom-right), with
 * 2 small squares stacked in the top-right corner.
 * Overall: 2 units × 2 units bounding box, diagonal from top-left to bottom-right.
 */
function PieceC() {
  const size = 2 * OU
  const w = size + OP * 2
  const h = size + OP * 2
  // Right triangle: bottom-left (0, 2U), top-right (2U, 0), bottom-right (2U, 2U)
  const pts = [
    [0, 2 * OU],
    [2 * OU, 0],
    [2 * OU, 2 * OU],
  ]
    .map(([x, y]) => `${OP + x},${OP + y}`)
    .join(' ')

  // 2 interior squares in top-right: 1×1 at (1U,0) to (2U,1U) and (1U,1U) to (2U,2U)
  // — these are square cells in the corner region
  const sq1 = { x: OP + OU, y: OP, w: OU, h: OU }
  const sq2 = { x: OP + OU, y: OP + OU, w: OU, h: OU }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', maxWidth: w }}
      aria-hidden="true"
    >
      <polygon points={pts} fill={PIECE_FILL} stroke={PIECE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      {/* interior square dividers */}
      <rect x={sq1.x} y={sq1.y} width={sq1.w} height={sq1.h} fill="none" stroke={GRID_LINE} strokeWidth={1.5} />
      <rect x={sq2.x} y={sq2.y} width={sq2.w} height={sq2.h} fill="none" stroke={GRID_LINE} strokeWidth={1.5} />
    </svg>
  )
}

/**
 * Piece D — narrow kite / tall triangle divided horizontally.
 * From 029.jpg: a tall narrow shape, like a kite or thin rhombus pointing up and down,
 * with a horizontal mid-line.
 */
function PieceD() {
  const w = OU + OP * 2
  const h = 3 * OU + OP * 2
  // Kite: top tip (U/2, 0), middle-right (U, 1.5U), bottom tip (U/2, 3U), middle-left (0, 1.5U)
  const mx = OU * 0.5
  const my = OU * 1.5
  const pts = [
    [mx, 0],
    [OU, my],
    [mx, 3 * OU],
    [0, my],
  ]
    .map(([x, y]) => `${OP + x},${OP + y}`)
    .join(' ')

  // Horizontal divider at mid-height (y = 1.5U)
  const divY = OP + my

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', maxWidth: w }}
      aria-hidden="true"
    >
      <polygon points={pts} fill={PIECE_FILL} stroke={PIECE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      <line x1={OP} y1={divY} x2={OP + OU} y2={divY} stroke={GRID_LINE} strokeWidth={1.5} />
    </svg>
  )
}

/**
 * Piece E — trapezoid: 2 squares wide with a diagonal cut on the right.
 * From 030.jpg: a rectangle (2U wide × 1U tall) with the top-right corner cut
 * diagonally, leaving a right trapezoid.
 */
function PieceE() {
  const w = 2 * OU + OP * 2
  const h = OU + OP * 2
  // Trapezoid: bottom-left (0, U), top-left (0, 0), top-mid (U, 0), bottom-right (2U, U)
  // The diagonal cut goes from top at x=U to bottom-right at x=2U
  const pts = [
    [0, 0],
    [OU, 0],
    [2 * OU, OU],
    [0, OU],
  ]
    .map(([x, y]) => `${OP + x},${OP + y}`)
    .join(' ')

  // Internal vertical divider between the square and the triangle part: x = U
  const divX = OP + OU

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block', maxWidth: w }}
      aria-hidden="true"
    >
      <polygon points={pts} fill={PIECE_FILL} stroke={PIECE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      <line x1={divX} y1={OP} x2={divX} y2={OP + OU} stroke={GRID_LINE} strokeWidth={1.5} />
    </svg>
  )
}

// Map from label to render function
const PIECE_RENDERERS: Record<string, () => React.ReactElement> = {
  A: () => <PieceA />,
  B: () => <PieceB />,
  C: () => <PieceC />,
  D: () => <PieceD />,
  E: () => <PieceE />,
}

const PIECE_ARIA_EN: Record<string, string> = {
  A: 'Option A: a parallelogram piece (3 units wide, slanting left)',
  B: 'Option B: an inverted triangle divided horizontally into 2 parts',
  C: 'Option C: a right triangle with 2 small squares in the top-right corner',
  D: 'Option D: a narrow kite shape divided horizontally',
  E: 'Option E: a trapezoid (rectangle with diagonal right side)',
}

/**
 * CoveredShape9ECOption — CHOICE_RENDERERS entry. Renders one A–E piece shape
 * as an SVG picture, matching the source paper's option images.
 * Binds to choice.label — cannot drift from the source.
 */
export function CoveredShape9ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase()
  const render = PIECE_RENDERERS[label]
  if (!render) return <span>{choice.text}</span>

  return (
    <div
      role="img"
      aria-label={PIECE_ARIA_EN[label] ?? choice.text}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px' }}
    >
      {render()}
    </div>
  )
}
