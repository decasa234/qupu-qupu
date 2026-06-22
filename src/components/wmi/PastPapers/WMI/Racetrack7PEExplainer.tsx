// IKMC-23-PE-Q7 — animated explainer for the racetrack tunnel problem.
//
// Reuses the road/tunnel layout and CarGlyph from Racetrack7PEIllustration.
// Beat-by-beat:
//   0. intro     — show the scene as-is (4 visible, tunnel opaque)
//   1. left cars — highlight 2 left cars; "Visible left: 2"
//   2. right cars— highlight all 4 visible; "2 + 2 = 4"
//   3. subtract  — "10 − 4 = 6" equation; tunnel pulsed
//   4. result    — tunnel reveals "6" badge; green accent

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '@/components/wmi/concepts/explainers/registry'
import { useBeatControl } from '@/components/wmi/concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  ROAD_Y,
  ROAD_H,
  TUNNEL_ZONE,
  COLOR,
  VISIBLE_CARS,
  CarGlyph,
} from './Racetrack7PEIllustration'
import { buildRacetrack7PESteps } from './racetrack7PESteps'

// ── Colours ───────────────────────────────────────────────────────────────────

const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const ORANGE = '#F59E0B'

// ── Sub-components ────────────────────────────────────────────────────────────

/** Road stripe component (reusable) */
function RoadStripes() {
  const STRIPE_H = 5
  const STRIPE_W = 18
  const STRIPE_GAP = 14
  const stripeY = ROAD_Y
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => (
        <rect
          key={`ls-${i}`}
          x={8 + i * (STRIPE_W + STRIPE_GAP)}
          y={stripeY - STRIPE_H / 2}
          width={STRIPE_W}
          height={STRIPE_H}
          rx={2}
          fill={COLOR.ROAD_STRIPE}
          opacity={0.7}
        />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <rect
          key={`rs-${i}`}
          x={TUNNEL_ZONE.x2 + 6 + i * (STRIPE_W + STRIPE_GAP)}
          y={stripeY - STRIPE_H / 2}
          width={STRIPE_W}
          height={STRIPE_H}
          rx={2}
          fill={COLOR.ROAD_STRIPE}
          opacity={0.7}
        />
      ))}
    </>
  )
}

