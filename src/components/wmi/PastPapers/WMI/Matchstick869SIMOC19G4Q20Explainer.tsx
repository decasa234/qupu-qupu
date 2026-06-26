import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Matchstick869Diagram } from './Matchstick869SIMOC19G4Q20Illustration'
import { buildMatchstick869Steps } from './matchstick869SIMOC19G4Q20Steps'

const GREEN = '#10B981'

export default function Matchstick869SIMOC19G4Q20Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildMatchstick869Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 869 menggunakan 7+6+6=19 batang; pindahkan 3 batang untuk membuat 9951 (6+6+5+2=19) — jawaban 9951.`
      : `Explainer: 869 uses 7+6+6=19 sticks; move 3 to make 9951 (6+6+5+2=19) — answer is 9951.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Matchstick869Diagram showAfter={beat.showAfter} highlightAnswer={beat.highlightAnswer} />

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
