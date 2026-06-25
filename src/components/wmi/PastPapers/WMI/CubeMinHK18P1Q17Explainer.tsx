// Post-answer explainer for HKIMO-18-P1H-Q17.
// "At least how many cube(s) is / are there in the figure below?" — answer 9.
//
// Reveals layers bottom-to-top: ground (7 cubes, gold) then top column (2 cubes, gold).
// Uses the same colour-override pattern as CubeCount20A5Explainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HKIMO18P1H17_CUBES } from './CubeMinHK18P1Q17Illustration'
import { buildCubeMinHK18P1Q17Steps } from './cubeMinHK18P1Q17Steps'

const GREEN = '#10B981'

function buildLayeredCubes(layersRevealed: number): IsoCube[] {
  return HKIMO18P1H17_CUBES
    .filter((c) => c.z < layersRevealed)
    .map((c) => {
      if (c.z === layersRevealed - 1) {
        return { ...c, color: ISO_GOLD_PALETTE.top }
      }
      return c
    })
}

export default function CubeMinHK18P1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeMinHK18P1Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildLayeredCubes(beat.layersRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lantai dasar 7 kubus, kolom kiri ditumpuk 2. Minimum total = 9 kubus.'
      : 'Explainer: ground floor 7 cubes, left column stacked 2 high. Minimum total = 9 cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          {cubes.length > 0 ? (
            <IsoCubes
              cubes={cubes}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          ) : (
            <IsoCubes
              cubes={HKIMO18P1H17_CUBES.filter((c) => c.z === 0).map((c) => ({ ...c, color: '#E5EFF8' }))}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          )}
        </div>

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
