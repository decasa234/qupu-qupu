import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import BalloonAnimals19G3Q9Illustration from './BalloonAnimals19G3Q9Illustration'
import { buildBalloonAnimals19G3Q9Steps } from './balloonAnimals19G3Q9Steps'

const RESULT_STYLE = { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
const STEP_STYLE   = { background: '#EFF6FF', borderColor: '#3B82F6', color: '#1E40AF' }

export default function BalloonAnimals19G3Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalloonAnimals19G3Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kucing+domba=5 balon; kucing+domba+2anjing=11 balon; 1 anjing=3 balon; domba+kucing+anjing=8 balon — jawaban A.'
      : 'Explainer: cat+sheep=5 balloons; cat+sheep+2dogs=11; 1 dog=3; sheep+cat+dog=8 — answer A.'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BalloonAnimals19G3Q9Illustration
          highlightPanel={beat.highlightPanel}
          showAnswer={beat.showAnswer}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={beat.result ? RESULT_STYLE : STEP_STYLE}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
