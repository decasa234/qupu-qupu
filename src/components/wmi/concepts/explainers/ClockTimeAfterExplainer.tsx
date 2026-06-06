import { useEffect, useMemo } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildClockAfterSteps } from './clockAfterSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const GREEN = '#10B981'
const PURPLE = '#341857'
const HAND_LEN = 36

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export default function ClockTimeAfterExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { hour: number; add: number }

  const story = useMemo(() => buildClockAfterSteps(p.hour, p.add, lang), [p.hour, p.add, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The hand sits at the start hour on 'show'/'add', then sweeps forward by
  // add×30° (clockwise, through 12 if it wraps) on 'wrap'/'result'.
  const startAngle = (story.hour % 12) * 30
  const atStart = beat.phase === 'show' || beat.phase === 'add'
  const handAngle = atStart ? startAngle : startAngle + story.add * 30

  // Animate the ANGLE and derive the hand tip from it, so the tip travels along
  // the circular arc — a true rotation about the centre (no transform-origin
  // quirks, which is why the previous version looked wrong).
  const angle = useMotionValue(handAngle)
  useEffect(() => {
    const controls = animate(angle, handAngle, { type: 'spring', stiffness: 55, damping: 14 })
    return () => controls.stop()
  }, [angle, handAngle])
  const tipX = useTransform(angle, (a) => 70 + HAND_LEN * Math.sin(toRad(a)))
  const tipY = useTransform(angle, (a) => 70 - HAND_LEN * Math.cos(toRad(a)))

  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jam menunjukkan pukul ${story.hour}, maju ${story.add} jam, hasilnya pukul ${story.result}.`
      : `Explainer: clock shows ${story.hour} o'clock, count forward ${story.add} hours, result is ${story.result} o'clock.`

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

          {/* Hour hand — tip sweeps along the arc (true rotation about the centre) */}
          <motion.line x1={70} y1={70} x2={tipX} y2={tipY} stroke={isResult ? GREEN : BLUE} strokeWidth={5} strokeLinecap="round" />

          {/* Center dot */}
          <circle cx={70} cy={70} r={4} fill={BLUE} />
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
