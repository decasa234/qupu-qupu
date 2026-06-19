import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CastleShape,
  FlagpolePrimitive,
  SVG_W,
  SVG_H,
  GROUND_Y,
  POLE_X,
  POLE_HW,
  POLE_TOP_Y,
  POLE_BOT_Y,
  CASTLE_TOP_Y,
  CASTLE_W,
  COLOR,
} from './FlagpoleCastle22Illustration'
import { buildFlagpoleCastle22Steps } from './flagpoleCastle22Steps'

// IKMC-19-PE-Q22 — post-answer animation.
// Reuses the CastleShape and FlagpolePrimitive from the illustration so the
// animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro     — static scene, label the two given heights.
//   1. pole-len  — brace the full pole: 80 − 20 = 60 cm.
//   2. half      — show midpoint tick, upper-half brace: 60 ÷ 2 = 30 cm.
//   3. castle    — show castle-height arrow: 80 − 30 = 50 cm.
//   4. result    — 50 cm → C (green).

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const INK = COLOR.LABEL

// ── layout reuse from illustration ───────────────────────────────────────────
const FIG_W = Math.min(280, SVG_W)

// Midpoint Y in SVG coords (= castle top = 50 cm above ground)
const MID_Y = CASTLE_TOP_Y  // already set to 50 cm in illustration exports

// ── sub-components for the animated overlays ─────────────────────────────────

/** Bracket on the right of the pole spanning from botY to topY with label. */
function PoleBrace({ topY, botY, label, color }: { topY: number; botY: number; label: string; color: string }) {
  const x = POLE_X + POLE_HW + 18
  const midY = (topY + botY) / 2
  const tickLen = 6

  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      {/* vertical brace line */}
      <line x1={x} y1={topY} x2={x} y2={botY} />
      {/* top tick */}
      <line x1={x - tickLen} y1={topY} x2={x + tickLen} y2={topY} />
      {/* bottom tick */}
      <line x1={x - tickLen} y1={botY} x2={x + tickLen} y2={botY} />
      {/* label */}
      <text
        x={x + 8}
        y={midY}
        fill={color}
        fontSize={11}
        fontWeight={800}
        textAnchor="start"
        dominantBaseline="central"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Arrow + label showing the castle height on the left side. */
function CastleHeightArrow({ color }: { color: string }) {
  const x = POLE_X - CASTLE_W * 0.62
  const topY = MID_Y
  const botY = GROUND_Y
  const midY = (topY + botY) / 2
  const tickLen = 5

  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      {/* vertical line */}
      <line x1={x} y1={topY} x2={x} y2={botY} />
      {/* top arrow head */}
      <line x1={x - tickLen} y1={topY + 2} x2={x} y2={topY} />
      <line x1={x + tickLen} y1={topY + 2} x2={x} y2={topY} />
      {/* bottom arrow head */}
      <line x1={x - tickLen} y1={botY - 2} x2={x} y2={botY} />
      <line x1={x + tickLen} y1={botY - 2} x2={x} y2={botY} />
      {/* label */}
      <text
        x={x - 6}
        y={midY}
        fill={color}
        fontSize={12}
        fontWeight={800}
        textAnchor="end"
        dominantBaseline="central"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        50 cm
      </text>
    </g>
  )
}

/** Midpoint tick across the pole. */
function MidpointTick() {
  const halfW = 12
  return (
    <g>
      <line
        x1={POLE_X - POLE_HW - halfW}
        y1={MID_Y}
        x2={POLE_X + POLE_HW + halfW}
        y2={MID_Y}
        stroke={ORANGE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  )
}

/** The two given height labels (always shown in explainer). */
function HeightLabels() {
  return (
    <g fontSize={11} fontWeight={700} fill={INK} fontFamily="ui-sans-serif, system-ui, sans-serif">
      {/* 80 cm label */}
      <line x1={POLE_X + POLE_HW} y1={POLE_TOP_Y} x2={POLE_X + POLE_HW + 10} y2={POLE_TOP_Y} stroke={INK} strokeWidth={1.5} />
      <text x={POLE_X + POLE_HW + 13} y={POLE_TOP_Y} dominantBaseline="central" textAnchor="start">
        80 cm
      </text>
      {/* 20 cm label */}
      <line x1={POLE_X + POLE_HW} y1={POLE_BOT_Y} x2={POLE_X + POLE_HW + 10} y2={POLE_BOT_Y} stroke={INK} strokeWidth={1.5} />
      <text x={POLE_X + POLE_HW + 13} y={POLE_BOT_Y} dominantBaseline="central" textAnchor="start">
        20 cm
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function FlagpoleCastle22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFlagpoleCastle22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tiang panjangnya 80 − 20 = 60 cm; setengahnya 30 cm menjulang di atas istana; jadi puncak istana di 80 − 30 = 50 cm — jawaban C.'
      : 'Explainer: pole is 80 − 20 = 60 cm; half of it, 30 cm, sticks above the castle top; so the castle top is at 80 − 30 = 50 cm — answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* ground strip */}
          <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#8B6914" strokeWidth={2} />

          {/* castle */}
          <CastleShape topY={CASTLE_TOP_Y} />

          {/* flagpole + flag */}
          <FlagpolePrimitive />

          {/* static height labels always visible */}
          <HeightLabels />

          {/* beat-driven overlays */}

          {/* full-pole brace: beat pole-len */}
          <AnimatePresence>
            {beat.showFullPole && (
              <motion.g
                key="full-pole-brace"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <PoleBrace topY={POLE_TOP_Y} botY={POLE_BOT_Y} label="60 cm" color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* midpoint tick: beats half → result */}
          <AnimatePresence>
            {beat.showMidpoint && (
              <motion.g
                key="midpoint"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <MidpointTick />
              </motion.g>
            )}
          </AnimatePresence>

          {/* upper-half brace (30 cm above castle top): beat half */}
          <AnimatePresence>
            {beat.showUpperHalf && (
              <motion.g
                key="upper-half"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <PoleBrace topY={POLE_TOP_Y} botY={MID_Y} label="30 cm" color={ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* castle-height arrow (50 cm): beats castle + result */}
          <AnimatePresence>
            {beat.showCastleHeight && (
              <motion.g
                key="castle-height"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CastleHeightArrow color={isResult ? GREEN : ORANGE} />
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
