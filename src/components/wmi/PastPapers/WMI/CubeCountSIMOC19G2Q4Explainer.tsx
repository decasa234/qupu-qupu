// Post-answer explainer for SIMOC-19-G2-Q4.
// "How many 1×1×1 cubes make up the 3×3×3 figure?" — answer: 27.
//
// Animation strategy:
//   intro        — full cube dimmed; cue layer-by-layer strategy
//   layer_bottom — bottom layer (z=0) lit in amber; rest dim; counter shows 9
//   layer_mid    — middle layer (z=1) lit in amber; rest dim; counter shows 9
//   layer_top    — top layer (z=2) lit in amber; rest dim; counter shows 9
//   answer       — all 27 cubes lit in green; counter shows 27

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { CUBE_3X3X3, GREY_PALETTE } from './CubeCountSIMOC19G2Q4Illustration'
import { buildCubeCountSIMOC19G2Q4Steps } from './cubeCountSIMOC19G2Q4Steps'
import type { CubeCountPhase } from './cubeCountSIMOC19G2Q4Steps'

const DIM     = '#CBD5E1'
const AMBER   = '#FCD34D'
const GREEN   = '#34D399'
const AMBER_P = { top: '#FDE68A', left: '#F59E0B', right: '#D97706', ink: '#1E293B' }
const GREEN_P = { top: '#A7F3D0', left: '#34D399', right: '#059669', ink: '#1E293B' }

function buildCubes(phase: CubeCountPhase): { cubes: IsoCube[]; palette: typeof GREY_PALETTE } {
  switch (phase) {
    case 'intro':
      return {
        palette: GREY_PALETTE,
        cubes: CUBE_3X3X3.map((c) => ({ ...c, color: DIM })),
      }
    case 'layer_bottom':
      return {
        palette: AMBER_P,
        cubes: CUBE_3X3X3.map((c) => ({
          ...c,
          color: c.z === 0 ? AMBER : DIM,
        })),
      }
    case 'layer_mid':
      return {
        palette: AMBER_P,
        cubes: CUBE_3X3X3.map((c) => ({
          ...c,
          color: c.z === 1 ? AMBER : DIM,
        })),
      }
    case 'layer_top':
      return {
        palette: AMBER_P,
        cubes: CUBE_3X3X3.map((c) => ({
          ...c,
          color: c.z === 2 ? AMBER : DIM,
        })),
      }
    case 'answer':
      return {
        palette: GREEN_P,
        cubes: CUBE_3X3X3.map((c) => ({ ...c, color: GREEN })),
      }
    default:
      return { palette: GREY_PALETTE, cubes: CUBE_3X3X3 }
  }
}

export default function CubeCountSIMOC19G2Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildCubeCountSIMOC19G2Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cubes, palette } = buildCubes(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung kubus 3×3×3 per lapisan — 9+9+9 = 27 kubus satuan.'
      : 'Explainer: count the 3×3×3 cube layer by layer — 9+9+9 = 27 unit cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Cube figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={24}
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
