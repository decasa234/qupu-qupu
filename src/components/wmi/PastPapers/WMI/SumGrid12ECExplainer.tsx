import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SumGrid12ECFigure } from './SumGrid12ECIllustration'
import { buildSumGrid12ECSteps } from './sumGrid12ECSteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function SumGrid12ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSumGrid12ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: baris 2 berjumlah 16 (salah) dan kolom 1 berjumlah 16 (salah); sel yang dibagi keduanya adalah angka 3, yang harus diubah menjadi 2. Jawaban B.'
      : 'Explainer: row 2 sums to 16 (wrong) and column 1 sums to 16 (wrong); their shared cell is the number 3, which must change to 2. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SumGrid12ECFigure
          highlightRows={beat.highlightRows}
          highlightCol={beat.highlightCol}
          ringMistake={beat.ringMistake}
          showCorrection={beat.showCorrection}
        />

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
