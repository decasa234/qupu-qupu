import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SquareGrid } from './P22G1Q21Illustration'
import { buildP22G1Q21Steps } from './p22G1Q21Steps'

const GREEN = '#10B981'

export default function P22G1Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G1Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi kotak dengan jumlah tepi, ★ = ${story.star}, lalu ★ + ♦ = ${story.total} (jawaban ${story.answer}).`
      : `Explainer: fill the boxes from the edge sums, star = ${story.star}, then star + diamond = ${story.total} (answer ${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SquareGrid
          highlightTopRow={beat.highlightTopRow}
          highlightCol={beat.highlightCol}
          highlightCells={beat.highlightCells}
          showSolution={beat.showSolution}
          revealStar={beat.revealStar}
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
