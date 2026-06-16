import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q4Cake } from './P25G1Q4Illustration'
import { buildP25G1Q4Steps } from './p25G1Q4Steps'

const GREEN = '#10B981'

export default function P25G1Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${story.longCount} lilin panjang = ${story.tens}, ${story.shortCount} lilin pendek = ${story.ones}, jadi ${story.tens} + ${story.ones} = ${story.answer} — jawaban ${story.letter}.`
      : `Explainer: ${story.longCount} long candles = ${story.tens}, ${story.shortCount} short candles = ${story.ones}, so ${story.tens} + ${story.ones} = ${story.answer} — answer ${story.letter}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q4Cake focus={beat.focus} ring={beat.ring} />

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
