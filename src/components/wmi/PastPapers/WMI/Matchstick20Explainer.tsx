import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Matchstick20Diagram } from './Matchstick20Illustration'
import { buildMatchstick20Steps } from './matchstick20Steps'

const GREEN = '#10B981'

export default function Matchstick20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMatchstick20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 91 pakai 8 batang, 77 pakai 6 batang, 75 pakai 8 batang — terbesar ketiga adalah ${story.answer}.`
      : `Explainer: 91 uses 8 sticks, 77 uses 6 sticks, 75 uses 8 sticks — the third largest is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Matchstick20Diagram candidates={beat.candidates} highlightAnswer={beat.highlightAnswer} />

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
