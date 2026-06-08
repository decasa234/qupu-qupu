import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ClockFace } from './ClockReadIllustration'
import { buildClockReadSteps } from './clockReadSteps'

const GREEN = '#10B981'

export default function ClockReadExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildClockReadSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const emphasize: 'hour' | 'minute' | 'none' =
    beat.phase === 'minute' ? 'minute' : beat.phase === 'hour' ? 'hour' : 'none'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: cara membaca jam analog yang menunjukkan pukul 12:30.'
      : 'Explainer: how to read the analog clock showing 12:30.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ClockFace emphasize={emphasize} />

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
