import { useMemo } from 'react'
import { z } from 'zod'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import { useBeatControl } from '../../../concepts/explainers/useBeatControl'
import { definePoolMeta } from '../poolMeta'

export const paramsSchema = z.object({
  /** Hour the short hand points to, 1–12. */
  hour: z.number().int().min(1).max(12),
  /** Minute the long hand points to, 0–59. */
  minute: z.number().int().min(0).max(59),
})
export type ClockFaceParams = z.infer<typeof paramsSchema>

export const meta = definePoolMeta({
  id: 'clock-face',
  title: 'Read an analog clock',
  summary:
    'Draws an analog clock set to a given time; the explainer reads the hour hand, then the minute hand, then lands on the time.',
  useWhen:
    'Question shows or asks for a clock time — reading the hands, matching a clock to a time, or telling what time it shows.',
  tags: ['clock', 'time', 'reading'],
  grades: [1, 2, 3],
  status: 'template' as const,
  paramsSchema,
  paramsExample: '{ "hour": 12, "minute": 30 }',
})

const FACE = '#2f6df0'
const PURPLE = '#341857'
const GREEN = '#10B981'
const MIN_PULSE = '#F97316'
const NEUTRAL = '#475569'

/** Clock angle (degrees clockwise from 12-o'clock) + length → SVG endpoint. */
function handPoint(angleDeg: number, length: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 75 + length * Math.sin(rad), y: 75 - length * Math.cos(rad) }
}

type Emphasis = 'hour' | 'minute' | 'none'

/** A clean analog clock face set to `hour:minute`. */
export function ClockFigure({
  hour,
  minute,
  emphasize = 'none',
}: {
  hour: number
  minute: number
  emphasize?: Emphasis
}) {
  const minuteAngle = minute * 6
  const hourAngle = (hour % 12) * 30 + minute * 0.5
  const minuteTip = handPoint(minuteAngle, 50)
  const hourTip = handPoint(hourAngle, 34)
  const minutePulse = emphasize === 'minute'
  const hourPulse = emphasize === 'hour'

  return (
    <svg
      viewBox="0 0 150 150"
      width={150}
      height={150}
      role="img"
      aria-label={`Clock showing ${hour}:${String(minute).padStart(2, '0')}`}
      style={{ overflow: 'visible' }}
    >
      {/* Face */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={FACE} strokeWidth={3} />

      {/* 12 tick marks */}
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
            stroke={FACE}
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* Numbers 12 / 3 / 6 / 9 */}
      {([12, 3, 6, 9] as const).map((n) => {
        const pos = handPoint((n % 12) * 30, 46)
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

      {/* Minute hand (long) */}
      <line
        x1={75}
        y1={75}
        x2={minuteTip.x}
        y2={minuteTip.y}
        stroke={minutePulse ? MIN_PULSE : NEUTRAL}
        strokeWidth={minutePulse ? 4 : 2.5}
        strokeLinecap="round"
        style={minutePulse ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' } : undefined}
      />

      {/* Hour hand (short) */}
      <line
        x1={75}
        y1={75}
        x2={hourTip.x}
        y2={hourTip.y}
        stroke={hourPulse ? FACE : NEUTRAL}
        strokeWidth={hourPulse ? 5 : 3.5}
        strokeLinecap="round"
        style={hourPulse ? { filter: 'drop-shadow(0 0 4px rgba(47,109,240,0.7))' } : undefined}
      />

      {/* Center dot */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

interface Beat {
  emphasize: Emphasis
  caption: string
  result: boolean
}

function buildBeats(hour: number, minute: number, lang: 'en' | 'id'): Beat[] {
  const mm = String(minute).padStart(2, '0')
  const time = `${hour}:${mm}`
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      emphasize: 'hour',
      caption: t(`The short hand is near ${hour} → ${hour} o'clock`, `Jarum pendek dekat ${hour} → pukul ${hour}`),
      result: false,
    },
    {
      emphasize: 'minute',
      caption: t(`The long hand points to ${minute} minutes`, `Jarum panjang menunjuk ${minute} menit`),
      result: false,
    },
    {
      emphasize: 'none',
      caption: t(`So the time is ${time}`, `Jadi waktunya ${time}`),
      result: true,
    },
  ]
}

export function ClockFaceIllustration({ params }: { params: unknown }) {
  const p = paramsSchema.parse(params)
  return (
    <div className="my-4 flex justify-center">
      <ClockFigure hour={p.hour} minute={p.minute} />
    </div>
  )
}

export function ClockFaceExplainer(props: ExplainerProps) {
  const p = paramsSchema.parse(props.params)
  const lang = props.lang ?? 'en'
  const beats = useMemo(() => buildBeats(p.hour, p.minute, lang), [p.hour, p.minute, lang])
  const index = useBeatControl(beats.length - 1, { ...props })
  const beat = beats[index] ?? beats[beats.length - 1]

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={beats[beats.length - 1].caption}>
      <div className="flex flex-col items-center gap-3">
        <ClockFigure hour={p.hour} minute={p.minute} emphasize={beat.emphasize} />
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

export default {
  meta,
  Illustration: ClockFaceIllustration,
  Explainer: ClockFaceExplainer,
}
