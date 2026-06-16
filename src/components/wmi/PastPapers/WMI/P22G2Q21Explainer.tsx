import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SumGridDiagram } from './P22G2Q21Illustration'
import { buildP22G2Q21Steps } from './p22G2Q21Steps'

const GREEN = '#10B981'

export default function P22G2Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi 1..9 (total 45); jumlah luar yang ditanya, baris atas ${story.topRow} dan baris bawah ${story.bottomRow}, berjumlah ${story.answer} (jawaban D).`
      : `Explainer: fill 1..9 (total 45); the asked outside sums, top row ${story.topRow} and bottom row ${story.bottomRow}, add to ${story.answer} (answer D).`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SumGridDiagram
          revealCells={beat.revealCells}
          highlightRows={beat.highlightRows}
          highlightCols={beat.highlightCols}
          showStarValue={beat.showStarValue}
          showDiamond={beat.showDiamond}
          showDiamondValue={beat.showDiamondValue}
          showRowSums={beat.showRowSums}
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
