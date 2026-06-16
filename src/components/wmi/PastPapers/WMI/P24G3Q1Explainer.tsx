/**
 * WMI-24P3A-Q1 post-answer explainer — number-line placement.
 *
 * Reuses the static figure's `NumberLineP` primitive so the animation reads as
 * the same scene coming alive: it shows the midpoint 8500, drops the wrong
 * candidates (8085 too low, 8850 too high), then lands 8580 right where P is
 * — answer D.
 */
import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberLineP } from './P24G3Q1Illustration'
import { buildP24G3Q1Steps } from './p24G3Q1Steps'

const GREEN = '#10B981'

export default function P24G3Q1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: P diawali 8 dan dekat titik tengah 8500, jadi P = 8580 (jawaban D).'
      : 'Explainer: P starts with 8 and sits near the midpoint 8500, so P = 8580 (answer D).'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberLineP showMidpoint={beat.showMidpoint} candidate={beat.candidate ?? undefined} />

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
