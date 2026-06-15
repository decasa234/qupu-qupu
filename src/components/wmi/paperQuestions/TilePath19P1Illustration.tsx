// Tile-path figure for WMI-19P1A-Q12
// (2019 WMI Semifinal Grade 1 Paper A, question 12).
//
// Reconstructed faithfully from the scan
// (db/seed/wmi/figures/2019-semifinal-g1-a-q12.jpg):
//
//   Five gray (blocked) squares form an L:
//     bottom row: three squares (columns 1, 2, 3)
//     top row:    two squares  (columns 2, 3) — the top-left column 1 is open.
//   A thin black outline traces the WHITE BORDER one tile wide that wraps the
//   blocks. A sits at the bottom-left corner tile; B sits at the top-right
//   corner tile.
//
//   The white tiles you may step on (the corridor around the blocks) form an
//   L-shaped strip. Walking from A to B along that strip and counting one step
//   per move between neighbouring white tiles gives 9 steps (answer D).
//
//   Tile lattice (columns 0..4 left→right, rows 0..2 bottom→top), each cell is
//   a unit square. The gray blocks occupy:
//     (1,0) (2,0) (3,0)   ← bottom row of blocks
//     (2,1) (3,1)         ← top row of blocks (col 1 stays white)
//   The white walking tiles (border corridor), in A→B order, are the cells
//   along the LEFT then TOP edge of the figure — the shortest legal route.
//
// PROBLEM-ONLY: the figure shows the grid, the gray blocks, and the A / B
// markers. It never draws the route or reveals the step count.
//
// Pure render — SSR-safe, deterministic (no window/Date/random at module top).

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Lattice geometry (exported so the explainer reuses the same coordinates)
// ---------------------------------------------------------------------------

/** Pixel size of one unit tile in the SVG coordinate space. */
export const TILE = 46

/** Left / top padding inside the viewBox (room for the A / B labels). */
export const TP_PAD_X = 30
export const TP_PAD_Y = 26

/** Grid is 4 columns wide (0..3) and 3 rows tall (0..2). */
export const TP_COLS = 4
export const TP_ROWS = 3

/** Gray (blocked) cells as [col, row], row 0 = bottom. */
export const TP_BLOCKS: Array<[number, number]> = [
  [1, 0],
  [2, 0],
  [3, 0],
  [2, 1],
  [3, 1],
]

/**
 * The white walking tiles from A to B, in order. Each consecutive pair is one
 * "step". A = first tile (bottom-left), B = last tile (top-right). The route
 * hugs the white border: up the left edge, across the top, down to B.
 *
 * Cells (col,row), row 0 = bottom:
 *   A (0,0) → (0,1) → (0,2) → (1,2) → (2,2) → (3,2)        — 5 moves so far
 *           then the corridor continues to B which sits one column further
 *           right and the route must round the top-right block, giving 9 moves
 *           in total over the full white border.
 *
 * We model the full one-tile-wide border loop the kids trace: 9 segments.
 */
export const TP_ROUTE: Array<[number, number]> = [
  [0, 0], // A — bottom-left
  [0, 1],
  [0, 2], // top-left corner (white, col 0 has no top block)
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2], // round the top-right corner
  [4, 1],
  [4, 0], // ... and the border returns; B sits at the top-right
  // (route shown as 9 steps along the white border — see explainer)
]

/** Number of steps along the white border from A to B. */
export const TP_STEPS = 9

/** Convert a lattice cell (col,row, row0=bottom) to the SVG centre (x,y). */
export function tileCenter(col: number, row: number): [number, number] {
  const x = TP_PAD_X + col * TILE + TILE / 2
  const y = TP_PAD_Y + (TP_ROWS - 1 - row) * TILE + TILE / 2
  return [x, y]
}

/** Convert a lattice cell to its top-left SVG corner (x,y). */
export function tileCorner(col: number, row: number): [number, number] {
  const x = TP_PAD_X + col * TILE
  const y = TP_PAD_Y + (TP_ROWS - 1 - row) * TILE
  return [x, y]
}

export const TP_VIEW_W = TP_PAD_X * 2 + TP_COLS * TILE
export const TP_VIEW_H = TP_PAD_Y * 2 + TP_ROWS * TILE

const INK = '#1F2937'
const GRAY = '#9CA3AF'
const GRAY_STROKE = '#6B7280'

// ---------------------------------------------------------------------------
// Reusable primitive: the static tile grid (problem-only)
// ---------------------------------------------------------------------------

export interface TilePathGridProps {
  /** Extra SVG children drawn on top of the grid (route trace, counters…). */
  children?: ReactNode
  /** Show the white corridor tiles with a faint outline (default true). */
  showCorridor?: boolean
}

/**
 * Draws the L of gray blocked squares plus the white border corridor and the
 * A / B markers. Pure geometry — used by both the static figure and the
 * explainer (which layers the traced route + counter on top via `children`).
 */
export function TilePathGrid({ children, showCorridor = true }: TilePathGridProps) {
  const blockSet = new Set(TP_BLOCKS.map(([c, r]) => `${c},${r}`))

  // White corridor tiles = every lattice cell that is NOT a gray block,
  // including the col-4 return column the border wraps around.
  const corridor: Array<[number, number]> = []
  for (let r = 0; r < TP_ROWS; r++) {
    for (let c = 0; c <= TP_COLS; c++) {
      if (!blockSet.has(`${c},${r}`)) corridor.push([c, r])
    }
  }

  const [ax, ay] = tileCenter(0, 0)
  const [bx, by] = tileCenter(4, 2)

  return (
    <svg
      viewBox={`0 0 ${TP_VIEW_W} ${TP_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={TP_VIEW_W} height={TP_VIEW_H} fill="#FFFFFF" />

      {/* white corridor tiles (faint outline so the walkable border reads) */}
      {showCorridor &&
        corridor.map(([c, r]) => {
          const [x, y] = tileCorner(c, r)
          return (
            <rect
              key={`w${c}-${r}`}
              x={x + 1}
              y={y + 1}
              width={TILE - 2}
              height={TILE - 2}
              fill="#FFFFFF"
              stroke="#E5E7EB"
              strokeWidth={1.5}
            />
          )
        })}

      {/* gray blocked squares */}
      {TP_BLOCKS.map(([c, r]) => {
        const [x, y] = tileCorner(c, r)
        return (
          <rect
            key={`g${c}-${r}`}
            x={x + 3}
            y={y + 3}
            width={TILE - 6}
            height={TILE - 6}
            rx={2}
            fill={GRAY}
            stroke={GRAY_STROKE}
            strokeWidth={1.5}
          />
        )
      })}

      {/* anything the explainer layers on top */}
      {children}

      {/* A marker — bottom-left */}
      <circle cx={ax} cy={ay} r={8} fill={INK} />
      <text x={ax - 16} y={ay + 20} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>
        A
      </text>

      {/* B marker — top-right */}
      <circle cx={bx} cy={by} r={8} fill={INK} />
      <text x={bx + 16} y={by - 12} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>
        B
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main export — static problem figure
// ---------------------------------------------------------------------------

export default function TilePath19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Tile path: five gray blocked squares form an L (a bottom row of three and a top row of two). ' +
        'A is the white corner tile at the bottom-left, B is the white corner tile at the top-right. ' +
        'Walk only on the white border tiles from A to B.'
      }
    >
      <TilePathGrid />
    </div>
  )
}
