import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q23Diagram } from './P24G3Q23Illustration'
import { buildP24G3Q23Steps } from './p24G3Q23Steps'

const GREEN = '#10B981'

export default function P24G3Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jumlahkan kedua kisi sel demi sel; sel yang dipakai keduanya saling hilang, sehingga tersisa empat lingkaran — jawaban ${story.answerLabel}.`
      : `Explainer: add the two grids cell by cell; shared cells cancel, leaving four circles — answer ${story.answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q23Diagram
          showResult={beat.showResult}
          hi1={beat.hi1}
          hi2={beat.hi2}
          resultGrid={beat.resultGrid}
          markAnswer={beat.markAnswer}
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
