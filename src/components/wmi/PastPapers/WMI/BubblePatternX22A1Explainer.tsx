import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BubblePatternDiagram } from './BubblePatternX22A1Illustration'
import { buildBubblePatternX22A1Steps } from './bubblePatternX22A1Steps'

const GREEN = '#059669'
const BLUE = '#30598A'

export default function BubblePatternX22A1Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildBubblePatternX22A1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola sudut +1 per gambar → B=4, C=5; barisan tengah 9, 20, 35 (selisih kedua +4) → A=35.'
      : 'Explainer: corner +1 per figure → B=4, C=5; center sequence 9, 20, 35 (2nd diff +4) → A=35.'

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BubblePatternDiagram
          ringCorners={beat.ringCorners}
          revealFig3={beat.revealFig3}
          ringCenters={beat.ringCenters}
          showAnswer={beat.showAnswer}
          lang={lang}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
