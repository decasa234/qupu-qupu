import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiagSquare20B6 } from './DiagSquare20B6Illustration'
import { buildDiagSquare20B6Steps, AREA, ANSWER_CHOICE } from './diagSquare20B6Steps'

// SEAMO-20-B-Q6 — Square with diagonal 12 cm; find area.
// Answer: 72 cm² → choice B.
//
// Beats:
//   1. State formula: Area = diagonal² ÷ 2.
//   2. Compute: 12² = 144 (show half-diagonal marks).
//   3. 144 ÷ 2 = 72 cm² → choice B (show area).

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

export default function DiagSquare20B6Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildDiagSquare20B6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: diagonal = 12 cm. Area = 12² ÷ 2 = 144 ÷ 2 = ${AREA} cm², choice ${ANSWER_CHOICE}.`,
    `Penjelasan: diagonal = 12 cm. Luas = 12² ÷ 2 = 144 ÷ 2 = ${AREA} cm², pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* figure coming alive */}
        <DiagSquare20B6 showHalfLabel={beat.showHalfLabel} showArea={beat.showArea} />

        {/* live arithmetic */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.math != null && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-base font-black tabular-nums"
                style={{ color: beat.result ? GREEN : ORANGE }}
              >
                {beat.result
                  ? t(`Area = ${beat.math}`, `Luas = ${beat.math}`)
                  : beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
