import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PriceClues16EC } from './PriceClues16ECIllustration'
import { buildPriceClues16ECSteps } from './priceClues16ECSteps'

// IKMC-19-EC-Q16 — post-answer animation.
//
// Teaching strategy: add all three clue equations, notice each fruit appears
// twice, divide the sum by 2. One idea per beat. Never jumps straight to 11.
//
// Reuses PriceClues16EC primitive from the illustration so the animation reads
// as the static scene coming alive — rows light up as they are referenced.

// ── colour tokens echoing the illustration ────────────────────────────────────
const BLUE = '#30598A'   // qupu-brand-blue
const ORANGE = '#f0853a' // qupu-brand-orange
const GREEN = '#10B981'
const GREEN_DK = '#065F46'
const GREEN_FILL = '#D1FAE5'

export default function PriceClues16ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPriceClues16ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Adding all three clue equations: (5 + 7 + 10) = 22; each fruit appears twice, so apple + pear + banana = 22 ÷ 2 = ${story.answer} cents. Answer D.`,
    `Menjumlahkan ketiga persamaan petunjuk: (5 + 7 + 10) = 22; setiap buah muncul dua kali, jadi apel + pir + pisang = 22 ÷ 2 = ${story.answer} sen. Jawaban D.`,
  )

  // Caption box colour: blue for setup/sum, orange for halve, green for result.
  const captionStyle = beat.result
    ? { background: GREEN_FILL, borderColor: GREEN, color: GREEN_DK }
    : beat.phase === 'halve'
      ? { background: '#FFF1E5', borderColor: ORANGE, color: '#B5530F' }
      : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const equationColor = beat.result ? GREEN : beat.phase === 'halve' ? ORANGE : BLUE

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The static fruit-row layout coming alive — rows light up per beat. */}
        <motion.div
          key={index}
          initial={{ opacity: 0.75, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full"
        >
          <PriceClues16EC litRow={beat.litRow} lang={lang} />
        </motion.div>

        {/* Equation call-out */}
        {beat.equation !== '' && (
          <motion.div
            key={`eq-${index}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: equationColor }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
