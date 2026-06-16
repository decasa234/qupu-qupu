import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RibbonGrid } from './P20G1Q9Illustration'
import { buildP20G1Q9Steps } from './p20G1Q9Steps'

const GREEN = '#10B981'

export default function P20G1Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G1Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pita terpanjang ${story.longest} kotak, terpendek ${story.shortest} kotak, selisih ${story.difference} kotak.`
      : `Explainer: longest ribbon ${story.longest} squares, shortest ${story.shortest} squares, difference ${story.difference} squares.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RibbonGrid highlight={beat.highlight} showLength={beat.showLength} highlightColor={beat.highlightColor} />

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
