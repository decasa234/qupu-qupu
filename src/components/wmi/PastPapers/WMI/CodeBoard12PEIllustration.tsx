/* eslint-disable react-refresh/only-export-components */
// IKMC-21-PE-Q12 — "Tom encodes words using the board shown."
//
// The problem: a 4×4 letter-grid where columns are A–D and rows are 1–4.
// Each cell contains a letter. The code format is column-letter then row-number:
// e.g. A2 = column A, row 2 = P. The word PIZZA = A2 A4 C1 C1 B2.
// Question: what word is B3 B2 C4 D2?  Answer: E (MATH).
//
// The STATIC illustration shows ONLY the problem figure — the grid with the
// header row and column labels, plus the code sequence "B3 B2 C4 D2" below.
// Does NOT reveal which cells are hit or the answer (MATH).
//
// The co-exported primitive (CodeBoard12PEGrid) accepts highlighted cells so
// the explainer can reveal each decoded letter without re-drawing the grid.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants ────────────────────────────────────────────────────

/** SVG canvas size. */
export const SVG_W = 280
export const SVG_H = 220

/** Grid origin (top-left corner of the header row). */
export const GRID_X = 24
export const GRID_Y = 18

/** Cell dimensions. */
export const CELL_W = 50
export const CELL_H = 40

/** Number of data rows and columns. */
export const ROWS = 4
export const COLS = 4

/** Column header labels. */
export const COL_LABELS = ['A', 'B', 'C', 'D'] as const

/** Row header labels. */
export const ROW_LABELS = ['1', '2', '3', '4'] as const

/**
 * Grid data — GRID[row][col] where row=0 is row-1 and col=0 is column-A.
 * Faithfully transcribed from the question body.
 *
 *      A    B    C    D
 *  1 [ B ][ K ][ Z ][ E ]
 *  2 [ P ][ A ][ F ][ H ]
 *  3 [ S ][ M ][ R ][ W ]
 *  4 [ I ][ N ][ T ][ L ]
 */
export const GRID: readonly (readonly string[])[] = [
  ['B', 'K', 'Z', 'E'],
  ['P', 'A', 'F', 'H'],
  ['S', 'M', 'R', 'W'],
  ['I', 'N', 'T', 'L'],
] as const

/**
 * Decode a code pair like "B3" → { col: 1, row: 2 } (0-based indices).
 * Code format: column letter (A–D) then row number (1–4).
 */
export function decodeCode(code: string): { col: number; row: number; letter: string } {
  const col = COL_LABELS.indexOf(code[0] as typeof COL_LABELS[number])
  const row = parseInt(code[1], 10) - 1
  return { col, row, letter: GRID[row][col] }
}

/**
 * The four code pairs being decoded.  Bound directly to the question data
 * (quantities.value = 4 code letters).
 */
export const CODE_SEQUENCE = ['B3', 'B2', 'C4', 'D2'] as const

/** Colour tokens. */
export const COLOR = {
  HEADER_BG: '#3B5FA0',       // qupu navy — column/row header cells
  HEADER_TEXT: '#FFFFFF',     // white text in headers
  CELL_BG: '#F9FAFB',         // light grey data cells
  CELL_STROKE: '#D1D5DB',     // cell border
  CELL_TEXT: '#1F2937',       // letter in data cells
  HIGHLIGHT_BG: '#FEF3C7',    // amber — highlighted cell during decode
  HIGHLIGHT_STROKE: '#F59E0B',
  HIGHLIGHT_TEXT: '#92400E',
  RESULT_BG: '#D1FAE5',       // green — final answer cell
  RESULT_STROKE: '#10B981',
  RESULT_TEXT: '#065F46',
  CODE_TEXT: '#374151',       // code sequence label below grid
  CODE_ACTIVE: '#2563EB',     // active code pair
} as const

// ── Helper: cell top-left from (col, row) in data coords (0-based) ───────────

/** SVG x of the left edge of a data cell (col 0–3). */
export const cellX = (col: number): number => GRID_X + CELL_W + col * CELL_W

/** SVG y of the top edge of a data cell (row 0–3). */
export const cellY = (row: number): number => GRID_Y + CELL_H + row * CELL_H

// ── Primitives ─────────────────────────────────────────────────────────────────

/**
 * The 4×4 letter grid with header row (A B C D) and header column (1 2 3 4).
 *
 * @param highlightedCells  Array of {col, row} (0-based) to highlight in amber.
 * @param resultCells       Array of {col, row} (0-based) to highlight in green.
 */
