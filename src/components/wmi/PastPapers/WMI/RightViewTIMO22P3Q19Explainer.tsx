// Post-answer explainer for TIMO-22-P3H-Q19.
// "At least how many squares visible from the right?" — answer: 8.
//
// Animation highlights each depth-group (by y) in amber while the rest dim,
// accumulating: 1 + 2 + 3 + 2 = 8.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { TIMO22P3Q19_CUBES } from './RightViewTIMO22P3Q19Illustration'
import { buildRightViewTIMO22P3Q19Steps } from './rightViewTIMO22P3Q19Steps'

const GOLD = '#FBBF24'
const DIM = '#C8D8E8'
const GREEN = '#10B981'

/** Colour-code cubes: highlighted y-rows amber, others dimmed. */
function colourCubes(cubes: IsoCube[], highlightY: number[]): IsoCube[] {
  if (highlightY.length === 0) return cubes
  return cubes.map((c) =>
    highlightY.includes(c.y) ? { ...c, color: GOLD } : { ...c, color: DIM },
  )
}

export default function RightViewTIMO22P3Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewTIMO22P3Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const displayCubes = colourCubes(TIMO22P3Q19_CUBES, beat.highlightY)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lihat dari kanan, hitung per baris kedalaman: 1+2+3+2 = 8 kotak.'
      : 'Explainer: view from right, count per depth row: 1+2+3+2 = 8 squares.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 3D figure with highlighted depth groups */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={displayCubes}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Running total */}
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
