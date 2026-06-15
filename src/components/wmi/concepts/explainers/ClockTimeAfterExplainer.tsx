import { useEffect, useMemo } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildClockAfterSteps } from './clockAfterSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

// Animate a hand's angle so its tip sweeps along the arc (true rotation about
// the centre — no SVG transform-origin quirks).
function useHandAngle(target: number) {
  const angle = useMotionValue(target)
  useEffect(() => {
    const controls = animate(angle, target, { type: 'spring', stiffness: 55, damping: 14 })
    return () => controls.stop()
  }, [angle, target])
  return angle
}

export default function ClockTimeAfterExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  // Coerce defensively: a stale stored instance (from a pre-minutes schema)
  // can lack minute/addMin — without this the caption would read "8:undefined".
  // (Such instances are also culled server-side; this is belt-and-suspenders.)
  const raw = params as Partial<{ hour: number; minute: number; addHour: number; addMin: number }>
  const p = {
    hour: raw.hour ?? 12,
    minute: raw.minute ?? 0,
    addHour: raw.addHour ?? 0,
    addMin: raw.addMin ?? 0,
  }

  const story = useMemo(
    () => buildClockAfterSteps(p.hour, p.minute, p.addHour, p.addMin, lang),
    [p.hour, p.minute, p.addHour, p.addMin, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const minAngle = useHandAngle(beat.minAngle)
  const hourAngle = useHandAngle(beat.hourAngle)
  const minTipX = useTransform(minAngle, (a) => 70 + 50 * Math.sin(toRad(a)))
  const minTipY = useTransform(minAngle, (a) => 70 - 50 * Math.cos(toRad(a)))
  const hourTipX = useTransform(hourAngle, (a) => 70 + 34 * Math.sin(toRad(a)))
  const hourTipY = useTransform(hourAngle, (a) => 70 - 34 * Math.cos(toRad(a)))

  const minuteActive = beat.phase === 'minutes'
  const hourActive = beat.phase === 'hours'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jam ${story.startStr}, maju ${p.addHour} jam ${p.addMin} menit, hasilnya ${story.resultStr}.`
      : `Explainer: clock ${story.startStr}, forward ${p.addHour} hours ${p.addMin} minutes, result ${story.resultStr}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">
        <svg viewBox="0 0 140 140" width={130} height={130} aria-hidden="true">
          {/* Clock face */}
          <circle cx={70} cy={70} r={60} fill="white" stroke={BLUE} strokeWidth={3} />

          {/* Hour tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = toRad(i * 30)
            return (
              <line
                key={i}
                x1={70 + 52 * Math.sin(a)}
                y1={70 - 52 * Math.cos(a)}
                x2={70 + 58 * Math.sin(a)}
                y2={70 - 58 * Math.cos(a)}
                stroke={PURPLE}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          })}

          {/* Cardinal hour labels */}
          <text x={70} y={20} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>12</text>
          <text x={120} y={72} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>3</text>
          <text x={70} y={122} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>6</text>
          <text x={20} y={72} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>9</text>

          {/* Minute hand — long, orange (dimmed while the hour hand is the focus) */}
          <motion.line
            x1={70}
            y1={70}
            x2={minTipX}
            y2={minTipY}
            stroke={isResult ? GREEN : ORANGE}
            strokeWidth={minuteActive ? 5 : 4}
            strokeLinecap="round"
            opacity={hourActive ? 0.5 : 1}
          />
          {/* Hour hand — short, blue (dimmed while the minute hand is the focus) */}
          <motion.line
            x1={70}
            y1={70}
            x2={hourTipX}
            y2={hourTipY}
            stroke={isResult ? GREEN : BLUE}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={minuteActive ? 0.5 : 1}
          />

          {/* Center dot */}
          <circle cx={70} cy={70} r={4} fill={PURPLE} />
        </svg>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
