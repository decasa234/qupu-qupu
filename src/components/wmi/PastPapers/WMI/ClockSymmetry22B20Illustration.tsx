// SEAMO-22-B-Q20 — Clock symmetry about the '5' at 5:00 pm
//
// "The time on the clock is now 5 pm. How many minutes later will the
// minute- and hour-hands first be of equal distance on both sides of
// the number '5'?"   Answer: A = 23 1/13 minutes.
//
// SOURCE FIGURE (2022.imgs/009.jpg):
//   LEFT panel: analog clock showing exactly 5:00 — minute hand pointing
//   at 12, hour hand pointing at 5. All 12 numbers shown around the rim.
//   ARROW (→) between the two panels.
//   RIGHT panel: analog clock at the target time (~5:23 1/13) where both
//   hands are symmetric about 5 — minute hand on the 5-left side, hour
//   hand on the 5-right side, equidistant from '5'. A "?" arc between
//   the two hands hints at the unknown time.
//
// The STEM illustration shows the problem (starting state + symmetry
// question), not the numerical answer (23 1/13).
//
// Copy-adapted from ClockAngle16B23Illustration (dual-panel layout,
// AnalogClock20 geometry) + ClockMatch20Illustration (AnalogClock20).
//
// Bound to breakdown.quantities:
//   START_TIME = 5:00  (minute at 0 min-marks, hour at 25 min-marks)
//   AXIS = 25 min-marks = the '5' position (clock number 5)
//   ANSWER_t = 300/13 minutes ≈ 23.077 minutes
//   minute_pos = t = 300/13 min-marks from 12
//   hour_pos = 25 + t/12 = 25 + 25/13 = 350/13 min-marks from 12
//   d = t/12 = 25/13 — equidistant from '5' (25 min-marks)
//
// Pure render: no Math.random, no Date — SSR-safe and deterministic.

import { clockHandPoint } from './ClockReadIllustration'

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const ORANGE = '#F97316'
const SLATE  = '#475569'

// ── geometry constants (all clocks share the same 150×150 viewBox) ───────────
const CX = 75
const CY = 75

/** Min-mark position (0–59) → angle degrees clockwise from 12. */
function minToDeg(m: number): number { return m * 6 }

/**
 * A full-numbered analog clock face (all 12 numerals around the rim).
 * Exported so the Explainer can import it.
 */
export interface FullClockProps {
  /** Minute-hand angle in degrees CW from 12. */
  minuteAngle: number
  /** Hour-hand angle in degrees CW from 12. */
  hourAngle: number
  /** When true, draw a dashed arc between the two hands and a '?' label. */
  showQuestion?: boolean
  /** When set, draw a dashed symmetry axis through the '5' position. */
  showAxis?: boolean
  /** When true, highlight the '5' numeral in orange. */
  highlightFive?: boolean
  size?: number
}

