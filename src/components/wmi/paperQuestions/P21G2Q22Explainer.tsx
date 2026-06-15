import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CrossGridQ22 } from './P21G2Q22Illustration'
import { buildP21G2Q22Steps } from './p21G2Q22Steps'

const GREEN = '#10B981'

export default function P21G2Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G2Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kotak terisi 3, 6, 8, dan 1, sehingga jumlah terbesarnya ${story.answer} — jawaban B.`
      : `Explainer: the boxes are 3, 6, 8 and 1, so the largest possible sum is ${story.answer} — answer B.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CrossGridQ22 values={beat.values} highlight={beat.highlight} showSum={beat.showSum} />

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
