/**
 * SEAMO-16-A-Q12 — post-answer explainer:
 * "How many ways to put 20 oranges into 3 baskets, each with an even count?"
 *
 * Animation beats:
 *   0. intro    — show 3 baskets; state the counting task.
 *   1. reframe  — display equation chip: 2a+2b+2c=20 → a+b+c=10.
 *   2. group0   — reveal 6 partitions that include a 0.
 *   3. group2   — reveal 3 more partitions (smallest = 2).
 *   4. result   — 6+3=9 → answer B (green).
 *
 * Reuses OrangeGlyph, BasketGlyph, BASKET_CX, BASELINE_Y, SVG_W, SVG_H, C
 * from ./OrangeBaskets16A12Illustration.
 *
 * Pure render (animation via framer-motion). SSR-safe static fallback.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  OrangeGlyph,
  BasketGlyph as _BasketGlyph,
  BASKET_CX,
  BASELINE_Y,
  SVG_W,
  SVG_H,
  C,
} from './OrangeBaskets16A12Illustration'
import {
  buildOrangeBaskets16A12Steps,
  PARTITION_GROUPS,
} from './orangeBaskets16A12Steps'

// re-export so the explainer can use BasketGlyph inline
import { BasketGlyph } from './Baskets10PEIllustration'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE      = '#2563EB'
const BLUE_BG   = '#EFF6FF'
const GREEN     = '#16A34A'
const GREEN_BG  = '#DCFCE7'
const GREEN_TXT = '#14532D'
const AMBER     = '#D97706'
const AMBER_BG  = '#FEF3C7'
const AMBER_TXT = '#78350F'
const TEAL      = '#0D9488'
const TEAL_BG   = '#CCFBF1'
const TEAL_TXT  = '#134E4A'

const GROUP_COLORS = [AMBER, TEAL] as const

const FIG_W = Math.min(360, SVG_W)

// ── PartitionList: shows rows of partition triples ───────────────────────────

interface PartitionListProps {
  lines: readonly string[]
  activeGroup: -1 | 0 | 1
}

function PartitionList({ lines, activeGroup }: PartitionListProps) {
  const group0Len = PARTITION_GROUPS[0].length
  return (
    <div className="flex w-full flex-col gap-1">
      {lines.map((line, i) => {
        const group = i < group0Len ? 0 : 1
        const color = GROUP_COLORS[group]
        const isActive = activeGroup === -1 || activeGroup === group
        return (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: isActive ? 1 : 0.35, x: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 rounded-lg px-3 py-1 font-mono text-sm font-semibold"
            style={{
              background: isActive ? (group === 0 ? AMBER_BG : TEAL_BG) : '#F9FAFB',
              color: isActive ? (group === 0 ? AMBER_TXT : TEAL_TXT) : '#9CA3AF',
              borderLeft: `3px solid ${isActive ? color : '#E5E7EB'}`,
            }}
          >
            <span style={{ color: isActive ? color : '#D1D5DB' }}>
              {i + 1}.
            </span>
            {line}
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function OrangeBaskets16A12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOrangeBaskets16A12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : beat.phase === 'group0'
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_TXT }
      : beat.phase === 'group2'
        ? { background: TEAL_BG, borderColor: TEAL, color: TEAL_TXT }
        : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const equationColor = isResult ? GREEN : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: daftarkan partisi bilangan genap dari 20 menjadi 3 bagian. Kelompok dengan 0: 6 cara. Kelompok dengan minimum 2: 3 cara. Total = 9 cara — jawaban B.'
      : 'Explainer: list even partitions of 20 into 3 parts. Group with 0: 6 ways. Group with min 2: 3 ways. Total = 9 ways — answer B.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure: 3 baskets with orange glyphs */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Total constraint banner */}
          <rect
            x={SVG_W / 2 - 66}
            y={4}
            width={132}
            height={22}
            rx={11}
            fill={C.TOTAL_BG}
            stroke={C.TOTAL_TEXT}
            strokeWidth={1.5}
          />
          <text
            x={SVG_W / 2}
            y={15}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={C.TOTAL_TEXT}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Total = 20 oranges
          </text>

          {(BASKET_CX as readonly number[]).map((cx, i) => (
            <g key={i}>
              <BasketGlyph cx={cx} baseY={BASELINE_Y} type={3} />
              <OrangeGlyph cx={cx} cy={BASELINE_Y - 105} r={12} />
              <text
                x={cx}
                y={BASELINE_Y + 14}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize={11}
                fontWeight={700}
                fill={C.LABEL_DARK}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>

        {/* Equation chip */}
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
                style={{ background: equationColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Partition list */}
        <AnimatePresence>
          {beat.lines.length > 0 && (
            <motion.div
              key="partition-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <PartitionList lines={beat.lines} activeGroup={beat.activeGroup} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtotal chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.subtotal !== '' && (
              <motion.span
                key={beat.subtotal}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{
                  background:
                    beat.phase === 'group0' ? AMBER :
                    beat.phase === 'group2' ? GREEN :
                    BLUE,
                }}
              >
                {beat.subtotal}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
