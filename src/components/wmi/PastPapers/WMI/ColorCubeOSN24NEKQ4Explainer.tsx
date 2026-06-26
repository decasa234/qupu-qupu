// Post-answer explainer for OSN-24-SD-NAS-EKSPERIMEN-Q4.
// "Color 27 unit cubes in a 3×3×3 with 3 colors, no two adjacent same color.
//  How many unit cubes receive color 1?" — answer: 9.
//
// Animation strategy:
//   intro   — show full 3×3×3 cube with 3-color pattern, dimmed
//   layer0  — illuminate bottom layer; all 3 residues visible
//   rule    — restore full cube; flash adjacent pairs to show mod difference
//   count   — highlight yellow (color 1) cubes only; counter shows 9
//   answer  — all cubes return to full color; caption announces 9

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  COLOR_CUBE_3X3,
  COLOR_YELLOW,
  cubeColor,
} from './ColorCubeOSN24NEKQ4Illustration'
import { buildColorCubeOSN24NEKQ4Steps } from './colorCubeOSN24NEKQ4Steps'
import type { ColorCubePhase } from './colorCubeOSN24NEKQ4Steps'

const DIM = '#CBD5E1'
const GREEN_CONFIRM = '#10B981'

function buildColoredCubes(phase: ColorCubePhase): IsoCube[] {
  switch (phase) {
    case 'intro':
      return COLOR_CUBE_3X3.map((c) => ({ ...c, color: DIM }))

    case 'layer0':
      return COLOR_CUBE_3X3.map((c) => ({
        ...c,
        color: c.z === 0 ? cubeColor(c.x, c.y, c.z) : DIM,
      }))

    case 'rule':
      return COLOR_CUBE_3X3.map((c) => ({
        ...c,
        color: cubeColor(c.x, c.y, c.z),
      }))

    case 'count':
      return COLOR_CUBE_3X3.map((c) => ({
        ...c,
        color: cubeColor(c.x, c.y, c.z) === COLOR_YELLOW
          ? COLOR_YELLOW
          : DIM,
      }))

    case 'answer':
      return COLOR_CUBE_3X3.map((c) => ({
        ...c,
        color: cubeColor(c.x, c.y, c.z),
      }))

    default:
      return COLOR_CUBE_3X3
  }
}

function getCountDisplay(phase: ColorCubePhase): number | null {
  if (phase === 'count' || phase === 'answer') return 9
  return null
}

export default function ColorCubeOSN24NEKQ4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildColorCubeOSN24NEKQ4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildColoredCubes(beat.phase)
  const count = getCountDisplay(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kubus 3×3×3 diwarnai dengan (i+j+k) mod 3. Warna 1 mendapat 9 kubus.'
      : 'Explainer: 3×3×3 cube colored by (i+j+k) mod 3. Color 1 gets 9 cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Cube figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
        </div>

        {/* Running count for color 1 */}
        {count !== null && (
          <motion.div
            key={`count-${count}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN_CONFIRM : COLOR_YELLOW }}
          >
            {count}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN_CONFIRM, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
