import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q19Diagram } from './P24G3Q19Illustration'
import { buildP24G3Q19Steps } from './p24G3Q19Steps'

const GREEN = '#10B981'

export default function P24G3Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ×0 memaksa A = 0, lalu telusuri siklus untuk B = 23 dan E = 11, jadi B + E = ${story.answerValue} (jawaban ${story.answerLabel}).`
      : `Explainer: ×0 forces A = 0, then chase the cycle to B = 23 and E = 11, so B + E = ${story.answerValue} (answer ${story.answerLabel}).`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q19Diagram targetValues={beat.targetValues} spotlight={beat.spotlight} />

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
