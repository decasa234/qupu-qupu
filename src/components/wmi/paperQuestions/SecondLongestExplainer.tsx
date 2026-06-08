import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SecondLongestBars } from './SecondLongestIllustration'
import { buildSecondLongestSteps } from './secondLongestSteps'

const GREEN = '#10B981'

export default function SecondLongestExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSecondLongestSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: membandingkan panjang strip — yang kedua terpanjang adalah ${story.secondLongest}.`
      : `Explainer: comparing strip lengths — the second longest is ${story.secondLongest}.`

  return (
    <div className="mx-auto w-full max-w-[522px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SecondLongestBars longest={beat.longest} second={beat.second} />

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
