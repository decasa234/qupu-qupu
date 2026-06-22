import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  LINE_Y,
  STATION_X,
  STATIONS,
  DOT_R,
  COLOR,
  TrainPrimitive,
  StationDot,
} from './Metro14ECIllustration'
import { buildMetro14ECSteps, STOP_CYCLE } from './metro14ECSteps'

// IKMC-23-EC-Q14 — post-answer animation.
// Reuses TrainPrimitive and StationDot from the illustration so the
// animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro    — static line, train at B heading East.
//   1. sequence — East run: stops 1–4 (C, D, E, F).
//   2. sequence — West run: stops 5–9 (E, D, C, B, A).
//   3. cycle    — stop 10 = B, cycle bracket appears.
//   4. mod      — 96 mod 10 = 6, show modulo reasoning.
//   5. result   — stop 6 = D highlighted green.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const PURPLE = '#7C3AED'

// ── layout helpers ────────────────────────────────────────────────────────────
const FIG_W = Math.min(340, SVG_W)

/** Map stop-number (1-based) to station label. */
function stopToStation(stopNum: number): string {
  return STOP_CYCLE[(stopNum - 1) % 10]
}

// ── sub-components ────────────────────────────────────────────────────────────

/**
 * The sequence row of numbered stop chips shown below the track.
 * Only shows chips 1..showStops.
 */
function StopChips({
  showStops,
  highlightStop,
}: {
  showStops: number
  highlightStop?: number
}) {
  const chipY = LINE_Y + DOT_R + 32
  const chipSpacing = 28
  const startX = STATION_X.A - 2

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {Array.from({ length: showStops }, (_, i) => {
        const n = i + 1
        const station = stopToStation(n)
        const cx = startX + (n - 1) * chipSpacing
        const isHighlight = n === highlightStop
        const bg = isHighlight ? GREEN : n <= 4 ? BLUE : ORANGE

        return (
          <g key={n}>
            {/* chip background */}
            <rect
              x={cx - 10}
              y={chipY - 9}
              width={20}
              height={18}
              rx={4}
              fill={bg}
              opacity={0.9}
            />
            {/* station label */}
            <text
              x={cx}
              y={chipY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={800}
              fill="white"
            >
              {station}
            </text>
            {/* stop number below chip */}
            <text
              x={cx}
              y={chipY + 13}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fontWeight={600}
              fill={bg}
            >
              {n}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/**
 * A bracket that wraps all 10 stop chips to indicate the repeating cycle.
 */
function CycleBracket() {
  const chipY = LINE_Y + DOT_R + 32
  const chipSpacing = 28
  const startX = STATION_X.A - 2
  const left = startX - 12
  const right = startX + 9 * chipSpacing + 12
  const top = chipY - 14
  const bot = chipY + 26
  const mid = (left + right) / 2

  return (
    <g stroke={PURPLE} fill="none" strokeWidth={1.5} strokeLinecap="round">
      {/* top horizontal bar */}
      <line x1={left} y1={top} x2={right} y2={top} />
      {/* left leg */}
      <line x1={left} y1={top} x2={left} y2={bot} />
      {/* right leg */}
      <line x1={right} y1={top} x2={right} y2={bot} />
      {/* "period = 10" label */}
      <text
        x={mid}
        y={top - 6}
        fill={PURPLE}
        fontSize={9}
        fontWeight={800}
        textAnchor="middle"
        dominantBaseline="central"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        period = 10
      </text>
    </g>
  )
}

/**
 * Animated dot showing the train travelling along the track for the current phase.
 * Shown at the station that is stop number `atStop`.
 */
function TrainAt({ stopNum }: { stopNum: number }) {
  const station = stopToStation(stopNum)
  const cx = STATION_X[station]
  if (cx === undefined) return null

  return (
    <g>
      <TrainPrimitive cx={cx} cy={LINE_Y - 24} />
    </g>
  )
}

/**
 * Green highlight ring around the answer station (D).
 */
function AnswerHighlight() {
  const x = STATION_X.D
  return (
    <circle
      cx={x}
      cy={LINE_Y}
      r={DOT_R + 5}
      fill="none"
      stroke={GREEN}
      strokeWidth={3}
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Metro14ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildMetro14ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Which stop does the moving train indicator show?
  // Show the train arriving at the most recent highlighted stop.
  const trainAtStop = beat.showStops > 0 ? beat.showStops : undefined

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kereta mulai di B menuju C; siklus 10 perhentian: C,D,E,F,E,D,C,B,A,B; 96 mod 10 = 6; perhentian ke-6 = D — jawaban D.'
      : 'Explainer: train starts at B heading to C; 10-stop cycle C,D,E,F,E,D,C,B,A,B; 96 mod 10 = 6; stop 6 = D — answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
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

          {/* "West" and "East" labels */}
          <text
            x={8}
            y={LINE_Y}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            West
          </text>
          <text
            x={SVG_W - 8}
            y={LINE_Y}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            East
          </text>

          {/* Track line */}
          <line
            x1={STATION_X.A}
            y1={LINE_Y}
            x2={STATION_X.F}
            y2={LINE_Y}
            stroke={COLOR.TRACK}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Station dots (always visible) */}
          {STATIONS.map((s) => (
            <StationDot key={s} label={s} x={STATION_X[s]} />
          ))}

          {/* Answer highlight ring: beat result */}
          <AnimatePresence>
            {beat.highlightAnswer && (
              <motion.g
                key="answer-ring"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              >
                <AnswerHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Train icon: intro beat shows at B; sequence beats show at current stop */}
          <AnimatePresence mode="wait">
            {beat.phase === 'intro' && (
              <motion.g
                key="train-intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TrainPrimitive cx={STATION_X.B} cy={LINE_Y - 24} />
              </motion.g>
            )}
            {beat.phase !== 'intro' && trainAtStop !== undefined && (
              <motion.g
                key={`train-stop-${trainAtStop}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <TrainAt stopNum={trainAtStop} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Stop chips row */}
          <AnimatePresence>
            {beat.showStops > 0 && (
              <motion.g
                key={`chips-${beat.showStops}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StopChips
                  showStops={beat.showStops}
                  highlightStop={beat.highlightAnswer ? 6 : undefined}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Cycle bracket */}
          <AnimatePresence>
            {beat.showCycleBracket && (
              <motion.g
                key="cycle-bracket"
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              >
                <CycleBracket />
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
