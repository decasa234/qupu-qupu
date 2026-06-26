// Post-answer explainer for SIMOC-22-G1-Q9.
// "How many cubes are stacked in the corner?" — answer: E (24).
//
// Animation strategy:
//   intro     — full staircase dimmed; introduce front-to-back counting
//   row_front — front row (y=0) lit amber; rest dim; counter: 4
//   row_mid   — middle row (y=1) lit amber; rest dim; counter: 8
//   row_back  — back row (y=2) lit amber; rest dim; counter: 12
//   answer    — all 24 cubes lit green; counter: 24

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  SIMOC22G1Q9_CUBES,
  SIMOC22G1Q9_PALETTE,
} from './StackedCubesSIMOC22G1Q9Illustration'
import {
  buildStackedCubesSIMOC22G1Q9Steps,
} from './stackedCubesSIMOC22G1Q9Steps'
import type { StackedCubesPhase } from './stackedCubesSIMOC22G1Q9Steps'

const DIM     = '#CBD5E1'
const AMBER   = '#FCD34D'
const GREEN   = '#34D399'
const AMBER_P = { top: '#FDE68A', left: '#F59E0B', right: '#D97706', ink: '#1E293B' }
const GREEN_P = { top: '#A7F3D0', left: '#34D399', right: '#059669', ink: '#1E293B' }

function buildCubes(
  phase: StackedCubesPhase,
): { cubes: IsoCube[]; palette: typeof SIMOC22G1Q9_PALETTE } {
  switch (phase) {
    case 'intro':
      return {
        palette: SIMOC22G1Q9_PALETTE,
        cubes: SIMOC22G1Q9_CUBES.map((c) => ({ ...c, color: DIM })),
      }
    case 'row_front':
      return {
        palette: AMBER_P,
        cubes: SIMOC22G1Q9_CUBES.map((c) => ({
          ...c,
          color: c.y === 0 ? AMBER : DIM,
        })),
      }
    case 'row_mid':
      return {
        palette: AMBER_P,
        cubes: SIMOC22G1Q9_CUBES.map((c) => ({
          ...c,
          color: c.y === 1 ? AMBER : DIM,
        })),
      }
    case 'row_back':
      return {
        palette: AMBER_P,
        cubes: SIMOC22G1Q9_CUBES.map((c) => ({
          ...c,
          color: c.y === 2 ? AMBER : DIM,
        })),
      }
    case 'answer':
      return {
        palette: GREEN_P,
        cubes: SIMOC22G1Q9_CUBES.map((c) => ({ ...c, color: GREEN })),
      }
    default:
      return { palette: SIMOC22G1Q9_PALETTE, cubes: SIMOC22G1Q9_CUBES }
  }
}

export default function StackedCubesSIMOC22G1Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildStackedCubesSIMOC22G1Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cubes, palette } = buildCubes(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung kubus per baris depan-ke-belakang — 4+8+12 = 24 kubus.'
      : 'Explainer: count cubes row by row front-to-back — 4+8+12 = 24 cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Staircase figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={palette}
            viewPadding={10}
          />
        </div>

        {/* Running count */}
        {beat.count !== null && (
          <motion.div
            key={`count-${beat.phase}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? '#059669' : '#D97706' }}
          >
            {beat.count}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#059669', color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#D97706', color: '#92400E' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
