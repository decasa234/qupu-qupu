import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CalcGrid8ECFigure } from './CalcGrid8ECIllustration'
import { buildCalcGrid8ECSteps } from './calcGrid8ECSteps'

// IKMC-2019-Ecolier-Q8 — post-answer beat-driven explainer.
// Reuses CalcGrid8ECFigure from the illustration so the animation reads as
// the static grid coming alive, one unknown revealed per beat.
//
// Beat sequence:
//   0. intro      — static grid, state the task.
//   1. row        — reveal A=3 (highlight A blue).
//   2. col-left   — reveal B=8 (highlight B blue).
//   3. col-right  — reveal C=3 (highlight C blue).
//   4. result     — reveal ?=5 (highlight Q green).

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function CalcGrid8ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCalcGrid8ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baris 2+1=3; kolom kiri 1+B=9 jadi B=8; kolom kanan 0+3=C=3; lalu B−C=8−3=5 — jawaban B.'
      : 'Explainer: row 2+1=3; left column 1+B=9 so B=8; right column 0+3=C=3; then B−C=8−3=5 — answer B.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — AnimatePresence wraps the whole figure so beat transitions animate */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <CalcGrid8ECFigure
                showA={beat.showA}
                showB={beat.showB}
                showC={beat.showC}
                showQ={beat.showQ}
                highlight={beat.highlight}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* equation pill */}
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
                style={{ background: accentColor }}
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
