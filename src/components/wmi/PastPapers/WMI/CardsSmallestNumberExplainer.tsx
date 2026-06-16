import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardsFigure } from './CardsSmallestNumberIllustration'
import { buildCardsSmallestNumberSteps } from './cardsSmallestNumberSteps'

const GREEN = '#10B981'

export default function CardsSmallestNumberExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCardsSmallestNumberSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const picked = useMemo(() => new Set(beat.picked), [beat.picked])
  const faded = useMemo(() => new Set(beat.faded), [beat.faded])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: membuat bilangan 3 digit terkecil dari kartu — jawabannya ${story.answer}.`
      : `Explainer: building the smallest 3-digit number from the cards — the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CardsFigure picked={picked} faded={faded} placeLabels={beat.placeLabels} />

        {/* The number being assembled, slot by slot. */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {beat.slots.map((d, i) => {
            const filled = d !== ''
            return (
              <div
                key={i}
                className="flex h-12 w-10 items-center justify-center rounded-lg border-2 font-display text-3xl font-black tabular-nums"
                style={
                  filled
                    ? { borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }
                    : { borderColor: '#CBD5E1', background: '#FFFFFF', color: '#CBD5E1' }
                }
              >
                {filled ? d : '?'}
              </div>
            )
          })}
        </div>

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
