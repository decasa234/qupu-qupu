/**
 * CountSquaresSIMOC19G3Q22Illustration — SIMOC-19-G3-Q22
 *
 * "Berapa banyak persegi yang terdapat pada gambar di bawah ini?"
 * Answer: 27.
 *
 * Source: docs/reference/ocr-res/simoc/contest/g3/2019.imgs/017.jpg
 *
 * Figure: two 3×3 grids joined at their shared corner cell (row 2, col 2),
 * forming a staircase/diagonal shape of 17 unit cells (5×5 bounding box,
 * cells missing in the top-right and bottom-left quadrants).
 *
 * Square counts: 1×1 = 17, 2×2 = 8, 3×3 = 2 → total 27.
 *
 * Reuses Polyomino primitive (./primitives/Polyomino).
 */

import React from 'react'
import { Polyomino } from './primitives/Polyomino'

// ---------------------------------------------------------------------------
// Cell data — exported so the Explainer can reuse
// ---------------------------------------------------------------------------

/** All 17 cells of the figure (rows 0-4, cols 0-4, 0-indexed). */
export const FIGURE_CELLS: [number, number][] = [
  // top-left 3×3 block (rows 0-2, cols 0-2)
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
  // bottom-right 3×3 block (rows 2-4, cols 2-4) — [2,2] already listed above
  [2, 3], [2, 4],
  [3, 2], [3, 3], [3, 4],
  [4, 2], [4, 3], [4, 4],
]

/** Upper-left corners of all eight 2×2 squares in the figure. */
export const TWO_X_TWO_UL: [number, number][] = [
  // top block
  [0, 0], [0, 1], [1, 0], [1, 1],
  // bottom block
  [2, 2], [2, 3], [3, 2], [3, 3],
]

/** Upper-left corners of all two 3×3 squares in the figure. */
export const THREE_X_THREE_UL: [number, number][] = [
  [0, 0], // top-left 3×3 block
  [2, 2], // bottom-right 3×3 block
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CountSquaresSIMOC19G3Q22Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Gambar dua blok persegi 3×3 yang sambung di sudut, ' +
        'membentuk pola tangga diagonal. ' +
        'Pertanyaan: berapa banyak persegi semua ukuran yang ada?'
      }
    >
      <Polyomino
        cells={FIGURE_CELLS}
        cellSize={44}
        fill="#FFFFFF"
        stroke="#374151"
        strokeWidth={2}
        showGrid
        label="Two 3×3 grids joined at one corner — count all squares of all sizes"
      />
    </div>
  )
}
