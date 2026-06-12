import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AnalogClock20, DigitalClock20 } from './ClockMatch20Illustration'
import { buildClock20Steps } from './clockMatch20Steps'

const GREEN = '#10B981'
const RED = '#EF4444'

export default function ClockMatch20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildClock20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 04:30 berarti jarum panjang di 6 dan jarum pendek antara 4 dan 5, jadi jam C yang cocok.'
      : 'Explainer: 04:30 means the minute hand at 6 and the hour hand between 4 and 5, so clock C matches.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end justify-center gap-4">
          {/* The digital time we must match. */}
          <DigitalClock20 time="04:30" />

          {/* The answer clock (C) being built up beat by beat. */}
          <div className="flex flex-col items-center gap-1">
            <AnalogClock20
              time="4:30"
              size={124}
              emphasizeMinute={beat.emphasizeMinute}
              emphasizeHour={beat.emphasizeHour}
            />
            <span
              className="rounded-full border-2 px-2.5 text-sm font-extrabold"
              style={
                beat.revealMatch
                  ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                  : { background: '#FFFFFF', borderColor: '#CBD5E1', color: '#475569' }
              }
            >
              C
            </span>
          </div>

          {/* The trap clock (A, 3:30): minute hand also on the 6, but the hour hand is wrong. */}
          {beat.showTrap && (
            <div className="flex flex-col items-center gap-1">
              <span className="relative inline-block" style={{ opacity: 0.6 }}>
                <AnalogClock20 time="3:30" size={96} />
                <svg viewBox="0 0 96 96" className="absolute inset-0" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
                  <line x1={18} y1={18} x2={78} y2={78} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                  <line x1={78} y1={18} x2={18} y2={78} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                </svg>
              </span>
              <span
                className="rounded-full border-2 px-2.5 text-sm font-extrabold"
                style={{ background: '#FEE2E2', borderColor: RED, color: '#991B1B' }}
              >
                A
              </span>
            </div>
          )}
        </div>

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
