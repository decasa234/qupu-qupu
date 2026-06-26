// TIMO-22-P2H-Q18 — "How many squares are there in the figure below?"
//
// Figure: Z-staircase — top-left 3×2 block + bottom-right 3×2 block.
//   Grid layout (global row × col):
//     Row 0: [X][X][X][ ][ ]
//     Row 1: [X][X][X][ ][ ]
//     Row 2: [ ][ ][X][X][X]
//     Row 3: [ ][ ][X][X][X]
//
//   1×1 squares: 12  (all unit cells)
//   2×2 squares:  4  (2 in top-left block + 2 in bottom-right block)
//   Total: 16 → answer 16
//
// Pure SVG render — no hooks, no framer-motion. SSR-safe.

import { GridBoard } from './primitives/GridBoard'

/** Unit cell size in SVG units. */
export const CELL = 44
/** Outer padding. */
export const PAD = 10

/** Top-left 3×2 block origin. */
export const TOP_X = PAD
export const TOP_Y = PAD

/** Bottom-right 3×2 block origin — offset 2 cells right and 2 cells down. */
export const BOT_X = PAD + 2 * CELL   // 98
export const BOT_Y = PAD + 2 * CELL   // 98

/** Total canvas dimensions. */
export const SVG_W = PAD + 5 * CELL + PAD   // 240
export const SVG_H = PAD + 4 * CELL + PAD   // 196

export const STROKE = '#374151'
export const FILL   = '#FFFFFF'

export default function CountSquaresTIMO22P2Q18Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar berpetak Z: blok 3×2 kiri atas dan blok 3×2 kanan bawah membentuk tangga. Hitung semua persegi dari semua ukuran."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL} />

        {/* top-left 3×2 block */}
        <g transform={`translate(${TOP_X}, ${TOP_Y})`}>
          <GridBoard rows={2} cols={3} cellSize={CELL} gridStroke={STROKE} />
        </g>

        {/* bottom-right 3×2 block */}
        <g transform={`translate(${BOT_X}, ${BOT_Y})`}>
          <GridBoard rows={2} cols={3} cellSize={CELL} gridStroke={STROKE} />
        </g>
      </svg>
    </div>
  )
}
