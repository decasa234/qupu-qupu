// SEAMO-22-A-Q7 — mirror-clock illustration.
//
// "Mark saw the reflection of an old clock. What was the actual time?"
// Answer: D = 4:45 pm (16.45)
//
// The figure shows a clock face seen in a mirror. The reflected image
// appears to show 7:15 (hour near 7, minute at 3). Mirror rule:
//   actual time = 12:00 − reflected reading = 12:00 − 7:15 = 4:45 pm
//
// The stem illustration draws ONLY the mirrored clock as it looks in the
// reflection — numbers reversed (scaleX −1), hands at apparent 7:15 —
// so the student must apply the mirror rule. The answer (4:45) is NOT shown.
//
// Copy-adapted from: ClockMatch20Illustration (AnalogClock20 + clockHandPoint)
// and ClockReadIllustration (clockHandPoint utility).
//
// Bound quantities from breakdown.quantities:
//   reflected time  = "7:15"
//   actual time     = "12:00 − 7:15 = 4:45 pm"
//
// Pure render — no Math.random, no Date — SSR-safe and deterministic.

import { clockHandPoint } from './ClockReadIllustration'

const BLUE   = '#2f6df0'
const PURPLE = '#341857'

export interface MirrorClockProps {
  /** If true, highlight the hour hand (for explainer). */
  emphasizeHour?: boolean
  /** If true, highlight the minute hand (for explainer). */
  emphasizeMinute?: boolean
  /** If true, draw the "actual" (non-reflected) clock showing 4:45 instead. */
  showActual?: boolean
}

/**
 * Analog clock face drawn as a mirror reflection (scaleX flipped), appearing
 * to show 7:15. Used for both the stem illustration and the explainer.
 *
 * When showActual=true it draws a normal (non-flipped) clock at 4:45 pm — used
 * in the explainer's final beat to reveal the answer.
 */
export function MirrorClock({
  emphasizeHour = false,
  emphasizeMinute = false,
  showActual = false,
}: MirrorClockProps = {}) {
  // The REFLECTED clock appears to show 7:15.
  // The ACTUAL clock shows 4:45.
  // For the reflected face we draw a normal clock at 4:45, then flip it with
  // scaleX(-1) so it visually looks like a 7:15 reflection (the mirror image).
  // When showActual=true we skip the flip and show 4:45 directly.
  const h = 4
  const m = 45
  const minuteAngle = m * 6                     // 270°
  const hourAngle   = (h % 12) * 30 + m * 0.5  // 4*30 + 22.5 = 142.5°

  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip   = clockHandPoint(hourAngle,   34)

  const size = 150
  const cx   = size / 2  // 75

  const minuteColor = emphasizeMinute ? '#F97316' : '#475569'
  const hourColor   = emphasizeHour   ? BLUE      : '#475569'

  const face = (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* scaleX(-1) about centre to produce the mirror effect */}
      <g transform={showActual ? '' : `scale(-1,1) translate(${-size},0)`}>
        {/* Face ring */}
        <circle cx={cx} cy={cx} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

        {/* 12 tick marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30
          const inner = clockHandPoint(angle, 54)
          const outer = clockHandPoint(angle, 62)
          return (
            <line
              key={i}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke={BLUE}
              strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            />
          )
        })}

        {/* Numbers 12 / 3 / 6 / 9 — the text itself is NOT flipped so it reads
            correctly on the actual clock face; the surrounding face IS flipped,
            which mirrors the number positions to where 12→12, 3→9, 9→3. */}
        {([12, 3, 6, 9] as const).map((n) => {
          const pos = clockHandPoint((n % 12) * 30, 46)
          return (
            <text
              key={n}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight="bold"
              fill={PURPLE}
              style={showActual ? undefined : { transform: `scale(-1,1) translate(${-2 * pos.x}px,0)` }}
            >
              {n}
            </text>
          )
        })}

        {/* Minute hand */}
        <line
          x1={cx} y1={cx}
          x2={minuteTip.x} y2={minuteTip.y}
          stroke={minuteColor}
          strokeWidth={emphasizeMinute ? 4 : 2.5}
          strokeLinecap="round"
          style={emphasizeMinute ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' } : undefined}
        />

        {/* Hour hand */}
        <line
          x1={cx} y1={cx}
          x2={hourTip.x} y2={hourTip.y}
          stroke={hourColor}
          strokeWidth={emphasizeHour ? 5 : 3.5}
          strokeLinecap="round"
          style={emphasizeHour ? { filter: 'drop-shadow(0 0 4px rgba(47,109,240,0.7))' } : undefined}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cx} r={4} fill={PURPLE} />
      </g>
    </svg>
  )

  return face
}

/** Default export: the stem illustration — the reflected (mirrored) clock face. */
export default function MirrorClock22A7Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Bayangan cermin sebuah jam yang tampak menunjukkan pukul 7:15 (jam cermin — angka terbalik)"
    >
      <MirrorClock />
    </div>
  )
}
