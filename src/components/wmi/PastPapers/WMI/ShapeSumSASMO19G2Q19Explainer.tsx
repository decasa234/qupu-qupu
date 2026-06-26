import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeSumDiagram } from './ShapeSumSASMO19G2Q19Illustration'
import { buildShapeSumSASMO19G2Q19Steps } from './shapeSumSASMO19G2Q19Steps'

export default function ShapeSumSASMO19G2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildShapeSumSASMO19G2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: substitusi persegi=segitiga+20 dan lingkaran=0, diperoleh segitiga=6, persegi=26; jawabannya 26.'
      : 'Explainer: substitute square=triangle+20 and circle=0, get triangle=6, square=26; answer is 26.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeSumDiagram
          highlightEq1={beat.highlightEq1}
          highlightEq2={beat.highlightEq2}
          highlightEq3={beat.highlightEq3}
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
