import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DigitCountDiagram } from './DigitCount16A15Illustration'
import { buildDigitCount16A15Steps } from './digitCount16A15Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function DigitCount16A15Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildDigitCount16A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung digit 1–9 (9 digit) ditambah 10–59 (100 digit) = 109 digit total.'
      : 'Explainer: count digits 1–9 (9 digits) plus 10–59 (100 digits) = 109 digits total.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DigitCountDiagram
          revealedGroups={beat.revealedGroups}
          showTotal={beat.showTotal}
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
