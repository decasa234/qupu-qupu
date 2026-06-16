import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FriendsMap } from './P21G1Q12Illustration'
import { buildP21G1Q12Steps } from './p21G1Q12Steps'

const GREEN = '#10B981'

export default function P21G1Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Judy ke Hellen 5 m lalu Hellen ke Amy 11 m, jadi 16 m. Jawaban ${story.answerLetter}.`
      : `Explainer: Judy to Hellen 5 m then Hellen to Amy 11 m, so 16 m in total. Answer ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FriendsMap litLegs={beat.litLegs} runningTotal={beat.runningTotal} />

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
