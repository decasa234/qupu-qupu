// IKMC-19-PE-Q24 — "Peter chose a square of four cells in the table…"
//
// STATIC PROBLEM FIGURE: a 4-row × 5-column table filled with the numbers 1–20
// (left→right, top→bottom). Matches the OCR output from the 2019 IKMC Pre-Ecolier
// paper exactly.
//
// Grid:
//   row 0:  1  2  3  4  5
//   row 1:  6  7  8  9 10
//   row 2: 11 12 13 14 15
//   row 3: 16 17 18 19 20
//
// Does NOT reveal: which 2×2 blocks sum > 63, nor the answer (14 / A).
//
// Co-exports `NumberTable24Grid` (the grid primitive) and layout constants so the
// explainer can overlay sliding-window highlights in the exact same coordinate
// system without re-deriving geometry.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ── Grid data ──────────────────────────────────────────────────────────────────

/** The fixed 4×5 number table. GRID[row][col], row 0 = top. */
export const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [1,  2,  3,  4,  5],
  [6,  7,  8,  9,  10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
]

export const ROWS = 4
export const COLS = 5

// ── Layout geometry ────────────────────────────────────────────────────────────

/** Outer padding so strokes don't clip at edges. */
export const PAD = 12
/** Cell width in SVG units. */
export const CELL_W = 46
/** Cell height in SVG units. */
export const CELL_H = 44

export const GRID_W = CELL_W * COLS   // 230
export const GRID_H = CELL_H * ROWS   // 176

export const VIEW_W = GRID_W + PAD * 2  // 254
export const VIEW_H = GRID_H + PAD * 2  // 200

/** Top-left x of a cell column. */
export const cellX = (col: number) => PAD + col * CELL_W
/** Top-left y of a cell row. */
export const cellY = (row: number) => PAD + row * CELL_H
/** Horizontal centre of a column. */
export const colCtr = (col: number) => cellX(col) + CELL_W / 2
/** Vertical centre of a row. */
export const rowCtr = (row: number) => cellY(row) + CELL_H / 2

// ── Colour tokens ──────────────────────────────────────────────────────────────

export const COLOR = {
  CELL_BG: '#F5F7FA',
  CELL_STROKE: '#C8D3E0',
  OUTER_FRAME: '#30598A',
  DIGIT: '#30598A',
  HIGHLIGHT_FILL: '#FFF3CD',
  HIGHLIGHT_STROKE: '#F59E0B',
  ANSWER_FILL: '#D1FAE5',
  ANSWER_STROKE: '#10B981',
} as const

// ── Primitive: NumberTable24Grid ───────────────────────────────────────────────

export interface NumberTable24GridProps {
  /**
   * A 2×2 block to highlight, identified by its top-left [row, col] (0-indexed).
   * When supplied, the four cells in the block are drawn with the highlight colour.
   * Out-of-range values are clamped / ignored.
   */
  highlight2x2?: [number, number] | null
  /**
   * If true, cell (2,3) — value 14 — is drawn in green (answer highlight).
   * Used in the explainer's final beat.
   */
  highlightAnswer?: boolean
  /**
   * Individual cells to mark in answer-green, given as [row, col] pairs.
   * Overrides `highlightAnswer` if both are set.
   */
  answerCells?: ReadonlyArray<[number, number]>
}

/**
 * NumberTable24Grid — the fixed 4×5 number grid rendered as a complete <svg>.
 *
 * Used directly as the static illustration and re-used by the explainer to
 * overlay a sliding 2×2 highlight window, frame by frame.
 */
export function NumberTable24Grid({
  highlight2x2 = null,
  highlightAnswer = false,
  answerCells = [],
}: NumberTable24GridProps = {}) {
  // Collect highlighted cell coords
  const hlCells = new Set<string>()
  if (highlight2x2) {
    const [r, c] = highlight2x2
    if (r >= 0 && r < ROWS - 1 && c >= 0 && c < COLS - 1) {
      hlCells.add(`${r},${c}`)
      hlCells.add(`${r},${c + 1}`)
      hlCells.add(`${r + 1},${c}`)
      hlCells.add(`${r + 1},${c + 1}`)
    }
  }

  // Collect answer-green cells
  const ansCells = new Set<string>()
  if (highlightAnswer) {
    ansCells.add('2,3') // row 2, col 3 = number 14
  }
  for (const [r, c] of answerCells) {
    ansCells.add(`${r},${c}`)
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 280 }}
      aria-hidden="true"
    >
      {/* cell backgrounds */}
      {GRID.map((rowVals, row) =>
        rowVals.map((_v, col) => {
          const key = `${row},${col}`
          const isHL = hlCells.has(key)
          const isAns = ansCells.has(key)
          return (
            <rect
              key={`bg-${key}`}
              x={cellX(col)}
              y={cellY(row)}
              width={CELL_W}
              height={CELL_H}
              fill={isAns ? COLOR.ANSWER_FILL : isHL ? COLOR.HIGHLIGHT_FILL : COLOR.CELL_BG}
              stroke={
                isAns ? COLOR.ANSWER_STROKE : isHL ? COLOR.HIGHLIGHT_STROKE : COLOR.CELL_STROKE
              }
              strokeWidth={isHL || isAns ? 2.5 : 1}
            />
          )
        }),
      )}

      {/* outer frame */}
      <rect
        x={PAD}
        y={PAD}
        width={GRID_W}
        height={GRID_H}
        fill="none"
        stroke={COLOR.OUTER_FRAME}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* inner vertical gridlines */}
      {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`vl-${i}`}
          x1={PAD + i * CELL_W}
          y1={PAD}
          x2={PAD + i * CELL_W}
          y2={PAD + GRID_H}
          stroke={COLOR.CELL_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* inner horizontal gridlines */}
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`hl-${i}`}
          x1={PAD}
          y1={PAD + i * CELL_H}
          x2={PAD + GRID_W}
          y2={PAD + i * CELL_H}
          stroke={COLOR.CELL_STROKE}
          strokeWidth={1}
        />
      ))}

      {/* digits */}
      {GRID.map((rowVals, row) =>
        rowVals.map((val, col) => {
          const key = `${row},${col}`
          const isAns = ansCells.has(key)
          return (
            <text
              key={`n-${key}`}
              x={colCtr(col)}
              y={rowCtr(row) + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isAns ? '#065F46' : COLOR.DIGIT}
              fontFamily="Nunito, sans-serif"
              fontSize={20}
              fontWeight={800}
            >
              {val}
            </text>
          )
        }),
      )}
    </svg>
  )
}

// ── Default export: static stem illustration ───────────────────────────────────

/**
 * NumberTable24Illustration
 *
 * Static, problem-only figure for IKMC-19-PE-Q24.
 * Shows the complete 4×5 number table (1–20) as it appears in the paper.
 * Does NOT highlight any 2×2 block or the answer.
 */
export default function NumberTable24Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tabel angka 4 baris kali 5 kolom. ' +
        'Baris 1: 1, 2, 3, 4, 5. ' +
        'Baris 2: 6, 7, 8, 9, 10. ' +
        'Baris 3: 11, 12, 13, 14, 15. ' +
        'Baris 4: 16, 17, 18, 19, 20. ' +
        'Peter memilih kotak 2×2 sel sehingga jumlah keempat angkanya lebih dari 63.'
      }
    >
      <NumberTable24Grid />
    </div>
  )
}
