import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CoinGrid3ECFigure } from './CoinGrid3ECIllustration'
import { buildCoinGrid3ECSteps } from './coinGrid3ECSteps'

// IKMC-22-EC-Q3 — post-answer beat-driven explainer.
//
// Reuses CoinGrid3ECFigure from the illustration so the animation reads as the
// static coin grid coming alive, one logical step per beat.
//
// Beats:
//   0. intro   — show initial grid, state the rule.
//   1. rows    — highlight the over-full row (row 4 / index 3) in red.
//   2. target  — spotlight coin C as the troublemaker; dashed ring shows target.
//   3. move    — C drawn at its new position (row 3, col 2); green ring.
//   4. result  — confirm rule satisfied; green answer pill.

const GREEN = '#10B981'
const BLUE  = '#30598A'
const RED   = '#EF4444'

export default function CoinGrid3ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCoinGrid3ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : beat.phase === 'rows' ? RED : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baris 4 memiliki 3 koin (B, C, E) tapi baris 3 hanya 1 koin (D). Pindahkan koin C dari baris 4 ke sel kosong di baris 3. Kini setiap baris dan kolom tepat punya 2 koin — jawaban C.'
      : 'Explainer: row 4 has 3 coins (B, C, E) but row 3 has only 1 coin (D). Move coin C from row 4 to the empty cell in row 3. Every row and column then has exactly 2 coins — answer C.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

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
              <CoinGrid3ECFigure
                coins={beat.coins}
                rings={beat.rings}
                emptyTarget={beat.emptyTarget}
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
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
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
