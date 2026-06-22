import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CoinTriangle16A3Figure } from './CoinTriangle16A3Illustration'
import { buildCoinTriangle16A3Steps } from './coinTriangle16A3Steps'

// SEAMO-16-A-Q3 — post-answer beat-driven explainer.
//
// Reuses CoinTriangle16A3Figure from the illustration so the animation reads
// as the static coin triangle coming alive, one logical step per beat.
//
// Beats:
//   0. intro   — show all coins gold; state the setup.
//   1. sides   — 3 sides × 6 coins; corner coins turn amber.
//   2. naive   — 3 × 6 = 18 but corners highlighted red.
//   3. corners — 3 corner coins spotlighted; edge coins gold.
//   4. fix     — 18 − 3 = 15; corners turn green.
//   5. result  — all coins green; answer D confirmed.

const GREEN = '#10B981'
const BLUE  = '#30598A'
const RED   = '#EF4444'

export default function CoinTriangle16A3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCoinTriangle16A3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : beat.phase === 'naive' || beat.phase === 'corners' ? RED : BLUE
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: setiap sisi segitiga punya 6 koin, namun 3 koin sudut dihitung dua kali. Kurangi 3: 18 − 3 = 15 koin. Jawaban D.'
      : 'Explainer: each side of the triangle has 6 coins, but 3 corner coins are counted twice. Subtract 3: 18 − 3 = 15 coins. Answer D.'

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
              <CoinTriangle16A3Figure
                cornerHighlight={beat.cornerHighlight}
                cornerColor={beat.cornerColor}
                edgeColor={beat.edgeColor}
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
