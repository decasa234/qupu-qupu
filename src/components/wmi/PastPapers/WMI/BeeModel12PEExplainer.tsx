// IKMC-23-PE-Q12 — Post-answer animated explainer.
//
// Reuses BeePrimitive + LEGEND + colour tokens from BeeModel12PEIllustration
// so the animation reads as the same scene coming alive.
//
// Beats:
//   0. intro     — show both bees, question framing.
//   1. flower    — highlight flower antenna (cost 2) missing from left bee.
//   2. smile     — highlight smile (cost 5) missing.
//   3. sunEye    — highlight sun-eye (cost 6) missing.
//   4. sum       — show all parts on left bee, display 2+5+6=13.
//   5. result    — 13 → Answer E (green).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BeePrimitive,
  LegendIcon,
  LEGEND,
  LEFT_BEE,
  RIGHT_BEE,
  RIGHT_BEE_PARTS,
  SVG_W,
  SVG_H,
  TABLE_X,
  TABLE_Y,
  COLOR,
  type BeePart,
} from './BeeModel12PEIllustration'
import { buildBeeModel12PESteps } from './beeModel12PESteps'

// ── Palette tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'

const ROW_H    = 30
const COL_ICON = 20
const COL_COST = 20
const TABLE_W  = COL_ICON + COL_COST

// ── Legend with highlight support ────────────────────────────────────────────

function AnimatedLegend({ highlight }: { highlight: BeePart | null }) {
  return (
    <g>
      <rect
        x={TABLE_X - 2}
        y={TABLE_Y - 2}
        width={TABLE_W + 4}
        height={LEGEND.length * ROW_H + 4}
        fill={COLOR.TABLE_BG}
        stroke={COLOR.TABLE_BORDER}
        strokeWidth={1.5}
        rx={3}
      />
      {LEGEND.map(({ part, cost }, i) => {
        const rowY  = TABLE_Y + i * ROW_H + ROW_H / 2
        const iconX = TABLE_X + COL_ICON / 2
        const costX = TABLE_X + COL_ICON + COL_COST / 2
        const isHighlight = part === highlight

        return (
          <g key={part} opacity={highlight && !isHighlight ? 0.35 : 1}>
            {i > 0 && (
              <line
                x1={TABLE_X - 2}
                y1={TABLE_Y + i * ROW_H - 2}
                x2={TABLE_X + TABLE_W + 2}
                y2={TABLE_Y + i * ROW_H - 2}
                stroke={COLOR.TABLE_BORDER}
                strokeWidth={0.8}
              />
            )}
            <line
              x1={TABLE_X + COL_ICON}
              y1={TABLE_Y + i * ROW_H - 2}
              x2={TABLE_X + COL_ICON}
              y2={TABLE_Y + (i + 1) * ROW_H - 2}
              stroke={COLOR.TABLE_BORDER}
              strokeWidth={0.8}
            />
            {/* amber highlight row background */}
            {isHighlight && (
              <rect
                x={TABLE_X - 2}
                y={TABLE_Y + i * ROW_H - 2}
                width={TABLE_W + 4}
                height={ROW_H}
                fill={AMBER_BG}
                opacity={0.7}
                rx={2}
              />
            )}
            <LegendIcon part={part} x={iconX} y={rowY} />
            <text
              x={costX}
              y={rowY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={isHighlight ? 900 : 700}
              fill={isHighlight ? AMBER_INK : COLOR.COST_FILL}
              fontFamily="Nunito, sans-serif"
            >
              {cost}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

export default function BeeModel12PEExplainer(props: ExplainerProps) {
  const lang    = props.lang ?? 'id'
  const story   = useMemo(() => buildBeeModel12PESteps(lang), [lang])
  const index   = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat    = story.steps[index] ?? story.steps[story.finalIndex]
  const T       = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Raha membutuhkan 2 + 5 + 6 = 13 poin untuk melengkapi lebah. Jawaban E = 13.'
      : 'Explainer: Raha needs 2 + 5 + 6 = 13 points to complete the bee. Answer E = 13.'

  // Build left bee parts set from the step data
  const leftParts = new Set(beat.leftPartsShown as BeePart[])

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Heading */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: beat.result ? GREEN : BLUE }}
        >
          {beat.result
            ? T('Bee complete! Answer E = 13 points', 'Lebah lengkap! Jawaban E = 13 poin')
            : beat.highlight
              ? T('Missing part found!', 'Bagian yang hilang ditemukan!')
              : T('Compare the two bees', 'Bandingkan dua lebah')}
        </div>

        {/* SVG figure */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={Math.min(360, SVG_W)}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

            {/* Left bee (animates its parts set) */}
            <BeePrimitive
              cx={LEFT_BEE.cx}
              cy={LEFT_BEE.cy}
              parts={leftParts}
              showFacePlaceholder={!leftParts.has('sunEye')}
            />

            {/* Amber circle around highlighted missing part on left bee */}
            <AnimatePresence>
              {beat.highlight === 'flower' && (
                <motion.circle
                  key="hl-flower"
                  cx={LEFT_BEE.cx - 12}
                  cy={LEFT_BEE.cy - 68}
                  r={12}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              {beat.highlight === 'smile' && (
                <motion.ellipse
                  key="hl-smile"
                  cx={LEFT_BEE.cx}
                  cy={LEFT_BEE.cy - 50}
                  rx={14}
                  ry={10}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              {beat.highlight === 'sunEye' && (
                <motion.circle
                  key="hl-sun"
                  cx={LEFT_BEE.cx}
                  cy={LEFT_BEE.cy - 58}
                  r={14}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Legend table (centre) */}
            <AnimatedLegend highlight={beat.highlight as BeePart | null} />

            {/* Right bee (always complete model) */}
            <BeePrimitive
              cx={RIGHT_BEE.cx}
              cy={RIGHT_BEE.cy}
              parts={RIGHT_BEE_PARTS}
            />
          </svg>
        </motion.div>

        {/* Running total badge */}
        {beat.runningTotal !== null && (
          <motion.div
            key={`total-${beat.runningTotal}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div
              className="flex h-9 items-center justify-center rounded-lg px-3 font-display text-lg font-extrabold text-white"
              style={{ background: beat.result ? GREEN : AMBER }}
            >
              {beat.runningTotal}
            </div>
            <span className="font-display text-sm font-extrabold" style={{ color: AMBER_INK }}>
              {T('points so far', 'poin sejauh ini')}
            </span>
          </motion.div>
        )}

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            key="answer"
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-display text-base font-extrabold"
            style={{ background: GREEN_BG, color: GREEN_INK, border: `2px solid ${GREEN}` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {T('Answer E = 13', 'Jawaban E = 13')}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="min-h-[48px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
