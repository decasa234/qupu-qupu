import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberGrid25, VERIFIED_PACKING } from './P22G1Q25Illustration'
import { buildP22G1Q25Steps } from './p22G1Q25Steps'

const GREEN = '#10B981'

export default function P22G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const groups = VERIFIED_PACKING.slice(0, beat.groupCount)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pasang kelompok tiga kotak berjumlah 16 tanpa tumpang tindih; paling banyak ${story.maxGroups} kelompok (D).`
      : `Explainer: pack non-overlapping groups of three squares summing to 16; at most ${story.maxGroups} groups fit (D).`

  return (
    <div className="mx-auto w-full max-w-[396px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberGrid25 groups={groups} showCount={beat.showCount} />

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
