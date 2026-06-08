import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildClockReadSteps } from './clockReadSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

/** Convert clock angle (degrees from 12-o-clock) + hand length to SVG endpoint. */
function handPoint(angleDeg: number, length: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: 75 + length * Math.sin(rad),
    y: 75 - length * Math.cos(rad),
  }
}

interface ClockFaceProps {
  hour: number
  minute: number
  emphasize: 'hour' | 'minute' | 'none'
}

function ClockFace({ hour, minute, emphasize }: ClockFaceProps) {
  const minuteAngle = minute * 6
  const hourAngle = (hour % 12) * 30 + minute * 0.5

  const minuteTip = handPoint(minuteAngle, 50)
  const hourTip = handPoint(hourAngle, 34)

  const hourPulse = emphasize === 'hour'
  const minutePulse = emphasize === 'minute'

  return (
    <svg
      viewBox="0 0 150 150"
      width={150}
      height={150}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Clock face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* Hour tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = handPoint(angle, 54)
        const outer = handPoint(angle, 62)
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={BLUE}
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* Hour numbers: 12, 3, 6, 9 */}
      {([12, 3, 6, 9] as const).map((n) => {
        const angle = ((n % 12) * 30)
        const pos = handPoint(angle, 46)
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
          >
            {n}
          </text>
        )
      })}

      {/* Minute hand (long, orange) */}
      <line
        x1={75}
        y1={75}
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke={minutePulse ? ORANGE : MUTED}
        strokeWidth={minutePulse ? 4 : 2.5}
        strokeLinecap="round"
        style={
          minutePulse
            ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' }
            : undefined
        }
      />

      {/* Hour hand (short, blue) */}
      <line
        x1={75}
        y1={75}
        x2={hourTip.x}
        y2={hourTip.y}
        stroke={hourPulse ? BLUE : MUTED}
        strokeWidth={hourPulse ? 5 : 3.5}
        strokeLinecap="round"
        style={
          hourPulse
            ? { filter: 'drop-shadow(0 0 4px rgba(47,109,240,0.7))' }
            : undefined
        }
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

export default function ClockReadTimeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { hour: number; minute: number }
  const story = useMemo(
    () => buildClockReadSteps(p.hour, p.minute, lang),
    [p.hour, p.minute, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const emphasize: 'hour' | 'minute' | 'none' =
    phase === 'hour' ? 'hour' : phase === 'minute' ? 'minute' : 'none'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: cara membaca jam analog — jam ${p.hour}, menit ${p.minute}.`
      : `Explainer: how to read an analog clock showing ${story.timeStr}.`

  // Build the time display label shown below the clock
  const buildingText: string = (() => {
    if (phase === 'show') return ''
    if (phase === 'hour') return lang === 'id' ? `${p.hour}:__` : `${p.hour}:__`
    if (phase === 'minute')
      return lang === 'id'
        ? `${p.hour}:${String(p.minute).padStart(2, '0')}`
        : `${p.hour}:${String(p.minute).padStart(2, '0')}`
    return story.timeStr
  })()

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        {/* SVG Clock */}
        <motion.div
          key={phase}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        >
          <ClockFace hour={p.hour} minute={p.minute} emphasize={emphasize} />
        </motion.div>

        {/* Building time display */}
        {buildingText ? (
          <motion.div
            key={buildingText}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="font-display text-3xl font-extrabold"
            style={{ color: phase === 'result' ? GREEN : BLUE }}
          >
            {buildingText}
          </motion.div>
        ) : null}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
