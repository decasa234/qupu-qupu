import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MultABDiagram } from './MultABHK25P3Q13Illustration'
import { buildMultABHK25P3Q13Steps } from './multABHK25P3Q13Steps'

const GREEN = '#10B981'

export default function MultABHK25P3Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMultABHK25P3Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: (10A+B)×A=96; coba A=3 → B=2; 32×3=96 ✓; A−B=1.'
      : 'Explainer: (10A+B)×A=96; try A=3 → B=2; 32×3=96 ✓; A−B=1.'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <MultABDiagram
          showValues={beat.showValues}
          aHighlight={beat.aHighlight}
          bHighlight={beat.bHighlight}
          showCheck={beat.showCheck}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF9C3', borderColor: '#D97706', color: '#92400E' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
