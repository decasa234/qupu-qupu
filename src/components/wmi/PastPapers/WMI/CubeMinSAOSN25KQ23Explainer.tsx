// Post-answer explainer for OSN-25-SD-KAB-Q23.
// "Minimum surface area of 10 unit cubes?" — answer C (30 cm²)
//
// Animates through three arrangements — line → flat 2×5 → compact 2×2×2+2 —
// showing how more shared contacts reduce surface area.
// IsoCubes primitive is reused for all three arrangements.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE, ISO_GREY_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { COMPACT_10 } from './CubeMinSAOSN25KQ23Illustration'
import { buildCubeMinSAOSN25KQ23Steps } from './cubeMinSAOSN25KQ23Steps'

const GREEN = '#10B981'

// ---------------------------------------------------------------------------
// Cube sets for each arrangement
// ---------------------------------------------------------------------------

/** 10 cubes in a straight line (x=0..9). */
const LINE_10: IsoCube[] = Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0, z: 0 }))

/** Flat 2×5 slab (x=0..4, y=0..1). */
const FLAT_10: IsoCube[] = Array.from({ length: 10 }, (_, i) => ({
  x: i % 5,
  y: Math.floor(i / 5),
  z: 0,
}))

function cubesForArrangement(arrangement: string): IsoCube[] {
  if (arrangement === 'line') return LINE_10
  if (arrangement === 'flat') return FLAT_10
  if (arrangement === 'compact') return COMPACT_10
  return []
}

function paletteForPhase(result: boolean) {
  return result ? ISO_GOLD_PALETTE : ISO_BLUE_PALETTE
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CubeMinSAOSN25KQ23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCubeMinSAOSN25KQ23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = cubesForArrangement(beat.arrangement)
  const palette = paletteForPhase(beat.result)

  // Size varies by arrangement so the figure fits in the card
  const size = beat.arrangement === 'line' ? 14 : beat.arrangement === 'flat' ? 18 : 22

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: maksimalkan kontak antar kubus untuk meminimalkan luas permukaan. Minimum = 30 cm².'
      : 'Explainer: maximize cube contacts to minimize surface area. Minimum = 30 cm².'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Cube arrangement figure */}
        <div className="min-h-[100px] overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3 flex items-center justify-center">
          {cubes.length > 0 ? (
            <IsoCubes
              cubes={cubes}
              size={size}
              palette={palette}
              viewPadding={8}
            />
          ) : (
            // Intro beat — show the 10 cubes as a ghost line
            <IsoCubes
              cubes={LINE_10.map((c) => ({ ...c, color: '#E5EFF8' }))}
              size={14}
              palette={ISO_GREY_PALETTE}
              viewPadding={8}
            />
          )}
        </div>

        {/* SA badge */}
        {beat.sa !== null && (
          <motion.div
            key={`sa-${beat.sa}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {lang === 'id' ? `LA = ${beat.sa} cm²` : `SA = ${beat.sa} cm²`}
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
