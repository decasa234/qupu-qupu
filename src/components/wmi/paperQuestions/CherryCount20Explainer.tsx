import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CherryDiagram } from './CherryCount20Illustration'
import { buildCherryCount20Steps } from './cherryCount20Steps'

const GREEN = '#10B981'

export default function CherryCount20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCherryCount20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: baris atas ${story.topTotal} ceri, baris bawah ${story.bottomTotal} ceri, jadi seluruhnya ${story.answer} ceri.`
      : `Explainer: top row ${story.topTotal} cherries, bottom row ${story.bottomTotal} cherries, so ${story.answer} cherries in total.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CherryDiagram
          countedBunches={beat.countedBunches}
          showTopTotal={beat.showTopTotal}
          showBottomTotal={beat.showBottomTotal}
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
