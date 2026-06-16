import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SumGridDiagram } from './SumGrid20Illustration'
import { buildSumGrid20Steps } from './sumGrid20Steps'

const GREEN = '#10B981'

export default function SumGrid20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSumGrid20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: persegi = ${story.squareValue}, segilima = ${story.pentagonValue}, lingkaran = ${story.circleValue}, jadi bilangan persegi-lingkaran adalah ${story.answer}.`
      : `Explainer: square = ${story.squareValue}, pentagon = ${story.pentagonValue}, circle = ${story.circleValue}, so the square-then-circle number is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SumGridDiagram
          highlightRows={beat.highlightRows}
          highlightCol={beat.highlightCol}
          showRelation={beat.showRelation}
          solved={beat.solved}
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