export function FullClock({
  minuteAngle,
  hourAngle,
  showQuestion = false,
  showAxis = false,
  highlightFive = false,
  size = 150,
}: FullClockProps) {
  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip   = clockHandPoint(hourAngle,   34)

  // arc between minute and hour for the "?" question arc
  const arcR    = 22
  const arcSpan = ((hourAngle - minuteAngle) + 360) % 360
  const arcLarge = arcSpan > 180 ? 1 : 0
  const arcS    = clockHandPoint(minuteAngle, arcR)
  const arcE    = clockHandPoint(hourAngle,   arcR)
  // label at midpoint of arc
  const midAng  = minuteAngle + arcSpan / 2
  const labelPt = clockHandPoint(midAng, arcR * 0.55)

  // symmetry axis through '5' (150° CW from 12)
  const axisAngle = minToDeg(25) // 25 min-marks = '5' = 150°
  const axisInner = clockHandPoint(axisAngle, 18)
  const axisOuter = clockHandPoint(axisAngle, 62)

  return (
    <svg
      viewBox="0 0 150 150"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Face */}
      <circle cx={CX} cy={CY} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 12 tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = clockHandPoint(angle, 54)
        const outer = clockHandPoint(angle, 62)
        return (
          <line
            key={i}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke={BLUE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* All 12 numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const angle = (n % 12) * 30
        const pos   = clockHandPoint(angle, 46)
        const isFive = n === 5
        return (
          <text
            key={n}
            x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight="bold"
            fill={highlightFive && isFive ? ORANGE : PURPLE}
          >
            {n}
          </text>
        )
      })}

      {/* Symmetry axis (dashed line through '5') */}
      {showAxis && (
        <line
          x1={CX} y1={CY}
          x2={axisOuter.x} y2={axisOuter.y}
          stroke={ORANGE} strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      )}

      {/* Question arc between hands */}
      {showQuestion && (
        <>
          <path
            d={`M ${arcS.x} ${arcS.y} A ${arcR} ${arcR} 0 ${arcLarge} 1 ${arcE.x} ${arcE.y}`}
            fill="none" stroke={ORANGE} strokeWidth={2} strokeDasharray="4 2"
          />
          <text
            x={labelPt.x} y={labelPt.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight="bold" fill={ORANGE}
          >?</text>
        </>
      )}

      {/* Minute hand (long) */}
      <line
        x1={CX} y1={CY}
        x2={minuteTip.x} y2={minuteTip.y}
        stroke={SLATE} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Hour hand (short) */}
      <line
        x1={CX} y1={CY}
        x2={hourTip.x} y2={hourTip.y}
        stroke={SLATE} strokeWidth={3.5} strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={4} fill={PURPLE} />
    </svg>
  )
}

// ── Derived clock angles ──────────────────────────────────────────────────────
// 5:00 pm: minute hand at 0 min-marks (0°), hour hand at 25 min-marks (150°)
export const START_MINUTE_ANGLE = 0    // 0°   pointing at 12
export const START_HOUR_ANGLE   = 150  // 150° pointing at 5

// Target time t = 300/13 min ≈ 23.077 min later:
//   minute hand = t = 300/13 min-marks from 12 → 300/13 × 6 ≈ 138.46°
//   hour hand = 25 + t/12 = 25 + 25/13 = 350/13 min-marks → × 6 ≈ 161.54°
//   Both are d = 25/13 ≈ 1.923 min-marks away from the '5' (25 min-marks)
export const TARGET_MINUTE_ANGLE = (300 / 13) * 6   // ≈ 138.46°
export const TARGET_HOUR_ANGLE   = (350 / 13) * 6   // ≈ 161.54°
export const AXIS_ANGLE          = minToDeg(25)      // 150° = the '5'

// ── Default export: stem illustration (two-panel, NOT the numerical answer) ──

export default function ClockSymmetry22B20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Pukul 5:00, jarum menit di angka 12 dan jarum jam di angka 5. Kapan kedua jarum sama jarak dari angka 5?"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {/* LEFT: 5:00 pm starting state */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <FullClock
            minuteAngle={START_MINUTE_ANGLE}
            hourAngle={START_HOUR_ANGLE}
            highlightFive
            size={138}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE }}>5:00 pm</span>
        </div>

        {/* Arrow */}
        <svg width={28} height={20} viewBox="0 0 28 20" aria-hidden="true">
          <line x1={2} y1={10} x2={22} y2={10} stroke={SLATE} strokeWidth={2.5} />
          <polyline points="16,4 26,10 16,16" fill="none" stroke={SLATE} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>

        {/* RIGHT: target time (symmetric about '5'), question not answered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <FullClock
            minuteAngle={TARGET_MINUTE_ANGLE}
            hourAngle={TARGET_HOUR_ANGLE}
            showAxis
            showQuestion
            highlightFive
            size={138}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>? menit kemudian</span>
        </div>
      </div>
    </div>
  )
}
