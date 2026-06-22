// IKMC-22-PE-Q5 — Coin placement grid (stem illustration)
//
// Problem: place 2 coins in each row and each column of a 4×4 grid.
// Five empty cells are labelled A–E; find where the final coin goes.
//
// Pre-placed coins (row, col), 0-indexed, row 0 = top:
//   (0,0)  (0,1)              ← row 0 already full
//   (1,1)        (1,3)        ← row 1 already full
//   (2,0)                     ← row 2 needs one more
//               (3,2)  (3,3)  ← row 3 already full
//
// Candidate cells (labelled in the image):
//   A = (1,0)   B = (0,3)   C = (1,2)   D = (2,2)   E = (3,0)
//
// Column tallies before the final coin:
//   col 0: (0,0),(2,0) → 2 full
//   col 1: (0,1),(1,1) → 2 full
//   col 2: (3,2)       → 1 needs one more
//   col 3: (1,3),(3,3) → 2 full
//
// Row 2 needs col 2 → answer D.  Answer: D.
//
// Co-exports:
//   CoinGrid5PE           — shared primitive (4×4 grid with state props)
//   COIN_CELLS            — pre-placed coin positions
//   CANDIDATE_CELLS       — A–E label positions
//   GRID_SIZE, GRID_PAD, CELL_SIZE, VIEW_W, VIEW_H
//
// Pure render, SSR-safe, no random/Date/side-effects.

// ── palette ───────────────────────────────────────────────────────────────────
const CELL_BG      = '#F9FAFB'
const CELL_STROKE  = '#D1D5DB'
const COIN_FILL    = '#F5CBA7'   // warm tan / beige coin colour from the source
const COIN_STROKE  = '#B7770D'
const LABEL_INK    = '#374151'
const HL_STROKE    = '#10B981'   // green highlight for correct answer
const HL_STROKE_W  = 3
const ARROW_COLOR  = '#F59E0B'   // amber for row/col scan overlays

// ── geometry ──────────────────────────────────────────────────────────────────
export const CELL_SIZE = 56
export const GRID_PAD  = 16
export const GRID_ROWS = 4
export const GRID_COLS = 4

export const VIEW_W = GRID_PAD * 2 + CELL_SIZE * GRID_COLS
export const VIEW_H = GRID_PAD * 2 + CELL_SIZE * GRID_ROWS

// ── data ──────────────────────────────────────────────────────────────────────

/** Pre-placed coins: [row, col] */
// eslint-disable-next-line react-refresh/only-export-components
export const COIN_CELLS: Array<[number, number]> = [
  [0, 0], [0, 1],
  [1, 1], [1, 3],
  [2, 0],
  [3, 2], [3, 3],
]

