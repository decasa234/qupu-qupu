// OSN-15-SD-NAS-Q13 — explainer animasi pasca-jawaban.
//
// Mengimpor ulang ClockAngleOSN15NQ13Face dari Illustration agar explainer
// terlihat sebagai adegan yang sama, dibuat hidup beat per beat.
//
// Urutan beat → lihat clockAngleOSN15NQ13Steps.ts.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockAngleOSN15NQ13Face, MINUTE_ANGLE, HOUR_ANGLE } from './ClockAngleOSN15NQ13Illustration'
import { buildClockAngleOSN15NQ13Steps } from './clockAngleOSN15NQ13Steps'

const GREEN  = '#10B981'
const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const ORANGE = '#F97316'

export default function ClockAngleOSN15NQ13Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildClockAngleOSN15NQ13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  // Per-beat rendering state
  const showMinuteLabel = beat.phase === 'minute' || beat.phase === 'subtract' || beat.phase === 'answer'
  const showHourLabel   = beat.phase === 'hour'   || beat.phase === 'subtract' || beat.phase === 'answer'
  const showArc         = beat.phase === 'subtract' || beat.phase === 'answer'
  const arcLabel        = beat.phase === 'answer' ? '47,5°' : '?°'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: menghitung sudut lancip antara jarum jam pukul 03:25.'
      : 'Explainer: calculating the acute angle between clock hands at 03:25.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Muka jam */}
        <div style={{ position: 'relative' }}>
          <ClockAngleOSN15NQ13Face
            size={180}
            showArc={showArc}
            minuteAngle={MINUTE_ANGLE}
            hourAngle={HOUR_ANGLE}
            arcLabel={arcLabel}
          />

          {/* Label jarum menit */}
          {showMinuteLabel && (
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#FFF7ED',
              border: `1.5px solid ${ORANGE}`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              color: '#92400e',
              whiteSpace: 'nowrap',
            }}>
              {lang === 'id' ? 'Jarum menit: 150°' : 'Minute hand: 150°'}
            </div>
          )}

          {/* Label jarum jam */}
          {showHourLabel && (
            <div style={{
              position: 'absolute',
              top: 10,
              right: 0,
              background: '#EFF6FF',
              border: `1.5px solid ${BLUE}`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              color: '#1e3a5f',
              whiteSpace: 'nowrap',
            }}>
              {lang === 'id' ? 'Jarum jam: 102,5°' : 'Hour hand: 102.5°'}
            </div>
          )}
        </div>

        {/* Keterangan langkah */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: PURPLE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
