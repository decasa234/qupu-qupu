import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AgeAliceDiagram } from './AgeAlice19B7Illustration'
import { buildAgeAlice19B7Steps } from './ageAlice19B7Steps'

const GREEN = '#10B981'

export default function AgeAlice19B7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAgeAlice19B7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: misalkan umur Alice = a, umur paman = 33−a; dalam 3 tahun 36−a = 2a+6, jadi a = 10 — jawaban B.'
      : 'Explainer: let Alice = a, uncle = 33−a; in 3 years 36−a = 2a+6, so a = 10 — answer B.'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <AgeAliceDiagram
          highlightNow={beat.highlightNow}
          highlightFuture={beat.highlightFuture}
          showAnswer={beat.showAnswer}
        />

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
