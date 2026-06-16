import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Pencils24G2 } from './P24G2Q14Illustration'
import { buildP24G2Q14Steps } from './p24G2Q14Steps'

const GREEN = '#10B981'

export default function P24G2Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'B'
  const story = useMemo(() => buildP24G2Q14Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lebar tetap ${story.totalW} cm, pensil atas ${story.topLen} cm, pensil bawah ${story.botLen} cm, jumlahnya ${story.answerSum} cm — jawaban ${story.answer}.`
      : `Explainer: fixed width ${story.totalW} cm, top pencil ${story.topLen} cm, bottom pencil ${story.botLen} cm, sum ${story.answerSum} cm — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Pencils24G2
          showWidth={beat.showWidth}
          showTopLen={beat.showTopLen}
          showBotLen={beat.showBotLen}
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
