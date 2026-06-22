// "How many triangles are there in the figure?" for SEAMO-16-A-Q2.
//
// The source figure (2016.imgs/003.jpg) shows a large equilateral triangle
// subdivided into a 3-row triangular grid — 9 unit triangles (6 up + 3 down).
// Triangles of every size total exactly 13:
//   Size-1 (unit): 6 up + 3 down = 9
//   Size-2 (up only): 3
//   Size-3 (the whole): 1
//   Total: 9 + 3 + 1 = 13  → answer D.
//
// No existing primitive matches triangular-grid figure counting, so this is
// a fresh component following the CountSquaresG2 copy-adapt pattern.

export const TRI_N = 3 // rows

// --- Geometry helpers ---
// Big triangle: apex at top-centre, base at bottom.
// We place it in a 240×215 viewBox (height = 240 * √3/2 ≈ 208; we use 215 for pad).
const W = 240
const PAD = 16
const SIDE = W - PAD * 2 // 208px — the side length of the big triangle
// Equilateral triangle: height = SIDE * √3/2
const TRI_H = (SIDE * Math.sqrt(3)) / 2
const APEX_X = W / 2
const APEX_Y = PAD
const BASE_Y = PAD + TRI_H
const BASE_L = PAD         // left base vertex x
const BASE_R = PAD + SIDE  // right base vertex x
export const VIEW_W = W
export const VIEW_H = Math.round(BASE_Y + PAD)

// For a triangular grid of side n, the unit side length is SIDE/n.
const U = SIDE / TRI_N

// Vertex positions in the grid.
// Grid coords: row r (0..n), col c (0..r for the bottom vertices of row r).
// Actually easier: map from triangular unit coords (i,j):
//   point(i,j) = apex + i*(row-down vector) + j*(col-right vector)
// row-down vector = (BASE_L-APEX_X)/n per unit going down left? No — use standard:
// The base spans from BASE_L to BASE_R.  Unit cell:
//   Down-left direction per row step
// Let's define:
//   pt(row, col) = row goes from 0 (apex row) to n (base row)
//                  col goes from 0 (left edge) to row (right edge)
// Each step down: dy = TRI_H / n, dx shifts left by U/2
// pt(r, c):
//   x = APEX_X - r*(U/2) + c*U
//   y = APEX_Y + r*(TRI_H/TRI_N)
function pt(r: number, c: number): [number, number] {
  return [APEX_X - r * (U / 2) + c * U, APEX_Y + r * (TRI_H / TRI_N)]
}

// --- Triangle catalogue ---
// Each triangle is defined by three vertex refs [r1,c1, r2,c2, r3,c3] and a size.
export type TriSize = 1 | 2 | 3
export interface TriEntry {
  size: TriSize
  dir: 'up' | 'down'
  // position identifier: top-row and top-col of the unit cell (for up-triangles)
  // or the row/col of the apex vertex (for down-triangles)
  key: string
  pts: [[number, number], [number, number], [number, number]]
}

function upTri(r: number, c: number, size: TriSize): TriEntry {
  // Upward triangle with top vertex at grid pt(r,c), size s means side = s units
  // vertices: apex = pt(r, c), bottom-left = pt(r+size, c), bottom-right = pt(r+size, c+size)
  return {
    size,
    dir: 'up',
    key: `U${size}-${r}-${c}`,
    pts: [pt(r, c), pt(r + size, c), pt(r + size, c + size)],
  }
}

