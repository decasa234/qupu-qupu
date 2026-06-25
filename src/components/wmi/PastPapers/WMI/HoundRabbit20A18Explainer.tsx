// SEAMO-20-A-Q18 — Explainer: hound chasing rabbit (relative speed).
//
// Beat-by-beat walkthrough:
//   1. Show initial layout (hound 30 m behind rabbit).
//   2. Hound speed: 60 ÷ 4 = 15 m/s.
//   3. Rabbit speed: 20 ÷ 2 = 10 m/s.
//   4. Closing speed = 15 − 10 = 5 m/s.
//   5. Time = 30 ÷ 5 = 6 s — answer D.
//
// Adapted from CarsLane9ECExplainer (beat-caption chip pattern) and
// AgeAlice19B7Explainer (useBeatControl + caption chip).
// Diagram: re-renders HoundGlyph + RabbitGlyph from HoundRabbit20A18Illustration
// at animated track positions based on elapsed time.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HoundGlyph, RabbitGlyph, TRACK } from './HoundRabbit20A18Illustration'
import {
  buildHoundRabbit20A18Steps,
  HOUND_SPEED,
  RABBIT_SPEED,
  GAP,
  CATCH_TIME,
} from './houndRabbit20A18Steps'

// ── Palette ──────────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#1D4ED8'
const BLUE_BG = '#EFF6FF'

const C = {
  ROAD: '#F1F5F9',
  ROAD_STROKE: '#CBD5E1',
  GAP_LINE: '#3B82F6',
  GAP_TEXT: '#1D4ED8',
  SPEED_H: '#92400E',   // hound speed label
  SPEED_R: '#D97706',   // rabbit speed label
  INK: '#1F2937',
} as const

const FONT = 'ui-sans-serif, system-ui, sans-serif'

// ── Diagram ───────────────────────────────────────────────────────────────────

/**
 * Re-renders the track figure with animated hound and rabbit positions
 * for a given beat. `elapsed` = seconds gone, 0 = initial positions.
 */
function TrackDiagram({
  elapsed,
  showSpeeds,
  lang,
}: {
  elapsed: number
  showSpeeds: boolean
  lang: 'en' | 'id'
}) {
  const { SVG_W, SVG_H, LANE_Y, LANE_H } = TRACK

  // Convert real metres to SVG pixels.
  // Total track visible = SVG_W − 2*pad metres (visual).
  // Hound starts at x=80, rabbit at x=80+GAP_PX.
  // We define 1 m = 4 px so 30 m gap = 120 px.
  const PX_PER_M = 3.2

  const houndX0 = 70
  const rabbitX0 = houndX0 + GAP * PX_PER_M   // ≈ 166 px from left
  const ANIMAL_CY = LANE_Y + LANE_H * 0.42

  const houndX = houndX0 + HOUND_SPEED * elapsed * PX_PER_M
  const rabbitX = rabbitX0 + RABBIT_SPEED * elapsed * PX_PER_M

  // Clamp so they don't run off canvas
  const maxX = SVG_W - 30
  const hCX = Math.min(houndX, maxX)
  const rCX = Math.min(rabbitX, maxX)

  const gapPx = Math.max(0, rCX - hCX)
  const braceY = LANE_Y + LANE_H + 14
  const midBrace = (hCX + 24 + rCX - 18) / 2

  const gapMetres = elapsed === 0 ? GAP : Math.max(0, GAP - (HOUND_SPEED - RABBIT_SPEED) * elapsed)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      style={{ display: 'block', maxWidth: '100%' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#FFFFFF" />

      {/* road */}
      <rect x={0} y={LANE_Y} width={SVG_W} height={LANE_H} fill={C.ROAD} stroke={C.ROAD_STROKE} strokeWidth={1.5} />
      <line
        x1={12} y1={LANE_Y + LANE_H / 2}
        x2={SVG_W - 12} y2={LANE_Y + LANE_H / 2}
        stroke={C.ROAD_STROKE} strokeWidth={1.5}
        strokeDasharray="10 7" strokeLinecap="round"
      />

      {/* animals */}
      <HoundGlyph cx={hCX} cy={ANIMAL_CY} />
      <RabbitGlyph cx={rCX} cy={ANIMAL_CY} />

      {/* speed labels (shown from beat 2 onward) */}
      {showSpeeds && (
        <>
          <text x={hCX} y={LANE_Y - 18} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.SPEED_H} fontFamily={FONT}>
            {HOUND_SPEED} m/s
          </text>
          <text x={rCX} y={LANE_Y - 18} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.SPEED_R} fontFamily={FONT}>
            {RABBIT_SPEED} m/s
          </text>
        </>
      )}

      {/* gap brace (only show when gap > 12 px) */}
      {gapPx > 12 && (
        <>
          <line x1={hCX + 24} y1={braceY} x2={rCX - 18} y2={braceY} stroke={C.GAP_LINE} strokeWidth={1.8} />
          <line x1={hCX + 24} y1={braceY - 5} x2={hCX + 24} y2={braceY + 5} stroke={C.GAP_LINE} strokeWidth={1.8} />
          <line x1={rCX - 18} y1={braceY - 5} x2={rCX - 18} y2={braceY + 5} stroke={C.GAP_LINE} strokeWidth={1.8} />
          <text x={midBrace} y={braceY + 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.GAP_TEXT} fontFamily={FONT}>
            {Math.round(gapMetres)} m
          </text>
        </>
      )}

      {/* "caught!" marker when elapsed = CATCH_TIME */}
      {elapsed === CATCH_TIME && (
        <text
          x={(hCX + rCX) / 2}
          y={LANE_Y - 6}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill={GREEN}
          fontFamily={FONT}
        >
          {lang === 'id' ? '✓ Tertangkap!' : '✓ Caught!'}
        </text>
      )}
    </svg>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function HoundRabbit20A18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHoundRabbit20A18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showSpeeds = beat.phase === 'speeds' || beat.phase === 'closing' || beat.phase === 'time' || beat.phase === 'result'

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kecepatan mendekat 15−10=5 m/detik; waktu=30÷5=6 detik. Jawaban D.`
      : `Explainer: closing speed 15−10=5 m/s; time=30÷5=6 seconds. Answer D.`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Animated track diagram */}
        <motion.div
          key={`track-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <TrackDiagram elapsed={beat.elapsed} showSpeeds={showSpeeds} lang={lang} />
        </motion.div>

        {/* Caption chip */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
