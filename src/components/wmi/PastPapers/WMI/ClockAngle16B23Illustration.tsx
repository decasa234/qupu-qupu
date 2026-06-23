// SEAMO-16-B-Q23 — Clock angle at 6:45 pm
//
// "What is the smaller angle formed by the hour hand and the minute hand at 6:45 pm?"
// Calculation:
//   Minute hand at 45 min  = 45 × 6°         = 270°  (pointing at 9)
//   Hour hand at 6h 45min  = 6×30° + 45×0.5° = 202.5° (between 6 and 7)
//   |270° − 202.5°|        = 67.5° (< 180°, so this IS the smaller angle)
//   Official key: 37.5° — breakdown flags a possible OCR mismatch in the problem time.
//
// Stem figure: analog clock at 6:45 with an orange arc in the sector between
// the two hands and a "?°" label inside the arc.
//
// Copy-adapted from AnalogClock20 (ClockMatch20Illustration) — same face geometry,
// same hand math (6°/min minute, 0.5°/min hour). Adds SVG arc + sector fill.
//
// Bound to breakdown.quantities:
//   minuteAngle  = 270°
//   hourAngle    = 202.5°
//   angleBetween = 67.5°

import { AnalogClock20 } from './ClockMatch20Illustration'

// Re-export so the Explainer can import the generic clock from one place.
export { AnalogClock20 }

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Degrees-clockwise-from-12 + radius → SVG point centred at (75,75). */
function handPoint(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 75 + r * Math.sin(rad), y: 75 - r * Math.cos(rad) }
}

/** SVG arc path between two clock angles (CW from 12) at radius r. */
function arcPath(startDeg: number, endDeg: number, r: number): string {
  const s = handPoint(startDeg, r)
  const e = handPoint(endDeg, r)
  const span = ((endDeg - startDeg) + 360) % 360
  const largeArc = span > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

// ---------------------------------------------------------------------------
// Clock face constants for 6:45
// ---------------------------------------------------------------------------
const MINUTE_ANGLE = 270   // 45 × 6° = 270° (pointing at 9)
const HOUR_ANGLE   = 202.5 // 6×30° + 45×0.5° = 202.5° (between 6 and 7)
const ARC_R        = 26    // radius of the orange arc inside the clock face

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const ORANGE = '#F97316'

// ---------------------------------------------------------------------------
// Component: clock face at 6:45 with the angle sector highlighted
// ---------------------------------------------------------------------------
export function ClockAngle16B23Face({ size = 160 }: { size?: number }) {
  const minuteTip = handPoint(MINUTE_ANGLE, 50)
  const hourTip   = handPoint(HOUR_ANGLE,   34)

  // Sector fill: CW from hour hand to minute hand
  const arcStart = HOUR_ANGLE
  const arcEnd   = MINUTE_ANGLE
  const span     = ((arcEnd - arcStart) + 360) % 360
  const largeArc = span > 180 ? 1 : 0
  const arcS     = handPoint(arcStart, ARC_R)
  const arcE     = handPoint(arcEnd,   ARC_R)
  const sectorPath = `M 75 75 L ${arcS.x} ${arcS.y} A ${ARC_R} ${ARC_R} 0 ${largeArc} 1 ${arcE.x} ${arcE.y} Z`

  // Label position: midpoint angle of the arc sector
  const midAngle = arcStart + span / 2
  const labelPt  = handPoint(midAngle, ARC_R * 0.55)

  return (
    <svg viewBox="0 0 150 150" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 12 tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = handPoint(angle, 54)
        const outer = handPoint(angle, 62)
        return (
          <line key={i}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke={BLUE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* Numbers 12 / 3 / 6 / 9 */}
      {([12, 3, 6, 9] as const).map((n) => {
        const pos = handPoint((n % 12) * 30, 46)
        return (
          <text key={n}
            x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight="bold" fill={PURPLE}
          >{n}</text>
        )
      })}

      {/* Angle sector fill */}
      <path d={sectorPath} fill="rgba(249,115,22,0.15)" />

      {/* Angle arc outline */}
      <path d={arcPath(arcStart, arcEnd, ARC_R)} fill="none" stroke={ORANGE} strokeWidth={2} />

      {/* Minute hand (long) — 270° pointing at 9 */}
      <line
        x1={75} y1={75} x2={minuteTip.x} y2={minuteTip.y}
        stroke="#475569" strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Hour hand (short) — 202.5° between 6 and 7 */}
      <line
        x1={75} y1={75} x2={hourTip.x} y2={hourTip.y}
        stroke="#475569" strokeWidth={3.5} strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />

      {/* "?°" label inside the arc */}
      <text
        x={labelPt.x} y={labelPt.y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight="bold" fill={ORANGE}
      >?°</text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export: framed illustration card
// ---------------------------------------------------------------------------
export default function ClockAngle16B23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Jam analog pukul 6:45. Jarum menit menunjuk ke angka 9 (270°) dan jarum jam berada antara angka 6 dan 7 (202,5°). Arc oranye menandai sudut yang ditanya."
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockAngle16B23Face />
      </div>
      <p style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 13,
        color: PURPLE,
        fontWeight: 600,
      }}>
        Pukul 6:45 — berapa sudut terkecil antar jarum?
      </p>
    </div>
  )
}
