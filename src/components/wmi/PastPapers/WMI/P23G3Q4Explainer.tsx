import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FractionStrips, SHADED_COUNT, STRIP_COUNT } from './P23G3Q4Illustration'
import { buildP23G3Q4Steps } from './p23G3Q4Steps'

const GREEN = '#10B981'

export default function P23G3Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'D'
  const story = useMemo(() => buildP23G3Q4Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${SHADED_COUNT} strip diarsir dari ${STRIP_COUNT}, jadi pecahannya ${SHADED_COUNT}/${STRIP_COUNT}.`
      : `Explainer: ${SHADED_COUNT} strips shaded out of ${STRIP_COUNT}, so the fraction is ${SHADED_COUNT}/${STRIP_COUNT}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FractionStrips countedShaded={beat.countedShaded} ringWhole={beat.ringWhole} />

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
