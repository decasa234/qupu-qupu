import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q25Diagram } from './P20G1Q25Illustration'
import { buildP20G1Q25Steps } from './p20G1Q25Steps'

const GREEN = '#10B981'

export default function P20G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung cara mencapai tiap angka; 10 dicapai ${story.total} cara, jadi ${story.other} cara lain (jawaban B).`
      : `Explainer: count ways to reach each number; 10 is reached ${story.total} ways, so ${story.other} other ways (answer B).`

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q25Diagram
          showExamplePath={beat.showExamplePath}
          waysBadges={beat.waysBadges}
          litCells={beat.litCells}
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