function downTri(r: number, c: number, size: TriSize): TriEntry {
  // Downward triangle with top-left at grid pt(r,c), top-right at pt(r, c+1) for size=1
  // For size s: bottom vertex at pt(r, c+s), top-left at pt(r+s, c), top-right at pt(r+s, c+s)
  // (Equivalently: the "upside-down" triangle whose bottom point is pt(r,c+s),
  //  left top is pt(r+s, c), right top is pt(r+s, c+s))
  // Actually: a down-triangle of size s has:
  //   top-left vertex = pt(r, c)  (shared with the up grid)
  //   top-right vertex = pt(r, c+s)
  //   bottom vertex = pt(r+s, c)  -- wait, let me re-derive.
  // In a triangular grid row numbering: down-triangle unit at "row r, col c"
  // has its top edge on row r, occupying cols c..c+1, and its bottom vertex at pt(r+1, c+1).
  // For size 1:  vertices are pt(r,c), pt(r,c+1), pt(r+1,c) — NO. That is not a down triangle.
  //
  // Standard triangular grid: An upward unit triangle at (r,c) has vertices
  //   pt(r,c), pt(r+1,c), pt(r+1,c+1).
  // A downward unit triangle shares the hypotenuse: it has vertices
  //   pt(r,c), pt(r,c+1), pt(r+1,c+1)? No — let me think again.
  //
  // Actually in row r (0-indexed from apex):
  //   Row r contains r up-triangles and (r-1) down-triangles (for r >= 1).
  //   The up-triangles in row r have vertices:
  //     for c=0..r-1: pt(r,c), pt(r+1,c), pt(r+1,c+1)
  //   The down-triangles in row r have vertices:
  //     for c=0..r-2: pt(r,c+1), pt(r+1,c+1), pt(r+1,c+1)? No...
  //
  // Let me just use the clean definition:
  //   Up-tri at (r,c): apex at pt(r,c), BL at pt(r+1,c), BR at pt(r+1,c+1)
  //   Down-tri at (r,c): "top" edge between pt(r+1,c) and pt(r+1,c+1),
  //                        bottom vertex at pt(r,c+1)   [inverted apex]
  //
  // Size-1 down-triangles exist in rows r=1,2:
  //   row 1: 1 down-tri (r=1,c=0): pts = pt(2,0), pt(2,1), pt(1,1)
  //   row 2: 2 down-tris:
  //     (r=2,c=0): pt(3,0), pt(3,1), pt(2,1)
  //     (r=2,c=1): pt(3,1), pt(3,2), pt(2,2)
  //
  // For a down-tri of size 1 at "bottom row rb, col cb" (rb = row of base edge):
  //   BL = pt(rb, cb), BR = pt(rb, cb+1), apex (top) = pt(rb-1, cb+1)
  // Wait — I need consistent coords. Let me define:
  //   down-tri (rb, cb): rb = the row of the base (bottom), cb = col offset
  //   BL = pt(rb, cb), BR = pt(rb, cb+1), TOP = pt(rb-1, cb)
  //   where TOP is the upward-pointing vertex.
  //
  // Check row 2 (rb=2, cb=0): BL=pt(2,0), BR=pt(2,1), TOP=pt(1,0)?
  // pt(1,0) is the left vertex of row 1. That would be the top-left corner of a big region,
  // not a unit down-triangle...
  //
  // I'll just hardcode: down-tri of size s.
  // Key insight: a downward unit triangle at grid position (r,c) means:
  //   vertex A = pt(r, c+1)  [the "bottom" in world coords but apex of inverted shape]
  //   vertex B = pt(r+1, c)  [bottom-left in world coords = top-left of inverted]
  //   vertex C = pt(r+1, c+1) [bottom-right]
  // where r ranges 0..n-2, c ranges 0..r.
  // (this down-tri is surrounded by up-tris at (r,c), (r,c+1), and (r+1,c+1))
  //
  // For size s, the generalized down-tri at (r,c) with s=size:
  //   vertex A = pt(r, c+s)
  //   vertex B = pt(r+s, c)
  //   vertex C = pt(r+s, c+s)
  // This is the down-triangle whose bounding rows are r..r+s.

  return {
    size,
    dir: 'down',
    key: `D${size}-${r}-${c}`,
    pts: [pt(r, c + size), pt(r + size, c), pt(r + size, c + size)],
  }
}

// Enumerate all triangles of all sizes
function buildAllTris(): TriEntry[] {
  const out: TriEntry[] = []
  for (let s = 1; s <= TRI_N; s++) {
    // Up-triangles of size s: apex at (r,c) where r+s <= n, c+s <= r+s (i.e. c <= r is implicit since c+s<=n)
    // Apex can be at row 0..n-s, col 0..r where r = row of apex = any row 0..n-s
    // Actually: for up-tri of size s with apex at (r,c): we need r+s <= n and c+s <= n-r+c?
    // The constraint is just r+s <= n (fits vertically) and the apex col c is valid for row r: 0 <= c <= r.
    // Wait — in our coord system, row r has valid col range 0..r. So for apex at (r,c): 0<=c<=r and r+s<=n.
    // Also BR = pt(r+s, c+s): we need 0<=c+s<=r+s, which is always true since c>=0.
    for (let r = 0; r + s <= TRI_N; r++) {
      for (let c = 0; c <= r; c++) {
        out.push(upTri(r, c, s as TriSize))
      }
    }
    // Down-triangles of size s: at (r,c) where r+s <= n-1...
    // Actually: vertex A = pt(r, c+s), B = pt(r+s, c), C = pt(r+s, c+s)
    // Need: c+s <= r (so pt(r, c+s) is valid for row r) — constraint: c+s <= r
    // And r+s <= n.
    // Also c >= 0.
    for (let r = 0; r + s <= TRI_N; r++) {
      for (let c = 0; c + s <= r; c++) {
        out.push(downTri(r, c, s as TriSize))
      }
    }
  }
  return out
}

