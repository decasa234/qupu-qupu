import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q6Ruler } from './P25G1Q6Illustration'
import { buildP25G1Q6Steps } from './p25G1Q6Steps'

const GREEN = '#10B981'

export default function P25G1Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pensil 1 = ${story.pencil1Len} cm, pensil 2 = ${story.pencil2Len} cm, jadi jumlahnya ${story.answer} cm.`
      : `Explainer: pencil 1 = ${story.pencil1Len} cm, pencil 2 = ${story.pencil2Len} cm, so the total is ${story.answer} cm.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q6Ruler measure1={beat.measure1} measure2={beat.measure2} guides1={beat.guides1} guides2={beat.guides2} />

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
