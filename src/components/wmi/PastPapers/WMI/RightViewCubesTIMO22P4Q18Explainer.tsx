// Post-answer explainer for TIMO-22-P4H-Q18.
// "Paling sedikit berapa banyak persegi yang terlihat dari sisi kanan?" → 9
//
// Beats:
//   0. intro       — 3D iso figure only
//   1. rightview   — right-side silhouette grid appears
//   2. count       — all 9 cells go green; count badge shows 9
//   3. result      — green confirmation caption

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { TIMO22P4Q18_CUBES } from './RightViewCubesTIMO22P4Q18Illustration'
import { buildRightViewCubesTIMO22P4Q18Steps } from './rightViewCubesTIMO22P4Q18Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// ---------------------------------------------------------------------------
// Right-side silhouette
// GridBoard: rows=3 (z=2 at top → r=0, z=0 at bottom → r=2)
//            cols=4 (y=0=front → c=0, y=3=back → c=3)
//
// VISIBLE[r][c] — which cells appear in the right-view silhouette:
//   r=0 (z=2): y=0 ✓  y=1 ✓  y=2 ✗  y=3 ✗
//   r=1 (z=1): y=0 ✓  y=1 ✓  y=2 ✓  y=3 ✗
//   r=2 (z=0): y=0 ✓  y=1 ✓  y=2 ✓  y=3 ✓
//   Total: 2 + 3 + 4 = 9
// ---------------------------------------------------------------------------

const VISIBLE: boolean[][] = [
  [true,  true,  false, false], // r=0, z=2
  [true,  true,  true,  false], // r=1, z=1
  [true,  true,  true,  true],  // r=2, z=0
]

const GREY = '#E5E7EB'
const GRID_CELL = 34
const GRID_ROWS = 3
const GRID_COLS = 4

export default function RightViewCubesTIMO22P4Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildRightViewCubesTIMO22P4Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak kanan susunan kubus = 9 persegi (siluet 3+3+2+1).'
      : 'Explainer: right-side view of cube arrangement gives 9 squares (silhouette 3+3+2+1).'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D isometric figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={TIMO22P4Q18_CUBES}
            size={20}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
        </div>

        {/* Right-side silhouette grid — visible from beat 1 onward */}
        {beat.showGrid && (
          <motion.div
            key="rightview-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="font-display text-xs font-bold"
              style={{ color: BLUE }}
            >
              {lang === 'id' ? 'Tampak kanan →' : 'Right view →'}
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
                fill={(r, c) => (VISIBLE[r][c] ? '#FFFFFF' : GREY)}
                highlight={(r, c) =>
                  beat.highlightAll && VISIBLE[r][c] ? 'green' : 'none'
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
