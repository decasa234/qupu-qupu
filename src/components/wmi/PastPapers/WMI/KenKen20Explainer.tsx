import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { KenKen20Figure } from './KenKen20Illustration'
import { buildKenKen20Steps } from './kenKen20Steps'

const GREEN = '#10B981'

export default function KenKen20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildKenKen20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kisi 4×4 dipecahkan langkah demi langkah; sel A, B, C, D memberi ${story.answer}.`
      : `Explainer: the 4×4 grid is solved step by step; cells A, B, C, D give ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <KenKen20Figure
          solved={beat.solved}
          activeKeys={beat.activeKeys}
          litKeys={beat.litKeys}
          markAnswers={beat.markAnswers}
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
