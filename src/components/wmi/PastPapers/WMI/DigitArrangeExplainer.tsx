import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DigitArrangeFigure, ANSWER } from './DigitArrangeIllustration'
import { buildDigitArrangeSteps } from './digitArrangeSteps'

const GREEN = '#10B981'

export default function DigitArrangeExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDigitArrangeSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bilangan dua angka dari 1, 2, 3, 4 diurutkan dari terkecil — yang ke-5 adalah ${ANSWER}.`
      : `Explainer: two-digit numbers from 1, 2, 3, 4 listed smallest-first — the 5th is ${ANSWER}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DigitArrangeFigure revealedRows={beat.revealedRows} countIndex={beat.countIndex} result={beat.result} />

        {beat.result && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: GREEN }}>
            {ANSWER}
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
