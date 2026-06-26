// Post-answer explainer for TIMO-22-P2H-Q19.
// "At least how many squares from the top?" → 9.
//
// Beats:
//   0. intro     — 3D iso staircase only
//   1. footprint — staircase top-view grid appears (height labels per cell)
//   2. count     — all 9 cells go green; count badge shows 9
//   3. result    — green confirmation caption

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { TIMO22P2Q19_CUBES } from './TopViewCubesTIMO22P2Q19Illustration'
import { buildTopViewCubesTIMO22P2Q19Steps } from './topViewCubesTIMO22P2Q19Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// Top-view grid: 3 rows (y-depth 0..2 displayed back-to-front as r=0..2),
// 4 columns (x=0..3). Empty cells (unoccupied footprint) use grey fill.
// HEIGHTS[r][c] — 0 means empty (no cube at that position).
const HEIGHTS: number[][] = [
  [0, 0, 3, 3], // r=0 → y=2 (back row)
  [0, 2, 2, 2], // r=1 → y=1 (mid row)
  [1, 1, 1, 1], // r=2 → y=0 (front row)
]

const OCCUPIED = (r: number, c: number) => HEIGHTS[r][c] > 0

const GREY = '#E5E7EB'
const GRID_CELL = 34
const GRID_ROWS = 3
const GRID_COLS = 4

export default function TopViewCubesTIMO22P2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildTopViewCubesTIMO22P2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas susunan kubus tangga = 9 persegi.'
      : 'Explainer: top-view of staircase cube arrangement gives 9 squares.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D isometric staircase */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={TIMO22P2Q19_CUBES}
            size={20}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
        </div>

        {/* Top-view grid — visible from beat 1 onward */}
        {beat.showGrid && (
          <motion.div
            key="topview-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="font-display text-xs font-bold"
              style={{ color: BLUE }}
            >
              {lang === 'id' ? 'Tampak atas ↓' : 'Top view ↓'}
            </span>
            <svg
              viewBox={gridBoardViewBox(GRID_ROWS, GRID_COLS, GRID_CELL)}
              width={GRID_COLS * GRID_CELL + 2}
              height={GRID_ROWS * GRID_CELL + 2}
            >
              <GridBoard
                rows={GRID_ROWS}
                cols={GRID_COLS}
                cellSize={GRID_CELL}
                fill={(r, c) => (OCCUPIED(r, c) ? '#FFFFFF' : GREY)}
                label={(r, c) =>
                  OCCUPIED(r, c) ? String(HEIGHTS[r][c]) : ''
                }
                highlight={(r, c) =>
                  beat.highlightAll && OCCUPIED(r, c) ? 'green' : 'none'
                }
              />
            </svg>
          </motion.div>
        )}

        {/* Count badge */}
        {beat.count > 0 && (
          <motion.div
            key={`count-${beat.count}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.count}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
