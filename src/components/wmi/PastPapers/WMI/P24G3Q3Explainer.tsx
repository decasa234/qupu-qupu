/**
 * WMI-24P3A-Q3 post-answer explainer — bus seat map.
 *
 * Reuses the static figure's `BusSeatMap` primitive so the animation reads as
 * the same scene coming alive: it names the 27 students, counts the 31 seats,
 * seats the students (blue), and lands on 31 − 27 = 4 empty seats (answer C).
 */
import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BusSeatMap } from './P24G3Q3Illustration'
import { buildP24G3Q3Steps } from './p24G3Q3Steps'

const GREEN = '#10B981'

export default function P24G3Q3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${story.students} siswa, ${story.totalSeats} kursi, jadi ${story.empty} kursi kosong (jawaban C).`
      : `Explainer: ${story.students} students, ${story.totalSeats} seats, so ${story.empty} empty seats (answer C).`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BusSeatMap filledSeats={beat.filledSeats} showTotal={beat.showTotal} />

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
