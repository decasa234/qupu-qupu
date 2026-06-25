import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColumnAddDiagram } from './ColumnAddHK24P1Q10Illustration'
import { buildColumnAddHK24P1Q10Steps } from './columnAddHK24P1Q10Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function ColumnAddHK24P1Q10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildColumnAddHK24P1Q10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: BA + AB = 11(A+B) = 121 → A+B = 11; dikombinasikan dengan B−A = 1 → B = 6.'
      : 'Explainer: BA + AB = 11(A+B) = 121 → A+B = 11; combined with B−A = 1 → B = 6.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ColumnAddDiagram
          showAnswer={beat.showAnswer}
          highlightSum={beat.highlightSum}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
