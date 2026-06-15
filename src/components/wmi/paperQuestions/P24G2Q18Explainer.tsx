import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FruitGrid } from './P24G2Q18Illustration'
import { buildP24G2Q18Steps } from './p24G2Q18Steps'

const GREEN = '#10B981'

export default function P24G2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const keep = beat.keep ? new Set(beat.keep) : undefined

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dari ${story.total} buah, sisakan pisang, ambil ${story.remove} — jawaban ${story.answerLabel}.`
      : `Explainer: of ${story.total} fruit, keep the bananas and take away ${story.remove} — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FruitGrid keep={keep} ringKind={beat.ringKind} />

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
