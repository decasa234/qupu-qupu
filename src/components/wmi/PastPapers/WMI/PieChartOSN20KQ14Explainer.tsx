import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PieChartDiagram } from './PieChartOSN20KQ14Illustration'
import { buildPieChartOSN20KQ14Steps } from './pieChartOSN20KQ14Steps'

export default function PieChartOSN20KQ14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildPieChartOSN20KQ14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jumlah tiga sektor tidak berlabel adalah 20+23.3+6.7=50%, sehingga x+y+z=100−50=50.'
      : 'Explainer: the three unlabeled sectors sum to 20+23.3+6.7=50%, so x+y+z=100−50=50.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PieChartDiagram
          highlightIds={beat.highlightIds}
          dimOthers={beat.dimOthers}
          showSum={beat.showSum}
          showAnswer={beat.showAnswer}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
