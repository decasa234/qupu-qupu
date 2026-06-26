import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberDiagramCore } from './NumberDiagramSIMOC19G2Q16Illustration'
import { buildNumberDiagramSIMOC19G2Q16Steps } from './numberDiagramSIMOC19G2Q16Steps'

const GREEN = '#10B981'

export default function NumberDiagramSIMOC19G2Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberDiagramSIMOC19G2Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan belah ketupat = pusat × (pusat − tepi) + tepi; bawah = 8×3+5 = 29.'
      : 'Explainer: diamond rule = centre × (centre − edge) + edge; bottom = 8×3+5 = 29.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumberDiagramCore
          highlight={beat.highlight}
          showAnswer={beat.showAnswer}
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
