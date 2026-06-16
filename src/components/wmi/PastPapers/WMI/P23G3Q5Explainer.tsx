import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeGrid, TARGET_AREA } from './P23G3Q5Illustration'
import { buildP23G3Q5Steps } from './p23G3Q5Steps'

const GREEN = '#10B981'

export default function P23G3Q5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'A'
  const story = useMemo(() => buildP23G3Q5Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung kotak tiap bangun; hanya bangun ${answerLetter} yang tepat ${TARGET_AREA} cm².`
      : `Explainer: count each shape's squares; only shape ${answerLetter} is exactly ${TARGET_AREA} cm².`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeGrid focus={beat.focus} measured={beat.measured} winner={beat.winner} />

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
