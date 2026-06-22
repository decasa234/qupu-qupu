import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Cake6 } from './Cake6PEIllustration'
import { buildCake6PESteps } from './cake6PESteps'

const GREEN = '#10B981'

export default function Cake6PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCake6PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${story.largeCount} lilin besar = ${story.tens} tahun, ${story.smallCount} lilin kecil = ${story.ones} tahun, jadi ${story.tens} + ${story.ones} = ${story.answer} — jawaban ${story.letter}.`
      : `Explainer: ${story.largeCount} large candles = ${story.tens} years, ${story.smallCount} small candles = ${story.ones} years, so ${story.tens} + ${story.ones} = ${story.answer} — answer ${story.letter}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Cake6 focus={beat.focus} ring={beat.ring} />

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
