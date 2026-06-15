// WMI-20P2A-Q9 (2020 Grade 2 Semifinal) — "Look at the figure. What time is it
// now?"  Answer: 8:20 (choice C).
//
// READING THE SCAN (2020-semifinal-g2-a-q9.jpg): a plain analog clock face
// numbered 1..12 (no minute digits). Two arrow-tipped hands fan out from the
// centre:
//   - the SHORT (hour) hand points down-left, to the "8".
//   - the LONG  (minute) hand points down-right, to the "4".
// A minute hand on the "4" means 4 x 5 = 20 minutes. With the hour hand at the
// 8, the time reads 8:20.
//
// THE TRAP: swap the hands. The "4" is where the minute hand sits, but 4 is also
// a clock NUMBER — reading it as the hour gives the wrong 4:20; reading the
// minute as the small number near 8 gives 8:40 / 4:08. Length tells them apart:
// the long hand is minutes, the short hand is the hour.
//
// The static figure draws ONLY the clock + the two hands as scanned. It never
// labels the time, the minute value, or which hand is which — that reveal is the
// animator's job (the co-exported P20G2Q9Clock primitive takes highlight +
// minute-ring props, all still without printing the answer string).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const FACE_STROKE = '#1F2937'

/** Hand readings (clock NUMBER each hand points at). */
export const HOUR_NUMBER = 8 // short hand -> 8
export const MINUTE_NUMBER = 4 // long hand -> 4
export const MINUTE_VALUE = MINUTE_NUMBER * 5 // 20 minutes
export const ANSWER_HOUR = HOUR_NUMBER // 8
export const ANSWER_MINUTE = MINUTE_VALUE // 20
/** Display string the animator lands on (e.g. "8:20"). */
export const ANSWER_TIME = `${ANSWER_HOUR}:${String(ANSWER_MINUTE).padStart(2, '0')}`

// ---- geometry --------------------------------------------------------------
const CX = 110
const CY = 110
const R = 92 // outer radius of the dial
const VIEW = 220

/** A clock NUMBER (1..12) -> angle in degrees clockwise from 12 o'clock. */
const numberAngle = (n: number) => (n % 12) * 30

/** Angle (deg clockwise from 12) + length -> SVG point about the clock centre. */
export function clockPoint(angleDeg: number, length: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + length * Math.sin(rad), y: CY - length * Math.cos(rad) }
}

const HOUR_LEN = 50
const MINUTE_LEN = 74

export const CLOCK_GEOM = {
  VIEW,
  CX,
  CY,
  R,
  clockPoint,
  numberAngle,
  HOUR_LEN,
  MINUTE_LEN,
} as const

/** One arrow-tipped clock hand from the centre toward `angleDeg` of `length`. */
function Hand({
  angleDeg,
  length,
  color,
  width,
}: {
  angleDeg: number
  length: number
  color: string
  width: number
}) {
  const tip = clockPoint(angleDeg, length)
  // small arrow head at the tip
  const back = clockPoint(angleDeg, length - 13)
  const perp = angleDeg + 90
  const a = clockPoint(perp, 6)
  const b = clockPoint(perp, -6)
  const ax = back.x + (a.x - CX)
  const ay = back.y + (a.y - CY)
  const bx = back.x + (b.x - CX)
  const by = back.y + (b.y - CY)
  return (
    <g>
      <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${tip.x},${tip.y} ${ax},${ay} ${bx},${by}`} fill={color} />
    </g>
  )
}

export interface P20G2Q9ClockProps {
  /** Highlight just the hour hand, just the minute hand, both, or neither. */
  emphasize?: 'hour' | 'minute' | 'both' | 'none'
  /** Show the 0/5/10/... minute ring outside the numbers (animator beat). */
  showMinuteRing?: boolean
}

/** Bare clock primitive: dial 1..12, hour hand at 8, minute hand at 4. */
export function P20G2Q9Clock({ emphasize = 'none', showMinuteRing = false }: P20G2Q9ClockProps = {}) {
  const hourAngle = numberAngle(HOUR_NUMBER)
  const minuteAngle = numberAngle(MINUTE_NUMBER)
  const hourLit = emphasize === 'hour' || emphasize === 'both'
  const minuteLit = emphasize === 'minute' || emphasize === 'both'

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(240, VIEW)} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* face */}
      <circle cx={CX} cy={CY} r={R} fill="#FFFFFF" stroke={FACE_STROKE} strokeWidth={3} />

      {/* minute (small) tick marks: 60 of them */}
      {Array.from({ length: 60 }, (_, i) => {
        const ang = i * 6
        const major = i % 5 === 0
        const inner = clockPoint(ang, R - (major ? 10 : 5))
        const outer = clockPoint(ang, R)
        return (
          <line
            key={`tk-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={INK}
            strokeWidth={major ? 2 : 1}
          />
        )
      })}

      {/* hour numbers 1..12 */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const pos = clockPoint(numberAngle(n), R - 22)
        return (
          <text
            key={`n-${n}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={17}
            fontWeight="bold"
            fill={INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {n}
          </text>
        )
      })}

      {/* optional minute ring (0,5,10,... outside the dial) */}
      {showMinuteRing &&
        Array.from({ length: 12 }, (_, i) => {
          const n = i + 1
          const val = (n % 12) * 5
          const pos = clockPoint(numberAngle(n), R + 16)
          return (
            <text
              key={`mr-${n}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight="bold"
              fill={n === MINUTE_NUMBER ? '#f0853a' : '#94A3B8'}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {val}
            </text>
          )
        })}

      {/* minute hand (long) -> 4 */}
      <Hand
        angleDeg={minuteAngle}
        length={MINUTE_LEN}
        color={minuteLit ? '#f0853a' : '#1F2937'}
        width={minuteLit ? 5 : 3}
      />
      {/* hour hand (short) -> 8 */}
      <Hand
        angleDeg={hourAngle}
        length={HOUR_LEN}
        color={hourLit ? '#2f6df0' : '#1F2937'}
        width={hourLit ? 6 : 4}
      />

      {/* centre hub */}
      <circle cx={CX} cy={CY} r={5} fill={INK} />
    </svg>
  )
}

/** Default export: bare clock, no answer revealed. */
export default function P20G2Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebuah jam analog bernomor 1 sampai 12. Jarum pendek menunjuk ke angka 8 dan jarum panjang menunjuk ke angka 4. Pukul berapa sekarang?"
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <P20G2Q9Clock />
      </div>
    </div>
  )
}
