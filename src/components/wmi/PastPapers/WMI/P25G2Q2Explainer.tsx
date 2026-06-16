import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubeSolid } from './P25G2Q2Illustration'
import { buildP25G2Q2Steps } from './p25G2Q2Steps'

const GREEN = '#10B981'

export default function P25G2Q2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G2Q2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${story.visible} kubus terlihat dan ${story.hidden} tersembunyi, jadi seluruhnya ${story.total} kubus.`
      : `Explainer: ${story.visible} cubes visible and ${story.hidden} hidden, so ${story.total} cubes in total.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <IsoCubeSolid revealHidden={beat.revealHidden} countLayers={beat.countLayers} />

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
