import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  HousePrimitive,
  LEFT_HOUSE_SLOTS,
  RIGHT_HOUSE_SLOTS,
  SVG_W,
  SVG_H,
  LEFT_OFFSET_X,
  RIGHT_OFFSET_X,
  CIRCLE_POS,
  type CircleSlot,
} from './PaintedHouses17PEIllustration'
import { buildPaintedHouses17PESteps } from './paintedHouses17PESteps'

// IKMC-22-PE-Q17 — post-answer explainer: find the painted-over "?".
//
// Strategy:
//   1. Left house shows 6+2+5=13 → painted circles sum = 7.
//   2. Right house shows 3+1+painted(7) = 11 visible.
//   3. ? = 20 − 11 = 9.
//
// Reuses HousePrimitive from the illustration, adding:
//   - coloured highlight rings around the active house body
//   - an equation strip above/on each house
//   - answer reveal (? → 9) on the result beat

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

// ── Answer-reveal slot set for right house ─────────────────────────────────────
const RIGHT_HOUSE_ANSWER_SLOTS: CircleSlot[] = [
  { kind: 'num', label: '3' },
  { kind: 'painted' },
  { kind: 'painted' },
  { kind: 'num', label: '1' },
  { kind: 'num', label: '9' },   // reveal the answer
]

// ── Highlight ring around a house ─────────────────────────────────────────────
function HouseHighlight({ color }: { color: string }) {
  return (
    <rect
      x={2}
      y={2}
      width={86}
      height={97}
      rx={6}
      ry={6}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="6 3"
    />
  )
}

// ── Equation badge drawn above a house ───────────────────────────────────────
function HouseEquation({
  text,
  color,
  offsetX,
}: {
  text: string
  color: string
  offsetX: number
}) {
  // centred at x=45 within the house, converted to SVG coords
  const cx = offsetX + 45
  return (
    <g>
      <rect
        x={cx - 44}
        y={1}
        width={88}
        height={16}
        rx={5}
        fill={color}
        opacity={0.18}
      />
      <text
        x={cx}
        y={9}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {text}
      </text>
    </g>
  )
}

// ── Painted-circle sum annotation (right house) ──────────────────────────────
// A small bracket/brace connecting the two painted circles, labelled "sum=7"
function PaintedSumAnnotation({ offsetX, color }: { offsetX: number; color: string }) {
  // The two painted circles in the RIGHT house are at indices 1 and 2 of CIRCLE_POS
  // (left-wall: cx=6,cy=55 and bottom-left: cx=14,cy=90 in house-local coords)
  const p1 = CIRCLE_POS[1]
  const p2 = CIRCLE_POS[2]

  const sx = offsetX + Math.min(p1.cx, p2.cx) - 14
  const y1 = 5 + p1.cy  // +5 for translate(x, 5)
  const y2 = 5 + p2.cy
  const midY = (y1 + y2) / 2

  return (
    <g stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round">
      {/* vertical brace */}
      <line x1={sx} y1={y1} x2={sx} y2={y2} />
      <line x1={sx} y1={y1} x2={sx + 5} y2={y1} />
      <line x1={sx} y1={y2} x2={sx + 5} y2={y2} />
      {/* label */}
      <text
        x={sx - 2}
        y={midY}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={8}
        fontWeight={800}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        sum=7
      </text>
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function PaintedHouses17PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPaintedHouses17PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: rumah kiri 6+2+5=13, lingkaran cat berjumlah 7; rumah kanan 3+7+1=11; tanda tanya = 20−11 = 9 — jawaban D.'
      : 'Explainer: left house 6+2+5=13, painted circles sum to 7; right house 3+7+1=11; question mark = 20−11 = 9 — answer D.'

  // Which house slots to use for the right house
  const rightSlots = beat.showAnswer ? RIGHT_HOUSE_ANSWER_SLOTS : RIGHT_HOUSE_SLOTS

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* left house */}
          <g transform={`translate(${LEFT_OFFSET_X}, 5)`}>
            <HousePrimitive
              slots={LEFT_HOUSE_SLOTS}
              highlightBody={beat.highlightLeft ? '#FFF7E6' : undefined}
            />
            {/* highlight ring */}
            <AnimatePresence>
              {beat.highlightLeft && (
                <motion.g
                  key="left-ring"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <HouseHighlight color={ORANGE} />
                </motion.g>
              )}
            </AnimatePresence>
          </g>

          {/* left house equation badge */}
          <AnimatePresence>
            {beat.showLeftEq && (
              <motion.g
                key="left-eq"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <HouseEquation
                  text="6+2+5=13 → painted=7"
                  color={ORANGE}
                  offsetX={LEFT_OFFSET_X}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* right house */}
          <g transform={`translate(${RIGHT_OFFSET_X}, 5)`}>
            <HousePrimitive
              slots={rightSlots}
              highlightBody={beat.highlightRight ? '#ECFDF5' : undefined}
            />
            {/* highlight ring */}
            <AnimatePresence>
              {beat.highlightRight && (
                <motion.g
                  key="right-ring"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <HouseHighlight color={isResult ? GREEN : BLUE} />
                </motion.g>
              )}
            </AnimatePresence>
          </g>

          {/* right house equation / painted-sum annotation */}
          <AnimatePresence>
            {beat.showRightEq && (
              <motion.g
                key="right-eq"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <PaintedSumAnnotation offsetX={RIGHT_OFFSET_X} color={BLUE} />
                <HouseEquation
                  text="3 + 7 + 1 = 11"
                  color={BLUE}
                  offsetX={RIGHT_OFFSET_X}
                />
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
