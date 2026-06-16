/** Convert a clock angle (degrees clockwise from 12-o'clock) + length to an SVG endpoint. */
export function clockHandPoint(angleDeg: number, length: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 75 + length * Math.sin(rad), y: 75 - length * Math.cos(rad) }
}

const FACE = '#2f6df0'
const PURPLE = '#341857'

interface ClockFaceProps {
  /** 'hour' / 'minute' highlights that hand; 'none' shows both neutral. */
  emphasize?: 'hour' | 'minute' | 'none'
}

/** A clean analog clock face reading 12:30 (minute → 6, hour halfway 12→1). */
export function ClockFace({ emphasize = 'none' }: ClockFaceProps) {
  // 12:30 → minute hand at 180° (straight down), hour hand 15° past 12.
  const minuteAngle = 180
  const hourAngle = 15

  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip = clockHandPoint(hourAngle, 34)

  const minutePulse = emphasize === 'minute'
  const hourPulse = emphasize === 'hour'

  return (
    <svg viewBox="0 0 150 150" width={150} height={150} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={FACE} strokeWidth={3} />

      {/* 12 tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = clockHandPoint(angle, 54)
        const outer = clockHandPoint(angle, 62)
        return (
          <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={FACE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5} />
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

      {/* Minute hand (long) — straight down to 6 */}
      <line
        x1={75}
        y1={75}
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke={minutePulse ? '#F97316' : '#475569'}
        strokeWidth={minutePulse ? 4 : 2.5}
        strokeLinecap="round"
        style={minutePulse ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' } : undefined}
      />

      {/* Hour hand (short) — just past 12 */}
      <line
        x1={75}
        y1={75}
        x2={hourTip.x}
        y2={hourTip.y}
        stroke={hourPulse ? FACE : '#475569'}
        strokeWidth={hourPulse ? 5 : 3.5}
        strokeLinecap="round"
        style={hourPulse ? { filter: 'drop-shadow(0 0 4px rgba(47,109,240,0.7))' } : undefined}
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

export default function ClockReadIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A clock showing 12:30"
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockFace />
      </div>
    </div>
  )
}
