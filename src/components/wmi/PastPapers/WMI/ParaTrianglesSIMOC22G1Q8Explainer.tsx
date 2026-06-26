import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParaTrianglesSIMOC22G1Q8Figure } from './ParaTrianglesSIMOC22G1Q8Illustration'
import { buildParaTrianglesSIMOC22G1Q8Steps } from './paraTrianglesSIMOC22G1Q8Steps'

const GREEN = '#10B981'

export default function ParaTrianglesSIMOC22G1Q8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildParaTrianglesSIMOC22G1Q8Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung segitiga dalam jajaran genjang — totalnya ${story.total}.`
      : `Explainer: counting triangles in a parallelogram — the total is ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ParaTrianglesSIMOC22G1Q8Figure highlightGroup={beat.highlightGroup} />

        {beat.running > 0 && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#2f6df0' }}
          >
            {beat.running}
          </div>
        )}

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
