import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CylinderBody,
  TapeBand,
  SVG_W,
  SVG_H,
  COLOR,
} from './TapeCylinder6ECIllustration'
import { buildTapeCylinder6ECSteps } from './tapeCylinder6ECSteps'

// IKMC-21-EC-Q6 — post-answer animation.
// Reuses CylinderBody + TapeBand from the illustration so the animation reads
// as the static scene coming alive.
//
// Animation beats:
//   0. intro   — static scene.
//   1. col     — vertical column highlight (3 → 18 → 33 → ?) in orange.
//   2. diff    — "+15" labels between column values in blue.
//   3. extend  — "33 + 15 = 48" arrow to the ? position in green.
//   4. result  — 48 revealed in green.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

// ── layout: the three tape band Y positions ───────────────────────────────────
const BAND_Y = [158, 124, 90] as const  // bottom, middle, top

// Column x position (the leftmost visible number column: values 3, 18, 33)
const COL_X = 48

// ── sub-components ────────────────────────────────────────────────────────────

/** Number labels on all three tape bands. */
function TapeNumbers({ highlightCol }: { highlightCol: boolean }) {
  const rows: Array<[number, string[]]> = [
    [BAND_Y[0], ['3', '4', '5', '6']],
    [BAND_Y[1], ['18', '19', '20', '21']],
    [BAND_Y[2], ['33', '?', '', '']],
  ]
  const xs = [48, 78, 112, 146]

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {rows.map(([y, vals]) =>
        vals.map((val, i) => {
          if (!val) return null
          const isQ = val === '?'
          const isColItem = i === 0 && highlightCol
          const fill = isQ
            ? (highlightCol ? ORANGE : COLOR.TAPE_QMARK)
            : isColItem
              ? ORANGE
              : COLOR.TAPE_TEXT
          return (
            <text
              key={`${y}-${i}`}
              x={xs[i]}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isQ ? 14 : 11}
              fontWeight={isQ || isColItem ? 900 : 700}
              fill={fill}
            >
              {val}
            </text>
          )
        })
      )}
    </g>
  )
}

/** Vertical column connector line from bottom to top column positions. */
function ColumnHighlight() {
  const topY    = BAND_Y[2] - 6
  const bottomY = BAND_Y[0] + 6
  return (
    <g>
      <line
        x1={COL_X}
        y1={bottomY}
        x2={COL_X}
        y2={topY}
        stroke={ORANGE}
        strokeWidth={2}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
    </g>
  )
}

/** "+15" increment labels between consecutive column values. */
function IncrementLabels() {
  const gaps: Array<[number, number]> = [
    [BAND_Y[0], BAND_Y[1]],
    [BAND_Y[1], BAND_Y[2]],
  ]
  return (
    <g>
      {gaps.map(([yBot, yTop], i) => {
        const midY = (yBot + yTop) / 2
        const x = COL_X - 26
        return (
          <g key={i}>
            <text
              x={x}
              y={midY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={900}
              fill={BLUE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              +15
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** Arrow from 33 to the ? position showing 33 + 15 = 48. */
function ExtendArrow({ revealed }: { revealed: boolean }) {
  // "?" is at x=78, y=90; "33" is at x=48, y=90 on the same band
  const fromX = 48
  const toX   = 78
  const y     = BAND_Y[2]
  const labelY = y - 22
  const color = revealed ? GREEN : ORANGE

  return (
    <g>
      {/* horizontal arrow from 33 to ? */}
      <line
        x1={fromX + 14}
        y1={y}
        x2={toX - 10}
        y2={y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* arrowhead */}
      <line x1={toX - 10} y1={y - 4} x2={toX - 4} y2={y} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={toX - 10} y1={y + 4} x2={toX - 4} y2={y} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* label above */}
      <text
        x={(fromX + toX) / 2}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={900}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        +15
      </text>
      {/* revealed answer */}
      {revealed && (
        <text
          x={toX}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={900}
          fill={GREEN}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          48
        </text>
      )}
    </g>
  )
}

// ── Tick lines (static) ───────────────────────────────────────────────────────
function TickLines() {
  return (
    <g>
      {[63, 97, 131].map((x) => (
        <g key={x}>
          <line x1={x} y1={149} x2={x} y2={167} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
          <line x1={x} y1={115} x2={x} y2={133} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
          <line x1={x} y1={ 81} x2={x} y2={ 99} stroke={COLOR.TICK_LINE} strokeWidth={0.8} />
        </g>
      ))}
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function TapeCylinder6ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTapeCylinder6ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: angka-angka di kolom yang sama adalah 3, 18, 33 — naik 15 per putaran. Jadi ? = 33 + 15 = 48 — jawaban C.'
      : 'Explainer: numbers in the same column are 3, 18, 33 — increasing by 15 per revolution. So ? = 33 + 15 = 48 — answer C.'

  const FIG_W = Math.min(300, SVG_W)

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

          {/* cylinder body */}
          <CylinderBody />

          {/* tape bands */}
          <TapeBand y={158} />
          <TapeBand y={124} />
          <TapeBand y={ 90} />

          {/* tick lines */}
          <TickLines />

          {/* tape number labels */}
          <TapeNumbers highlightCol={beat.showColumn} />

          {/* column connector: beat col + diff + extend + result */}
          <AnimatePresence>
            {beat.showColumn && (
              <motion.g
                key="col-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <ColumnHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* increment labels: beat diff */}
          <AnimatePresence>
            {beat.showIncrement && (
              <motion.g
                key="increments"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <IncrementLabels />
              </motion.g>
            )}
          </AnimatePresence>

          {/* extend arrow + revealed answer: beats extend + result */}
          <AnimatePresence>
            {beat.showExtend && (
              <motion.g
                key="extend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <ExtendArrow revealed={isResult} />
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
