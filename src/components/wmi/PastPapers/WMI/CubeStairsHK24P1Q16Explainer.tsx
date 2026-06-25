// Post-answer explainer for HKIMO-24-P1H-Q16.
// "Figure 2 has how many cubes?" — answer: 40.
//
// The animation reveals the staircase step by step (front to back),
// colouring the newly revealed step in gold while prior steps stay blue.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK24P1Q16_FIG2_CUBES } from './CubeStairsHK24P1Q16Illustration'
import { buildCubeStairsHK24P1Q16Steps } from './cubeStairsHK24P1Q16Steps'

const GOLD = '#FBBF24'
const GREEN = '#10B981'

/** Build the visible cube list highlighting the newly revealed step. */
function buildRevealedCubes(stepsRevealed: number): IsoCube[] {
  // Steps correspond to y-depth: y=0 (step1) .. y=3 (step4)
  return HK24P1Q16_FIG2_CUBES
    .filter((c) => c.y < stepsRevealed)
    .map((c) => {
      // The current (newest) step gets gold; earlier steps stay blue
      if (c.y === stepsRevealed - 1) return { ...c, color: GOLD }
      return c
    })
}

export default function CubeStairsHK24P1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeStairsHK24P1Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildRevealedCubes(beat.stepsRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung tangga kubus depan ke belakang. 4+8+12+16 = 40 kubus.'
      : 'Explainer: count staircase steps front to back. 4+8+12+16 = 40 cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Staircase figure — grows step by step */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          {cubes.length > 0 ? (
            <IsoCubes
              cubes={cubes}
              size={22}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          ) : (
            // Ghost of full figure before animation starts
            <IsoCubes
              cubes={HK24P1Q16_FIG2_CUBES.map((c) => ({ ...c, color: '#E5EFF8' }))}
              size={22}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          )}
        </div>

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
