import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PascalHexTriangle } from './P23G1Q24Illustration'
import { buildP23G1Q24Steps } from './p23G1Q24Steps'

const GREEN = '#10B981'

export default function P23G1Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G1Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const reveal = useMemo(() => new Set(beat.reveal), [beat.reveal])
  const ring = useMemo(() => new Set(beat.ring), [beat.ring])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiga sel arsiran segitiga Pascal bernilai ${story.parent}, ${story.child1}, dan ${story.child2}; jumlahnya ${story.answer}.`
      : `Explainer: the three shaded Pascal cells are ${story.parent}, ${story.child1}, and ${story.child2}; their sum is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PascalHexTriangle reveal={reveal} ringAt={ring} />

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
