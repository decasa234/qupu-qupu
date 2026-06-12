// Clock-matching question for WMI-20F1A-Q6.
//
// The question card shows a digital alarm clock reading 04:30; the four
// answer options are analog clock faces (A 3:30, B 4:20, C 4:30, D 4:00 —
// see ClockOption20.tsx, which draws each option from its choice text).
// Answer: C — minute hand straight down at the 6, hour hand halfway
// between 4 and 5.
import { clockHandPoint } from './ClockReadIllustration'

const BLUE = '#2f6df0'
const PURPLE = '#341857'

/** Parse an "h:mm" choice/time string (12-hour). Returns null if it doesn't parse. */
export function parseClockTime(text: string): { h: number; m: number } | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(text)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 1 || h > 12 || m < 0 || m > 59) return null
  return { h, m }
}

export interface AnalogClock20Props {
  /** Time as "h:mm", e.g. "4:30". Hour hand advances proportionally with the minutes. */
  time: string
  size?: number
  emphasizeMinute?: boolean
  emphasizeHour?: boolean
}

/** A parameterized analog clock face — white face, blue rim/ticks, 12/3/6/9 numerals. */
export function AnalogClock20({ time, size = 150, emphasizeMinute = false, emphasizeHour = false }: AnalogClock20Props) {
  const parsed = parseClockTime(time) ?? { h: 12, m: 0 }
  // Minute hand: 6° per minute. Hour hand: 30° per hour + 0.5° per minute,
  // so 4:30 lands exactly halfway between the 4 and the 5.
  const minuteAngle = parsed.m * 6
  const hourAngle = (parsed.h % 12) * 30 + parsed.m * 0.5

  const minuteTip = clockHandPoint(minuteAngle, 50)
  const hourTip = clockHandPoint(hourAngle, 34)

  return (
    <svg viewBox="0 0 150 150" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 12 tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = clockHandPoint(angle, 54)
        const outer = clockHandPoint(angle, 62)
        return (
          <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={BLUE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5} />
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

      {/* Minute hand (long) */}
      <line
        x1={75}
        y1={75}
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke={emphasizeMinute ? '#F97316' : '#475569'}
        strokeWidth={emphasizeMinute ? 4 : 2.5}
        strokeLinecap="round"
        style={emphasizeMinute ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' } : undefined}
      />

      {/* Hour hand (short) */}
      <line
        x1={75}
        y1={75}
        x2={hourTip.x}
        y2={hourTip.y}
        stroke={emphasizeHour ? BLUE : '#475569'}
        strokeWidth={emphasizeHour ? 5 : 3.5}
        strokeLinecap="round"
        style={emphasizeHour ? { filter: 'drop-shadow(0 0 4px rgba(47,109,240,0.7))' } : undefined}
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

/** A blue rounded digital alarm clock with a dark display showing the given time. */
export function DigitalClock20({ time }: { time: string }) {
  return (
    <svg viewBox="0 0 170 124" width={170} height={124} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Alarm bells */}
      <circle cx={56} cy={22} r={11} fill={BLUE} stroke={PURPLE} strokeWidth={2} />
      <circle cx={114} cy={22} r={11} fill={BLUE} stroke={PURPLE} strokeWidth={2} />

      {/* Body */}
      <rect x={20} y={26} width={130} height={84} rx={16} fill={BLUE} />

      {/* Feet */}
      <line x1={42} y1={108} x2={32} y2={118} stroke={PURPLE} strokeWidth={4} strokeLinecap="round" />
      <line x1={128} y1={108} x2={138} y2={118} stroke={PURPLE} strokeWidth={4} strokeLinecap="round" />

      {/* Display */}
      <rect x={34} y={42} width={102} height={52} rx={8} fill="#0F172A" />
      <text
        x={85}
        y={68}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize={28}
        fontWeight={800}
        letterSpacing={2}
        fill="#FFFFFF"
      >
        {time}
      </text>
    </svg>
  )
}

export default function ClockMatch20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A digital clock showing 04:30"
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DigitalClock20 time="04:30" />
      </div>
    </div>
  )
}
