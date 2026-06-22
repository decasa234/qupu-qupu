import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BuildingShape,
  LadderShape,
  SVG_W,
  SVG_H,
  GROUND_Y,
  ROOF_Y,
  N_FLOORS,
  FLOOR_H_PX,
  BLDG_X,
  BLDG_W,
  UNITS_PER_FLOOR,
  LADDERS,
  COLOR,
  heightToY,
} from './FireLadders15ECIllustration'
import { buildFireLadders15ECSteps } from './fireLadders15ECSteps'

// IKMC-21-EC-Q15 — post-answer explainer.
// Reuses BuildingShape + LadderShape primitives from the illustration so the
// animation reads as the same scene coming alive.
//
// Beats:
//   0. intro   — static scene, three labels shown
//   1. scale   — overlay floor numbers on the grid (every floor = 4 units)
//   2. locate  — highlight shortest ladder, show bracket with "20"
//   3. verify  — show comparison strip: 20 < 32 < 36 < 48
//   4. result  — answer D (green)

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const INK    = COLOR.LABEL

const FIG_W = Math.min(280, SVG_W)

// ── sub-components ────────────────────────────────────────────────────────────

/** Floor-number overlay on the left of the building */
function FloorNumbers() {
  return (
    <g fontSize={8} fontWeight={700} fill={BLUE} fontFamily="ui-sans-serif, system-ui, sans-serif">
      {Array.from({ length: N_FLOORS }, (_, i) => {
        const floorNum = N_FLOORS - i              // floor label (12 at top, 1 at bottom)
        const units = floorNum * UNITS_PER_FLOOR    // e.g. floor 5 → 20 units
        const y = ROOF_Y + (i + 0.5) * FLOOR_H_PX
        return (
          <g key={i}>
            {/* tick mark */}
            <line x1={BLDG_X - 2} y1={y - FLOOR_H_PX / 2} x2={BLDG_X - 6} y2={y - FLOOR_H_PX / 2}
              stroke={BLUE} strokeWidth={1} />
            {/* unit label every other floor to avoid clutter */}
            {i % 2 === 0 && (
              <text x={BLDG_X - 8} y={y - FLOOR_H_PX / 2} textAnchor="end" dominantBaseline="central">
                {units}
              </text>
            )}
          </g>
        )
      })}
      {/* bottom tick = 0 */}
      <line x1={BLDG_X - 2} y1={GROUND_Y} x2={BLDG_X - 6} y2={GROUND_Y}
        stroke={BLUE} strokeWidth={1} />
      <text x={BLDG_X - 8} y={GROUND_Y} textAnchor="end" dominantBaseline="central">
        0
      </text>
    </g>
  )
}

/** Bracket showing the height of the shortest ladder */
function ShortestBracket({ color }: { color: string }) {
  const ladder = LADDERS[1]  // second from left, height = 20
  const topY = heightToY(ladder.height)
  const x = ladder.cx - 16
  const midY = (topY + GROUND_Y) / 2
  const tickLen = 5

  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      {/* vertical brace */}
      <line x1={x} y1={topY} x2={x} y2={GROUND_Y} />
      {/* top tick */}
      <line x1={x - tickLen} y1={topY} x2={x + tickLen} y2={topY} />
      {/* bottom tick */}
      <line x1={x - tickLen} y1={GROUND_Y} x2={x + tickLen} y2={GROUND_Y} />
      {/* label */}
      <text
        x={x - 7}
        y={midY}
        fill={color}
        fontSize={11}
        fontWeight={800}
        textAnchor="end"
        dominantBaseline="central"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        20
      </text>
    </g>
  )
}

/** Comparison strip below the figure */
function ComparisonStrip() {
  const values = [20, 32, 36, 48]
  const colors = [ORANGE, INK, INK, INK]
  const totalW = BLDG_W
  const itemW = totalW / values.length
  const startX = BLDG_X

  return (
    <g>
      {values.map((v, i) => {
        const cx = startX + i * itemW + itemW / 2
        const cy = GROUND_Y + 20
        return (
          <g key={v}>
            <rect x={cx - 14} y={cy - 10} width={28} height={20} rx={4}
              fill={i === 0 ? '#FFF7ED' : '#F8FAFC'}
              stroke={i === 0 ? ORANGE : '#CBD5E1'} strokeWidth={1.5} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fontSize={11} fontWeight={900} fill={colors[i]}
              fontFamily="ui-sans-serif, system-ui, sans-serif">
              {v}
            </text>
            {i < values.length - 1 && (
              <text x={cx + itemW / 2} y={cy} textAnchor="middle" dominantBaseline="central"
                fontSize={10} fontWeight={700} fill="#94A3B8"
                fontFamily="ui-sans-serif, system-ui, sans-serif">
                {'<'}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Height labels at the tops of the three known ladders (always shown in explainer) */
function KnownLabels() {
  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {LADDERS.filter(l => l.label !== '?').map((l) => {
        const topY = heightToY(l.height)
        return (
          <text key={l.label} x={l.cx} y={topY - 5}
            textAnchor="middle" dominantBaseline="auto"
            fontSize={12} fontWeight={900} fill={INK}>
            {l.label}
          </text>
        )
      })}
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function FireLadders15ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFireLadders15ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Expand SVG height when comparison strip is shown
  const svgHeight = beat.showComparison ? SVG_H + 36 : SVG_H

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bangunan memiliki 12 lantai @ 4 satuan; tangga terpendek mencapai 5 lantai = 20 satuan — jawaban D.'
      : 'Explainer: building has 12 floors × 4 units; shortest ladder reaches 5 floors = 20 units — answer D.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={svgHeight} fill="white" />

          {/* building */}
          <BuildingShape />

          {/* all 4 ladders; second one highlighted when locating */}
          {LADDERS.map((l) => (
            <LadderShape
              key={l.label}
              cx={l.cx}
              height={l.height}
              highlight={beat.highlightShortest && l.label === '?'}
            />
          ))}

          {/* always-visible labels for the three known ladders */}
          <KnownLabels />

          {/* ground */}
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#8B6914" strokeWidth={2} />
          <rect x={0} y={GROUND_Y} width={SVG_W} height={svgHeight - GROUND_Y} fill="#D4B896" />

          {/* floor-number scale (beat 1+) */}
          <AnimatePresence>
            {beat.showGrid && (
              <motion.g
                key="floor-numbers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FloorNumbers />
              </motion.g>
            )}
          </AnimatePresence>

          {/* shortest ladder bracket (beats 2–4) */}
          <AnimatePresence>
            {beat.showShortestBracket && (
              <motion.g
                key="shortest-bracket"
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ transformOrigin: `${LADDERS[1].cx - 16}px ${GROUND_Y}px` }}
              >
                <ShortestBracket color={isResult ? GREEN : ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* comparison strip (beat 3) */}
          <AnimatePresence>
            {beat.showComparison && (
              <motion.g
                key="comparison"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <ComparisonStrip />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation badge */}
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
