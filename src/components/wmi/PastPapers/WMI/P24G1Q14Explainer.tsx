import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PencilFigure } from './P24G1Q14Illustration'
import { buildP24G1Q14Steps } from './p24G1Q14Steps'

const GREEN = '#10B981'

export default function P24G1Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lebar penuh 20 cm; pensil terpendek (hijau) = 20 − 12 = ${story.shortest} cm (jawaban E).`
      : `Explainer: full width 20 cm; the shortest pencil (green) = 20 − 12 = ${story.shortest} cm (answer E).`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PencilFigure showFullGap={beat.showFullGap} measure={beat.measure} showLength={beat.showLength} />

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
