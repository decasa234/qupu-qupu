// Post-answer explainer for SEAMO-19-A-Q5.
// "How many cubes are there in the figure below?" — answer 12.
//
// The animation reveals layers bottom-to-top using colour to highlight the
// layer being counted. The IsoCubes primitive is reused directly; per-cube
// `color` overrides mark each new layer in gold while prior layers stay blue.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { SEAMO19A5_CUBES } from './CubeStack19A5Illustration'
import { buildCubeStack19A5Steps } from './cubeStack19A5Steps'

const GREEN = '#10B981'

// Map each cube to its layer z so we can tint revealed layers.
function buildLayeredCubes(layersRevealed: number): IsoCube[] {
  return SEAMO19A5_CUBES.map((c) => {
    if (c.z > layersRevealed - 1) {
      // Not yet revealed — hide by making it fully transparent (use white/bg colour).
      // We exclude it from the array so it simply does not render yet.
      return null
    }
    // The highest visible layer gets gold highlight, lower layers stay blue.
    if (c.z === layersRevealed - 1) {
      return { ...c, color: ISO_GOLD_PALETTE.top }
    }
    return c
  }).filter((c): c is IsoCube => c !== null)
}

export default function CubeStack19A5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeStack19A5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildLayeredCubes(beat.layersRevealed)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung kubus lapis per lapis. Bawah 8, tengah 3, atas 1. Total = 12 kubus.`
      : `Explainer: count cubes layer by layer. Bottom 8, middle 3, top 1. Total = 12 cubes.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The cube figure — grows layer by layer */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          {cubes.length > 0 ? (
            <IsoCubes
              cubes={cubes}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          ) : (
            // Before any layer is revealed show the outline only (z=0 layer in dim blue)
            <IsoCubes
              cubes={SEAMO19A5_CUBES.filter((c) => c.z === 0).map((c) => ({ ...c, color: '#E5EFF8' }))}
              size={26}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          )}
        </div>

        {/* Running count — appears once we start revealing */}
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
