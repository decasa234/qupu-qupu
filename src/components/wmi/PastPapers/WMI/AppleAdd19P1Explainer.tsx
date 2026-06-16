import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AppleDiagram } from './AppleAdd19P1Illustration'
import { buildAppleAdd19P1Steps } from './appleAdd19P1Steps'

const GREEN = '#10B981'

export default function AppleAdd19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAppleAdd19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: buat sepuluh dulu — pindahkan 1 apel agar ${story.left} jadi 10, lalu 10 + 7 = ${story.answer}.`
      : `Explainer: make a ten first — move 1 apple so ${story.left} becomes 10, then 10 + 7 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <AppleDiagram
          leftCount={beat.leftCount}
          rightCount={beat.rightCount}
          showBridge={beat.showBridge}
          showAnswer={beat.showAnswer}
          leftLabel={beat.leftLabel}
          rightLabel={beat.rightLabel}
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
