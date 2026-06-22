import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoardPrimitive } from './Covered20ECIllustration'
import { buildCovered20ECSteps } from './covered20ECSteps'

// IKMC-20-EC-Q20 — post-answer animation for the "covered numbers" board.
// Reuses BoardPrimitive from Covered20ECIllustration so the animation is
// recognised as the same board coming alive.
//
// Beats:
//   0. intro     — plain board, state the three facts.
//   1. total     — 1+2+…+8 = 36.
//   2. minus-tri — 36 − 10 = 26.
//   3. minus-sq  — 26 − 20 = 6.
//   4. result    — circle revealed as "6", answer D.

const GREEN  = '#10B981'
const ORANGE = '#f0853a'
const BLUE   = '#30598A'

export default function Covered20ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCovered20ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: angka 1 sampai 8 berjumlah 36. Kurangi jumlah segitiga 10 dan jumlah persegi 20: 36 − 10 − 20 = 6. Lingkaran menyembunyikan angka 6, jawaban D.'
      : 'Explainer: numbers 1 to 8 sum to 36. Subtract the triangle sum of 10 and the square sum of 20: 36 − 10 − 20 = 6. The circle hides the number 6, answer D.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* the board — circle revealed on the result beat */}
        <BoardPrimitive revealCircle={beat.revealCircle} />

        {/* arithmetic equation badge */}
        {beat.equation !== '' && (
          <motion.div
            key={beat.phase}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: beat.result ? GREEN : ORANGE }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
