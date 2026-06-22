// IKMC-19-EC-Q14 — post-answer animation.
// Reuses SumRowFigure from SumBoxes14ECIllustration so the animation reads
// as the static scene coming alive.
//
// Beats:
//   0. intro    — blank □□□ + ? — state the constraint.
//   1. hundreds — 9 in hundreds.
//   2. tens     — 2 in tens.
//   3. try-1    — 920 + 1 = 921.
//   4. try-0    — 921 + 0 = 921 (same!).
//   5. result   — both 0 and 1 → answer A.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SumRowFigure } from './SumBoxes14ECIllustration'
import { buildSumBoxes14ECSteps } from './sumBoxes14ECSteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function SumBoxes14ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSumBoxes14ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tempatkan 9 di ratusan, 2 di puluhan; sisa 0 dan 1 bisa dipertukarkan — keduanya menghasilkan 921. Jawaban A.'
      : 'Explainer: put 9 in hundreds, 2 in tens; leftover 0 and 1 are interchangeable — both give 921. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <SumRowFigure
          digits={beat.digits}
          single={beat.single}
          highlightIndex={beat.highlightIndex}
          resultSingle={beat.resultSingle}
          resultAll={beat.resultAll}
        />

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
