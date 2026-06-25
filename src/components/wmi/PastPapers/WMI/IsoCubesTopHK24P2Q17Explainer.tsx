// Post-answer explainer for HKIMO-24-P2H-Q17.
// "At least how many unit square(s) can be seen from the top?" — Answer: 13.
//
// Animation: depth-rows (y=0, y=1, y=2) are revealed one at a time.
// The newly revealed row is highlighted gold; prior rows stay blue.
// A running counter below shows how the total builds to 13.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK24P2Q17_CUBES } from './IsoCubesTopHK24P2Q17Illustration'
import { buildIsoCubesTopHK24P2Q17Steps } from './isoCubesTopHK24P2Q17Steps'

const GREEN = '#10B981'

/**
 * Return the cubes visible for the current beat, colouring the newest
 * depth-row gold so the viewer can count the newly added squares.
 */
function buildRevealedCubes(rowsRevealed: number): IsoCube[] {
  return HK24P2Q17_CUBES
    .filter((c) => c.y < rowsRevealed)
    .map((c) => {
      if (c.y === rowsRevealed - 1) return { ...c, color: ISO_GOLD_PALETTE.top }
      return c
    })
}

export default function IsoCubesTopHK24P2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildIsoCubesTopHK24P2Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildRevealedCubes(beat.rowsRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak atas — hitung posisi (x,y) yang terisi, baris per baris. Total = 13.'
      : 'Explainer: top view — count occupied (x,y) positions row by row. Total = 13.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Cube figure — grows depth-row by depth-row */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          {cubes.length > 0 ? (
            <IsoCubes
              cubes={cubes}
              size={24}
              palette={ISO_BLUE_PALETTE}
              viewPadding={12}
            />
          ) : (
            /* Before any row is revealed show a ghost outline of the front row */
            <IsoCubes
              cubes={HK24P2Q17_CUBES.filter((c) => c.y === 0).map((c) => ({ ...c, color: '#E5EFF8' }))}
              size={24}
              palette={ISO_BLUE_PALETTE}
              viewPadding={12}
            />
          )}
        </div>

        {/* Running count */}
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
