import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q25Grid } from './P19G3Q25Illustration'
import { buildP19G3Q25Steps } from './p19G3Q25Steps'

const GREEN = '#10B981'

export default function P19G3Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G3Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap keping berjumlah ${story.pieceSum}, isi kotaknya, lalu jumlah pojok A+B+C+D = ${story.cornerSum} — jawaban D.`
      : `Explainer: each piece sums to ${story.pieceSum}, fill the grid, then the corners A+B+C+D = ${story.cornerSum} — answer D.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q25Grid solved={beat.solved} litPiece={beat.litPiece} markCorners={beat.markCorners} />

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
