// Post-answer explainer for SASMO-20-G3-Q6.
// "Berapa banyak kubus semuanya?" — answer B (30 cubes).
//
// Animation reveals the staircase pyramid layer by layer (bottom → top),
// colouring each new layer in gold so hidden cubes become visible as they
// are counted. Prior layers revert to blue once the next layer lights up.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { SASMO20G3Q6_CUBES } from './CornerCubesSASMO20G3Q6Illustration'
import { buildCornerCubesSASMO20G3Q6Steps } from './cornerCubesSASMO20G3Q6Steps'

const GREEN = '#10B981'

/**
 * Build the visible cube list with layer colouring.
 * layersRevealed=0 → nothing shown (returns empty, handled by ghost below)
 * layersRevealed=N → layers z=0..N-1 shown; layer z=N-1 highlighted in gold
 */
function buildLayeredCubes(layersRevealed: number): IsoCube[] {
  if (layersRevealed === 0) return []
  return SASMO20G3Q6_CUBES
    .filter((c) => c.z < layersRevealed)
    .map((c) =>
      c.z === layersRevealed - 1
        ? { ...c, color: ISO_GOLD_PALETTE.top }
        : c,
    )
}

/** Ghost of the bottom layer shown before any layer is revealed. */
const GHOST_CUBES: IsoCube[] = SASMO20G3Q6_CUBES
  .filter((c) => c.z === 0)
  .map((c) => ({ ...c, color: '#DCE9F4' }))

export default function CornerCubesSASMO20G3Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCornerCubesSASMO20G3Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildLayeredCubes(beat.layersRevealed)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung kubus lapis per lapis. Bawah 16, lapis-2 9, lapis-3 4, atas 1. Total = 30 kubus.'
      : 'Explainer: count cubes layer by layer. Bottom 16, 2nd 9, 3rd 4, top 1. Total = 30 cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The cube figure — grows layer by layer */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes.length > 0 ? cubes : GHOST_CUBES}
            size={24}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Running total counter */}
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
