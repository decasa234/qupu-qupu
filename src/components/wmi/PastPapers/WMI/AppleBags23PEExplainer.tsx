import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BagDiagram } from './AppleBags23PEIllustration'
import { buildAppleBags23PESteps } from './appleBags23PESteps'

const GREEN = '#10B981'

export default function AppleBags23PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAppleBags23PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jumlahkan sisa apel (3+4+6=13), kurangi dari 19 (dapat 6 diambil), bagi dengan 3 kantong = 2 per kantong.'
      : 'Explainer: sum remaining apples (3+4+6=13), subtract from 19 (6 removed total), divide by 3 bags = 2 per bag.'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BagDiagram
          counts={beat.counts}
          dimCounts={beat.dimCounts}
          removedLabel={beat.removedLabel}
          showAnswer={beat.showAnswer}
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
