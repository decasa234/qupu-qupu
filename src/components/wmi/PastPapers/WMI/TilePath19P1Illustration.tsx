// Tile-path figure for WMI-19P1A-Q12
// (2019 WMI Semifinal Grade 1 Paper A, question 12).
//
// The scan db/seed/wmi/figures/2019-semifinal-g1-a-q12.jpg shows the WORKED
// EXAMPLE of the body text ("Following the example where A to B = 5"): a
// staircase block of gray squares 3 wide and 2 tall (top-left square missing),
// with A at the bottom-left corner and B at the top-right corner of the white
// border. Walking along the white border and counting one step per square side
// gives 3 + 2 = 5 steps either way around — the "= 5" the body quotes.
//
// The LARGER grid of the actual question is not preserved in the crop, so this
// is a self-consistent reconstruction at the next size up, keeping the same
// staircase style: gray squares fill a shape 5 wide and 4 tall (the top-left
// 2×2 corner missing), A at the bottom-left corner, B at the top-right corner.
// Counting square sides along the white border from A to B:
//   up 2, right 2, up 2, right 3  →  2 + 2 + 2 + 3 = 9 steps   (answer D)
// (the other way around is 5 + 4 = 9 as well — the staircase keeps both walks
// equal, exactly as in the example).
//
// PROBLEM-ONLY: the static figure shows the gray squares, the border outline
// and the A / B markers. It never draws the counted route or the step count.
//
// Pure render — SSR-safe, deterministic (no window/Date/random at module top).

import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Lattice geometry (exported so the explainer reuses the same coordinates)
// ---------------------------------------------------------------------------

/** Pixel size of one unit square in the SVG coordinate space. */
export const TILE = 44

/** Padding inside the viewBox (room for the A / B labels). */
export const TP_PAD_X = 30
export const TP_PAD_Y = 30

/** The figure is 5 unit squares wide and 4 tall (with a 2×2 top-left notch). */
export const TP_COLS = 5
export const TP_ROWS = 4

/**
 * Gray (filled) cells as [col, row], row 0 = bottom. Rows 0–1 span the full
 * width; rows 2–3 only exist on the right (cols 2..4) — the staircase notch.
 */
export const TP_BLOCKS: Array<[number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
  [2, 2], [3, 2], [4, 2],
  [2, 3], [3, 3], [4, 3],
]

/**
 * The border walk from A to B as lattice CORNER points [col, row]
 * (row 0 = bottom edge). Each consecutive pair is one step of one square side:
 * A(0,0) → up 2 → right 2 → up 2 → right 3 → B(5,4). 10 points = 9 steps.
 */
export const TP_ROUTE: Array<[number, number]> = [
  [0, 0], // A — bottom-left corner
  [0, 1],
  [0, 2], // top of the left edge (the notch corner)
  [1, 2],
  [2, 2], // along the ledge
  [2, 3],
  [2, 4], // up the step
  [3, 4],
  [4, 4],
  [5, 4], // B — top-right corner
]

/** Number of steps (square sides) along the white border from A to B. */
export const TP_STEPS = TP_ROUTE.length - 1 // 9

/** Outline of the whole staircase figure, as lattice corner points. */
export const TP_OUTLINE: Array<[number, number]> = [
  [0, 0],
  [5, 0],
  [5, 4],
  [2, 4],
  [2, 2],
  [0, 2],
]

/** Convert a lattice corner (col,row, row0=bottom) to SVG coords (x,y). */
export function cornerPoint(col: number, row: number): [number, number] {
  const x = TP_PAD_X + col * TILE
  const y = TP_PAD_Y + (TP_ROWS - row) * TILE
  return [x, y]
}

/** Convert a lattice cell (col,row, row0=bottom) to its top-left SVG corner. */
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
// Reusable primitive: the static staircase grid (problem-only)
// ---------------------------------------------------------------------------

export interface TilePathGridProps {
  /** Extra SVG children drawn on top of the grid (route trace, counters…). */
  children?: ReactNode
}

/**
 * Draws the staircase of gray squares inside its border outline plus the A / B
 * markers. Pure geometry — used by both the static figure and the explainer
 * (which layers the traced route + counter on top via `children`).
 */
export function TilePathGrid({ children }: TilePathGridProps) {
  const [ax, ay] = cornerPoint(0, 0)
  const [bx, by] = cornerPoint(5, 4)
  const outline = TP_OUTLINE.map(([c, r]) => cornerPoint(c, r).join(',')).join(' ')

  return (
    <svg
      viewBox={`0 0 ${TP_VIEW_W} ${TP_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={TP_VIEW_W} height={TP_VIEW_H} fill="#FFFFFF" />

      {/* gray squares (inset so a thin white channel shows, like the scan) */}
      {TP_BLOCKS.map(([c, r]) => {
        const [x, y] = tileCorner(c, r)
        return (
          <rect
            key={`g${c}-${r}`}
            x={x + 4}
            y={y + 4}
            width={TILE - 8}
            height={TILE - 8}
            rx={2}
            fill={GRAY}
            stroke={GRAY_STROKE}
            strokeWidth={1.5}
          />
        )
      })}

      {/* border outline of the whole figure (the white walking border) */}
      <polygon points={outline} fill="none" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />

      {/* anything the explainer layers on top */}
      {children}

      {/* A marker — bottom-left corner */}
      <circle cx={ax} cy={ay} r={7} fill={INK} />
      <text x={ax - 16} y={ay + 18} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>
        A
      </text>

      {/* B marker — top-right corner */}
      <circle cx={bx} cy={by} r={7} fill={INK} />
      <text x={bx + 16} y={by - 10} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>
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
        'Tile path: a staircase block of gray squares, five wide and four tall with the top-left corner missing. ' +
        'A marks the bottom-left corner of the white border and B marks the top-right corner. ' +
        'Walk along the white border from A to B, counting one step per square side.'
      }
    >
      <TilePathGrid />
    </div>
  )
}
