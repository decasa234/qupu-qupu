import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TilingFigureQ25 } from './P21G2Q25Illustration'
import { buildP21G2Q25Steps } from './p21G2Q25Steps'

const GREEN = '#10B981'

export default function P21G2Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G2Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: A jatuh pada kotak berisi ${story.aValue}, B pada kotak berisi ${story.bValue}, jadi A + B = ${story.answer} (jawaban A).`
      : `Explainer: A lands on a cell holding ${story.aValue}, B on a cell holding ${story.bValue}, so A + B = ${story.answer} (answer A).`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TilingFigureQ25 glowA={beat.glowA} glowB={beat.glowB} />

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
