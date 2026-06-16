import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FruitSubDiagram } from './FruitSubtraction20Illustration'
import { buildFruitSubtraction20Steps } from './fruitSubtraction20Steps'

const GREEN = '#10B981'

export default function FruitSubtraction20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildFruitSubtraction20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: satuan meminjam, jadi pisang = 4, bilangan atas 84, dan pengurangnya 84 − 36 = ${story.answer}.`
      : `Explainer: the ones place borrows, so banana = 4, the top number is 84, and the subtrahend is 84 − 36 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FruitSubDiagram
          revealBanana={beat.revealBanana}
          revealStrawberry={beat.revealStrawberry}
          highlight={beat.highlight}
          bananaGuess={beat.bananaGuess}
          borrow={beat.borrow}
          showCheck={beat.showCheck}
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
