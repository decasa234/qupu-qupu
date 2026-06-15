// "Allowed shapes" figure for WMI-22P2A-Q25 (2022 Grade 2 Semifinal, Paper A).
//
// The scan (db/seed/wmi/figures/2022-semifinal-g2-a-q25.jpg) shows ONLY the
// legend of six allowed shapes that "three consecutive number squares" may
// form — NOT the underlying number grid (the grid is absent from the scan).
//
// The six shapes are the 6 orientations a tromino (three touching squares) can
// take inside the grid:
//   1. ▭▭▭            three in a horizontal row
//   2. ▯ / ▯ / ▯       three in a vertical column
//   3..6. the four L-shaped corners (each an L rotated to a different corner)
//
// We redraw exactly those six tromino shapes as a clean legend. PROBLEM-ONLY:
// the figure shows the allowed group shapes and never reveals the count (13).
//
// SSR-safe · deterministic (no window/document/Math.random/Date at module top).

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Shape data (exported so the explainer reuses the SAME tromino set)
// ---------------------------------------------------------------------------

/** A shape = list of (col,row) unit cells, normalised to start at (0,0). */
export type Tromino = Array<[number, number]>

/** The six allowed "consecutive three squares" shapes, in scan order. */
export const SHAPES: Tromino[] = [
  // 1. horizontal I
  [[0, 0], [1, 0], [2, 0]],
  // 2. vertical I
  [[0, 0], [0, 1], [0, 2]],
  // 3. L — top-left + bottom two  (┌ corner at top-left going right-down)
  [[0, 0], [0, 1], [1, 1]],
  // 4. L — top two + bottom-left  (┐ corner)
  [[0, 0], [1, 0], [0, 1]],
  // 5. L — top two + bottom-right (corner bottom-right)
  [[0, 0], [1, 0], [1, 1]],
  // 6. L — bottom two + top-right (corner top-right)
  [[1, 0], [0, 1], [1, 1]],
]

export const UNIT = 30 // px per unit square
const FILL = '#FBF3DA' // soft cream (matches the scan tiles)
const EDGE = '#B7A77D'

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** Bounding box (cols, rows) of a tromino. */
function bbox(t: Tromino): [number, number] {
  let mc = 0
  let mr = 0
  for (const [c, r] of t) {
    mc = Math.max(mc, c)
    mr = Math.max(mr, r)
  }
  return [mc + 1, mr + 1]
}

/** Draw one tromino with its top-left at (ox, oy). Optional highlight colour. */
export function TrominoGlyph({
  shape,
  ox,
  oy,
  fill = FILL,
  edge = EDGE,
}: {
  shape: Tromino
  ox: number
  oy: number
  fill?: string
  edge?: string
}) {
  const cells: ReactNode[] = shape.map(([c, r], i) => (
    <rect
      key={i}
      x={ox + c * UNIT}
      y={oy + r * UNIT}
      width={UNIT}
      height={UNIT}
      fill={fill}
      stroke={edge}
      strokeWidth={1.6}
    />
  ))
  return <g>{cells}</g>
}

// gap between shapes when laid in a row
const GAP = 22
const PAD = 12
const ROW_H = 3 * UNIT // tallest shape is 3 tall

/** x offset where shape i starts (shapes laid left→right, vertically centred). */
export function shapeX(i: number): number {
  let x = PAD
  for (let k = 0; k < i; k++) {
    const [cols] = bbox(SHAPES[k])
    x += cols * UNIT + GAP
  }
  return x
}

export function shapeY(i: number): number {
  const [, rows] = bbox(SHAPES[i])
  return PAD + (ROW_H - rows * UNIT) / 2
}

export const VIEW_W = (() => {
  let x = PAD
  for (let k = 0; k < SHAPES.length; k++) {
    const [cols] = bbox(SHAPES[k])
    x += cols * UNIT + (k < SHAPES.length - 1 ? GAP : 0)
  }
  return x + PAD
})()

export const VIEW_H = ROW_H + PAD * 2

/** The legend of all six allowed shapes (problem-only). */
export function ShapeLegend({ highlight }: { highlight?: number }) {
  return (
    <g>
      {SHAPES.map((s, i) => (
        <TrominoGlyph
          key={i}
          shape={s}
          ox={shapeX(i)}
          oy={shapeY(i)}
          fill={highlight === i ? '#FDE68A' : FILL}
          edge={highlight === i ? '#F0853A' : EDGE}
        />
      ))}
    </g>
  )
}

export default function P22G2Q25Illustration() {
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'The six allowed shapes for a group of three touching number squares: three in a row, three in a column, and four L-shaped corners.'
      }
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}>
        <ShapeLegend />
      </svg>
    </div>
  )
}
