// IKMC-22-EC-Q9 — Explainer: 5-car overtaking simulation.
//
// Walks through the 3 overtaking moves beat-by-beat using the CarRow primitive
// from CarsLane9ECIllustration. A step badge labels each move (Move 1/2/3); a
// caption chip narrates what is happening. The final beat is green and names
// the answer (B: 2, 1, 3, 5, 4).
//
// Adapted from BallsMove12ECExplainer (beat-by-beat row + caption chip pattern)
// and FlagpoleCastle22Explainer (badge + motion kit).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CarRow } from './CarsLane9ECIllustration'
import { buildCarsLane9ECSteps } from './carsLane9ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#1D4ED8'
const BLUE_BG = '#EFF6FF'
const AMBER = '#D97706'
const AMBER_BG = '#FFFBEB'

export default function CarsLane9ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCarsLane9ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const hasMoveLabel = !!beat.moveLabel

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const badgeStyle = { background: AMBER_BG, borderColor: AMBER, color: AMBER }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 3 gerakan mendahului diterapkan satu per satu. Urutan akhir: 2, 1, 3, 5, 4. Jawaban B.`
      : `Explainer: 3 overtaking moves applied step by step. Final order: 2, 1, 3, 5, 4. Answer B.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Move badge — visible only on move-preview beats */}
        <div className="h-9 flex items-center justify-center">
          {hasMoveLabel && (
            <motion.div
              key={`badge-${index}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="rounded-full border-2 px-5 py-1 text-sm font-extrabold"
              style={badgeStyle}
            >
              {beat.moveLabel}
            </motion.div>
          )}
        </div>

        {/* Car row for this beat */}
        <motion.div
          key={`row-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <CarRow
            order={beat.order}
            highlightSet={beat.highlightSet}
          />
        </motion.div>

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
