import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q3Row } from './P25G1Q3Illustration'
import { buildP25G1Q3Steps } from './p25G1Q3Steps'

const GREEN = '#10B981'

export default function P25G1Q3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung bangun dari kiri; bola ada di posisi ${story.position} — jawaban ${story.answer}.`
      : `Explainer: count the shapes from the left; the ball is at position ${story.position} — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q3Row numbered={beat.numbered} ringIndex={beat.ringIndex} />

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
