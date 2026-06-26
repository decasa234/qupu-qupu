import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParkSquaresFigure } from './ParkSquaresOSN25KQ13Illustration'
import {
  buildParkSquaresOSN25KQ13Steps,
  ANSWER_EN,
  ANSWER_ID,
  type ParkPhase,
} from './parkSquaresOSN25KQ13Steps'

const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'

export default function ParkSquaresOSN25KQ13Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildParkSquaresOSN25KQ13Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat   = steps[index] ?? steps[steps.length - 1]
  const answer = lang === 'id' ? ANSWER_ID : ANSWER_EN

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Luas Taman 1 = 100 m² → sisi 10 m. Rasio 5:4:3 → sisi 10 m, 8 m, 6 m. Keliling = 2×(10+8+6)+2×10 = 68 m. Jawaban C.'
      : 'Explainer: Area of Park 1 = 100 m² → side 10 m. Ratio 5:4:3 → sides 10 m, 8 m, 6 m. Perimeter = 2×(10+8+6)+2×10 = 68 m. Answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Park figure with phase-based annotations */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <ParkSquaresFigure phase={beat.phase as ParkPhase} lang={lang} />
        </motion.div>

        {/* Caption / result box */}
        <motion.div
          key={`cap-${index}`}
          className="w-full min-h-[52px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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

        {/* Answer chip on final beat */}
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
