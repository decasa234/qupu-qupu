import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q23DotPatternDiagram } from './P24G1Q23Illustration'
import { buildP24G1Q23Steps } from './p24G1Q23Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P24G1Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: titik yang bertumpuk di kedua kisi saling meniadakan, titik tunggal tetap. Hasilnya cocok dengan opsi ${story.answerLetter}.`
      : `Explainer: dots present in both grids cancel, single dots stay. The result matches option ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q23DotPatternDiagram showCancel={beat.showCancel} showResult={beat.showResult} />

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
