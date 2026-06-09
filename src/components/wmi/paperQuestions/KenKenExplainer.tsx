import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { KenKenFigure } from './KenKenGridIllustration'
import { buildKenKenSteps } from './kenKenSteps'

const GREEN = '#10B981'

export default function KenKenExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildKenKenSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi kisi 1–4 tanpa pengulangan — ABCD = ${story.answer}.`
      : `Explainer: fill the 1–4 grid with no repeats — ABCD = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <KenKenFigure filledRows={beat.filledRows} activeRow={beat.activeRow} markAnswers={beat.markAnswers} />

        {beat.result && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: GREEN }}>
            {story.answer}
          </div>
        )}

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
