// BullRabbitChain20A2Explainer — SEAMO 2020 Paper A, Q2
//
// Animates: 1 bull = 4 goats (row1) → 1 goat = 2 rabbits (row2) → 4×2=8 (result).
// SSR-safe: no Math.random, no Date.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BullRabbitDiagram } from './BullRabbitChain20A2Illustration'
import { buildBullRabbitChain20A2Steps } from './bullRabbitChain20A2Steps'

const GREEN = '#10B981'

export default function BullRabbitChain20A2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBullRabbitChain20A2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? '1 banteng = 4 kambing, 1 kambing = 2 kelinci, jadi 1 banteng = 8 kelinci. Jawaban D.'
      : '1 bull = 4 goats, 1 goat = 2 rabbits, so 1 bull = 8 rabbits. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BullRabbitDiagram
          dimRows={beat.dimRows}
          revealAnswer={beat.revealAnswer}
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
