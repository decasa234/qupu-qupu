import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q14Diagram } from './P20G3Q14Illustration'
import { buildP20G3Q14Steps } from './p20G3Q14Steps'

const GREEN = '#10B981'

export default function P20G3Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G3Q14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap ikon 3 gajah; ${story.answer} kebun binatang punya lebih dari 10 gajah.`
      : `Explainer: each icon is 3 elephants; ${story.answer} zoos have more than 10 elephants.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q14Diagram revealRow={beat.revealRow} markedOver={beat.markedOver} />

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
