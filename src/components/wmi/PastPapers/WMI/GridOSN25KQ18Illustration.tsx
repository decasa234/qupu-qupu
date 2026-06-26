// OSN-25-SD-KAB-Q18 — 2×2 coloured grid stem illustration.
// Shows the blank grid that students must fill with 4 different primes < 40.
// Primitive: GridBoard (imported from ./primitives/GridBoard).
// Exports shared layout constants so GridOSN25KQ18Explainer can reuse them.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── shared layout constants ───────────────────────────────────────────────────
export const CELL = 80   // cell size in SVG units
export const ROWS = 2
export const COLS = 2

/**
 * Per-cell fill colours matching the source figure (4 distinct colours so
 * students can clearly distinguish each cell position).
 */
export const CELL_COLORS: Record<string, string> = {
  '0-0': '#B3C6E0',  // top-left  — periwinkle blue
  '0-1': '#C0392B',  // top-right — red
  '1-0': '#5A9A5A',  // bottom-left — green
  '1-1': '#2E5FA3',  // bottom-right — navy blue
}

// ── Illustration (default export) ────────────────────────────────────────────

/**
 * OSN-25-SD-KAB-Q18 stem: a 2×2 coloured grid to be filled with
 * 4 different prime numbers each less than 40.
 */
export default function GridOSN25KQ18Illustration() {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)

  return (
    <svg
      viewBox={vb}
      width={COLS * CELL}
      height={ROWS * CELL}
      aria-label="Petak 2×2 yang harus diisi dengan bilangan prima berbeda yang masing-masing kurang dari 40"
      role="img"
    >
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={CELL}
        fill={(r, c) => CELL_COLORS[`${r}-${c}`]}
        gridStroke="#374151"
      />
    </svg>
  )
}
