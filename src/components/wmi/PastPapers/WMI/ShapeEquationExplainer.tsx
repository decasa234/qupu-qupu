import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeEquationDiagram } from './ShapeEquationIllustration'
import { buildShapeEquationSteps } from './shapeEquationSteps'

const GREEN = '#10B981'

export default function ShapeEquationExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeEquationSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lingkaran = ${story.circleValue}, bintang = ${story.starValue}, segitiga = ${story.triangleValue}, jadi segitiga + bintang = ${story.answer}.`
      : `Explainer: circle = ${story.circleValue}, star = ${story.starValue}, triangle = ${story.triangleValue}, so triangle + star = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeEquationDiagram highlightRow={beat.highlightRow} revealAnswer={beat.revealAnswer} solved={beat.solved} />

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
