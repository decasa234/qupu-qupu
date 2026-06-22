// Boxes13PEIllustration.tsx
// IKMC-23-PE-Q13 — 6-row × 5-column table of 30 empty boxes.
//
// Faithful reconstruction of docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/031.jpg:
//   - 6 rows labeled 1–6 on the left
//   - 5 columns labeled A–E across the top
//   - All boxes empty (problem only — no painting shown)
//
// The table has 30 boxes total. After painting row 3, row 6, col C, col D,
// inclusion-exclusion gives 18 painted → 30 − 18 = 12 not painted (answer C).
//
// Exports the reusable BoxGrid13Primitive for the explainer to import.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Grid constants ────────────────────────────────────────────────────────────

/** Number of rows (labels 1–6) */
export const GRID_ROWS = 6
/** Number of columns (labels A–E) */
export const GRID_COLS = 5

/** Painted rows (0-indexed: row index 2 = label "3", row index 5 = label "6") */
export const PAINTED_ROWS: ReadonlySet<number> = new Set([2, 5])
/** Painted columns (0-indexed: col index 2 = "C", col index 3 = "D") */
export const PAINTED_COLS: ReadonlySet<number> = new Set([2, 3])

/** Column labels */
export const COL_LABELS = ['A', 'B', 'C', 'D', 'E'] as const
/** Row labels */
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6'] as const

/** Inclusion-exclusion totals */
export const PAINT_TOTALS = {
  rows: PAINTED_ROWS.size * GRID_COLS,     // 2 × 5 = 10
  cols: PAINTED_COLS.size * GRID_ROWS,     // 2 × 6 = 12
  overlaps: PAINTED_ROWS.size * PAINTED_COLS.size, // 2 × 2 = 4
  painted: 2 * GRID_COLS + 2 * GRID_ROWS - PAINTED_ROWS.size * PAINTED_COLS.size,
  total: GRID_ROWS * GRID_COLS,            // 30
} as const
// painted = 10 + 12 − 4 = 18; unpainted = 30 − 18 = 12

/** Returns true if the cell (row, col) — both 0-indexed — would be painted. */
export function isPainted(row: number, col: number): boolean {
  return PAINTED_ROWS.has(row) || PAINTED_COLS.has(col)
}

// ── SVG layout constants ──────────────────────────────────────────────────────

export const CELL_W = 32   // cell width
export const CELL_H = 28   // cell height
export const LABEL_W = 18  // left label column width
export const LABEL_H = 20  // top label row height
export const PAD = 6       // outer padding

export const SVG_W = PAD * 2 + LABEL_W + GRID_COLS * CELL_W
export const SVG_H = PAD * 2 + LABEL_H + GRID_ROWS * CELL_H

// ── Primitive (re-exported for the Explainer) ─────────────────────────────────

type CellFillFn = (row: number, col: number) => string

/**
 * Reusable primitive: the 6 × 5 labelled grid.
 *
 * @param cellFill  optional per-cell fill override — (row, col) → CSS colour.
 *                  Defaults to white for all cells.
 */
export function BoxGrid13Primitive({
  cellFill,
}: {
  cellFill?: CellFillFn
}) {
  const defaultFill = '#FFFFFF'
  const strokeColor = '#374151'

  // Grid origin (top-left of cell [0,0])
  const gx = PAD + LABEL_W
  const gy = PAD + LABEL_H

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(280, SVG_W * 1.5)}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* column labels A–E */}
      {COL_LABELS.map((label, c) => (
        <text
          key={`col-${c}`}
          x={gx + c * CELL_W + CELL_W / 2}
          y={PAD + LABEL_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#111827"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      ))}

      {/* row labels 1–6 */}
      {ROW_LABELS.map((label, r) => (
        <text
          key={`row-${r}`}
          x={PAD + LABEL_W / 2}
          y={gy + r * CELL_H + CELL_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#111827"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      ))}

      {/* grid cells */}
      {Array.from({ length: GRID_ROWS }, (_, r) =>
        Array.from({ length: GRID_COLS }, (__, c) => {
          const fill = cellFill ? cellFill(r, c) : defaultFill
          return (
            <rect
              key={`${r}-${c}`}
              x={gx + c * CELL_W}
              y={gy + r * CELL_H}
              width={CELL_W}
              height={CELL_H}
              fill={fill}
              stroke={strokeColor}
              strokeWidth={0.8}
            />
          )
        }),
      )}
    </svg>
  )
}

// ── Default export: static problem illustration ───────────────────────────────

/**
 * Boxes13PEIllustration
 *
 * Static, problem-only figure for IKMC-23-PE-Q13.
 * Shows: empty 6 × 5 labelled grid (rows 1–6, columns A–E).
 * Does NOT reveal which boxes will be painted or the answer.
 */
export default function Boxes13PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tabel kosong dengan 6 baris (berlabel 1 sampai 6) dan 5 kolom (berlabel A sampai E). ' +
        'Total 30 kotak kosong yang akan dicat sesuai instruksi soal.'
      }
    >
      <BoxGrid13Primitive />
    </div>
  )
}
