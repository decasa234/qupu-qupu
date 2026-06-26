// SIMOC-19-G3-Q9 — "stack map → front view" stem illustration + option renderer
//
// Figure 4 stack map (read from OCR crop 009.jpg):
//   Row 0 (top  / back):    2  2  4
//   Row 1 (bottom / front): 1  3  1
//
// Front view: max height per column = [2, 3, 4]. Answer: B.
//
// Default export:  StackMapSIMOC19G3Q9Illustration  (the stem figure: stack map + 3-D view)
// Named export:    StackMapSIMOC19G3Q9Option         (renders one A–E front-view silhouette)
//
// IMPORT-FIRST: IsoCubes from ./primitives/IsoCubes (iso cubes), GridBoard from ./primitives/GridBoard.
// Pure SVG — no hooks, no framer-motion, no Math.random. SSR-safe.

import { IsoCubes, ISO_BLUE_PALETTE, type IsoCube } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import type { WmiChoice } from '../../../../types/wmi'

// ── Stack map data (shared with explainer) ────────────────────────────────────

/** GridBoard cell size in SVG units. */
export const CELL = 44

/** Figure 4: STACK_MAP[r][c] = number of cubes stacked at map row r, column c.
 *  r=0 = back row (shown at top of the printed grid).
 *  r=1 = front row (shown at bottom). */
export const STACK_MAP: readonly (readonly number[])[] = [
  [2, 2, 4],   // back  (r=0)
  [1, 3, 1],   // front (r=1)
] as const

/** Maximum stack height per column (= front-view height). */
export const FRONT_HEIGHTS: readonly number[] = [2, 3, 4] as const

// ── IsoCubes voxel list ───────────────────────────────────────────────────────
// ISO coord: x = column index (0–2), y = depth (0 = front, 1 = back), z = height layer (0-based).
// STACK_MAP row 1 (front) → iso y=0; STACK_MAP row 0 (back) → iso y=1.

function buildVoxels(): IsoCube[] {
  const voxels: IsoCube[] = []
  const isoY = [1, 0] // map row 0 → iso y=1 (back), map row 1 → iso y=0 (front)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const h = STACK_MAP[r][c]
      for (let z = 0; z < h; z++) {
        voxels.push({ x: c, y: isoY[r], z })
      }
    }
  }
  return voxels
}

/** Pre-built voxel list for the 3-D illustration. */
export const GRID_CUBES: IsoCube[] = buildVoxels()

// ── Front-view option heights per choice ─────────────────────────────────────
// These silhouettes represent the A–E picture choices as 3-column bar profiles.
// B=[2,3,4] is the correct answer (matches FRONT_HEIGHTS).

const OPTION_HEIGHTS: Record<string, number[]> = {
  A: [1, 3, 4],
  B: [2, 3, 4],   // ← correct
  C: [2, 2, 4],
  D: [2, 3, 2],
  E: [4, 3, 2],
}

// ── FrontViewSilhouette sub-component ────────────────────────────────────────
// Renders a flat 2-D front-view silhouette: 3 columns of N squares each, bottom-aligned.

const OPT_CELL = 18   // px per square
const OPT_COLS = 3
const OPT_MAX_H = 4   // tallest possible column across all options
const OPT_W = OPT_COLS * OPT_CELL
const OPT_H = OPT_MAX_H * OPT_CELL
const OPT_FILL = '#D6EBF7'
const OPT_STROKE = '#1F2937'

interface FrontViewSilhouetteProps {
  heights: number[]
  highlightCorrect?: boolean
}

function FrontViewSilhouette({ heights, highlightCorrect = false }: FrontViewSilhouetteProps) {
  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width={OPT_W}
      height={OPT_H}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Draw grid border */}
      {Array.from({ length: OPT_COLS }, (_, c) => {
        const h = heights[c] ?? 0
        const filledRows = h
        const topRow = OPT_MAX_H - filledRows
        return Array.from({ length: OPT_MAX_H }, (__, r) => {
          const filled = r >= topRow
          return (
            <rect
              key={`${c}-${r}`}
              x={c * OPT_CELL}
              y={r * OPT_CELL}
              width={OPT_CELL}
              height={OPT_CELL}
              fill={filled ? (highlightCorrect ? '#BBF7D0' : OPT_FILL) : 'none'}
              stroke={filled ? OPT_STROKE : '#d1d5db'}
              strokeWidth={filled ? 1.2 : 0.7}
            />
          )
        })
      })}
    </svg>
  )
}

// ── GridMap sub-component ─────────────────────────────────────────────────────
// Shows the 2-row × 3-col number grid for the stack map.

const GRID_VB = gridBoardViewBox(2, 3, CELL)

function StackMapGrid({ highlightCol = -1 }: { highlightCol?: number }) {
  return (
    <svg
      viewBox={GRID_VB}
      width={3 * CELL}
      height={2 * CELL}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <GridBoard
        rows={2}
        cols={3}
        cellSize={CELL}
        label={(r, c) => String(STACK_MAP[r][c])}
        fill={(r, c) => {
          if (c === highlightCol) return '#FEF3C7'  // amber tint when highlighted
          return '#FFFFFF'
        }}
        highlight={(_, c) =>
          c === highlightCol ? 'amber' : 'none'
        }
      />
    </svg>
  )
}

// ── Default export: Stem illustration ─────────────────────────────────────────

/** Shows Figure 4 (the stack map grid) and a 3-D isometric view of the arrangement. */
export default function StackMapSIMOC19G3Q9Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={
        'Figure 4 stack map: back row 2 2 4, front row 1 3 1. ' +
        'Find the front view of this arrangement.'
      }
    >
      {/* 2-D stack map grid */}
      <div className="flex flex-col items-center gap-1">
        <span
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#4B5563',
            letterSpacing: '0.01em',
          }}
        >
          Gambar 4
        </span>
        <div aria-hidden="true">
          <StackMapGrid />
        </div>
        {/* Row labels */}
        <div
          className="flex justify-between"
          style={{ width: 3 * CELL, fontSize: 11, color: '#6B7280' }}
        >
          <span style={{ paddingLeft: 2 }}>belakang ↑</span>
          <span style={{ paddingRight: 2 }}>↑ back</span>
        </div>
      </div>

      {/* 3-D IsoCubes view */}
      <div className="flex flex-col items-center gap-1" aria-hidden="true">
        <span
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#4B5563',
            letterSpacing: '0.01em',
          }}
        >
          Tampilan 3-D
        </span>
        <IsoCubes
          cubes={GRID_CUBES}
          size={26}
          cellGap={1}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
          label="3-D view of Figure 4 stack arrangement"
        />
      </div>
    </div>
  )
}

// ── Named export: Option renderer ─────────────────────────────────────────────

/**
 * StackMapSIMOC19G3Q9Option — renders one A–E choice as a flat front-view silhouette.
 * Registered in CHOICE_RENDERERS for SIMOC-19-G3-Q9.
 */
export function StackMapSIMOC19G3Q9Option({ choice }: { choice: WmiChoice }) {
  const heights = OPTION_HEIGHTS[choice.label]
  if (!heights) return <span>{choice.text}</span>
  const isCorrect = choice.label === 'B'

  return (
    <span
      role="img"
      aria-label={`Option ${choice.label}: front view with column heights ${heights.join(', ')}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <FrontViewSilhouette heights={heights} highlightCorrect={isCorrect} />
    </span>
  )
}
