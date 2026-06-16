import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q24SumGridDiagram } from './P24G1Q24Illustration'
import { buildP24G1Q24Steps } from './p24G1Q24Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P24G1Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lingkaran = ${story.circle}, segitiga = ${story.triangle}, bintang = ${story.star}. Jawaban ${story.answerLetter}.`
      : `Explainer: circle = ${story.circle}, triangle = ${story.triangle}, star = ${story.star}. Answer ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q24SumGridDiagram
          highlightRows={beat.highlightRows}
          highlightCol={beat.highlightCol}
          solved={beat.solved}
          showAnswer={beat.showAnswer}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
