import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Dartboard } from './P25G1Q15Illustration'
import { buildP25G1Q15Steps } from './p25G1Q15Steps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for WMI-25P1A-Q15. The option boards are images, so the
 * explainer tallies Ally's board (10 + 10 + 1 + 1 + 0 = 22), states the winning
 * rule (Luka must score under 22), and lands on the keyed answer letter — the one
 * board that ties or beats Ally and so cannot occur if Ally wins.
 */
export default function P25G1Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q15Steps(lang, props.correctAnswer), [lang, props.correctAnswer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: total Ally = ${story.allyTotal}; Luka harus kurang dari itu, jadi papan ${story.answer} tidak mungkin.`
      : `Explainer: Ally's total = ${story.allyTotal}; Luka must score less, so board ${story.answer} is impossible.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Dartboard showTotal={beat.showTotal} countedDarts={beat.countedDarts} />

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
