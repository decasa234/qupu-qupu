// RouteGrid19B22Illustration — SEAMO 2019 Paper B, Q22
//
// Question: How many ways are there to travel from A to B,
//           by passing through C and D?
//
// Source image: docs/reference/ocr-res/seamo/contest/paper-b/2019.imgs/011.jpg
//
// The figure shows a rectangular lattice grid of 5 columns × 3 rows of cells
// (= 6 × 4 nodes). Travel is right-or-up only along the grid lines.
//
//   Grid layout (row 0 = TOP, row 3 = BOTTOM, col 0 = LEFT, col 5 = RIGHT):
//
//     row 0 (top):                                                 B (5,0)
//     row 1:                                   D (4,1)
//     row 2:                   C (2,2)
//     row 3 (bottom):  A (0,3)
//
//   Travel rule: only RIGHT (+col) or UP (-row) at each step.
//
// The figure is problem-only — it shows the grid, the four labeled
// intersection nodes (A, B, C, D), and nothing else. No path count is revealed.
//
// Copy-adapted from AntPath24G2Illustration.tsx (same grid-drawing approach).
// Pure render — no hooks, no framer-motion, SSR-safe.

import React from 'react'

// ---------------------------------------------------------------------------
// Grid constants
// ---------------------------------------------------------------------------

/** Number of cell columns (so node columns go 0..COLS). */
export const GRID_COLS = 5

/** Number of cell rows (so node rows go 0..ROWS, 0 = top, ROWS = bottom). */
export const GRID_ROWS = 3

/** Pixel width of each grid cell in the SVG coordinate space. */
export const CELL_W = 52

/** Pixel height of each cell. Matches the roughly 5:3 aspect ratio of the scan. */
export const CELL_H = 40

/** Left / top padding inside the viewBox. */
export const PAD_LEFT = 28
export const PAD_TOP = 16

// ---------------------------------------------------------------------------
// Labeled waypoints (col, row) — row 0 = top of grid, row GRID_ROWS = bottom
// ---------------------------------------------------------------------------
export const WAYPOINT_A: [number, number] = [0, GRID_ROWS]   // bottom-left
export const WAYPOINT_B: [number, number] = [GRID_COLS, 0]   // top-right
export const WAYPOINT_C: [number, number] = [2, 2]            // interior
export const WAYPOINT_D: [number, number] = [4, 1]            // interior

// ---------------------------------------------------------------------------
// Helper: lattice node (col, row) → SVG pixel (x, y)
// ---------------------------------------------------------------------------
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD_LEFT + col * CELL_W, PAD_TOP + row * CELL_H]
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

/** Rectangular lattice grid: 5 × 3 cells with thin grey lines. */
function GridLines() {
  const lines: React.ReactNode[] = []

  // Vertical lines (col = 0..GRID_COLS)
  for (let c = 0; c <= GRID_COLS; c++) {
    const x = PAD_LEFT + c * CELL_W
    const y0 = PAD_TOP
    const y1 = PAD_TOP + GRID_ROWS * CELL_H
    lines.push(
      <line key={`v${c}`} x1={x} y1={y0} x2={x} y2={y1}
        stroke="#9CA3AF" strokeWidth={1.2} />,
    )
  }

  // Horizontal lines (row = 0..GRID_ROWS)
  for (let r = 0; r <= GRID_ROWS; r++) {
    const y = PAD_TOP + r * CELL_H
    const x0 = PAD_LEFT
    const x1 = PAD_LEFT + GRID_COLS * CELL_W
    lines.push(
      <line key={`h${r}`} x1={x0} y1={y} x2={x1} y2={y}
        stroke="#9CA3AF" strokeWidth={1.2} />,
    )
  }

  return <g>{lines}</g>
}

// Colour palette
const INK = '#1F2937'
const DOT_FILL = '#1F2937'
const LABEL_FILL = '#1F2937'

/**
 * Filled dot + label for a single waypoint node.
 * label is positioned slightly outside the grid edge for A (bottom-left) and
 * B (top-right), and just below-right for C and D interior nodes.
 */
function WaypointNode({
  col,
  row,
  label,
}: {
  col: number
  row: number
  label: string
}) {
  const [cx, cy] = nodeXY(col, row)

  // Nudge label placement per node to match the scan
  let dx = 0
  let dy = 0
  let anchor: 'start' | 'end' | 'middle' = 'middle'
  let baseline: 'auto' | 'hanging' | 'central' = 'central'

  if (label === 'A') {
    // bottom-left corner — label below-left
    dx = -10
    dy = 12
    anchor = 'end'
    baseline = 'hanging'
  } else if (label === 'B') {
    // top-right corner — label above-right
    dx = 10
    dy = -10
    anchor = 'start'
    baseline = 'auto'
  } else {
    // interior nodes C and D — label slightly right-below the dot
    dx = 10
    dy = 8
    anchor = 'start'
    baseline = 'hanging'
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={DOT_FILL} />
      <text
        x={cx + dx}
        y={cy + dy}
        textAnchor={anchor}
        dominantBaseline={baseline}
        fontSize={15}
        fontWeight={700}
        fill={LABEL_FILL}
        fontFamily="Nunito, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main export (default = stem illustration)
// ---------------------------------------------------------------------------

/**
 * RouteGrid19B22Illustration
 *
 * Static, problem-only figure for SEAMO-19-B-Q22
 * (SEAMO 2019 Paper B, Question 22 — route counting).
 *
 * Shows a 5-column × 3-row rectangular lattice grid with four labeled
 * intersection points: A (bottom-left), B (top-right), C (col 2, row 2
 * from top), and D (col 4, row 1 from top). The question asks how many
 * paths from A to B pass through C and D (moving right or up only).
 *
 * The figure never reveals the answer (answer = 6).
 */
export default function RouteGrid19B22Illustration() {
  const svgW = PAD_LEFT * 2 + GRID_COLS * CELL_W
  const svgH = PAD_TOP * 2 + GRID_ROWS * CELL_H

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi jalan persegi panjang 5 kolom × 3 baris. ' +
        'Titik A di sudut kiri bawah, titik B di sudut kanan atas. ' +
        'Titik C di persimpangan kolom 2 baris 2 (dari atas), ' +
        'titik D di persimpangan kolom 4 baris 1 (dari atas). ' +
        'Berapa banyak cara perjalanan dari A ke B melalui C dan D?'
      }
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={Math.min(340, svgW)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={svgW} height={svgH} fill="white" />

        {/* grid lines */}
        <GridLines />

        {/* waypoint dots + labels */}
        <WaypointNode col={WAYPOINT_A[0]} row={WAYPOINT_A[1]} label="A" />
        <WaypointNode col={WAYPOINT_B[0]} row={WAYPOINT_B[1]} label="B" />
        <WaypointNode col={WAYPOINT_C[0]} row={WAYPOINT_C[1]} label="C" />
        <WaypointNode col={WAYPOINT_D[0]} row={WAYPOINT_D[1]} label="D" />
      </svg>
    </div>
  )
}
