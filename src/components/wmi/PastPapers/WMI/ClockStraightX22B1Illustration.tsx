// SEAMOX-22-B-Q1 — Clock straight-line problem starting at 7 a.m.
//
// "The time now is 7 a.m. How long, in minutes, does the minute hand
//  take to form a straight line with the hour hand for the first time?"
// Official key: 21 min (FLAG — math gives 60/11 ≈ 5.45 min for 180° separation).
//
// Source figure (2022.imgs/001.jpg): clock with both hands on the 12-6 axis,
// illustrating the "straight line" concept. STEM shows the starting state (7:00).
//
// Copy-adapted from ClockAngle16B23Illustration (handPoint geometry, arc overlay)
// and ClockSymmetry22B20Illustration (reusable full-face component exported for Explainer).
//
// Bound to breakdown.quantities:
//   minuteAngle = 0°   (minute hand at 12)
//   hourAngle   = 210° (7 × 30°, hour hand at 7)
//   relativeSpeed = 5.5°/min

import { clockHandPoint } from './ClockReadIllustration'

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const ORANGE = '#F97316'
const SLATE  = '#475569'

// ── Fixed clock angles at 7:00 AM ────────────────────────────────────────────
export const MINUTE_ANGLE_7  = 0    // minute hand at 12 (0°)
export const HOUR_ANGLE_7    = 210  // hour hand at 7   (7 × 30° = 210°)

// Angles at first straight-line moment (t = 60/11 ≈ 5.45 min after 7:00):
//   minute = 60/11 × 6 = 360/11 ≈ 32.73°
//   hour   = 210 + 60/11 × 0.5 = 210 + 30/11 ≈ 212.73°
export const STRAIGHT_MINUTE_ANGLE = 360 / 11   // ≈ 32.73°
export const STRAIGHT_HOUR_ANGLE   = 210 + 30 / 11  // ≈ 212.73°

// ── Reusable face component (exported for the Explainer) ─────────────────────

export interface ClockX22B1FaceProps {
  minuteAngle: number
  hourAngle: number
  /** Draw an orange dashed arc from hour → minute with "?" label */
  showQuestionArc?: boolean
  /** Highlight both hands orange to indicate a straight line */
  showStraightLine?: boolean
  size?: number
}

export function ClockX22B1Face({
  minuteAngle,
  hourAngle,
  showQuestionArc = false,
  showStraightLine = false,
  size = 150,
}: ClockX22B1FaceProps) {
  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip   = clockHandPoint(hourAngle,   34)

  // Arc: CW from hour hand to minute hand (shows gap that needs to close)
  const arcR    = 22
  const arcSpan = ((minuteAngle - hourAngle) + 360) % 360
  const arcLarge = arcSpan > 180 ? 1 : 0
  const arcS    = clockHandPoint(hourAngle,   arcR)
  const arcE    = clockHandPoint(minuteAngle, arcR)
  const midAng  = hourAngle + arcSpan / 2
  const labelPt = clockHandPoint(midAng, arcR * 0.58)

  const handColor = showStraightLine ? ORANGE : SLATE

  return (
    <svg
      viewBox="0 0 150 150"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 12 tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = clockHandPoint(angle, 54)
        const outer = clockHandPoint(angle, 62)
        return (
          <line key={i}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke={BLUE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* All 12 numerals */}
      {Array.from({ length: 12 }, (_, i) => {
        const n     = i + 1
        const angle = (n % 12) * 30
        const pos   = clockHandPoint(angle, 46)
        return (
          <text key={n}
            x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight="bold" fill={PURPLE}
          >{n}</text>
        )
      })}

      {/* Question arc (CW from hour to minute, showing the gap) */}
      {showQuestionArc && (
        <>
          <path
            d={`M ${arcS.x} ${arcS.y} A ${arcR} ${arcR} 0 ${arcLarge} 1 ${arcE.x} ${arcE.y}`}
            fill="none" stroke={ORANGE} strokeWidth={2} strokeDasharray="4 2"
          />
          <text
            x={labelPt.x} y={labelPt.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={8} fontWeight="bold" fill={ORANGE}
          >? min</text>
        </>
      )}

      {/* Minute hand (long) */}
      <line
        x1={75} y1={75} x2={minuteTip.x} y2={minuteTip.y}
        stroke={handColor} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Hour hand (short) */}
      <line
        x1={75} y1={75} x2={hourTip.x} y2={hourTip.y}
        stroke={handColor} strokeWidth={3.5} strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────
export default function ClockStraightX22B1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Jam analog pukul 7:00 pagi. Jarum menit menunjuk ke angka 12 (0°) dan jarum jam menunjuk ke angka 7 (210°). Kapan pertama kali kedua jarum membentuk garis lurus?"
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockX22B1Face
          minuteAngle={MINUTE_ANGLE_7}
          hourAngle={HOUR_ANGLE_7}
          showQuestionArc
          size={170}
        />
      </div>
      <p style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 13,
        color: PURPLE,
        fontWeight: 600,
      }}>
        Pukul 7:00 — berapa menit hingga jarum membentuk garis lurus?
      </p>
    </div>
  )
}
