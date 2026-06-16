import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SumGridFigure } from './P22G3Q21Illustration'
import { buildP22G3Q21Steps } from './p22G3Q21Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// WMI-22P3A-Q21 — post-answer explainer. Re-uses SumGridFigure and fills the
// 3x3 grid one deduction per beat using the total 45 and the labelled line
// sums, landing on ● + ◆ + ★ = 3 + 6 + 8 = 17 (answer B).
export default function P22G3Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi kisi memakai total 45 dan jumlah garis; ● = ${story.dot}, ◆ = ${story.diamond}, ★ = ${story.star}, jadi ${story.answer}.`
      : `Explainer: fill the grid using the total 45 and the line sums; ● = ${story.dot}, ◆ = ${story.diamond}, ★ = ${story.star}, so ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SumGridFigure filled={beat.filled} highlight={beat.highlight} />

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
