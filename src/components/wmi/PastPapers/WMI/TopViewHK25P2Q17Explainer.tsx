// Post-answer explainer for HKIMO-25-P2H-Q17.
// "At least how many square(s) can be seen if viewing the figure below from the top?" — answer 9.
//
// Beat 0–1: Show the 3D isometric figure with narration.
// Beat 2–3: Switch to the top-down 3×3 GridBoard with all 9 cells highlighted.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { HK25P2Q17_CUBES } from './TopViewHK25P2Q17Illustration'
import { buildTopViewHK25P2Q17Steps } from './topViewHK25P2Q17Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'

// All 9 cells of the 3×3 top-view grid are occupied
const isVisible = (_r: number, _c: number) => true

export default function TopViewHK25P2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTopViewHK25P2Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas susunan kubus memperlihatkan 9 persegi dalam kisi 3×3.'
      : 'Explainer: top view of the cube arrangement shows 9 squares in a 3×3 grid.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D isometric view */}
        {beat.show3D && (
          <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
            <IsoCubes
              cubes={HK25P2Q17_CUBES}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          </div>
        )}

        {/* Top-down 3×3 grid view */}
        {beat.showGrid && (
          <motion.div
            key="top-grid"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
          >
            <svg
              viewBox={gridBoardViewBox(3, 3, 44)}
              width={3 * 44 + 16}
              height={3 * 44 + 16}
            >
              <GridBoard
                rows={3}
                cols={3}
                cellSize={44}
                fill={(r, c) =>
                  isVisible(r, c)
                    ? beat.result
                      ? '#D1FAE5'
                      : '#FEF3C7'
                    : '#F3F4F6'
                }
                highlight={(r, c) =>
                  isVisible(r, c)
                    ? beat.result
                      ? 'green'
                      : 'amber'
                    : 'none'
                }
                label={(r, c) => (isVisible(r, c) ? '□' : undefined)}
              />
            </svg>
          </motion.div>
        )}

        {/* Running count badge */}
        {beat.runningTotal > 0 && (
          <motion.div
            key={`count-${beat.runningTotal}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : AMBER }}
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
              : { background: '#FEF9EE', borderColor: '#F59E0B', color: '#92400E' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
