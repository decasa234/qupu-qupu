import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { P21G1Q22Grid } from './P21G1Q22Illustration'
import { buildP21G1Q22Steps } from './p21G1Q22Steps'

const GREEN = '#10B981'

export default function P21G1Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: "?" adalah layang-layang merah yang tinggi — jawaban ${story.answerLetter}.`
      : `Explainer: "?" is a red long-kite — answer ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <P21G1Q22Grid
          revealAnswer={beat.revealAnswer}
          highlightRow={beat.highlightRow}
          highlightCol={beat.highlightCol}
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
