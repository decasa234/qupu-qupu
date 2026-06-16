import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q20Diagram } from './P20G3Q20Illustration'
import { buildP20G3Q20Steps } from './p20G3Q20Steps'

const GREEN = '#10B981'

export default function P20G3Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G3Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tumpukan 10 kubus dilengkapi menjadi kubus 3×3×3 = 27, jadi perlu ${story.answer} kubus tambahan.`
      : `Explainer: a 10-cube pile is completed into a 3×3×3 = 27 cube, so ${story.answer} extra cubes are needed.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q20Diagram cells={undefined} ghosts={beat.ghosts} />

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
