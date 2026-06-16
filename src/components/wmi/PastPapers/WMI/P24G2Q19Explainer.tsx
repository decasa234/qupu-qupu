import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q19Flower } from './P24G2Q19Illustration'
import { buildP24G2Q19Steps } from './p24G2Q19Steps'

// WMI-24P2A-Q19 — post-answer explainer for the matching-flower question.
// Reuses the Q19Flower primitive so the animation reads as the static figure
// coming alive: it reads the alternating dark/white discs, shows that a rotation
// keeps the order, shows that a mirror reverses it (the trap), and lands on the
// option that is a true rotation — the seed answer (E).

const GREEN = '#10B981'

export default function P24G2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'E'
  const story = useMemo(() => buildP24G2Q19Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bunga yang cocok bisa diputar, bukan dicerminkan; jawabannya ${answer}.`
      : `Explainer: the matching flower can be rotated, not mirrored; the answer is ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q19Flower rotateSteps={beat.rotateSteps} mirror={beat.mirror} activePetals={beat.activePetals} />

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
