/**
 * IKMC-20-EC-Q8 — "Casper has the following 7 pieces (parallelogram-shaped tiles
 * of different sizes). He uses some of these pieces to fully cover a 1×16 grid
 * without overlap. He uses as many different pieces as possible. How many pieces
 * does Casper use?" (answer C = 5).
 *
 * The stem figure (031.jpg) shows 7 parallelogram-shaped strip tiles of widths
 * 1 through 7, scattered across the image at a slight diagonal angle. Each tile
 * is a row of n squares drawn as a parallelogram skewed rightward.
 *
 * This illustration shows ONLY the 7 pieces — it never reveals the answer or
 * shows the 1×16 target grid covered.
 *
 * Co-exports `StripTile` and `PIECE_SIZES` so the explainer can reuse them.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 *
 * Adapted from Polyomino10ECIllustration (same IKMC Ecolier series).
 */

// ─── colour tokens (matching house style) ───────────────────────────────────

export const TILE_FILL   = '#C8D8EC'  // soft qupu-brand-blue tint
export const TILE_STROKE = '#30598A'  // qupu-brand-blue
export const TILE_STROKE_W = 1.5

// ─── piece catalogue ────────────────────────────────────────────────────────

/** Width (in squares) of each of Casper's 7 pieces, indexed 0–6. */
export const PIECE_SIZES = [1, 2, 3, 4, 5, 6, 7] as const

// ─── StripTile ───────────────────────────────────────────────────────────────

/**
 * Draws one parallelogram-shaped strip tile of `n` cells.
 * The tile is rendered as n abutting parallelograms: each cell is a
 * parallelogram with a horizontal skew of `skew` px so the top edge is
 * offset to the right, matching the source paper's visual style.
 *
 * SVG <g> — must be placed inside an <svg>.
 */
export function StripTile({
  n,
  x,
  y,
  cellW = 22,
  cellH = 16,
  skew = 6,
  fill = TILE_FILL,
  stroke = TILE_STROKE,
  strokeWidth = TILE_STROKE_W,
}: {
  n: number
  x: number
  y: number
  cellW?: number
  cellH?: number
  /** Horizontal offset of the top edge relative to the bottom edge (px). */
  skew?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = x + i * cellW // bottom-left x of this cell
        // Parallelogram points: bottom-left → bottom-right → top-right → top-left
        const points = [
          `${bx},${y + cellH}`,
          `${bx + cellW},${y + cellH}`,
          `${bx + cellW + skew},${y}`,
          `${bx + skew},${y}`,
        ].join(' ')
        return (
          <polygon
            key={i}
            points={points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        )
      })}
    </g>
  )
}

// ─── layout helpers ──────────────────────────────────────────────────────────

/**
 * Layout: arrange the 7 tiles in two rows, matching the scattered look of the
 * original figure. Sizes 1–4 on the first row, sizes 5–7 on the second row.
 *
 * Each tile has a total visual width of:  n * cellW + skew  (for the overhang)
 */
const CELL_W = 22
const CELL_H = 16
const SKEW   = 6
const GAP    = 10  // horizontal gap between tiles in a row
const ROW_H  = 40  // vertical distance between rows (includes tile height)
const PAD_X  = 8
const PAD_Y  = 10

/** Returns [{size, x, y}] for each piece in display order. */
function layoutPieces(): { size: number; x: number; y: number }[] {
  // Row 1: sizes 1, 2, 3, 4  (left to right)
  // Row 2: sizes 5, 6, 7
  const rows: number[][] = [
    [1, 2, 3, 4],
    [5, 6, 7],
  ]
  const result: { size: number; x: number; y: number }[] = []
  rows.forEach((row, ri) => {
    let cx = PAD_X
    row.forEach((size) => {
      result.push({ size, x: cx, y: PAD_Y + ri * ROW_H })
      cx += size * CELL_W + SKEW + GAP
    })
  })
  return result
}

const LAYOUT = layoutPieces()

// Compute canvas dimensions
const allX = LAYOUT.map(({ size, x }) => x + size * CELL_W + SKEW)
const allY = LAYOUT.map(({ y }) => y + CELL_H)
const SVG_W = Math.max(...allX) + PAD_X
const SVG_H = Math.max(...allY) + PAD_Y

// ─── default export — stem illustration ─────────────────────────────────────

/**
 * The in-card figure for IKMC-20-EC-Q8.
 * Shows all 7 parallelogram-shaped strip pieces (widths 1–7).
 * Never reveals the answer or the covered 1×16 grid.
 */
export default function Pieces8ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tujuh potongan berbentuk jajar genjang berukuran 1 sampai 7 kotak. ' +
        'Casper akan memilih beberapa potongan ini untuk menutupi sebuah tabel 1×16.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        role="presentation"
        style={{ overflow: 'visible' }}
      >
        {LAYOUT.map(({ size, x, y }) => (
          <StripTile
            key={size}
            n={size}
            x={x}
            y={y}
            cellW={CELL_W}
            cellH={CELL_H}
            skew={SKEW}
          />
        ))}
        {/* Size labels below each tile */}
        {LAYOUT.map(({ size, x, y }) => {
          const tileW = size * CELL_W + SKEW
          const cx = x + tileW / 2
          return (
            <text
              key={`lbl-${size}`}
              x={cx}
              y={y + CELL_H + 10}
              textAnchor="middle"
              fontSize={9}
              fill={TILE_STROKE}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {size}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
