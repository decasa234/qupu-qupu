import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q13Grid } from './P25G1Q13Illustration'
import { buildP25G1Q13Steps } from './p25G1Q13Steps'

const GREEN = '#10B981'

export default function P25G1Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: persegi besar 4×4 = ${story.bigTotal} persegi, sudah ada ${story.used}, jadi tambahkan ${story.answer}.`
      : `Explainer: a 4×4 big square is ${story.bigTotal} squares; ${story.used} are already there, so add ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q13Grid
          showBigOutline={beat.showBigOutline}
          showGhosts={beat.showGhosts}
          numberFilled={beat.numberFilled}
          numberGhosts={beat.numberGhosts}
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
