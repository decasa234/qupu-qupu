import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RuleBoard } from './P19G2Q6Illustration'
import { buildP19G2Q6Steps } from './p19G2Q6Steps'

const GREEN = '#10B981'

// Post-answer explainer for WMI-19P2A-Q6. Reuses the RuleBoard primitive: it
// reads the worked rule, substitutes triangle + bowl, then reveals the
// constructed result and names the matching choice (A). The original choices
// were images, so we derive the figure and clearly indicate the letter.
export default function P19G2Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G2Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: terapkan aturan gabungan bentuk; segitiga + mangkuk menghasilkan Gambar ${story.answerLetter} — jawaban ${story.answerLetter}.`
      : `Explainer: apply the combine rule; triangle + bowl gives Figure ${story.answerLetter} — answer ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RuleBoard revealAnswer={beat.revealAnswer} />

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
