// Post-answer explainer for HKIMO-18-P2H-Q19.
// "At least how many squares can be seen if viewing the figure below from top?" — answer 5.
//
// Beat 0–1: Show the 3D isometric figure with narration.
// Beat 2–3: Switch to the top-down 2×3 GridBoard with 5 visible cells highlighted.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { HK18P2Q19_CUBES } from './TopViewHK18P2Q19Illustration'
import { buildTopViewHK18P2Q19Steps } from './topViewHK18P2Q19Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'

// Top-view 2×3 grid:
//   row 0 (back,  y=1):  cols 0,1,2 all visible
//   row 1 (front, y=0):  cols 0,1 visible; col 2 empty
const isVisible = (r: number, c: number) =>
  (r === 0) || (r === 1 && c < 2)

export default function TopViewHK18P2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTopViewHK18P2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas susunan kubus memperlihatkan 5 persegi yang terlihat.'
      : 'Explainer: top view of the cube arrangement shows 5 visible squares.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D isometric view */}
        {beat.show3D && (
          <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
            <IsoCubes
              cubes={HK18P2Q19_CUBES}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          </div>
        )}

        {/* Top-down grid view */}
        {beat.showGrid && (
          <motion.div
            key="top-grid"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
          >
            <svg
              viewBox={gridBoardViewBox(2, 3, 48)}
              width={3 * 48 + 16}
              height={2 * 48 + 16}
            >
              <GridBoard
                rows={2}
                cols={3}
                cellSize={48}
                fill={(r, c) => {
                  if (!isVisible(r, c)) return '#F3F4F6'
                  return beat.result ? '#D1FAE5' : '#FEF3C7'
                }}
                highlight={(r, c) => {
                  if (!isVisible(r, c)) return 'none'
                  return beat.result ? 'green' : 'amber'
                }}
                label={(r, c) => {
                  if (!isVisible(r, c)) return undefined
                  return '□'
                }}
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
