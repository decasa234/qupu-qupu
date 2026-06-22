// Beat-driven explainer for SEAMO-16-A-Q20 (pair-sum system, find ⊙ = 28).
// Adapted from ShapeEquationExplainer.tsx structure.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PairSumsDiagram } from './PairSums16A20Illustration'
import { buildPairSums16A20Steps } from './pairSums16A20Steps'

const GREEN = '#10B981'

export default function PairSums16A20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPairSums16A20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jumlahkan tiga persamaan → 128 → total = 64 → lingkaran = ${story.circleValue}.`
      : `Explainer: sum all three equations → 128 → total = 64 → circle = ${story.circleValue}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PairSumsDiagram
          highlightRow={beat.highlightRow}
          showAnswer={beat.showAnswer}
          dimFirst={beat.dimFirst}
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
