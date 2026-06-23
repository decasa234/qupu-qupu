// SEAMO-17-A-Q6 — post-answer animated explainer.
//
// Reuses AnalogClockEC17A6 from ElapsedClock17A6Illustration so the explainer
// reads as the same scene coming alive.
//
// Beat sequence → see elapsedClock17A6Steps.ts.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnalogClockEC17A6, START_H, START_M, END_H, END_M } from './ElapsedClock17A6Illustration'
import { buildElapsedClock17A6Steps } from './elapsedClock17A6Steps'

const GREEN  = '#10B981'
const BLUE   = '#2f6df0'
const INK    = '#1e293b'
const ORANGE = '#F97316'

export default function ElapsedClock17A6Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildElapsedClock17A6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: menghitung menit yang berlalu dari dua jam analog.'
      : 'Explainer: counting elapsed minutes from two analog clocks.'

  // Determine per-clock emphasis from the current beat.
  const clock1Highlight = beat.focus === 1
  const clock2Highlight = beat.focus === 2

  // On diff / convert beats, show elapsed annotation.
  const showElapsed = beat.phase === 'diff' || beat.phase === 'convert'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Two-clock figure */}
        <div className="flex items-end gap-5">
          {/* Clock 1 — start */}
          <div className="flex flex-col items-center gap-1">
            <AnalogClockEC17A6
              h={START_H} m={START_M}
              size={118}
              highlight={clock1Highlight}
              emphMinute={beat.phase === 'clock1'}
              emphHour={false}
            />
            <span
              className="font-display text-xs font-extrabold"
              style={{ color: clock1Highlight ? ORANGE : '#64748b' }}
            >
              {lang === 'id' ? 'Mulai' : 'Start'} · 1:30
            </span>
          </div>

          {/* Arrow */}
          <svg width={32} height={20} viewBox="0 0 32 20" aria-hidden="true" style={{ marginBottom: 26 }}>
            <line x1={2} y1={10} x2={26} y2={10} stroke={showElapsed ? ORANGE : INK} strokeWidth={2} strokeLinecap="round" />
            <polyline points="18,4 26,10 18,16" fill="none" stroke={showElapsed ? ORANGE : INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Clock 2 — end */}
          <div className="flex flex-col items-center gap-1">
            <AnalogClockEC17A6
              h={END_H} m={END_M}
              size={118}
              highlight={clock2Highlight}
              emphMinute={beat.phase === 'clock2'}
              emphHour={false}
            />
            <span
              className="font-display text-xs font-extrabold"
              style={{ color: clock2Highlight ? ORANGE : '#64748b' }}
            >
              {lang === 'id' ? 'Akhir' : 'End'} · 3:45
            </span>
          </div>
        </div>

        {/* Elapsed time annotation (diff + convert beats) */}
        {showElapsed && (
          <div
            className="rounded-lg border-2 px-4 py-1 font-display text-sm font-extrabold"
            style={{ borderColor: ORANGE, background: '#FFF7ED', color: '#92400e' }}
          >
            {beat.phase === 'diff'
              ? (lang === 'id' ? '3:45 − 1:30 = 2 jam 15 menit' : '3:45 − 1:30 = 2 h 15 min')
              : (lang === 'id' ? '2 × 60 + 15 = 135 menit' : '2 × 60 + 15 = 135 min')}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: '#1e3a5f' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
