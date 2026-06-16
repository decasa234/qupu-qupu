import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PerimeterFigure } from './P20G3Q6Illustration'
import { buildP20G3Q6Steps } from './p20G3Q6Steps'

const GREEN = '#10B981'

export default function P20G3Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G3Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: persegi 15 × 15 (keliling 60) ditambah tonjolan 5 + 5, jadi keliling ${story.perimeter} cm, pilihan ${story.answer}.`
      : `Explainer: a 15 by 15 square (perimeter 60) plus a tab's 5 + 5, so the perimeter is ${story.perimeter} cm, option ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PerimeterFigure highlight={beat.highlight} showAllLengths={beat.showAllLengths} />

        {beat.result && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-extrabold text-white"
            style={{ background: GREEN }}
            aria-hidden="true"
          >
            {story.answer}
          </div>
        )}

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
