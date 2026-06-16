/**
 * CubeNet22G3Illustration — WMI-22F3A-Q11
 *
 * Draws the faulty 7-square cube net exactly as it appears in the source image.
 * All 7 squares are shown with their numbers; NO square is highlighted or removed.
 * The animator imports SquareNet to overlay highlighting/removal after the answer.
 *
 * Net layout (row, col), 0-indexed, row increases downward:
 *   "1"  → (0, 0)
 *   "2"  → (1, 0)
 *   "3"  → (1, 1)
 *   "4"  → (1, 2)
 *   "5"  → (1, 3)
 *   "6"  → (2, 1)
 *   "7"  → (2, 3)
 *
 * Pure render — no Math.random, no Date, no side effects. SSR-safe.
 */

export interface NetSquare {
  row: number
  col: number
  label: string
}

export const NET_SQUARES: NetSquare[] = [
  { row: 0, col: 0, label: '1' },
  { row: 1, col: 0, label: '2' },
  { row: 1, col: 1, label: '3' },
  { row: 1, col: 2, label: '4' },
  { row: 1, col: 3, label: '5' },
  { row: 2, col: 1, label: '6' },
  { row: 2, col: 3, label: '7' },
]

/** Square side length in SVG units. */
export const CELL = 52

/** Stroke width for the square borders. */
export const BORDER_W = 1.5

/** Light-blue fill that matches the source image. */
const SQUARE_FILL = '#cfe8f5'
const SQUARE_STROKE = '#5b8fa8'
const LABEL_FILL = '#1a3a4a'

/**
 * SquareNet — primitive shared with the animator.
 *
 * Renders a list of {row, col, label} squares on a common grid.
 * Each square can be individually styled via `highlight` and `removed`.
 *
 * Props:
 *   squares       — array of NetSquare (row/col/label)
 *   highlight     — set of labels to tint (e.g. for the animator's "which one?")
 *   removed       — set of labels to grey out / cross out
 *   cell          — cell size (default CELL = 52)
 */
export interface SquareNetProps {
  squares: NetSquare[]
  highlight?: Set<string>
  removed?: Set<string>
  cell?: number
}

export function SquareNet({
  squares,
  highlight = new Set(),
  removed = new Set(),
  cell = CELL,
}: SquareNetProps) {
  return (
    <g>
      {squares.map(({ row, col, label }) => {
        const x = col * cell
        const y = row * cell
        const isHighlighted = highlight.has(label)
        const isRemoved = removed.has(label)

        const fill = isRemoved
          ? '#e8e8e8'
          : isHighlighted
            ? '#fde68a' // amber tint when animator highlights
            : SQUARE_FILL

        const stroke = isRemoved ? '#aaaaaa' : SQUARE_STROKE
        const labelColor = isRemoved ? '#aaaaaa' : LABEL_FILL
        const opacity = isRemoved ? 0.5 : 1

        return (
          <g key={label} opacity={opacity}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill={fill}
              stroke={stroke}
              strokeWidth={BORDER_W}
            />
            <text
              x={x + cell / 2}
              y={y + cell / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.round(cell * 0.38)}
              fontWeight="600"
              fill={labelColor}
              fontFamily="sans-serif"
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

// The grid spans cols 0–3 (width = 4 cells) and rows 0–2 (height = 3 cells).
// We add padding on all sides so borders don't clip.
const PAD = 10
const GRID_COLS = 4
const GRID_ROWS = 3

const VIEW_W = GRID_COLS * CELL + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2

// Rendered display width — cap at 260 so it fits nicely in a card.
const DISPLAY_W = Math.min(260, VIEW_W)

export default function CubeNet22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaring kubus cacat: 7 persegi bernomor 1–7. Persegi 1 di pojok kiri atas, persegi 2-3-4-5 membentuk baris horizontal, persegi 6 di bawah kolom kedua, persegi 7 di bawah kolom keempat. Tentukan persegi mana yang harus dihapus agar sisanya bisa dilipat menjadi kubus."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={DISPLAY_W}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* offset by PAD so borders have breathing room */}
        <g transform={`translate(${PAD}, ${PAD})`}>
          <SquareNet squares={NET_SQUARES} />
        </g>
      </svg>
    </div>
  )
}
