import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PuzzleCalc3ECFigure } from './PuzzleCalc3ECIllustration'
import { buildPuzzleCalc3ECSteps } from './puzzleCalc3ECSteps'

// IKMC-2021-Ecolier-Q3 — post-answer beat-driven explainer.
// Four jigsaw pieces assembled into a rectangle read "12 + 3 = 15".
//
// Beat sequence (see puzzleCalc3ECSteps.ts):
//   0. intro    — scattered pieces, state the task.
//   1. identify — highlight all four pieces, name their labels.
//   2. assemble — show pieces joined.
//   3. read     — highlight "1"+"2" pieces forming 12; chip "12 + 3".
//   4. compute  — reveal "= 15" (green); answer B.

const GREEN = '#10B981'
const BLUE = '#30598A'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

export default function PuzzleCalc3ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPuzzleCalc3ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: susun keping "1", "2", "+", "3" dari kiri ke kanan — keping "1" dan "2" membentuk angka 12, sehingga perhitungannya adalah 12 + 3 = 15 — jawaban B.'
      : 'Explainer: arrange pieces "1", "2", "+", "3" left-to-right — pieces "1" and "2" form the number 12, so the calculation is 12 + 3 = 15 — answer B.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* figure */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`beat-${index}`}
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <PuzzleCalc3ECFigure
                showAssembled={beat.showAssembled}
                highlightPieces={beat.highlightPieces}
                showResult={beat.showResult}
              />
            </motion.div>
          </AnimatePresence>
        </div>

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
