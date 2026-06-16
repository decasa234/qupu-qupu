import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NumberPattern25G1, ANSWER } from './NumberPattern25G1Illustration'
import { buildNumberPattern25G1Steps } from './numberPattern25G1Steps'

const GREEN = '#10B981'
const ORANGE = '#C56A12' // qupu-brand-orange (darker) — the active subtraction step
const BLUE = '#30598A' // qupu-brand-blue — the reveal/goal voice

export default function NumberPattern25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberPattern25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The active subtraction step wears orange; the goal/result voice is blue.
  const accent = beat.result ? GREEN : beat.phase === 'step' ? ORANGE : BLUE

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap angka pertama dikurangi angka kedua memberi angka pertama berikutnya — 19 − 3 = 16, 16 − 4 = 12, 12 − 6 = ${ANSWER}. Jadi "?" = ${ANSWER}.`
      : `Explainer: each first number minus the second gives the next first number — 19 − 3 = 16, 16 − 4 = 12, 12 − 6 = ${ANSWER}. So "?" = ${ANSWER}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberPattern25G1 litStep={beat.litStep} revealAnswer={beat.revealAnswer} />

        {beat.expr && (
          <motion.div
            key={`expr-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: accent }}
          >
            {beat.expr}
          </motion.div>
        )}

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {story.answer}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'step'
                ? { background: '#FFFFFF', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
