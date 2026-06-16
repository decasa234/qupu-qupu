import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q16Scene } from './P23G1Q16Illustration'
import { buildP23G1Q16Steps } from './p23G1Q16Steps'

const GREEN = '#10B981'

export default function P23G1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'D'
  const story = useMemo(() => buildP23G1Q16Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: titik merah berputar satu sudut tiap segi lima; pada segi lima "?" titik berada di sudut kiri-atas — jawaban ${story.answer}.`
      : `Explainer: the red dot turns one corner per pentagon; on the "?" pentagon it lands at the upper-left corner — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[600px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q16Scene solveQuestion={beat.solveQuestion} focusIndex={beat.focusIndex} />

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
