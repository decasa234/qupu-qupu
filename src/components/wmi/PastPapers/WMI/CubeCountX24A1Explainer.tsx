// Post-answer explainer for SEAMOX-24-A-Q1.
// "Count the number of cubes." — answer: 16.
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
import { SEAMOX24A1_CUBES } from './CubeCountX24A1Illustration'
import { buildCubeCountX24A1Steps } from './cubeCountX24A1Steps'

const GREEN = '#10B981'

// Build the visible cube list with layer colouring.
// layersRevealed=0 → nothing shown
// layersRevealed=1 → z=0 shown (gold)
// layersRevealed=2 → z=0 blue, z=1 gold
// layersRevealed=3 → z=0,1 blue, z=2 gold
function buildLayeredCubes(layersRevealed: number): IsoCube[] {
  return SEAMOX24A1_CUBES
    .filter((c) => c.z < layersRevealed)
    .map((c) => {
      // Highest visible layer gets gold; lower layers stay blue.
      if (c.z === layersRevealed - 1) {
        return { ...c, color: ISO_GOLD_PALETTE.top }
      }
      return c
    })
}

export default function CubeCountX24A1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeCountX24A1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildLayeredCubes(beat.layersRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung kubus lapis per lapis. Bawah 8, tengah 6, atas 2. Total = 16 kubus.'
      : 'Explainer: count cubes layer by layer. Bottom 8, middle 6, top 2. Total = 16 cubes.'

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
            // Before any layer is revealed show a dim ghost of the bottom layer
            <IsoCubes
              cubes={SEAMOX24A1_CUBES.filter((c) => c.z === 0).map((c) => ({ ...c, color: '#E5EFF8' }))}
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
