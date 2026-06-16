import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeGridDiagram } from './ShapeGrid20Illustration'
import { buildShapeGrid20Steps } from './shapeGrid20Steps'

const GREEN = '#10B981'

export default function ShapeGrid20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeGrid20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baris bawah adalah baris terakhir, lalu bentuk paling kanan di baris itu adalah segitiga biru — jawaban B.'
      : 'Explainer: the bottom row is the last row, then the rightmost shape in that row is the blue triangle — answer B.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeGridDiagram
          highlightRow={beat.highlightRow}
          highlightCell={beat.highlightCell}
          trapCell={beat.trapCell}
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
