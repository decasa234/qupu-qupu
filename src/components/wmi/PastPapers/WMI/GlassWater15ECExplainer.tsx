import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  GlassVessel,
  SVG_W,
  SVG_H,
  GLASS_CXS,
  GLASS_BOT_Y,
  RIM_RX,
  RIM_RY,
  GLASS_TOP_Y,
  GLASS_H,
} from './GlassWater15ECIllustration'
import {
  buildGlassWater15ECSteps,
  FULL_GLASS_G,
  EMPTY_GLASS_G,
  HALF_FULL_G,
} from './glassWater15ECSteps'

// IKMC-19-EC-Q15 — post-answer explainer.
// Reuses GlassVessel from the illustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro      — static 3-glass scene; state the two given weights.
//   1. water-mass — highlight left glass; equation 400 − 100 = 300 g.
//   2. half-water — highlight right glass; equation 300 ÷ 2 = 150 g.
//   3. half-full  — highlight right glass; equation 100 + 150 = 250 g.
//   4. result     — 250 g → D (green).

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const INK = '#1F2937'

// ── highlight ring ────────────────────────────────────────────────────────────

/** A glowing ring drawn around a glass to focus attention on it. */
function HighlightRing({ cx, color }: { cx: number; color: string }) {
  const rx = RIM_RX + 6
  const ry = GLASS_H / 2 + RIM_RY + 6
  const cy = GLASS_TOP_Y + GLASS_H / 2

  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray="6 4"
    />
  )
}

/** Weight label underneath a glass (used in explainer to reveal values). */
function WeightLabel({ cx, label, color }: { cx: number; label: string; color: string }) {
  return (
    <text
      x={cx}
      y={GLASS_BOT_Y + 20}
      textAnchor="middle"
      dominantBaseline="auto"
      fontSize={14}
      fontWeight={800}
      fill={color}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function GlassWater15ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildGlassWater15ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const highlightColor = isResult ? GREEN : ORANGE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: air saja = ${FULL_GLASS_G} − ${EMPTY_GLASS_G} = 300 g; setengah air = 150 g; gelas setengah penuh = ${EMPTY_GLASS_G} + 150 = ${HALF_FULL_G} g — jawaban D.`
      : `Explainer: water alone = ${FULL_GLASS_G} − ${EMPTY_GLASS_G} = 300 g; half water = 150 g; half-full glass = ${EMPTY_GLASS_G} + 150 = ${HALF_FULL_G} g — answer D.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(320, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* full glass — always 400 g */}
          <GlassVessel cx={GLASS_CXS[0]} fillFraction={beat.fills[0]} />
          <WeightLabel cx={GLASS_CXS[0]} label={`${FULL_GLASS_G} g`} color={INK} />

          {/* empty glass — always 100 g */}
          <GlassVessel cx={GLASS_CXS[1]} fillFraction={beat.fills[1]} />
          <WeightLabel cx={GLASS_CXS[1]} label={`${EMPTY_GLASS_G} g`} color={INK} />

          {/* question glass — half-full */}
          <GlassVessel cx={GLASS_CXS[2]} fillFraction={beat.fills[2]} />
          <WeightLabel
            cx={GLASS_CXS[2]}
            label={isResult ? `${HALF_FULL_G} g` : '?'}
            color={isResult ? GREEN : INK}
          />

          {/* highlight ring — drawn over the glasses */}
          <AnimatePresence>
            {beat.highlight >= 0 && (
              <motion.g
                key={`ring-${beat.highlight}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <HighlightRing cx={GLASS_CXS[beat.highlight]} color={highlightColor} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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
