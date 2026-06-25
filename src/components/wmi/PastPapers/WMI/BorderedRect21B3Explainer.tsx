// Post-answer animation for SEAMO-21-B-Q3.
//
// Method taught: outer area − inner area = shaded border area.
//   outer = 9 × 6 = 54 m²
//   border 1 m on all sides → inner = 7 × 4 = 28 m²
//   shaded = 54 − 28 = 26 m²  → E (None of the above)

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BorderedRectFrame } from './BorderedRect21B3Illustration'
import { buildBorderedRectSteps } from './borderedRect21B3Steps'

const BRAND_BLUE = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_DARK = '#065F46'
const PEACH      = '#FFD3B1'
const SHELL      = '#FFF9F4'

function EquationChip({ text, result }: { text: string; result: boolean }) {
  if (!text) return null
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25 }}
        style={{
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 800,
          color: result ? GREEN_DARK : BRAND_BLUE,
          background: result ? GREEN_BG : BLUE_BG,
          border: `1.5px solid ${result ? GREEN : BRAND_BLUE}`,
          borderRadius: 8,
          padding: '3px 14px',
          letterSpacing: '0.02em',
          textAlign: 'center',
        }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

export default function BorderedRect21B3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBorderedRectSteps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Outer rectangle 9 × 6 = 54 m². Inner white rectangle (9−2) × (6−2) = 7 × 4 = 28 m². ` +
      `Shaded area = 54 − 28 = 26 m². 26 is not in choices A–D, so answer is E.`,
    `Persegi panjang luar 9 × 6 = 54 m². Persegi panjang dalam (9−2) × (6−2) = 7 × 4 = 28 m². ` +
      `Luas diarsir = 54 − 28 = 26 m². 26 tidak ada di pilihan A–D, jadi jawaban E.`,
  )

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DARK }
    : { background: BLUE_BG, borderColor: BRAND_BLUE, color: BRAND_BLUE }

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Figure: reuse illustration primitive with animated phase */}
        <BorderedRectFrame outerW={9} outerH={6} border={1} phase={beat.phase} />

        {/* Arithmetic chip */}
        <EquationChip text={beat.equation} result={beat.result} />

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

        {/* Final answer badge */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            style={{
              background: GREEN_BG,
              border: `2px solid ${GREEN}`,
              borderRadius: 10,
              padding: '4px 20px',
              fontSize: 20,
              fontWeight: 900,
              color: GREEN_DARK,
              letterSpacing: '0.03em',
            }}
          >
            {t('Shaded = 26 m² → E', 'Diarsir = 26 m² → E')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