export function CodeBoard12PEGrid({
  highlightedCells = [],
  resultCells = [],
}: {
  highlightedCells?: { col: number; row: number }[]
  resultCells?: { col: number; row: number }[]
}) {
  function isHighlighted(col: number, row: number) {
    return highlightedCells.some((c) => c.col === col && c.row === row)
  }
  function isResult(col: number, row: number) {
    return resultCells.some((c) => c.col === col && c.row === row)
  }

  return (
    <g>
      {/* ── Column header row ── */}
      {/* Empty top-left corner cell */}
      <rect
        x={GRID_X}
        y={GRID_Y}
        width={CELL_W}
        height={CELL_H}
        fill={COLOR.HEADER_BG}
        stroke={COLOR.HEADER_TEXT}
        strokeWidth={1}
        rx={3}
      />

      {/* Column header cells: A B C D */}
      {COL_LABELS.map((label, ci) => (
        <g key={`col-hdr-${ci}`}>
          <rect
            x={GRID_X + CELL_W + ci * CELL_W}
            y={GRID_Y}
            width={CELL_W}
            height={CELL_H}
            fill={COLOR.HEADER_BG}
            stroke={COLOR.HEADER_TEXT}
            strokeWidth={1}
            rx={3}
          />
          <text
            x={GRID_X + CELL_W + ci * CELL_W + CELL_W / 2}
            y={GRID_Y + CELL_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight={800}
            fill={COLOR.HEADER_TEXT}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      ))}

      {/* ── Data rows ── */}
      {ROW_LABELS.map((rowLabel, ri) => (
        <g key={`row-${ri}`}>
          {/* Row header cell: 1 2 3 4 */}
          <rect
            x={GRID_X}
            y={GRID_Y + CELL_H + ri * CELL_H}
            width={CELL_W}
            height={CELL_H}
            fill={COLOR.HEADER_BG}
            stroke={COLOR.HEADER_TEXT}
            strokeWidth={1}
            rx={3}
          />
          <text
            x={GRID_X + CELL_W / 2}
            y={GRID_Y + CELL_H + ri * CELL_H + CELL_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight={800}
            fill={COLOR.HEADER_TEXT}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {rowLabel}
          </text>

          {/* Data cells */}
          {GRID[ri].map((letter, ci) => {
            const highlighted = isHighlighted(ci, ri)
            const result = isResult(ci, ri)
            const bgFill = result
              ? COLOR.RESULT_BG
              : highlighted
                ? COLOR.HIGHLIGHT_BG
                : COLOR.CELL_BG
            const strokeColor = result
              ? COLOR.RESULT_STROKE
              : highlighted
                ? COLOR.HIGHLIGHT_STROKE
                : COLOR.CELL_STROKE
            const textColor = result
              ? COLOR.RESULT_TEXT
              : highlighted
                ? COLOR.HIGHLIGHT_TEXT
                : COLOR.CELL_TEXT

            return (
              <g key={`cell-${ri}-${ci}`}>
                <rect
                  x={GRID_X + CELL_W + ci * CELL_W}
                  y={GRID_Y + CELL_H + ri * CELL_H}
                  width={CELL_W}
                  height={CELL_H}
                  fill={bgFill}
                  stroke={strokeColor}
                  strokeWidth={result || highlighted ? 2 : 1}
                  rx={3}
                />
                <text
                  x={GRID_X + CELL_W + ci * CELL_W + CELL_W / 2}
                  y={GRID_Y + CELL_H + ri * CELL_H + CELL_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={result || highlighted ? 800 : 600}
                  fill={textColor}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {letter}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
}

// ── Code sequence label below grid ────────────────────────────────────────────

/**
 * Row of code pair chips below the grid.
 *
 * @param activeIndex  Which pair (0–3) is currently highlighted; -1 for none.
 * @param doneIndices  Pairs that have already been decoded (shown in green).
 */
export function CodeSequenceRow({
  activeIndex = -1,
  doneIndices = [],
}: {
  activeIndex?: number
  doneIndices?: number[]
}) {
  const codeY = GRID_Y + CELL_H * 5 + 12  // below the 4 data rows + gap

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {/* "Code:" label */}
      <text
        x={GRID_X}
        y={codeY + 12}
        fontSize={12}
        fontWeight={700}
        fill={COLOR.CODE_TEXT}
        dominantBaseline="central"
      >
        Code:
      </text>

      {/* Code pair chips */}
      {CODE_SEQUENCE.map((code, i) => {
        const done = doneIndices.includes(i)
        const active = i === activeIndex
        const chipX = GRID_X + 48 + i * 54
        const chipFill = done ? COLOR.RESULT_BG : active ? '#DBEAFE' : '#F3F4F6'
        const chipStroke = done ? COLOR.RESULT_STROKE : active ? COLOR.CODE_ACTIVE : '#9CA3AF'
        const chipText = done ? COLOR.RESULT_TEXT : active ? COLOR.CODE_ACTIVE : COLOR.CODE_TEXT

        return (
          <g key={`chip-${i}`}>
            <rect
              x={chipX}
              y={codeY}
              width={46}
              height={24}
              rx={6}
              fill={chipFill}
              stroke={chipStroke}
              strokeWidth={active || done ? 2 : 1}
            />
            <text
              x={chipX + 23}
              y={codeY + 12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={chipText}
            >
              {code}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * CodeBoard12PEIllustration
 *
 * Static, problem-only figure for IKMC-21-PE-Q12.
 * Shows: the 4×4 letter-code grid with column headers A–D and row headers 1–4,
 * plus the code sequence "B3 B2 C4 D2" below. Does NOT highlight any cells
 * or reveal the answer (MATH).
 */
export default function CodeBoard12PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tabel kode 4 baris kali 4 kolom. Kolom diberi label A, B, C, D. ' +
        'Baris diberi label 1, 2, 3, 4. ' +
        'Baris 1: B K Z E. Baris 2: P A F H. Baris 3: S M R W. Baris 4: I N T L. ' +
        'Kode yang harus didekode: B3 B2 C4 D2.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the grid */}
        <CodeBoard12PEGrid />

        {/* code sequence below — no active/done highlighting in static view */}
        <CodeSequenceRow />
      </svg>
    </div>
  )
}
