/**
 * SEAMOX-24-A-Q15 — Animated explainer for the meeting-path problem.
 *
 * Beats:
 *   1. Show the initial setup (house → park, both walkers, 2600 m).
 *   2. Add speeds: 60 + 70 = 130 m/min.
 *   3. Time = 2600 ÷ 130 = 20 min.
 *   4. Meeting time = 0730 + 20 = 0750 h — meeting dot appears on path.
 *
 * Reuses MeetingPathSVG from the stem illustration.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MeetingPathSVG } from './MeetingPathX24A15Illustration'
import {
  MEETING_PATH_STEPS,
  MEETING_PATH_FINAL_INDEX,
} from './meetingPathX24A15Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'

export default function MeetingPathX24A15Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const holds = useMemo(() => MEETING_PATH_STEPS.map((s) => s.hold), [])

  const index = useBeatControl(MEETING_PATH_FINAL_INDEX, {
    ...props,
    holds,
  })

  const beat = MEETING_PATH_STEPS[index] ?? MEETING_PATH_STEPS[MEETING_PATH_FINAL_INDEX]
  const isResult = beat.phase === 'result'
  const caption = lang === 'id' ? beat.captionId : beat.captionEn

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: John dan saudaranya berjalan saling mendekati — hitung kecepatan gabungan lalu waktu pertemuan.'
      : 'Explainer: John and his brother walk toward each other — find combined speed then meeting time.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <MeetingPathSVG showMeeting={beat.showMeeting} />

        {/* Running computation label (speed / time / result) */}
        {(beat.phase === 'speed' || beat.phase === 'time' || beat.phase === 'result') && (
          <div
            className="font-display text-xl font-black tabular-nums"
            style={{ color: isResult ? GREEN : BLUE }}
          >
            {beat.phase === 'speed' && '60 + 70 = 130 m/min'}
            {beat.phase === 'time' && '2600 ÷ 130 = 20 min'}
            {beat.phase === 'result' && '0730 + 20 min = 0750 h'}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: '#1E40AF' }
          }
        >
          {caption}
        </div>
      </div>
    </div>
  )
}
