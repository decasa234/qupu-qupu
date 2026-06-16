import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquareCutDiagram } from './P23G3Q9Illustration'
import { buildP23G3Q9Steps } from './p23G3Q9Steps'

const GREEN = '#10B981'

export default function P23G3Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G3Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: luas persegi ${story.squareArea} m² dikurangi luas persegi panjang ${story.rectArea} m² sama dengan ${story.shaded} m².`
      : `Explainer: square area ${story.squareArea} m² minus rectangle area ${story.rectArea} m² equals ${story.shaded} m².`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SquareCutDiagram
          highlightShaded={beat.highlightShaded}
          emphasizeSquare={beat.emphasizeSquare}
          emphasizeRect={beat.emphasizeRect}
          rectTag={beat.rectTag}
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
