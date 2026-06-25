import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PentagonShape } from './Pentagon22B3Illustration'
import { buildPentagon22B3Steps, ANSWER_VALUE, ANSWER_CHOICE } from './pentagon22B3Steps'

// SEAMO-22-B-Q3 (2022 Contest B) — pentagon ABCDE, ∠A = 90°, find ∠B+∠C+∠D+∠E.
// Answer: E (450°).
//
// Animation beats:
//   1. Show the problem figure (no highlight).
//   2. State the pentagon angle-sum rule: (5−2)×180° = 540°.
//   3. Spotlight ∠A = 90° (the given right angle).
//   4. Subtract: 540° − 90°.
//   5. Land 450° = choice E (green).

const BLUE = '#30598A'
const GREEN = '#059669'
const ORANGE = '#f0853a'

export default function Pentagon22B3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPentagon22B3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: Pentagon ABCDE interior angle sum = 540°. With ∠A = 90°, ∠B+∠C+∠D+∠E = 540°−90° = 450°. Answer ${ANSWER_CHOICE} (${ANSWER_VALUE}°).`,
    `Penjelasan: Jumlah sudut dalam segi-lima ABCDE = 540°. Dengan ∠A = 90°, ∠B+∠C+∠D+∠E = 540°−90° = 450°. Jawaban ${ANSWER_CHOICE} (${ANSWER_VALUE}°).`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Pentagon figure, spotlighting the current angle. */}
        <motion.div
          key={`fig-${beat.highlight ?? 'none'}-${beat.showALabel ? 'a' : ''}-${beat.sumLabel ?? ''}`}
          initial={{ opacity: 0.65, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <PentagonShape
            highlight={beat.highlight}
            showALabel={beat.showALabel}
            sumLabel={beat.sumLabel}
          />
        </motion.div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.highlight === 'A'
                ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
