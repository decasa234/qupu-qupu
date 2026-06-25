import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColourWormDiagram } from './ColourWormX24A2Illustration'
import { buildColourWormX24A2Steps } from './colourWormX24A2Steps'

const GREEN = '#059669'
const BLUE  = '#30598A'

export default function ColourWormX24A2Explainer(props: ExplainerProps) {
  const lang  = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildColourWormX24A2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola berulang Hijau-Hijau diikuti Kuning → ? = Kuning.'
      : 'Explainer: repeating Green-Green-Yellow cycle → ? = Yellow.'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ColourWormDiagram
          revealAnswer={beat.revealAnswer}
          highlightIds={beat.highlightIds}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE  }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
