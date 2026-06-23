// SEAMO-17-A-Q6 — elapsed time between two analog clocks.
//
// "There are 60 minutes in an hour. By observing the two clocks shown in the
//  figure, how many minutes have passed?"  Answer: A = 135 min.
//
// SOURCE FIGURE (2017.imgs/007.jpg + 008.jpg):
//   Clock 1 (start): minute hand at 6 (30 min), hour hand just past 1 → 1:30.
//   Clock 2 (end):   minute hand at 3 (15 min), hour hand just past 3 → 3:45.
//   Elapsed: 3:45 − 1:30 = 2 h 15 min = 135 min → choice A.
//
// The STATIC illustration shows ONLY the problem (two clocks with unknown
// times) — never labels the answer.
//
// Bound quantities from breakdown.quantities:
//   Elapsed time (from figure) = 2 hours 15 minutes = 135 minutes
//
// Copy-adapted from ClockMatch20Illustration (AnalogClock20 + clockHandPoint).
// Pure render: no Math.random, no Date — SSR-safe and deterministic.

import { clockHandPoint } from './ClockReadIllustration'

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const INK    = '#1e293b'

// ── Clock times (from source figure) ─────────────────────────────────────────
/** Clock 1: start time 1:30  (minute hand at 6, hour just past 1). */
export const START_H = 1
export const START_M = 30

/** Clock 2: end time 3:45  (minute hand at 3, hour just past 3). */
export const END_H = 3
export const END_M = 45

/** Elapsed minutes = 135. */
export const ELAPSED_MIN = 135

export interface AnalogClockEC17A6Props {
  h: number
  m: number
  size?: number
  /** Orange ring around the face when true (used in explainer). */
  highlight?: boolean
  /** Draw orange minute hand when true (explainer beat). */
  emphMinute?: boolean
  /** Draw orange hour hand when true (explainer beat). */
  emphHour?: boolean
}

/** A clean analog clock face showing the given h:mm time. */
export function AnalogClockEC17A6({
  h, m, size = 130,
  highlight = false,
  emphMinute = false,
  emphHour = false,
}: AnalogClockEC17A6Props) {
  const minuteAngle = m * 6
  const hourAngle   = (h % 12) * 30 + m * 0.5

  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip   = clockHandPoint(hourAngle,   34)

  return (
    <svg viewBox="0 0 150 150" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Outer ring highlight */}
      {highlight && <circle cx={75} cy={75} r={66} fill="none" stroke="#F97316" strokeWidth={3} strokeDasharray="6 3" />}

      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 60 minute tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = i * 6
        const isHour = i % 5 === 0
        const inner = clockHandPoint(angle, isHour ? 52 : 55)
        const outer = clockHandPoint(angle, 62)
        return (
          <line
            key={i}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke={BLUE}
            strokeWidth={isHour ? 2.5 : 1}
          />
        )
      })}

      {/* Numbers 12 / 3 / 6 / 9 */}
      {([12, 3, 6, 9] as const).map((n) => {
        const pos = clockHandPoint((n % 12) * 30, 46)
        return (
          <text key={n} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fill={PURPLE}>
            {n}
          </text>
        )
      })}

      {/* Minute hand (long, thin) */}
      <line
        x1={75} y1={75}
        x2={minuteTip.x} y2={minuteTip.y}
        stroke={emphMinute ? '#F97316' : '#475569'}
        strokeWidth={emphMinute ? 3.5 : 2.5}
        strokeLinecap="round"
      />

      {/* Hour hand (short, thick) */}
      <line
        x1={75} y1={75}
        x2={hourTip.x} y2={hourTip.y}
        stroke={emphHour ? BLUE : '#475569'}
        strokeWidth={emphHour ? 5 : 3.5}
        strokeLinecap="round"
      />

      {/* Centre dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

// ── Static stem illustration ──────────────────────────────────────────────────

export default function ElapsedClock17A6Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label={
        'Dua jam analog: jam pertama menunjukkan 1:30 (waktu mulai) ' +
        'dan jam kedua menunjukkan 3:45 (waktu akhir). Berapa menit yang telah berlalu?'
      }
    >
      {/* Two clocks side by side */}
      <div className="flex items-end gap-6">
        {/* Clock 1 — start */}
        <div className="flex flex-col items-center gap-1">
          <AnalogClockEC17A6 h={START_H} m={START_M} />
          <span className="font-display text-xs font-bold text-slate-500">
            Start
          </span>
        </div>

        {/* Arrow between clocks */}
        <svg width={36} height={24} viewBox="0 0 36 24" aria-hidden="true" style={{ marginBottom: 24 }}>
          <line x1={2} y1={12} x2={30} y2={12} stroke={INK} strokeWidth={2} strokeLinecap="round" />
          <polyline points="22,5 30,12 22,19" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Clock 2 — end */}
        <div className="flex flex-col items-center gap-1">
          <AnalogClockEC17A6 h={END_H} m={END_M} />
          <span className="font-display text-xs font-bold text-slate-500">
            End
          </span>
        </div>
      </div>
    </div>
  )
}
