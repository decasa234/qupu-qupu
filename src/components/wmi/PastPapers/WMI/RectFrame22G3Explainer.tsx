// Post-answer animation for WMI-22F3A-Q21.
//
// Method taught: enclosing-rectangle identity.
//   Find each missing side → all five pieces tile a 13×17 box →
//   shaded area = 13×17 − (56+45+48+42) = 221 − 191 = 30.

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

// The enclosing 13×17 box in the illustration's drawing coordinate system.
// Computed from the illustration's pinwheel layout constants:
//   U=22, CX=150, CY=130, CW=44, CH=44, TOP_H=52.8, LEFT_W=52.8, RIGHT_W=52.8, BOT_H=52.8
// Left edge  = CX − LEFT_W = 150 − 52.8 = 97.2
// Top edge   = CY − TOP_H  = 130 − 52.8 = 77.2
// Width      = CW + LEFT_W + RIGHT_W = 44 + 52.8 + 52.8 = 149.6
// Height     = CH + TOP_H  + BOT_H   = 44 + 52.8 + 52.8 = 149.6
const U = 22
const CX = 150
const CY = 130
const CW = U * 2
const CH = U * 2
const TOP_H = U * 2.4
const LEFT_W = U * 2.4
const RIGHT_W = U * 2.4
const BOT_H = U * 2.4

const BOX_X = CX - LEFT_W
const BOX_Y = CY - TOP_H
const BOX_W = CW + LEFT_W + RIGHT_W
const BOX_H = CH + TOP_H + BOT_H

// ---------------------------------------------------------------------------
// Enclosing-rectangle overlay
// ---------------------------------------------------------------------------
// Drawn on top of the RectFrame SVG (same viewBox), visible from beat 5 onwards.
function EnclosingBox({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.svg
          key="enclosing"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={Math.min(300, VIEW_W)}
          height={(Math.min(300, VIEW_W) / VIEW_W) * VIEW_H}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Dashed amber outline for the 13×17 enclosing rectangle */}
          <rect
            x={BOX_X}
            y={BOX_Y}
            width={BOX_W}
            height={BOX_H}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            rx={3}
          />
          {/* Width annotation above */}
          <text
            x={BOX_X + BOX_W / 2}
            y={BOX_Y - 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="#B45309"
          >
            13
          </text>
          {/* Height annotation to the right */}
          <text
            x={BOX_X + BOX_W + 14}
            y={BOX_Y + BOX_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="#B45309"
          >
            17
          </text>
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

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
    `Strategy: enclosing-rectangle identity. ` +
      `The four rectangles and the shaded region tile a 13 × 17 box. ` +
      `Shaded area = 13 × 17 − (56+45+48+42) = 221 − 191 = ${story.answer}.`,
    `Strategi: identitas persegi panjang pembungkus. ` +
      `Keempat persegi panjang dan daerah berbintang mengisi kotak 13 × 17. ` +
      `Luas berbintang = 13 × 17 − (56+45+48+42) = 221 − 191 = ${story.answer}.`,
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
        {/* Figure: RectFrame reused from illustration + enclosing-box overlay */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <RectFrame
            pieces={PIECES}
            starId="star"
            highlight={beat.highlight}
            viewW={VIEW_W}
            viewH={VIEW_H}
          />
          <EnclosingBox visible={beat.showEnclosing} />
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
