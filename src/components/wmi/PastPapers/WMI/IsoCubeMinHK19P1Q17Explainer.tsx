// Post-answer explainer for HKIMO-19-P1H-Q17.
// "At least how many cubes is/are there in the figure below?" — answer: 9.
//
// Animation strategy:
//   intro    — show full structure dimmed; explain "minimum" rule
//   ground   — highlight z=0 layer in gold; running total = 7
//   elevated — highlight z=1 cubes in gold, ground returns to blue; total = 9
//   verify   — all cubes turn green; confirm no hidden support needed
//   answer   — stays green; caption shows 7 + 2 = 9

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  HKIMO19P1Q17_GROUND,
  HKIMO19P1Q17_ELEVATED,
  HKIMO19P1Q17_ALL,
} from './IsoCubeMinHK19P1Q17Illustration'
import { buildIsoCubeMinHK19P1Q17Steps } from './isoCubeMinHK19P1Q17Steps'
import type { CubeMinPhase } from './isoCubeMinHK19P1Q17Steps'

const GREEN = '#10B981'
const DIM = '#C8D8E8'

function buildColoredCubes(phase: CubeMinPhase): IsoCube[] {
  switch (phase) {
    case 'intro':
      return HKIMO19P1Q17_ALL.map((c) => ({ ...c, color: DIM }))
    case 'ground':
      return [
        ...HKIMO19P1Q17_GROUND.map((c) => ({ ...c, color: ISO_GOLD_PALETTE.top })),
        ...HKIMO19P1Q17_ELEVATED.map((c) => ({ ...c, color: DIM })),
      ]
    case 'elevated':
      return [
        ...HKIMO19P1Q17_GROUND,
        ...HKIMO19P1Q17_ELEVATED.map((c) => ({ ...c, color: ISO_GOLD_PALETTE.top })),
      ]
    case 'verify':
    case 'answer':
      return HKIMO19P1Q17_ALL.map((c) => ({ ...c, color: GREEN }))
    default:
      return HKIMO19P1Q17_ALL
  }
}

function getRunningTotal(phase: CubeMinPhase): number {
  if (phase === 'ground') return 7
  if (phase === 'elevated' || phase === 'verify' || phase === 'answer') return 9
  return 0
}

export default function IsoCubeMinHK19P1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildIsoCubeMinHK19P1Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildColoredCubes(beat.phase)
  const total = getRunningTotal(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung minimum kubus. Lapisan dasar 7, lapisan atas 2. Total minimum = 9.'
      : 'Explainer: count minimum cubes. Ground layer 7, elevated layer 2. Minimum total = 9.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Cube figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Running count */}
        {total > 0 && (
          <motion.div
            key={`count-${total}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {total}
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
