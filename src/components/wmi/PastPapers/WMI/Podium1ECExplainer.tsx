import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  RunnerFigure,
  RUNNERS,
  SVG_W,
  SVG_H,
  GROUND_Y,
  BLOCK_W,
  COLOR,
} from './Podium1ECIllustration'
import { buildPodium1ECSteps, PODIUM_CHOICE } from './podium1ECSteps'

// IKMC-19-EC-Q1 — post-answer animation.
// Reuses RunnerFigure and layout constants from Podium1ECIllustration so the
// animation reads as the static podium coming alive.
//
// Beats:
//   0. intro  — full podium, no highlights.
//   1. rank1  — C highlighted (amber) → 1st place badge.
//   2. rank2  — D highlighted → 2nd place badge.
//   3. rank3  — E highlighted → 3rd place badge.  ← ANSWER
//   4. result — E stays amber, green caption.

// ── colour tokens ─────────────────────────────────────────────────────────
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const AMBER_STROKE = '#D97706'
const GOLD = '#F59E0B'

// ── Podium step (redrawn for explainer with highlight support) ────────────

function PodiumStep({ cx, stepH, highlighted }: { cx: number; stepH: number; highlighted: boolean }) {
  const x = cx - BLOCK_W / 2
  const y = GROUND_Y - stepH
  return (
    <rect
      x={x}
      y={y}
      width={BLOCK_W}
      height={stepH}
      fill={highlighted ? '#FEF9C3' : COLOR.STEP_FILL}
      stroke={highlighted ? AMBER_STROKE : COLOR.STEP_STROKE}
      strokeWidth={highlighted ? 2.5 : 2}
      strokeLinejoin="round"
    />
  )
}

// ── Rank badge overlay ────────────────────────────────────────────────────

/** Badge that floats above the runner's head when they are identified. */
function RankBadge({ cx, stepH, rankLabel }: { cx: number; stepH: number; rankLabel: string }) {
  const feetY = GROUND_Y - stepH
  const headTopY = feetY - 44 - 12 * 2 - 1 - 12  // above head
  const badgeY = headTopY - 22

  return (
    <g>
      {/* connector line */}
      <line x1={cx} y1={badgeY + 18} x2={cx} y2={headTopY + 2} stroke={GOLD} strokeWidth={1.5} strokeDasharray="3 2" />
      {/* badge pill */}
      <rect x={cx - 18} y={badgeY} width={36} height={18} rx={9} fill={GOLD} />
      <text
        x={cx}
        y={badgeY + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {rankLabel}
      </text>
    </g>
  )
}

// ── Runner letter badge (below ground) ───────────────────────────────────

function RunnerBadge({ cx, label, highlighted }: { cx: number; label: string; highlighted: boolean }) {
  const badgeW = 22
  const badgeH = 18
  const y = GROUND_Y + 4
  return (
    <g>
      <rect
        x={cx - badgeW / 2}
        y={y}
        width={badgeW}
        height={badgeH}
        rx={4}
        fill={highlighted ? AMBER_STROKE : COLOR.RUNNER_BG}
      />
      <text
        x={cx}
        y={y + badgeH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────

export default function Podium1ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPodium1ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const highlighted = new Set(beat.highlight)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tangga tertinggi = peringkat 1 (C), kedua = peringkat 2 (D), ketiga = peringkat 3 (E). Jawabannya ${PODIUM_CHOICE}.`
      : `Explainer: tallest step = 1st place (C), second = 2nd (D), third-tallest step = 3rd place (E). The answer is ${PODIUM_CHOICE}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* podium figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* ground strip */}
          <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND_FILL} />
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke={COLOR.GROUND_LINE} strokeWidth={2} />

          {/* podium steps — tallest first */}
          {[...RUNNERS].sort((a, b) => b.stepH - a.stepH).map(({ label, cx, stepH }) => (
            <PodiumStep key={label} cx={cx} stepH={stepH} highlighted={highlighted.has(label)} />
          ))}

          {/* runner figures */}
          {RUNNERS.map(({ label, cx, stepH }) => (
            <RunnerFigure key={label} cx={cx} stepH={stepH} highlight={highlighted.has(label)} />
          ))}

          {/* rank badges (animated) */}
          <AnimatePresence>
            {beat.rankLabel !== '' &&
              RUNNERS.filter(({ label }) => highlighted.has(label)).map(({ label, cx, stepH }) => (
                <motion.g
                  key={`rank-${label}-${beat.phase}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <RankBadge cx={cx} stepH={stepH} rankLabel={beat.rankLabel} />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* runner letter badges below ground */}
          {RUNNERS.map(({ label, cx }) => (
            <RunnerBadge key={label} cx={cx} label={label} highlighted={highlighted.has(label)} />
          ))}
        </svg>

        {/* caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

export { PODIUM_ANSWER } from './podium1ECSteps'
