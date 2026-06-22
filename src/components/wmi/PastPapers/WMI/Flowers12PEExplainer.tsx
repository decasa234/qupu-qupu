import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FlowerPE,
  LARGE_PETALS,
  SMALL_PETALS,
  COLOR,
  SVG_W,
  SVG_H,
} from './Flowers12PEIllustration'
import { buildFlowers12PESteps } from './flowers12PESteps'

// IKMC-20-PE-Q12 — post-answer animation.
// Reuses FlowerPE and shared primitives from the illustration.
//
// Animation beats (see flowers12PESteps.ts):
//   0. intro         — static scene, equal-sum rule stated.
//   1. sum-flower1   — ring around large flower; show 1+3+5+7+9=25.
//   2. sum-flower2   — ring around small flower; show 2+4+6+8=20.
//   3. compute       — both flowers ringed; show 25−20=5.
//   4. result        — hidden petal reveals 5 (green).

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const PINK = '#E91E8C'
const RING_LARGE = '#F59E0B'  // amber ring around large flower
const RING_SMALL = '#6366F1'  // indigo ring around small flower

// ── layout ────────────────────────────────────────────────────────────────────
const FIG_W = Math.min(340, SVG_W)

const LARGE_CX = 130
const LARGE_CY = 148
const SMALL_CX = 193
const SMALL_CY = 98

// ── sub-components ────────────────────────────────────────────────────────────

/** Highlight ring around a flower. */
function FlowerRing({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="6 4"
    />
  )
}

/** Equation pill rendered below the SVG. */
function EquationPill({ text, isResult }: { text: string; isResult: boolean }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl px-5 py-1.5 font-display text-base font-black tabular-nums text-white"
      style={{ background: isResult ? GREEN : PINK }}
    >
      {text}
    </motion.div>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Flowers12PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFlowers12PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#FFF0F7', borderColor: PINK, color: '#9D174D' }

  // Small flower petals: on result beat, replace "?" with "5"
  const smallPetalsResolved: Array<{ angleDeg: number; label: string; hidden?: boolean }> = isResult
    ? [...SMALL_PETALS].map((p) => ({
        angleDeg: p.angleDeg,
        label: 'hidden' in p && p.hidden ? '5' : p.label,
        hidden: false,
      }))
    : [...SMALL_PETALS]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bunga besar penjumlahan 1+3+5+7+9=25; bunga kecil 2+4+6+8=20; kelopak tersembunyi = 25−20 = 5; jawaban C.'
      : 'Explainer: large flower sum 1+3+5+7+9=25; small flower 2+4+6+8=20; hidden petal = 25−20 = 5; answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* large flower */}
          <FlowerPE
            cx={LARGE_CX}
            cy={LARGE_CY}
            petalR={42}
            petalRy={27}
            centerR={22}
            petals={LARGE_PETALS}
          />

          {/* small flower (with answer revealed on result beat) */}
          <FlowerPE
            cx={SMALL_CX}
            cy={SMALL_CY}
            petalR={30}
            petalRy={19}
            centerR={16}
            petals={smallPetalsResolved}
          />

          {/* highlight ring — large flower */}
          <AnimatePresence>
            {beat.highlightLarge && (
              <motion.g
                key="ring-large"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35 }}
                style={{ transformOrigin: `${LARGE_CX}px ${LARGE_CY}px` }}
              >
                <FlowerRing cx={LARGE_CX} cy={LARGE_CY} r={68} color={RING_LARGE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* highlight ring — small flower */}
          <AnimatePresence>
            {beat.highlightSmall && (
              <motion.g
                key="ring-small"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35 }}
                style={{ transformOrigin: `${SMALL_CX}px ${SMALL_CY}px` }}
              >
                <FlowerRing cx={SMALL_CX} cy={SMALL_CY} r={48} color={RING_SMALL} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation pill */}
        <div className="flex min-h-[2.5rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <EquationPill key={beat.equation} text={beat.equation} isResult={isResult} />
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
