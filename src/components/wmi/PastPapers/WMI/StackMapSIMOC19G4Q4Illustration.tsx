/**
 * StackMapSIMOC19G4Q4Illustration — SIMOC-19-G4-Q4
 *
 * "Figure 4 is a stack map. Which of the following is the front view?"
 * Stack map:
 *   Back row  (top):    2  2  4
 *   Front row (bottom): 1  3  1
 * Answer: B — front view heights [2, 3, 4] (column-wise max).
 *
 * Source crops: docs/reference/ocr-res/simoc/contest/g4/2019.imgs/005.jpg (map)
 *               006–010.jpg (options A–E)
 *
 * Default export: stem illustration (stack map grid + IsoCubes 3D view).
 * Named export:   StackMapSIMOC19G4Q4Option — picture-choice renderer for
 *                 CHOICE_RENDERERS['SIMOC-19-G4-Q4'].
 */

import React from 'react'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Stack map data
// ---------------------------------------------------------------------------

const BACK_ROW  = [2, 2, 4]  // col0, col1, col2 — back row (y=1 in IsoCubes)
const FRONT_ROW = [1, 3, 1]  // col0, col1, col2 — front row (y=0 in IsoCubes)

// GridBoard label: r=0 = top = back row; r=1 = bottom = front row
const STACK_LABEL = (r: number, c: number): string =>
  r === 0 ? String(BACK_ROW[c]) : String(FRONT_ROW[c])

// ---------------------------------------------------------------------------
// IsoCubes voxels
// x = column (0=left, 2=right), y = depth (0=front, 1=back), z = height (0=bottom)
// ---------------------------------------------------------------------------

function buildStackCubes(activeCol?: number): IsoCube[] {
  const COL_HI: Record<number, string> = { 0: '#6366F1', 1: '#F59E0B', 2: '#10B981' }
  const DIM = '#CBD5E1'
  const cubes: IsoCube[] = []
  for (let col = 0; col < 3; col++) {
    const hi = activeCol !== undefined ? (activeCol === col ? COL_HI[col] : DIM) : undefined
    for (let z = 0; z < BACK_ROW[col]; z++)  cubes.push({ x: col, y: 1, z, color: hi })
    for (let z = 0; z < FRONT_ROW[col]; z++) cubes.push({ x: col, y: 0, z, color: hi })
  }
  return cubes
}

/** Base cube list (no colour override) — import from explainer. */
export const STACK_CUBES: IsoCube[] = buildStackCubes()

/** Build a cube list with one column highlighted; remaining cubes dimmed. */
export function buildHighlightedCubes(activeCol?: number): IsoCube[] {
  return buildStackCubes(activeCol)
}

export const GREY_PALETTE = {
  top:  '#E2E8F0',
  left: '#94A3B8',
  right: '#64748B',
  ink:  '#1E293B',
}

// ---------------------------------------------------------------------------
// Default export — stem illustration
// ---------------------------------------------------------------------------

export default function StackMapSIMOC19G4Q4Illustration() {
  const cellSize = 44
  const vb = gridBoardViewBox(2, 3, cellSize)

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Peta tumpukan Gambar 4: baris belakang 2 2 4 (kiri ke kanan), ' +
        'baris depan 1 3 1. Di kanannya tampilan 3D dari susunan kubus yang sama.'
      }
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        {/* Stack map grid */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-xs font-semibold text-slate-500">
            Peta Tumpukan
          </span>
          <svg
            viewBox={vb}
            width={cellSize * 3}
            height={cellSize * 2}
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <GridBoard
              rows={2}
              cols={3}
              cellSize={cellSize}
              label={STACK_LABEL}
              gridStroke="#94A3B8"
            />
          </svg>
          <div className="flex gap-0 text-[10px] leading-tight text-slate-400">
            <span style={{ width: cellSize }} className="text-center">↑ belakang</span>
            <span style={{ width: cellSize }} className="text-center" />
            <span style={{ width: cellSize }} className="text-center" />
          </div>
        </div>

        {/* 3D IsoCubes view */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-xs font-semibold text-slate-500">
            Tampilan 3D
          </span>
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
            <IsoCubes
              cubes={STACK_CUBES}
              size={22}
              palette={GREY_PALETTE}
              viewPadding={8}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Front-view silhouette — shared helper
// ---------------------------------------------------------------------------

const CELL   = 18
const GAP    = 2
const MAX_H  = 4
const TOTAL_W = 3 * CELL + 2 * GAP
const TOTAL_H = MAX_H * CELL

function FrontViewSilhouette({
  heights,
}: {
  heights: [number, number, number]
}) {
  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width={TOTAL_W * 2}
      height={TOTAL_H * 2}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {heights.map((h, ci) => {
        const x = ci * (CELL + GAP)
        return Array.from({ length: h }, (_, zi) => {
          const y = TOTAL_H - (zi + 1) * CELL
          return (
            <rect
              key={`${ci}-${zi}`}
              x={x + 0.5}
              y={y + 0.5}
              width={CELL - 1}
              height={CELL - 1}
              fill="#BFDBFE"
              stroke="#3B82F6"
              strokeWidth={1}
            />
          )
        })
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Option heights per choice label (from source images 006–010)
// A → [2,1,3]  valley (non-monotone trap)
// B → [2,3,4]  correct staircase
// C → [2,2,4]  reading back row only
// D → [1,2,3]  staircase shifted by 1
// E → [1,3,1]  reading front row only (U-shape)
// ---------------------------------------------------------------------------

const OPTION_HEIGHTS: Record<string, [number, number, number]> = {
  A: [2, 1, 3],
  B: [2, 3, 4],
  C: [2, 2, 4],
  D: [1, 2, 3],
  E: [1, 3, 1],
}

// ---------------------------------------------------------------------------
// Named export — picture-choice renderer
// ---------------------------------------------------------------------------

export function StackMapSIMOC19G4Q4Option({ choice }: { choice: WmiChoice }) {
  const heights = OPTION_HEIGHTS[choice.label] ?? [1, 1, 1]
  return (
    <div className="flex flex-col items-center p-2">
      <FrontViewSilhouette heights={heights as [number, number, number]} />
    </div>
  )
}
