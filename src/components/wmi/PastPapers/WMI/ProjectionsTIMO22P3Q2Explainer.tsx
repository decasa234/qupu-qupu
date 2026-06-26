// Post-answer explainer for TIMO-22-P3H-Q2.
// "Find the number of black marbles inserted in the 3×3×3 cube." — Answer: 7.
//
// Animation reads each of the three projections in turn, highlighting its filled
// cells, then concludes with the total marble count.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ProjectionGrid,
  TOP_VIEW,
  FRONT_VIEW,
  RIGHT_VIEW,
} from './ProjectionsTIMO22P3Q2Illustration'
import { buildProjectionsTIMO22P3Q2Steps } from './projectionsTIMO22P3Q2Steps'

const GREEN = '#10B981'

export default function ProjectionsTIMO22P3Q2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildProjectionsTIMO22P3Q2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baca tampak atas, depan, kanan lalu gabungkan → 7 kelereng.'
      : 'Explainer: read top, front, right-side projections then combine → 7 marbles.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Three projection grids */}
        <div className="flex items-start justify-center gap-4 rounded-lg border-2 border-qupu-cream-dark bg-white p-4">
          <ProjectionGrid
            data={TOP_VIEW}
            label="Tampak Atas"
            highlightFilled={beat.activeView === 'top'}
          />
          <ProjectionGrid
            data={FRONT_VIEW}
            label="Tampak Depan"
            highlightFilled={beat.activeView === 'front'}
          />
          <ProjectionGrid
            data={RIGHT_VIEW}
            label="Tampak Kanan"
            highlightFilled={beat.activeView === 'right'}
          />
        </div>

        {/* Answer badge — only shown on final beat */}
        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            7
          </motion.div>
        )}

        {/* Beat caption */}
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
