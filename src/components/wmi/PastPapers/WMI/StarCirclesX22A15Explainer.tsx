import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildNodes, EDGES, SVG_W, SVG_H, NODE_R } from './StarCirclesX22A15Illustration'
import { buildStarCirclesX22A15Steps } from './starCirclesX22A15Steps'
import { NodeGraph } from './primitives/NodeGraph'

const GREEN = '#10B981'

export default function StarCirclesX22A15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStarCirclesX22A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jumlah 1–7=28; tiga lengan ×12=36; pusat dihitung 3× sehingga pusat=(36−28)÷2=4.'
      : 'Explainer: sum 1–7=28; three arms ×12=36; center counted 3 times so center=(36−28)÷2=4.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NodeGraph
          nodes={buildNodes(beat.labels, beat.fills)}
          edges={EDGES}
          nodeR={NODE_R}
          width={SVG_W}
          height={SVG_H}
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
