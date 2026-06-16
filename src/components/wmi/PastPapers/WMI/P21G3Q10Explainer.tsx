import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q10Strip } from './P21G3Q10Illustration'
import { buildP21G3Q10Steps } from './p21G3Q10Steps'

const GREEN = '#10B981'

export default function P21G3Q10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G3Q10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: periksa tiap bangun; ${story.answer} terbagi menjadi bagian sama besar.`
      : `Explainer: check each shape; ${story.answer} are divided into equal parts.`

  return (
    <div className="mx-auto w-full max-w-[660px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q10Strip focusIdx={beat.focusIdx} verdictIdx={beat.verdictIdx} equalSoFar={beat.equalSoFar} />

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
