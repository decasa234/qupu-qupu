// Post-answer explainer for SIMOC-19-G2-Q14.
// "Minimum cubes to build the figure shown by three views?" — answer: 9 (choice D).
//
// Animation strategy:
//   intro   — all 9 cubes shown dimmed; introduce strategy
//   ground  — 7 ground cubes (z=0) lit amber; rest dimmed; counter=7
//   tower   — ground dimmed; back-right tower column (x=3,y=2, z=0..2) lit amber
//   answer  — all 9 cubes lit green; counter=9

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube, IsoPalette } from './primitives/IsoCubes'
import { buildThreeViewsSIMOC19G2Q14Steps } from './threeViewsSIMOC19G2Q14Steps'
import type { ThreeViewsPhase } from './threeViewsSIMOC19G2Q14Steps'

// ── Colour tokens ──────────────────────────────────────────────────────────────
const DIM   = '#CBD5E1'
const AMBER = '#FCD34D'
const GREEN = '#34D399'

const GREY_P: IsoPalette  = { top: '#E2E8F0', left: '#94A3B8', right: '#64748B', ink: '#1E293B' }
const AMBER_P: IsoPalette = { top: '#FDE68A', left: '#F59E0B', right: '#D97706', ink: '#1E293B' }
const GREEN_P: IsoPalette = { top: '#A7F3D0', left: '#34D399', right: '#059669', ink: '#1E293B' }

// ── Minimum-solution cube positions ───────────────────────────────────────────
// Ground layer (z=0): 7 positions matching the top-view footprint
// Tower extras (z=1,2): at the back-right corner (x=3, y=2)
const GROUND_CUBES: IsoCube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 3, y: 1, z: 0 },
  { x: 3, y: 2, z: 0 },
]

const TOWER_EXTRAS: IsoCube[] = [
  { x: 3, y: 2, z: 1 },
  { x: 3, y: 2, z: 2 },
]

const ALL_CUBES: IsoCube[] = [...GROUND_CUBES, ...TOWER_EXTRAS]

// ── Phase → coloured cube list ─────────────────────────────────────────────────
function buildCubes(phase: ThreeViewsPhase): { cubes: IsoCube[]; palette: IsoPalette } {
  switch (phase) {
    case 'intro':
      return {
        palette: GREY_P,
        cubes: ALL_CUBES.map((c) => ({ ...c, color: DIM })),
      }
    case 'ground':
      return {
        palette: AMBER_P,
        cubes: [
          ...GROUND_CUBES.map((c) => ({ ...c, color: AMBER })),
          ...TOWER_EXTRAS.map((c) => ({ ...c, color: DIM })),
        ],
      }
    case 'tower':
      return {
        palette: AMBER_P,
        cubes: [
          ...GROUND_CUBES.map((c) => ({ ...c, color: DIM })),
          { x: 3, y: 2, z: 0, color: AMBER },
          { x: 3, y: 2, z: 1, color: AMBER },
          { x: 3, y: 2, z: 2, color: AMBER },
        ],
      }
    case 'answer':
      return {
        palette: GREEN_P,
        cubes: ALL_CUBES.map((c) => ({ ...c, color: GREEN })),
      }
    default:
      return { palette: GREY_P, cubes: ALL_CUBES }
  }
}

// ── Explainer component ────────────────────────────────────────────────────────
export default function ThreeViewsSIMOC19G2Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildThreeViewsSIMOC19G2Q14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cubes, palette } = buildCubes(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bangun minimum dari tiga tampak — 7 kubus dasar + 2 kubus menara = 9 kubus satuan.'
      : 'Explainer: minimum build from three views — 7 ground cubes + 2 tower cubes = 9 unit cubes.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Isometric cube figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes cubes={cubes} size={26} palette={palette} viewPadding={10} />
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
