import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TulipDiagram } from './P23G3Q16Illustration'
import { buildP23G3Q16Steps } from './p23G3Q16Steps'

const GREEN = '#10B981'

export default function P23G3Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G3Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: A = ${story.a}, B = ${story.b}, C = ${story.c}, jadi A + B + C = ${story.sum}.`
      : `Explainer: A = ${story.a}, B = ${story.b}, C = ${story.c}, so A + B + C = ${story.sum}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TulipDiagram
          leftLabels={beat.leftLabels}
          rightLabels={beat.rightLabels}
          highlightRow={beat.highlightRow}
          solvedRows={beat.solvedRows}
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
