import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ArrowGrid23 } from './P22G1Q23Illustration'
import { buildP22G1Q23Steps } from './p22G1Q23Steps'

const GREEN = '#10B981'

export default function P22G1Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G1Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ikuti panah satu per satu dari baris 3; anak ayam keluar lewat bawah di bawah kolom 5 dan mencapai nanas (C).'
      : 'Explainer: follow the arrows one at a time from row 3; the chick exits the bottom below column 5 and reaches the pineapple (C).'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ArrowGrid23 visitedNodes={beat.visitedNodes} showTrail={beat.showTrail} revealAnswer={beat.revealAnswer} />

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
