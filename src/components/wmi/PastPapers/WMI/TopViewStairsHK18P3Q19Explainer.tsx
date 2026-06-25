// Post-answer explainer for HKIMO-18-P3H-Q19.
// "At least how many squares from the top?" → 8.
//
// Beats:
//   0. intro     — 3D iso staircase only
//   1. footprint — 4-col × 2-row top-view grid appears (height labels per cell)
//   2. count     — all 8 cells go green; count badge shows 8
//   3. result    — green confirmation caption

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { HK18P3Q19_CUBES } from './TopViewStairsHK18P3Q19Illustration'
import { buildTopViewStairsHK18P3Q19Steps } from './topViewStairsHK18P3Q19Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// Top-view grid layout: rows=2 (y-depth 0..1), cols=4 (x-column 0..3)
// Label each cell with the height of that column so students see height is irrelevant.
// HEIGHTS[row][col] ↔ height at (x=col, y=row)
const HEIGHTS: number[][] = [
  [4, 3, 2, 1], // y=0 (front row)
  [4, 3, 2, 1], // y=1 (back row)
]
const GRID_CELL = 36
const GRID_ROWS = 2
const GRID_COLS = 4

export default function TopViewStairsHK18P3Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTopViewStairsHK18P3Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas tangga 4 langkah = 8 persegi.'
      : 'Explainer: top-view of 4-step staircase gives 8 squares.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D isometric staircase */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={HK18P3Q19_CUBES}
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
                label={(r, c) => String(HEIGHTS[r][c])}
                highlight={() => (beat.highlightAll ? 'green' : 'none')}
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
