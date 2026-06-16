import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ORDER_STRING, Q7Diagram } from './P22G1Q7Illustration'
import { buildP22G1Q7Steps } from './p22G1Q7Steps'

const GREEN = '#10B981'

export default function P22G1Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'C'
  const story = useMemo(() => buildP22G1Q7Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: urutkan tali dari terpanjang ke terpendek (${ORDER_STRING}); itu pilihan ${answer}.`
      : `Explainer: order the ropes from longest to shortest (${ORDER_STRING}); that is choice ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q7Diagram showLengths={beat.showLengths} spotlight={beat.spotlight} ranks={beat.ranks} />

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
