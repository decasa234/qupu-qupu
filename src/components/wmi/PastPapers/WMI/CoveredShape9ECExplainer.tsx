/**
 * IKMC-23-EC-Q9 — post-answer explainer.
 *
 * Walks through the solution beat-by-beat:
 *   0. intro  — show the L-shape with dot; state the task.
 *   1. locate — identify the dot's position.
 *   2. piece-A — highlight the parallelogram (piece A) region on the shape.
 *   3. result — confirm the dot falls under piece A; answer is A.
 *
 * Reuses ShapePrimitive from CoveredShape9ECIllustration.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapePrimitive } from './CoveredShape9ECIllustration'
import { buildCoveredShape9ECSteps } from './coveredShape9ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function CoveredShape9ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCoveredShape9ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const ariaLabel = t(
    'Explainer: the dot on the L-shaped figure is located in the region covered by piece A, the parallelogram. Answer: A.',
    'Penjelasan: titik pada bentuk huruf L berada di wilayah yang ditutupi potongan A, yaitu jajar genjang. Jawaban: A.',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* the L-shape, with piece-A highlight toggled by beat */}
        <motion.div
          key={String(beat.highlightA)}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <ShapePrimitive showDot highlightA={beat.highlightA} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