/** Candidate cells with their A–E labels: { row, col, label } */
// eslint-disable-next-line react-refresh/only-export-components
export const CANDIDATE_CELLS: Array<{ row: number; col: number; label: string }> = [
  { row: 1, col: 0, label: 'A' },
  { row: 0, col: 3, label: 'B' },
  { row: 1, col: 2, label: 'C' },
  { row: 2, col: 2, label: 'D' },
  { row: 3, col: 0, label: 'E' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function cellOrigin(row: number, col: number): [number, number] {
  return [
    GRID_PAD + col * CELL_SIZE,
    GRID_PAD + row * CELL_SIZE,
  ]
}

function cellCentre(row: number, col: number): [number, number] {
  const [x, y] = cellOrigin(row, col)
  return [x + CELL_SIZE / 2, y + CELL_SIZE / 2]
}

// ── shared primitive ──────────────────────────────────────────────────────────

export interface CoinGrid5PEProps {
  /** Highlight border (green) around these [row,col] cells */
  highlightCells?: Array<[number, number]>
  /** Draw a row scan overlay on this row index */
  highlightRow?: number | null
  /** Draw a column scan overlay on this col index */
  highlightCol?: number | null
  /** Render the answer coin at (2,2) */
  showAnswer?: boolean
  /** Dim non-answer candidate labels once answer is revealed */
  dimOtherLabels?: boolean
}

/**
 * CoinGrid5PE
 *
 * Shared 4×4 grid primitive for IKMC-22-PE-Q5.
 * Renders the pre-placed coins, the A–E candidate labels, and accepts props for
 * the explainer's animated overlays (row/col scan, answer reveal, highlight).
 */
export function CoinGrid5PE({
  highlightCells = [],
  highlightRow = null,
  highlightCol = null,
  showAnswer = false,
  dimOtherLabels = false,
}: CoinGrid5PEProps = {}) {
  const hlSet = new Set(highlightCells.map(([r, c]) => `${r},${c}`))

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={VIEW_W}
      aria-hidden="true"
    >
      {/* row scan tint */}
      {highlightRow !== null && (
        <rect
          x={0}
          y={GRID_PAD + highlightRow * CELL_SIZE}
          width={VIEW_W}
          height={CELL_SIZE}
          fill={ARROW_COLOR}
          opacity={0.12}
        />
      )}

      {/* col scan tint */}
      {highlightCol !== null && (
        <rect
          x={GRID_PAD + highlightCol * CELL_SIZE}
          y={0}
          width={CELL_SIZE}
          height={VIEW_H}
          fill={ARROW_COLOR}
          opacity={0.12}
        />
      )}

      {/* grid cells */}
      {Array.from({ length: GRID_ROWS }, (_, row) =>
        Array.from({ length: GRID_COLS }, (_, col) => {
          const [x, y] = cellOrigin(row, col)
          const key = `${row},${col}`
          const isHl = hlSet.has(key)
          return (
            <rect
              key={key}
              x={x}
              y={y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={CELL_BG}
              stroke={isHl ? HL_STROKE : CELL_STROKE}
              strokeWidth={isHl ? HL_STROKE_W : 1.5}
            />
          )
        }),
      )}

      {/* pre-placed coins */}
      {COIN_CELLS.map(([row, col]) => {
        const [cx, cy] = cellCentre(row, col)
        const r = CELL_SIZE * 0.36
        return (
          <g key={`coin-${row}-${col}`}>
            <circle cx={cx} cy={cy} r={r} fill={COIN_FILL} stroke={COIN_STROKE} strokeWidth={2} />
          </g>
        )
      })}

      {/* answer coin at D = (2, 2) */}
      {showAnswer && (() => {
        const [cx, cy] = cellCentre(2, 2)
        const r = CELL_SIZE * 0.36
        return (
          <g key="coin-answer">
            <circle cx={cx} cy={cy} r={r} fill={COIN_FILL} stroke={HL_STROKE} strokeWidth={2.5} />
          </g>
        )
      })()}

      {/* candidate labels A–E */}
      {CANDIDATE_CELLS.map(({ row, col, label }) => {
        const [cx, cy] = cellCentre(row, col)
        // hide D label once answer coin is shown; dim others if dimOtherLabels
        const isAnswer = row === 2 && col === 2
        if (isAnswer && showAnswer) return null
        const opacity = dimOtherLabels && !isAnswer ? 0.3 : 1
        return (
          <text
            key={`lbl-${label}`}
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={800}
            fill={LABEL_INK}
            fontFamily="Nunito, sans-serif"
            opacity={opacity}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ── default export: stem illustration ────────────────────────────────────────

/**
 * CoinGrid5PEIllustration
 *
 * Static problem figure for IKMC-22-PE-Q5.
 * Shows the 4×4 grid with 7 pre-placed coins and five candidate cells
 * labelled A–E. Never reveals the answer.
 */
export default function CoinGrid5PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kotak 4×4 dengan koin yang sudah ditempatkan: baris atas punya 2 koin, ' +
        'baris 2 punya 2 koin, baris 3 punya 1 koin, baris bawah punya 2 koin. ' +
        'Sel kosong berlabel A, B, C, D, E menunjukkan posisi koin terakhir yang mungkin.'
      }
    >
      <CoinGrid5PE />
    </div>
  )
}
