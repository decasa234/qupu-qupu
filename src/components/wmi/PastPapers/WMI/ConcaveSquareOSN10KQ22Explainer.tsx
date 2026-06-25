import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ConcaveSquareFigure } from './ConcaveSquareOSN10KQ22Illustration'
import {
  buildConcaveSquareOSN10KQ22Steps,
  ANSWER_EN,
  ANSWER_ID,
} from './concaveSquareOSN10KQ22Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'

export default function ConcaveSquareOSN10KQ22Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildConcaveSquareOSN10KQ22Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]
  const answer = lang === 'id' ? ANSWER_ID : ANSWER_EN

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: luas arsiran = persegi − dua setengah lingkaran = 1.600 − 314 = 1.286 cm².'
      : 'Explainer: shaded area = square − two semicircles = 1,600 − 314 = 1,286 cm².'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.75, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <ConcaveSquareFigure phase={beat.phase} lang={lang} />
        </motion.div>

        <motion.div
          key={`caption-${index}`}
          className="w-full min-h-[48px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          {beat.caption}
        </motion.div>

        {beat.result && (
          <motion.div
            key="answer-chip"
            className="rounded-xl px-5 py-2 font-display text-base font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {lang === 'id' ? `Jawaban: ${answer}` : `Answer: ${answer}`}
          </motion.div>
        )}
      </div>
    </div>
  )
}
