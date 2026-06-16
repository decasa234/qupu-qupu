import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AnimalEquationRow } from './P21G1Q24Illustration'
import { buildP21G1Q24Steps } from './p21G1Q24Steps'

const GREEN = '#10B981'

export default function P21G1Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ganti 🦛 + 🦁 dengan 20, sisanya 🦁 + 🦁 + 🐨 = 31, sehingga 🦛 = ${story.hippo}.`
      : `Explainer: substitute 🦛 + 🦁 with 20, the rest 🦁 + 🦁 + 🐨 = 31, so 🦛 = ${story.hippo}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <AnimalEquationRow
          tokens={beat.row}
          highlightFirstThree={beat.highlightFirstThree}
          valueChips={beat.valueChips}
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
