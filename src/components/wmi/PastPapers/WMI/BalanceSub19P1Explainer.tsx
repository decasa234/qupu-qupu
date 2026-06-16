import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BalanceBeam } from './BalanceSub19P1Illustration'
import { buildBalanceSub19P1Steps } from './BalanceSub19P1Steps'

const GREEN = '#10B981'

export default function BalanceSub19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalanceSub19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 1 belah ketupat = ${story.squaresPerDiamond} persegi, jadi 2 belah ketupat = ${story.answer} persegi. Jawaban B.`
      : `Explainer: 1 diamond = ${story.squaresPerDiamond} squares, so 2 diamonds = ${story.answer} squares. Answer B.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BalanceBeam left={beat.left} right={beat.right} highlight={beat.highlight} solvedRight={beat.solvedRight} />

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
