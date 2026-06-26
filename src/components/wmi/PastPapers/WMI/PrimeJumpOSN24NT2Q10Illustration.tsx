/**
 * PrimeJumpOSN24NT2Q10Illustration — OSN-24-SD-NAS-TEORI2-Q10
 * "Lompat berjumlah prima" — prime-sum jump game tile grid.
 *
 * Grid layout (col 0–4, row 0–2), each tile 0.5 m × 0.5 m:
 *   row 0:  —    [2]  [3]  [4]   —
 *   row 1:  [1]  [7]  [6]  [5]  [11]
 *   row 2:  —    [8]  [9]  [10]  —
 *
 * Pure SVG, SSR-safe (no hooks, no framer-motion, no Math.random).
 *
 * Named export `PrimeJumpGrid` — shared rendering primitive used by the explainer.
 * Default export — stem illustration (no path shown).
 */

import { MazeGrid } from './primitives/MazeGrid'

// ── layout constants (exported for explainer) ────────────────────────────────

export const PJ_CELL = 52
export const PJ_PAD  = 20
export const PJ_COLS = 5
export const PJ_ROWS = 3
export const PJ_W = PJ_PAD * 2 + PJ_COLS * PJ_CELL   // 300
export const PJ_H = PJ_PAD * 2 + PJ_ROWS * PJ_CELL   // 196

/** Tile number at each [col,row] position */
export const PJ_TILE: Readonly<Record<string, number>> = {
  '1,0': 2,  '2,0': 3,  '3,0': 4,
  '0,1': 1,  '1,1': 7,  '2,1': 6,  '3,1': 5,  '4,1': 11,
  '1,2': 8,  '2,2': 9,  '3,2': 10,
}

const EMPTY_CORNERS = new Set(['0,0', '4,0', '0,2', '4,2'])

// ── shared grid renderer ─────────────────────────────────────────────────────

export interface PrimeJumpGridProps {
  /** Trail path as [col, row] cells; empty array = no trail */
  path?: ReadonlyArray<readonly [number, number]>
  /** Stroke colour of the trail polyline */
  trailColor?: string
}

/**
 * PrimeJumpGrid — renders the numbered tile grid, optionally with a highlighted path.
 * Used both by the stem illustration (no path) and the explainer (with path).
 */
export function PrimeJumpGrid({ path = [], trailColor = '#F59E0B' }: PrimeJumpGridProps) {
  const cx = (col: number) => PJ_PAD + col * PJ_CELL + PJ_CELL / 2
  const cy = (row: number) => PJ_PAD + row * PJ_CELL + PJ_CELL / 2

  return (
    <svg
      viewBox={`0 0 ${PJ_W} ${PJ_H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <MazeGrid
        rows={PJ_ROWS}
        cols={PJ_COLS}
        path={path}
        trailColor={trailColor}
        cellFill={(col, row) => {
          const k = `${col},${row}`
          if (EMPTY_CORNERS.has(k)) return '#F8FAFC'   // near-white = empty corner
          const tile = PJ_TILE[k]
          if (tile === 1)  return '#BBF7D0'            // green  = start
          if (tile === 11) return '#FDE68A'            // amber  = goal
          return '#EFF6FF'                             // pale blue = normal tile
        }}
        cellSize={PJ_CELL}
        padding={PJ_PAD}
      />

      {/* Tile number labels — drawn above MazeGrid fills */}
      {Object.entries(PJ_TILE).map(([key, num]) => {
        const [c, r] = key.split(',').map(Number)
        return (
          <text
            key={key}
            x={cx(c)}
            y={cy(r) + 7}
            textAnchor="middle"
            fontSize={21}
            fontWeight="700"
            fill={num === 1 ? '#15803D' : num === 11 ? '#92400E' : '#1E3A5F'}
            fontFamily="sans-serif"
          >
            {num}
          </text>
        )
      })}

      {/* Dimension annotation */}
      <text
        x={PJ_PAD / 2}
        y={PJ_PAD + PJ_ROWS * PJ_CELL / 2}
        textAnchor="middle"
        fontSize={9}
        fill="#64748B"
        fontFamily="sans-serif"
        dominantBaseline="middle"
        writingMode="vertical-rl"
        transform={`rotate(180, ${PJ_PAD / 2}, ${PJ_PAD + (PJ_ROWS * PJ_CELL) / 2})`}
      >
        0,5 m
      </text>
      <text
        x={PJ_PAD + PJ_CELL / 2}
        y={PJ_PAD - 6}
        textAnchor="middle"
        fontSize={9}
        fill="#64748B"
        fontFamily="sans-serif"
      >
        0,5 m
      </text>
    </svg>
  )
}

// ── default export = stem illustration (no path) ─────────────────────────────

export default function PrimeJumpOSN24NT2Q10Illustration() {
  return <PrimeJumpGrid />
}
