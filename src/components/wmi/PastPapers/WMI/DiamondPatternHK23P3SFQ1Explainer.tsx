import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiamondPanelDiagram } from './DiamondPatternHK23P3SFQ1Illustration'
import { buildDiamondPatternHK23P3SFQ1Steps } from './diamondPatternHK23P3SFQ1Steps'

const GREEN = '#10B981'

export default function DiamondPatternHK23P3SFQ1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDiamondPatternHK23P3SFQ1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan atas×bawah = kiri×kanan; berlian 3: ?×12 = 40×9 = 360, jadi ? = 30.'
      : 'Explainer: rule top×bottom = left×right; diamond 3: ?×12 = 40×9 = 360, so ? = 30.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DiamondPanelDiagram highlightIndex={beat.highlightIndex} showAnswer={beat.showAnswer} />
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
