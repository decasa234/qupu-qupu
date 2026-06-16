import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PyramidFigure } from './P24G1Q13Illustration'
import { buildP24G1Q13Steps } from './p24G1Q13Steps'

const GREEN = '#10B981'

export default function P24G1Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kotak kanan = 20 − 13 = 7, lalu apel = 7 − 3 = ${story.apple} (jawaban B).`
      : `Explainer: right box = 20 − 13 = 7, then apple = 7 − 3 = ${story.apple} (answer B).`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PyramidFigure showRightMid={beat.showRightMid} revealApple={beat.revealApple} highlight={beat.highlight} />

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
