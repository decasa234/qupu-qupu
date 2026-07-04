// Post-answer animation for WMI-22F3A-Q21.
//
// Method taught: side lengths + the 4 / 4 / 3 offsets (the scan's labels).
//   TOP 8 tall, LEFT 5 wide → ★ height = 9 − (8 − 4) = 5.
//   BOTTOM = 42 ÷ (8 + 3 − 5) = 7 wide → ★ width = 7 − (5 − 4) = 6.
//   ★ area = 5 × 6 = 30.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RectFrame, PIECES } from './RectFrame22G3Illustration'
import { buildRectFrameSteps } from './rectFrame22G3Steps'

// Colour tokens — echo the illustration's qupu palette.
const BRAND_BLUE   = '#30598A'
const BLUE_BG      = '#E1EFFB'
const GREEN        = '#10B981'
const GREEN_BG     = '#D1FAE5'
const GREEN_DARK   = '#065F46'
const PEACH        = '#FFD3B1'
const SHELL        = '#FFF9F4'

// ViewBox matches the illustration file.
const VIEW_W = 340
const VIEW_H = 320

// ---------------------------------------------------------------------------
// Equation chip — shows the current arithmetic step.
// ---------------------------------------------------------------------------
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
          fontSize: 15,
          fontWeight: 800,
          color: result ? GREEN_DARK : BRAND_BLUE,
          background: result ? GREEN_BG : BLUE_BG,
          border: `1.5px solid ${result ? GREEN : BRAND_BLUE}`,
          borderRadius: 8,
          padding: '3px 14px',
          letterSpacing: '0.02em',
        }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Main explainer component
// ---------------------------------------------------------------------------

export default function RectFrame22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildRectFrameSteps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: side lengths plus the 4, 4, 3 offsets. ` +
      `Shaded height = 9 − (8 − 4) = 5; shaded width = 7 − (5 − 4) = 6. ` +
      `Shaded area = 5 × 6 = ${story.answer}.`,
    `Strategi: panjang sisi ditambah selisih 4, 4, 3. ` +
      `Tinggi arsiran = 9 − (8 − 4) = 5; lebar arsiran = 7 − (5 − 4) = 6. ` +
      `Luas arsiran = 5 × 6 = ${story.answer}.`,
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
        {/* Figure: RectFrame reused from the illustration */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <RectFrame
            pieces={PIECES}
            starId="star"
            highlight={beat.highlight}
            viewW={VIEW_W}
            viewH={VIEW_H}
          />
        </div>

        {/* Arithmetic equation chip */}
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
            {`★ = ${story.answer}`}
          </motion.div>
        )}
      </div>
    </div>
  )
}