export const ALL_TRIS = buildAllTris()
export const TRI_TOTAL = ALL_TRIS.length // should be 13

/** Triangles grouped by size, then dir, ordered for the tally. */
export const TRIS_BY_SIZE: { size: TriSize; tris: TriEntry[] }[] = (() => {
  const sizes = [1, 2, 3] as TriSize[]
  return sizes
    .map((sz) => ({ size: sz, tris: ALL_TRIS.filter((t) => t.size === sz) }))
    .filter((g) => g.tris.length > 0)
})()

export const CT16_VIEW_W = VIEW_W
export const CT16_VIEW_H = VIEW_H

const GOLD = '#F59E0B'
const GOLD_DARK = '#92400E'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.25)'

export interface CountTriangles16A2FigureProps {
  highlightSize?: TriSize | null
  highlightTri?: TriEntry | null
}

function triPoints(pts: TriEntry['pts']): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export function CountTriangles16A2Figure({ highlightSize = null, highlightTri = null }: CountTriangles16A2FigureProps) {
  const highlights = highlightTri
    ? [highlightTri]
    : highlightSize != null
      ? ALL_TRIS.filter((t) => t.size === highlightSize)
      : []

  return (
    <svg
      viewBox={`0 0 ${CT16_VIEW_W} ${CT16_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Gold fill for the whole big triangle */}
      <polygon
        points={`${APEX_X},${APEX_Y} ${BASE_L},${BASE_Y} ${BASE_R},${BASE_Y}`}
        fill={GOLD}
        stroke="none"
      />

      {/* Highlight fills (green) drawn over gold */}
      {highlights.map((t, i) => (
        <polygon key={`hf-${i}`} points={triPoints(t.pts)} fill={GREEN_FILL} />
      ))}

      {/* Interior grid lines — all unit edges */}
      {/* We draw by connecting grid points along rows and diagonals */}
      {Array.from({ length: TRI_N + 1 }, (_, r) =>
        Array.from({ length: r + 1 }, (_, c) => {
          const lines: React.ReactNode[] = []
          const [x1, y1] = pt(r, c)
          // Horizontal edge to the right (same row)
          if (c < r) {
            const [x2, y2] = pt(r, c + 1)
            lines.push(
              <line key={`h-${r}-${c}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth={1.5} />
            )
          }
          // Edge going down-right (to next row, same col)
          if (r < TRI_N) {
            const [x2, y2] = pt(r + 1, c)
            lines.push(
              <line key={`dl-${r}-${c}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth={1.5} />
            )
          }
          // Edge going down-left (to next row, col+1)
          if (r < TRI_N) {
            const [x2, y2] = pt(r + 1, c + 1)
            lines.push(
              <line key={`dr-${r}-${c}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth={1.5} />
            )
          }
          return lines
        })
      )}

      {/* Outer border drawn on top, thicker */}
      <polygon
        points={`${APEX_X},${APEX_Y} ${BASE_L},${BASE_Y} ${BASE_R},${BASE_Y}`}
        fill="none"
        stroke={GOLD_DARK}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* Highlight borders */}
      {highlights.map((t, i) => (
        <polygon key={`hb-${i}`} points={triPoints(t.pts)} fill="none" stroke={GREEN} strokeWidth={3.5} strokeLinejoin="round" />
      ))}
    </svg>
  )
}

export default function CountTriangles16A2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A large equilateral triangle subdivided into a 3-row grid of smaller triangles. Count all triangles of every size — the total is ${TRI_TOTAL}.`}
    >
      <CountTriangles16A2Figure />
    </div>
  )
}
