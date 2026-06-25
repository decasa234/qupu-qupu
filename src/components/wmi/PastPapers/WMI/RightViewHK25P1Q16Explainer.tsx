// Post-answer explainer for HKIMO-25-P1H-Q16.
// "At least how many squares visible from the right?" — answer: 7.
//
// Beats:
//   0 intro  — show 3-D figure, empty right-view grid
//   1 back   — highlight y=2 cubes gold; fill 4 grid cells (z=0..3)
//   2 mid    — highlight y=1 cubes amber; fill 2 more cells (z=0,1)
//   3 front  — highlight y=0 cube orange; fill last cell (z=0)
//   4 total  — running total = 7, all green
//
// Right-view 2-D grid (yz plane, looking in −x direction):
//   columns: y=2 (back, left in grid), y=1, y=0 (front, right in grid)
//   rows:    z=3 (top) … z=0 (bottom)
//   filled cells:
//     y=2: z=0,1,2,3  (4)
//     y=1: z=0,1      (2)
//     y=0: z=0        (1)

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK25P1Q16_CUBES } from './RightViewHK25P1Q16Illustration'
import { buildRightViewHK25P1Q16Steps } from './rightViewHK25P1Q16Steps'

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const GOLD   = '#F59E0B'
const AMBER  = '#FB923C'
const ORANGE = '#EF4444'
const GREEN  = '#10B981'
const GHOST  = '#E2EDF7'

// depth → highlight colour
const DEPTH_COLOR: Record<number, string> = { 2: GOLD, 1: AMBER, 0: ORANGE }

// ---------------------------------------------------------------------------
// Right-view grid constants
// ---------------------------------------------------------------------------
const CELL = 22            // grid cell px
const COLS = 3             // y = 2, 1, 0 (left → right)
const ROWS = 4             // z = 3, 2, 1, 0 (top → bottom)
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL

/** Is (y_col, z_row) a filled cell in the right-side view? */
function isFilled(yDepth: number, z: number): boolean {
  if (yDepth === 2) return z <= 3      // column: all 4 heights
  if (yDepth === 1) return z <= 1      // middle: heights 0 and 1
  if (yDepth === 0) return z === 0     // front: height 0 only
  return false
}

// ---------------------------------------------------------------------------
// 3-D cube list with per-depth colour overrides
// ---------------------------------------------------------------------------
function buildColoredCubes(revealedDepths: number[]): IsoCube[] {
  return HK25P1Q16_CUBES.map((c) => {
    if (revealedDepths.includes(c.y)) {
      return { ...c, color: DEPTH_COLOR[c.y] ?? GOLD }
    }
    return { ...c, color: GHOST }
  })
}

// ---------------------------------------------------------------------------
// Right-view 2-D grid
// ---------------------------------------------------------------------------
function RightViewGrid({ revealedDepths }: { revealedDepths: number[] }) {
  // columns in the grid correspond to y=2,1,0 (left to right)
  const yOrder = [2, 1, 0]

  return (
    <svg
      width={GRID_W + 2}
      height={GRID_H + 2}
      viewBox={`-1 -1 ${GRID_W + 2} ${GRID_H + 2}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* cells */}
      {yOrder.map((yDepth, col) =>
        Array.from({ length: ROWS }, (_, rowIdx) => {
          const z = ROWS - 1 - rowIdx  // row 0 = z=3, row 3 = z=0
          const filled = isFilled(yDepth, z) && revealedDepths.includes(yDepth)
          const fill = filled ? (DEPTH_COLOR[yDepth] ?? GOLD) : '#F8FAFC'
          return (
            <rect
              key={`${col}-${rowIdx}`}
              x={col * CELL}
              y={rowIdx * CELL}
              width={CELL}
              height={CELL}
              fill={fill}
              stroke="#94A3B8"
              strokeWidth={1}
            />
          )
        }),
      )}
      {/* outer border */}
      <rect x={0} y={0} width={GRID_W} height={GRID_H} fill="none" stroke="#334155" strokeWidth={1.5} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer
// ---------------------------------------------------------------------------
export default function RightViewHK25P1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewHK25P1Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildColoredCubes(beat.revealedDepths)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lihat dari kanan — kolom belakang 4, baris tengah 2, depan 1. Total = 7 persegi.'
      : 'Explainer: right-side view — back column 4, middle 2, front 1. Total = 7 squares.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 3-D figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes cubes={cubes} size={24} palette={ISO_BLUE_PALETTE} viewPadding={10} />
        </div>

        {/* Right-view grid + count */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-xs font-bold uppercase tracking-wide"
              style={{ color: '#64748B' }}
            >
              {lang === 'id' ? 'Tampak kanan' : 'Right view'}
            </span>
            <RightViewGrid revealedDepths={beat.revealedDepths} />
          </div>

          {beat.runningTotal > 0 && (
            <motion.div
              key={`count-${beat.runningTotal}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-3xl font-black tabular-nums"
              style={{ color: beat.result ? GREEN : '#30598A' }}
            >
              {beat.runningTotal}
            </motion.div>
          )}
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
