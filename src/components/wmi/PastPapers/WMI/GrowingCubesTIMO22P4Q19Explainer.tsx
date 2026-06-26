// Post-answer explainer for TIMO-22-P4H-Q19.
// "How many cubes are there in the 10th group?" — answer: 29.
//
// Animation: reveals groups 1→2→3 one at a time, highlighting the 3 new cubes
// in gold; then shows the formula G(n) = 3n − 1 and applies it to n = 10.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  TIMO22P4Q19_G1,
  TIMO22P4Q19_G2,
  TIMO22P4Q19_G3,
} from './GrowingCubesTIMO22P4Q19Illustration'
import { buildGrowingCubesTIMO22P4Q19Steps } from './growingCubesTIMO22P4Q19Steps'

const GREEN = '#10B981'
const NEW_CUBE_COLOR = ISO_GOLD_PALETTE.top

// Build the cube list for each group, highlighting cubes not present in the
// previous group (the 3 "new" cubes) in gold.
function getCubes(group: 1 | 2 | 3): IsoCube[] {
  switch (group) {
    case 1:
      return TIMO22P4Q19_G1
    case 2:
      return TIMO22P4Q19_G2.map((c) =>
        // new in G2 vs G1: x >= 2 at z=0, or z=1
        (c.z === 0 && c.x >= 2) || c.z === 1 ? { ...c, color: NEW_CUBE_COLOR } : c,
      )
    case 3:
      return TIMO22P4Q19_G3.map((c) =>
        // new in G3 vs G2: x >= 4 at z=0, or z=2
        (c.z === 0 && c.x >= 4) || c.z === 2 ? { ...c, color: NEW_CUBE_COLOR } : c,
      )
  }
}

export default function GrowingCubesTIMO22P4Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildGrowingCubesTIMO22P4Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = getCubes(beat.groupShown)

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: pola kubus bertumbuh G(n) = 3n − 1. G(10) = 29 kubus.'
          : 'Explainer: growing cube pattern G(n) = 3n − 1. G(10) = 29 cubes.'
      }
    >
      <div className="flex flex-col items-center gap-3">
        {/* Isometric figure — updates as groups are revealed */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
        </div>

        {/* Formula overlay */}
        {beat.showFormula && (
          <motion.div
            key="formula"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border-2 border-qupu-cream-dark bg-qupu-cream px-5 py-2 font-display text-base font-extrabold text-slate-700"
          >
            G(n) = 3n &minus; 1
          </motion.div>
        )}

        {/* Final result callout */}
        {beat.showResult && (
          <motion.div
            key="result"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            G(10) = 29
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
