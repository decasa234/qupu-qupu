import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { RouteMapQ21 } from './P21G2Q21Illustration'
import { buildP21G2Q21Steps } from './p21G2Q21Steps'

const GREEN = '#10B981'

export default function P21G2Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G2Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jumlah pohon yang mungkin adalah {${story.achievable.join(', ')}}, jadi ${story.impossible} salah — jawaban ${story.answerLabel}.`
      : `Explainer: the possible tree counts are {${story.achievable.join(', ')}}, so ${story.impossible} is wrong — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RouteMapQ21
          highlight={beat.highlight}
          runningTotal={beat.runningTotal}
          totalLabel={beat.totalLabel ?? undefined}
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
