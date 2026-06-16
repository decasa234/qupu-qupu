import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VennDiagram } from './TriangleColors20Illustration'
import { buildTriangleColors20Steps } from './triangleColors20Steps'

const GREEN = '#10B981'

export default function TriangleColors20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTriangleColors20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 6 segitiga semuanya, buang 2 yang hitam, jadi ${story.answer} segitiga tidak hitam.`
      : `Explainer: 6 triangles in all, cross out the 2 black ones, so ${story.answer} triangles are not black.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <VennDiagram highlightKeys={beat.highlightKeys} dimNonTriangles={beat.dimNonTriangles} badges={beat.badges} />

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
