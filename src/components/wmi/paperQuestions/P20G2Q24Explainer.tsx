import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { DiceStack } from './P20G2Q24Illustration'
import { buildP20G2Q24Steps } from './p20G2Q24Steps'

const GREEN = '#10B981'

export default function P20G2Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G2Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: total atas+bawah = ${story.total}, sisi atas = ${story.upTotal}, jadi sisi bawah = ${story.answer}.`
      : `Explainer: up+down total = ${story.total}, up faces = ${story.upTotal}, so down faces = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DiceStack upTotal={beat.upTotal} downTotal={beat.downTotal} markTopUp={beat.markTopUp} />

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
