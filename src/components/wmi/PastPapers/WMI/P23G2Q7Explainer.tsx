import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RibbonRulerScene } from './P23G2Q7Illustration'
import { buildP23G2Q7Steps } from './p23G2Q7Steps'

const GREEN = '#10B981'

export default function P23G2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G2Q7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pita A = ${story.lenAmm} mm, pita B = ${story.lenBmm} mm, selisih ${story.diffMm} mm.`
      : `Explainer: ribbon A = ${story.lenAmm} mm, ribbon B = ${story.lenBmm} mm, difference ${story.diffMm} mm.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RibbonRulerScene measureA={beat.measureA} measureB={beat.measureB} />

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
