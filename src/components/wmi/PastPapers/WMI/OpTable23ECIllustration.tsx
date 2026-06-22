// Stem illustration for IKMC-22-EC-Q23 (2022 Ecolier).
//
// A 2×2 multiplication table with a hidden column header (?) and a hidden
// result cell (♥). The player must find ? and then compute the heart.
//
// Table layout (adapted from the scanned figure 2022.imgs/049.jpg):
//
//   ×  |  3  |  ?        ← header row
//   5  | 15  | 35        ← row 1
//   4  | 12  |  ♥        ← row 2
//
// Solution (from breakdown.quantities):
//   Step 1: 5 × ? = 35  →  ? = 35 ÷ 5 = 7
//   Step 2: ♥ = 4 × 7 = 28  →  answer C
//
// Static illustration: shows the PROBLEM only — ? and ♥ remain hidden.
// Shared primitive (OpTable23ECFigure) is consumed by the explainer too.
//
// Pool reuse: adapted from SumGrid12ECIllustration.tsx (grid line + cell
// text approach) — same bordered-cell / header pattern, extended with
// a header row/col and a heart glyph cell.

const INK = '#1F2937'
const BLUE = '#30598A'
const GREEN = '#10B981'
const HEADER_BG = '#F3F4F6'   // light grey header cells
const HEART_COLOR = '#8B5CF6' // purple, matches real figure scan

// Table metrics
const CELL = 62           // cell width & height
const BORDER = 2          // grid line width
const PAD_X = 14          // left/right padding
const PAD_Y = 14          // top/bottom padding

// 3×3 grid (header row + 2 data rows, header col + 2 data cols)
const COLS = 3
const ROWS = 3
const SVG_W = PAD_X * 2 + CELL * COLS
const SVG_H = PAD_Y * 2 + CELL * ROWS

// Cell centre helpers
const cx = (col: number) => PAD_X + col * CELL + CELL / 2
const cy = (row: number) => PAD_Y + row * CELL + CELL / 2
const rx = (col: number) => PAD_X + col * CELL
const ry = (row: number) => PAD_Y + row * CELL

// ── Exported constants (used by explainer to stay in sync) ───────────────────

export const COL_KNOWN = 3      // known column header
export const COL_UNKNOWN = 7    // solved column header (?)
export const ROW_1 = 5          // first row header
export const ROW_2 = 4          // second row header
export const CELL_15 = 15       // row1 × col_known
export const CELL_35 = 35       // row1 × col_unknown (reveals ?)
export const CELL_12 = 12       // row2 × col_known
export const HEART_VALUE = 28   // row2 × col_unknown = answer

// ── Shared primitive ─────────────────────────────────────────────────────────

export interface OpTable23ECFigureProps {
  /** Show the solved column header (7) instead of ?. */
  showColHeader?: boolean
  /** Show the heart answer (28) instead of ♥. */
  showHeart?: boolean
  /** Highlight which cell: 'col' = column-header ?, 'heart' = ♥ cell. */
  highlight?: 'col' | 'heart' | null
  /** Highlight the 35 cell to anchor the column search. */
  highlightCell35?: boolean
}

/** Shared multiplication-table primitive. Unsolved state by default. */
export function OpTable23ECFigure({
  showColHeader = false,
  showHeart = false,
  highlight = null,
  highlightCell35 = false,
}: OpTable23ECFigureProps) {
  // Cell background resolver
  const cellBg = (row: number, col: number) => {
    const isHeader = row === 0 || col === 0
    if (row === 0 && col === 2 && highlight === 'col') return '#E1EFFB'
    if (row === 2 && col === 2 && highlight === 'heart') return '#D1FAE5'
    if (row === 1 && col === 2 && highlightCell35) return '#FEF3C7'
    if (isHeader) return HEADER_BG
    return 'white'
  }

  // Text colour resolver
  const textColor = (row: number, col: number) => {
    if (row === 0 && col === 2 && highlight === 'col') return BLUE
    if (row === 2 && col === 2 && highlight === 'heart') return GREEN
    return INK
  }

  // Stroke width for highlighted cells
  const strokeWidth = (row: number, col: number) => {
    const isHi =
      (row === 0 && col === 2 && highlight === 'col') ||
      (row === 2 && col === 2 && highlight === 'heart') ||
      (row === 1 && col === 2 && highlightCell35)
    return isHi ? 3 : BORDER
  }

  const strokeColor = (row: number, col: number) => {
    if (row === 0 && col === 2 && highlight === 'col') return BLUE
    if (row === 2 && col === 2 && highlight === 'heart') return GREEN
    if (row === 1 && col === 2 && highlightCell35) return '#D97706'
    return INK
  }

  // Cell content matrix
  //   row 0 (header): ×  |  3  |  ?/7
  //   row 1:           5  | 15  | 35
  //   row 2:           4  | 12  | ♥/28
  const cellContent = (row: number, col: number): string | null => {
    if (row === 0 && col === 0) return '×'
    if (row === 0 && col === 1) return String(COL_KNOWN)
    if (row === 0 && col === 2) return showColHeader ? String(COL_UNKNOWN) : '?'
    if (row === 1 && col === 0) return String(ROW_1)
    if (row === 1 && col === 1) return String(CELL_15)
    if (row === 1 && col === 2) return String(CELL_35)
    if (row === 2 && col === 0) return String(ROW_2)
    if (row === 2 && col === 1) return String(CELL_12)
    if (row === 2 && col === 2) return showHeart ? String(HEART_VALUE) : null  // heart drawn separately
    return null
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Cell backgrounds + borders ── */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <rect
            key={`bg-${row}-${col}`}
            x={rx(col)}
            y={ry(row)}
            width={CELL}
            height={CELL}
            fill={cellBg(row, col)}
            stroke={strokeColor(row, col)}
            strokeWidth={strokeWidth(row, col)}
          />
        )),
      )}

      {/* ── Cell text ── */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const content = cellContent(row, col)
          if (content === null) return null
          const isHeader = row === 0 || col === 0
          return (
            <text
              key={`t-${row}-${col}`}
              x={cx(col)}
              y={cy(row)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isHeader ? 20 : 22}
              fontWeight={isHeader ? 900 : 800}
              fill={textColor(row, col)}
              className="font-display"
            >
              {content}
            </text>
          )
        }),
      )}

      {/* ── Heart glyph (row 2, col 2) — shown when not yet solved ── */}
      {!showHeart && (
        <text
          x={cx(2)}
          y={cy(2)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={28}
          fill={highlight === 'heart' ? '#6D28D9' : HEART_COLOR}
        >
          ♥
        </text>
      )}
    </svg>
  )
}

// ── Default export: static illustration (unsolved) ───────────────────────────

export default function OpTable23ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tabel perkalian 2x2. Header kolom: 3 dan tanda tanya. Header baris: 5 dan 4. Isi: 5×3=15, 5×?=35, 4×3=12, 4×?=hati. Temukan angka di balik hati."
    >
      <OpTable23ECFigure />
    </div>
  )
}
