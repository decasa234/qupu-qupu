// Post-answer explainer for HKIMO-20-P3H-Q16.
// "At least how many square(s) can be seen from the right?" — answer: 3.
//
// Animation:
//  Beat 0 — show the full 3D figure (neutral)
//  Beat 1 — highlight front row (y=0) in gold; show 1 right-view square
//  Beat 2 — highlight back row (y=1) in gold; show all 3 right-view squares
//  Beat 3 — final answer 3 in green

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import type { IsoCube } from './primitives/IsoCubes'
import { HK20P3Q16_CUBES } from './RightViewHK20P3Q16Illustration'
import { buildRightViewHK20P3Q16Steps } from './rightViewHK20P3Q16Steps'

const GOLD = '#FBBF24'
const GREEN = '#10B981'

// Right-view squares (row=height z, col=depth y) to reveal per beat
// right-view grid: 2 rows (z=0,z=1) × 2 cols (y=0,y=1)
//   (z=0, y=0) = cell [row=1, col=0] (bottom of front column)
//   (z=0, y=1) = cell [row=1, col=1] (bottom of back column)
//   (z=1, y=1) = cell [row=0, col=1] (top of back column)
const RIGHT_VIEW_SQUARES: [number, number][] = [
  [1, 0], // front column z=0
  [1, 1], // back column z=0
  [0, 1], // back column z=1
]

function buildHighlightedCubes(highlightDepth: number): IsoCube[] {
  return HK20P3Q16_CUBES.map((c) => {
    if (highlightDepth === 1 && c.y === 0) return { ...c, color: GOLD }
    if (highlightDepth === 2 && c.y === 1) return { ...c, color: GOLD }
    return c
  })
}

export default function RightViewHK20P3Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewHK20P3Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildHighlightedCubes(beat.highlightDepth)

  // Build right-view fill function: revealed squares filled amber
  const revealedSet = new Set(
    RIGHT_VIEW_SQUARES.slice(0, beat.viewSquares).map(([r, c]) => `${r},${c}`),
  )

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pandangan kanan bangun 3D. Baris depan (y=0) tinggi 1 = 1 kotak. Baris belakang (y=1) tinggi 2 = 2 kotak. Total = 3 kotak.'
      : 'Explainer: right-view of 3D figure. Front row height 1 = 1 square. Back row height 2 = 2 squares. Total = 3 squares.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* ISO figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Right-view 2D projection (2 rows × 2 cols) */}
        {beat.viewSquares > 0 && (
          <motion.div
            key={`rv-${beat.viewSquares}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-display text-xs font-bold text-gray-500">
              {lang === 'id' ? 'Tampak kanan' : 'Right view'}
            </span>
            <svg viewBox={gridBoardViewBox(2, 2, 32)} width={80} height={80}>
              <GridBoard
                rows={2}
                cols={2}
                cellSize={32}
                fill={(r, c) => (revealedSet.has(`${r},${c}`) ? GOLD : '#F3F4F6')}
                highlight={(r, c) =>
                  revealedSet.has(`${r},${c}`) ? 'amber' : 'none'
                }
              />
            </svg>
          </motion.div>
        )}

        {/* Running total */}
        {beat.runningTotal > 0 && (
          <motion.div
            key={`count-${beat.runningTotal}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {beat.runningTotal}
          </motion.div>
        )}

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
