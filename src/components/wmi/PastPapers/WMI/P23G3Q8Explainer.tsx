import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Mountain, PERIMETER, X_VALUE } from './P23G3Q8Illustration'
import { buildP23G3Q8Steps } from './p23G3Q8Steps'

const GREEN = '#10B981'

export default function P23G3Q8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'D'
  const story = useMemo(() => buildP23G3Q8Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jumlah sisi yang diketahui ${PERIMETER - X_VALUE} m, jadi x = ${PERIMETER} − ${PERIMETER - X_VALUE} = ${X_VALUE} m.`
      : `Explainer: the known sides total ${PERIMETER - X_VALUE} m, so x = ${PERIMETER} − ${PERIMETER - X_VALUE} = ${X_VALUE} m.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Mountain highlight={beat.highlight} revealX={beat.revealX} />

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
