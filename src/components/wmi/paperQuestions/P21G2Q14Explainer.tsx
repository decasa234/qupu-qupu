import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q14Figure } from './P21G2Q14Illustration'
import { buildP21G2Q14Steps } from './p21G2Q14Steps'

const GREEN = '#10B981'

export default function P21G2Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G2Q14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: sisi besar = ${story.count} × ${story.smallSide} = ${story.bigSide} cm, keliling = 4 × ${story.bigSide} = ${story.bigPerim} cm.`
      : `Explainer: big side = ${story.count} × ${story.smallSide} = ${story.bigSide} cm, perimeter = 4 × ${story.bigSide} = ${story.bigPerim} cm.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q14Figure
          showSmallLabel
          traceSide={beat.traceSide}
          highlightDiagonal={beat.highlightDiagonal}
          showBigSide={beat.showBigSide}
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
