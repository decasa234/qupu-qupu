/**
 * SEAMO-22-A-Q6 — Four arrangements of 6 small rectangles; compare perimeters.
 *
 * THE FIGURE (from OCR crop 2022.imgs/007.jpg)
 * ============================================
 * Four figures, each made of 6 identical small rectangles:
 *   Figure 1 — single row:   1 tall × 6 wide
 *   Figure 2 — 2×3 block:   2 tall × 3 wide
 *   Figure 3 — 3×2 block:   3 tall × 2 wide
 *   Figure 4 — single col:  6 tall × 1 wide
 *
 * Answer C: Figure 1 has the largest perimeter.
 * (Most linear = most outer edges exposed.)
 *
 * Uses Polyomino primitive for each arrangement.
 * Pure SVG — SSR-safe, no hooks, no framer-motion.
 */

import React from 'react'
import { Polyomino } from './primitives/Polyomino'

// Exported so the Explainer can overlay highlights
export const CELL = 22   // px per cell (square approximation of each small rectangle)
export const PAD = 4     // Polyomino internal padding

// Cell definitions — [row, col] pairs for each figure
export const FIG1_CELLS: [number, number][] = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]]  // 1×6 row
export const FIG2_CELLS: [number, number][] = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]  // 2×3 block
export const FIG3_CELLS: [number, number][] = [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]]  // 3×2 block
export const FIG4_CELLS: [number, number][] = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]  // 6×1 col

const FILL = '#EFF6FF'    // light blue — blank cells (problem figure, no highlighting)
const STROKE = '#1E3A5F'  // dark navy border

// Shared Polyomino props
const POLY_PROPS = {
  cellSize: CELL,
  pad: PAD,
  fill: FILL,
  stroke: STROKE,
  strokeWidth: 1.5,
  showGrid: true,
}

/** One labelled arrangement panel. */
function FigPanel({
  cells,
  label,
}: {
  cells: [number, number][]
  label: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <Polyomino cells={cells} {...POLY_PROPS} />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/**
 * RectPerim22A6Illustration
 *
 * Static problem figure: four arrangements of 6 small rectangles.
 * Does NOT reveal which has the largest perimeter (that's the answer).
 */
export default function RectPerim22A6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat susunan 6 persegi panjang kecil: Gambar 1 satu baris, Gambar 2 dua baris tiga kolom, ' +
        'Gambar 3 tiga baris dua kolom, Gambar 4 satu kolom. Manakah yang kelilingnya terbesar?'
      }
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '8px 4px',
        }}
      >
        <FigPanel cells={FIG1_CELLS} label="Figure 1" />
        <FigPanel cells={FIG2_CELLS} label="Figure 2" />
        <FigPanel cells={FIG3_CELLS} label="Figure 3" />
        <FigPanel cells={FIG4_CELLS} label="Figure 4" />
      </div>
    </div>
  )
}
