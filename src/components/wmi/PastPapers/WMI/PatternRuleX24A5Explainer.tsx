import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PatternRuleX24A5Diagram } from './PatternRuleX24A5Illustration'
import { buildPatternRuleX24A5Steps } from './patternRuleX24A5Steps'

const GREEN = '#059669'
const BLUE = '#30598A'

export default function PatternRuleX24A5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildPatternRuleX24A5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan adalah A minus B; kebalikannya untuk baris 3 → persegi + X.'
      : 'Explainer: rule is A minus B; reverse for row 3 → square overlaid with X.'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PatternRuleX24A5Diagram
          revealAnswer={beat.revealAnswer}
          highlightRow={beat.highlightRow}
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
