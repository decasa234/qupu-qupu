import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RollRectFigure } from './P25G3Q18Illustration'
import { buildP25G3Q18Steps } from './p25G3Q18Steps'

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function P25G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pusat menelusuri persegi panjang 6 × 4, keliling ${story.answer} cm — jawaban ${story.answerLabel}.`
      : `Explainer: the center traces a 6 by 4 rectangle, perimeter ${story.answer} cm — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RollRectFigure
          highlightPath={beat.highlightPath}
          showInnerDims={beat.showInnerDims}
          showCircle={beat.showCircle}
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
