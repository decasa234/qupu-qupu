import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquareCountDiagram } from './SquareCountHK24P1Q17Illustration'
import { buildSquareCountHK24P1Q17Steps } from './squareCountHK24P1Q17Steps'

const GREEN = '#059669'
const BLUE = '#2563EB'

export default function SquareCountHK24P1Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSquareCountHK24P1Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 9 persegi 1×1 ditambah 2 persegi 2×2 sama dengan 11 persegi.'
      : 'Explainer: 9 unit squares plus 2 two-by-two squares equals 11 squares total.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SquareCountDiagram
          highlightA={beat.highlightA}
          highlightB={beat.highlightB}
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
