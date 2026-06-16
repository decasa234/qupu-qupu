import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ScalesDiagram } from './ThreeScales20Illustration'
import { buildThreeScales20Steps } from './threeScales20Steps'

const GREEN = '#10B981'

export default function ThreeScales20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildThreeScales20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: total 16 g, sisi seimbang 8 g, bintang = 5, lingkaran = 3, segitiga = 3, jadi segitiga + lingkaran = ${story.answer} g.`
      : `Explainer: total 16 g, balanced sides 8 g, star = 5, circle = 3, triangle = 3, so triangle + circle = ${story.answer} g.`

  return (
    <div className="mx-auto w-full max-w-[700px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ScalesDiagram focus={beat.focus} solved={beat.solved} showAnswer={beat.showAnswer} />

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
