import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TrianglePatternDiagram } from './TrianglePattern20Illustration'
import { buildTrianglePattern20Steps } from './trianglePattern20Steps'

const GREEN = '#10B981'

export default function TrianglePattern20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTrianglePattern20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kelompok berulang 5 bentuk berisi ${story.trianglesPerGroup} segitiga; 40 ÷ 5 = ${story.groupCount} kelompok; ${story.groupCount} × ${story.trianglesPerGroup} = ${story.answer} segitiga.`
      : `Explainer: the repeating group of 5 shapes has ${story.trianglesPerGroup} triangles; 40 ÷ 5 = ${story.groupCount} groups; ${story.groupCount} × ${story.trianglesPerGroup} = ${story.answer} triangles.`

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TrianglePatternDiagram
          groupHighlight={beat.groupHighlight}
          boxAllGroups={beat.boxAllGroups}
          highlightTriangles={beat.highlightTriangles}
          showMath={beat.showMath}
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
