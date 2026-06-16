// GrayGrid24G2Illustration.tsx
// WMI 2024 Grade-2 Final Q4 — 8 × 9 grid of rectangles with 7 gray cells.
// Problem: "Each vertical column has 8 rectangles and each horizontal row has
// 9 rectangles. If there are 7 gray rectangles, how many white rectangles are
// there?" Answer: 8 × 9 − 7 = 65.
//
// This file shows ONLY the problem figure (the grid + gray cells as given).
// It does NOT reveal the answer.

// ---- data constants (exported for explainers / animators) ------------------

/** Grid dimensions: ROWS rows × COLS columns = 72 total cells. */
export const GRID_ROWS = 8
export const GRID_COLS = 9

/**
 * The 7 gray cells as [row, col] pairs (0-indexed, row 0 = top).
 * Transcribed faithfully from the exam figure
 * (db/seed/wmi/figures/2024-final-g2-a-q4.jpg).
 *
 * Row 1: cols 1, 2, 4  (3 cells in a single row, two close together on left)
 * Row 2: col 6         (1 cell, upper-right area)
 * Row 3: col 4         (1 cell, centre)
 * Row 4: cols 1 and 7  (2 cells — left and right)
 *
 * Total = 3 + 1 + 1 + 2 = 7 ✓
 */
export const GRAY_CELLS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [1, 2],
  [1, 4],
  [2, 6],
  [3, 4],
  [4, 1],
  [4, 7],
] as const

/** Total cells, gray count, and white count for reference. */
export const GRID_TOTALS = {
  total: GRID_ROWS * GRID_COLS, // 72
  gray: GRAY_CELLS.length,      // 7
  white: GRID_ROWS * GRID_COLS - GRAY_CELLS.length, // 65
} as const

// ---- helpers ---------------------------------------------------------------

function isGray(r: number, c: number): boolean {
  return GRAY_CELLS.some(([gr, gc]) => gr === r && gc === c)
}

// ---- primitive (re-usable by the explainer) --------------------------------

/**
 * The raw SVG content of the grid — no wrapper div.
 * `highlightGray` colours the gray cells; pass `false` for the problem-only
 * static figure. Accepts an optional override set to colour individual cells.
 */
export function GrayGridPrimitive({
  highlightGray = true,
  overrides,
}: {
  highlightGray?: boolean
  overrides?: ReadonlyMap<string, string> // `"r,c"` → fill colour
}) {
  // Layout
  const CELL_W = 30
  const CELL_H = 22
  const PAD_X = 4
  const PAD_Y = 4
  const W = PAD_X * 2 + GRID_COLS * CELL_W
  const H = PAD_Y * 2 + GRID_ROWS * CELL_H

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={Math.min(300, W)}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {Array.from({ length: GRID_ROWS }, (_, r) =>
        Array.from({ length: GRID_COLS }, (__, c) => {
          const key = `${r},${c}`
          const gray = highlightGray && isGray(r, c)
          const fill =
            overrides?.get(key) ??
            (gray ? '#9CA3AF' : '#FFFFFF')
          return (
            <rect
              key={key}
              x={PAD_X + c * CELL_W}
              y={PAD_Y + r * CELL_H}
              width={CELL_W}
              height={CELL_H}
              fill={fill}
              stroke="#374151"
              strokeWidth={0.8}
            />
          )
        }),
      )}
    </svg>
  )
}

// ---- main export -----------------------------------------------------------

/**
 * In-card illustration for WMI-24F2A-Q4.
 *
 * Pure render — no state, no random, SSR-safe and deterministic.
 * `params` is accepted to match the illustrator signature contract but the
 * grid is fixed (the figure has no variable parameters).
 */
export default function GrayGrid24G2Illustration() {
  const grayList = GRAY_CELLS.map(([r, c]) => `baris ${r + 1} kolom ${c + 1}`).join(', ')
  const ariaLabel =
    `Kisi ${GRID_ROWS} baris kali ${GRID_COLS} kolom berisi ${GRID_TOTALS.total} persegi panjang kecil. ` +
    `Terdapat ${GRAY_CELLS.length} persegi panjang abu-abu di posisi: ${grayList}. ` +
    `Hitung berapa persegi panjang yang berwarna putih.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <GrayGridPrimitive highlightGray={true} />
    </div>
  )
}
