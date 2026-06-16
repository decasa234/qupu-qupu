import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BarChart22G2, DessertTray22G2 } from './P22G2Q7Illustration'
import { buildP22G2Q7Steps } from './p22G2Q7Steps'

const GREEN = '#10B981'

export default function P22G2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: biskuit ${story.cookies}, kue ${story.cakes}, keju ${story.cheese}, jadi diagram yang benar adalah B.`
      : `Explainer: cookies ${story.cookies}, cakes ${story.cakes}, cheese ${story.cheese}, so the correct chart is B.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {beat.showChart ? (
          <BarChart22G2 values={beat.bars} active={beat.activeBar} maxH={8} />
        ) : (
          <DessertTray22G2 highlight={beat.highlight} />
        )}

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
