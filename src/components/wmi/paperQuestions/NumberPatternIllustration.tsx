// "Find ★ in the number arrangement" figure for WMI-19F1-Q10.
// Reconstructed exactly from the real figure: a 6-column x 5-row grid where
// only some cells are filled (shaded). Each filled cell's value follows the rule
//   value = 10 * (row + 2) + (col + 4)
// i.e. the tens digit counts down the rows (2.. for the top row, +1 per row) and
// the units digit counts across the columns (4 at col 0, +1 per column).
// The ★ sits at row 4, col 3 -> 10*6 + 7 = 67.
export const NP_COLS = 6
export const NP_ROWS = 5

/** value at a (row, col) cell following the figure's rule. */
export const cellValue = (row: number, col: number): number => 10 * (row + 2) + (col + 4)

export interface NumberCell {
  row: number
  col: number
  value: number
  /** True for the ★ cell (the one to find). */
  star: boolean
}

// The cells that are actually printed (shaded) in the real figure, plus the ★ cell.
const FILLED: ReadonlyArray<[number, number]> = [
  [0, 0], [0, 1], [0, 5], // 24 25 . . . 29
  [1, 0], [1, 2], //          34 .  36 . . .
  [2, 2], [2, 4], [2, 5], //  .  .  46 . 48 49
  [3, 0], [3, 1], [3, 4], //  54 55 .  . 58 .
  [4, 1], //                  .  65 .  ★ . .   (★ is the answer cell, drawn separately)
]

export const STAR_ROW = 4
export const STAR_COL = 3
export const STAR_VALUE = cellValue(STAR_ROW, STAR_COL) // 67

/** Filled number cells (shaded squares with a printed value), excluding the ★. */
export const NUMBER_CELLS: NumberCell[] = FILLED.map(([row, col]) => ({
  row,
  col,
  value: cellValue(row, col),
  star: false,
}))

export const NP_VIEW_W = 360
export const NP_VIEW_H = 300
const NP_PAD = 6
export const NP_CELL = (NP_VIEW_W - NP_PAD * 2) / NP_COLS

const nx = (col: number) => NP_PAD + col * NP_CELL
const ny = (row: number) => NP_PAD + row * NP_CELL

const SHADE = '#E5E7EB'
const STAR_SHADE = '#FEF3C7'
const STAR_STROKE = '#F59E0B'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'

export interface NumberPatternFigureProps {
  /** Highlight these cells (e.g. the ones establishing the rule). */
  highlight?: ReadonlyArray<[number, number]>
  /** Reveal the ★ cell's value (67) instead of the star glyph. */
  revealStar?: boolean
  /** Glow the ★ cell. */
  highlightStar?: boolean
}

function StarGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.42
    pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`)
  }
  return <polygon points={pts.join(' ')} fill="#1F2937" />
}

export function NumberPatternFigure({ highlight = [], revealStar = false, highlightStar = false }: NumberPatternFigureProps) {
  const hset = new Set(highlight.map(([r, c]) => `${r},${c}`))

  return (
    <svg
      viewBox={`0 0 ${NP_VIEW_W} ${NP_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Shaded number cells + their values */}
      {NUMBER_CELLS.map((cell, i) => {
        const lit = hset.has(`${cell.row},${cell.col}`)
        return (
          <g key={`c-${i}`}>
            <rect
              x={nx(cell.col)}
              y={ny(cell.row)}
              width={NP_CELL}
              height={NP_CELL}
              fill={lit ? GREEN_FILL : SHADE}
              stroke={lit ? GREEN : '#1F2937'}
              strokeWidth={lit ? 3 : 1.5}
            />
            <text
              x={nx(cell.col) + NP_CELL / 2}
              y={ny(cell.row) + NP_CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={NP_CELL * 0.42}
              fontWeight={800}
              fill="#1F2937"
            >
              {cell.value}
            </text>
          </g>
        )
      })}

      {/* The ★ answer cell */}
      <rect
        x={nx(STAR_COL)}
        y={ny(STAR_ROW)}
        width={NP_CELL}
        height={NP_CELL}
        fill={highlightStar ? GREEN_FILL : STAR_SHADE}
        stroke={highlightStar ? GREEN : STAR_STROKE}
        strokeWidth={highlightStar ? 3.5 : 2}
      />
      {revealStar ? (
        <text
          x={nx(STAR_COL) + NP_CELL / 2}
          y={ny(STAR_ROW) + NP_CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={NP_CELL * 0.42}
          fontWeight={900}
          fill={GREEN}
        >
          {STAR_VALUE}
        </text>
      ) : (
        <StarGlyph cx={nx(STAR_COL) + NP_CELL / 2} cy={ny(STAR_ROW) + NP_CELL / 2} r={NP_CELL * 0.3} />
      )}

      {/* Empty grid cells (outline only) */}
      {Array.from({ length: NP_ROWS }).map((_, row) =>
        Array.from({ length: NP_COLS }).map((__, col) => {
          const filled = NUMBER_CELLS.some((c) => c.row === row && c.col === col)
          const isStar = row === STAR_ROW && col === STAR_COL
          if (filled || isStar) return null
          return (
            <rect
              key={`e-${row}-${col}`}
              x={nx(col)}
              y={ny(row)}
              width={NP_CELL}
              height={NP_CELL}
              fill="white"
              stroke="#1F2937"
              strokeWidth={1.5}
            />
          )
        }),
      )}
    </svg>
  )
}

export default function NumberPatternIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A 6 by 5 grid of numbers. Each number's tens digit grows down the rows and its units digit grows across the columns, so the ★ cell equals ${STAR_VALUE}.`}
    >
      <NumberPatternFigure />
    </div>
  )
}
