// SEAMO-21-A-Q18 — clock sequence puzzle.
//
// "What comes next?"
// Source figures: 2021.imgs/026.jpg, 027.jpg, 028.jpg (3 analog clocks), 029.jpg (? panel).
// Clock 1 (026): 9:05  (minute at 1 = 5 min, hour just past 9)
// Clock 2 (027): 9:40  (minute at 8 = 40 min, hour between 9 and 10)
// Clock 3 (028): 10:15 (minute at 3 = 15 min, hour just past 10)
// Pattern: each clock advances by +35 minutes.
// Next time: 10:15 + 35 min = 10:50 a.m. → Answer C.
//
// STEM ONLY (no picture options — the A-E choices are text times, not figures).
// The stem shows 3 analog clocks + a question-mark panel, laid out in a 2×2 grid
// identical in style to ClockSeq18A10Illustration (copy-adapted).
//
// Primitives used:
//   AnalogClock20 (from ./ClockMatch20Illustration) for each clock face.
//
// Bound quantities from breakdown.quantities:
//   pattern = "from clock sequence in figure"
//   answer  = "10.50 a.m."
//
// Pure render: no Math.random, no Date — SSR-safe and deterministic.

import { AnalogClock20 } from './ClockMatch20Illustration'

/** The three visible times in the sequence (each +35 min apart). */
export const SEQ_TIMES = ['9:05', '9:40', '10:15'] as const
/** The hidden 4th time (the answer). */
export const ANSWER_TIME = '10:50'
/** Interval in minutes between consecutive clocks. */
export const INTERVAL_MIN = 35

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const INK    = '#334155'

// ── Right-pointing arrow between panels ──────────────────────────────────────
function Arrow() {
  return (
    <svg width={28} height={20} viewBox="0 0 28 20" aria-hidden="true" style={{ display: 'block' }}>
      <line x1={2} y1={10} x2={22} y2={10} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <polyline points="16,4 23,10 16,16" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Single clock panel ────────────────────────────────────────────────────────
interface ClockPanelProps {
  time: string
  size?: number
  /** Highlight ring around the face (used in explainer). */
  highlight?: boolean
}

export function ClockPanel({ time, size = 100, highlight = false }: ClockPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {highlight && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '3px solid #F97316',
            pointerEvents: 'none',
            width: size + 8,
            height: size + 8,
          }}
        />
      )}
      <AnalogClock20 time={time} size={size} />
    </div>
  )
}

// ── Question-mark panel ───────────────────────────────────────────────────────
function QuestionPanel({ size = 100 }: { size?: number }) {
  return (
    <svg viewBox="0 0 150 150" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Face same style as AnalogClock20 */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />
      {/* Question mark */}
      <text
        x={75}
        y={80}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={52}
        fontWeight={900}
        fill={PURPLE}
        opacity={0.75}
      >
        ?
      </text>
    </svg>
  )
}

// ── Illustration: 2×2 grid ────────────────────────────────────────────────────
/** Props let the explainer override which times to show (e.g. reveal the answer). */
export interface ClockSeq21A18Props {
  /** Highlight ring on specific slot (0-indexed). */
  highlightSlot?: number | null
  /** Replace the 4th slot question mark with the answer clock. */
  revealAnswer?: boolean
}

/**
 * 2×2 grid: three analog clocks connected by arrows, plus a question-mark
 * fourth panel. Never shows the answer in the default static figure.
 */
export function ClockSeq21A18({
  highlightSlot = null,
  revealAnswer = false,
}: ClockSeq21A18Props = {}) {
  const CLOCK_SIZE = 100

  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `${CLOCK_SIZE}px 32px ${CLOCK_SIZE}px`,
        gridTemplateRows: `${CLOCK_SIZE}px 32px ${CLOCK_SIZE}px`,
        alignItems: 'center',
        justifyItems: 'center',
        gap: 0,
        rowGap: 4,
      }}
      aria-hidden="true"
    >
      {/* Row 1: Clock1 → Clock2 */}
      <ClockPanel time={SEQ_TIMES[0]} size={CLOCK_SIZE} highlight={highlightSlot === 0} />
      <Arrow />
      <ClockPanel time={SEQ_TIMES[1]} size={CLOCK_SIZE} highlight={highlightSlot === 1} />

      {/* Down arrows between rows */}
      <svg width={CLOCK_SIZE} height={32} viewBox={`0 0 ${CLOCK_SIZE} 32`} aria-hidden="true">
        <line x1={50} y1={2} x2={50} y2={26} stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <polyline points="43,20 50,27 57,20" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div />
      <svg width={CLOCK_SIZE} height={32} viewBox={`0 0 ${CLOCK_SIZE} 32`} aria-hidden="true">
        <line x1={50} y1={2} x2={50} y2={26} stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <polyline points="43,20 50,27 57,20" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Row 2: Clock3 → ? */}
      <ClockPanel time={SEQ_TIMES[2]} size={CLOCK_SIZE} highlight={highlightSlot === 2} />
      <Arrow />
      {revealAnswer
        ? <ClockPanel time={ANSWER_TIME} size={CLOCK_SIZE} highlight={highlightSlot === 3} />
        : <QuestionPanel size={CLOCK_SIZE} />}
    </div>
  )
}

export default function ClockSeq21A18Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Urutan empat jam: jam pertama pukul 9:05, jam kedua pukul 9:40, ' +
        'jam ketiga pukul 10:15, dan tanda tanya untuk waktu berikutnya.'
      }
    >
      <ClockSeq21A18 />
    </div>
  )
}
