import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColumnAddDiagram } from './ColumnAdd16A9Illustration'
import { buildColumnAdd16A9Steps } from './columnAdd16A9Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function ColumnAdd16A9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildColumnAdd16A9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tambahkan 2 + 22 + 222 + 2222 + 22222 langkah demi langkah = 24 690.'
      : 'Explainer: add 2 + 22 + 222 + 2 222 + 22 222 step by step = 24 690.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ColumnAddDiagram
          revealedCount={beat.revealedCount}
          showAnswer={beat.showAnswer}
          highlightCol={beat.highlightCol}
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