/** Road + tunnel structure (static background) */
function RoadAndTunnel({
  tunnelAccent,
  showAnswer,
}: {
  tunnelAccent: string
  showAnswer: boolean
}) {
  const roadTop = ROAD_Y - ROAD_H / 2
  const roadBot = ROAD_Y + ROAD_H / 2
  const hillCx  = (TUNNEL_ZONE.x1 + TUNNEL_ZONE.x2) / 2
  const hillW   = TUNNEL_ZONE.x2 - TUNNEL_ZONE.x1
  const hillTop = 28
  const archW   = 30
  const archH   = 26

  return (
    <>
      {/* Ground */}
      <rect x={0} y={roadBot - 4} width={SVG_W} height={SVG_H - roadBot + 4} fill="#BBF7D0" />

      {/* Road */}
      <rect x={0} y={roadTop} width={SVG_W} height={ROAD_H} fill={COLOR.ROAD} />
      <line x1={0} y1={roadTop} x2={SVG_W} y2={roadTop} stroke={COLOR.ROAD_CURB} strokeWidth={2} />
      <line x1={0} y1={roadBot} x2={SVG_W} y2={roadBot} stroke={COLOR.ROAD_CURB} strokeWidth={2} />
      <RoadStripes />

      {/* Green hill */}
      <ellipse
        cx={hillCx}
        cy={hillTop + 30}
        rx={hillW / 2 + 10}
        ry={roadBot - hillTop - 10}
        fill={tunnelAccent}
      />
      <rect
        x={TUNNEL_ZONE.x1 - 2}
        y={roadTop}
        width={hillW + 4}
        height={ROAD_H}
        fill={tunnelAccent}
      />
      {/* Hill shading */}
      <ellipse cx={hillCx - hillW * 0.18} cy={hillTop + 20} rx={hillW * 0.18} ry={20} fill={COLOR.GRASS_DARK} opacity={0.35} />
      <ellipse cx={hillCx + hillW * 0.18} cy={hillTop + 20} rx={hillW * 0.18} ry={20} fill={COLOR.GRASS_DARK} opacity={0.35} />

      {/* Left tunnel portal */}
      <rect x={TUNNEL_ZONE.x1 - 2} y={roadTop} width={archW} height={ROAD_H} fill={COLOR.TUNNEL_ENTRANCE} />
      <ellipse cx={TUNNEL_ZONE.x1 + archW / 2 - 2} cy={roadTop} rx={archW / 2} ry={archH / 2} fill={COLOR.TUNNEL_ENTRANCE} />
      <path
        d={`M ${TUNNEL_ZONE.x1 - 2} ${roadBot} L ${TUNNEL_ZONE.x1 - 2} ${roadTop} A ${archW / 2} ${archH / 2} 0 0 1 ${TUNNEL_ZONE.x1 + archW - 2} ${roadTop} L ${TUNNEL_ZONE.x1 + archW - 2} ${roadBot}`}
        fill="none"
        stroke={COLOR.TUNNEL_ARCH}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Right tunnel portal */}
      <rect x={TUNNEL_ZONE.x2 - archW + 2} y={roadTop} width={archW} height={ROAD_H} fill={COLOR.TUNNEL_ENTRANCE} />
      <ellipse cx={TUNNEL_ZONE.x2 - archW / 2 + 2} cy={roadTop} rx={archW / 2} ry={archH / 2} fill={COLOR.TUNNEL_ENTRANCE} />
      <path
        d={`M ${TUNNEL_ZONE.x2 - archW + 2} ${roadBot} L ${TUNNEL_ZONE.x2 - archW + 2} ${roadTop} A ${archW / 2} ${archH / 2} 0 0 1 ${TUNNEL_ZONE.x2 + 2} ${roadTop} L ${TUNNEL_ZONE.x2 + 2} ${roadBot}`}
        fill="none"
        stroke={COLOR.TUNNEL_ARCH}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Inside tunnel: show "?" or answer badge */}
      {!showAnswer && (
        <text
          x={hillCx}
          y={ROAD_Y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill="#CBD5E1"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          opacity={0.6}
        >
          ?
        </text>
      )}

      {/* Hill label */}
      <text
        x={hillCx}
        y={hillTop + 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill="#FFFFFF"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing={0.5}
      >
        TEROWONGAN
      </text>
    </>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Racetrack7PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRacetrack7PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult   = beat.result
  const isSubtract = beat.phase === 'subtract'
  const accentColor = isResult ? GREEN : isSubtract ? ORANGE : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : isSubtract
      ? { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
      : { background: '#DBEAFE', borderColor: BLUE, color: BLUE }

  // Green hill accent on result beat
  const tunnelFill = isResult ? '#4ADE80' : isSubtract ? '#86EFAC' : COLOR.GRASS

  const hillCx = (TUNNEL_ZONE.x1 + TUNNEL_ZONE.x2) / 2

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 4 mobil terlihat (2 kiri + 2 kanan). Mobil di terowongan = 10 − 4 = 6. Jawaban B.'
      : 'Explainer: 4 cars visible (2 left + 2 right). Cars in tunnel = 10 − 4 = 6. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* SVG Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* Road + tunnel */}
          <RoadAndTunnel tunnelAccent={tunnelFill} showAnswer={isResult} />

          {/* Answer badge inside tunnel (result beat) */}
          <AnimatePresence>
            {isResult && (
              <motion.g
                key="answer-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <circle cx={hillCx} cy={ROAD_Y} r={20} fill={GREEN} />
                <text
                  x={hillCx}
                  y={ROAD_Y - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={18}
                  fontWeight={900}
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  6
                </text>
                <text
                  x={hillCx}
                  y={ROAD_Y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8}
                  fontWeight={700}
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? 'mobil' : 'cars'}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Visible cars — highlighted or dimmed */}
          {VISIBLE_CARS.map((car, i) => {
            const isHighlighted = beat.highlighted.includes(i)
            const isLeft = car.side === 'left'
            // On count-left beat, only left cars are highlighted
            const dimRight = beat.phase === 'count' && beat.visibleCount === 2 && !isLeft
            return (
              <motion.g
                key={i}
                animate={{
                  opacity: dimRight ? 0.35 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <CarGlyph cx={car.cx} cy={car.cy} fill={car.fill} />
                {/* Highlight ring */}
                {isHighlighted && (
                  <AnimatePresence>
                    <motion.circle
                      key={`ring-${i}-${beat.phase}`}
                      cx={car.cx}
                      cy={car.cy}
                      r={20}
                      fill="none"
                      stroke={accentColor}
                      strokeWidth={2.5}
                      initial={{ r: 14, opacity: 0 }}
                      animate={{ r: 20, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                    />
                  </AnimatePresence>
                )}
              </motion.g>
            )
          })}

          {/* Running count badge (visible cars) */}
          <AnimatePresence mode="wait">
            {beat.visibleCount > 0 && (
              <motion.g
                key={`count-${beat.visibleCount}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              >
                {/* Badge at top-left */}
                <rect x={6} y={6} width={70} height={22} rx={11} fill={accentColor} opacity={0.92} />
                <text
                  x={41}
                  y={17}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={800}
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id'
                    ? `terlihat: ${beat.visibleCount}`
                    : `visible: ${beat.visibleCount}`}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* "10 cars total" badge top-right */}
          <rect x={SVG_W - 86} y={8} width={78} height={22} rx={11} fill="#DBEAFE" />
          <text
            x={SVG_W - 47}
            y={19}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill="#1E3A8A"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {lang === 'id' ? '10 mobil' : '10 cars'}
          </text>
        </svg>

        {/* Equation pill */}
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
                style={{ background: accentColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
