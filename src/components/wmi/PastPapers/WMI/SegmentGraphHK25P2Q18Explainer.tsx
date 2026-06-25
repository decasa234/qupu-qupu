import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NodeGraph } from './primitives/NodeGraph'
import { GRAPH_NODES, GRAPH_EDGES } from './SegmentGraphHK25P2Q18Illustration'
import { buildSegmentGraphHK25P2Q18Steps } from './segmentGraphHK25P2Q18Steps'

const GREEN  = '#10B981'
const AMBER  = '#F59E0B'
const PAST   = '#22C55E'   // lighter green for already-counted edges
const BASE   = '#30598A'   // default qupu-brand-blue

export default function SegmentGraphHK25P2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSegmentGraphHK25P2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Build edges with per-beat colouring
  const edges = GRAPH_EDGES.map((e, i) => {
    if (beat.result) return { ...e, color: GREEN }
    if (i < beat.highlightUpTo) return { ...e, color: PAST }
    if (i === beat.highlightUpTo) return { ...e, color: AMBER }
    return { ...e, color: BASE }
  })

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung 10 segmen garis dalam graf.`
      : `Explainer: counting 10 line segments in the graph.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <NodeGraph
            nodes={GRAPH_NODES}
            edges={edges}
            nodeR={8}
            width={420}
            height={320}
          />
        </div>

        {beat.running > 0 && (
          <div
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : AMBER }}
          >
            {beat.running}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.highlightUpTo >= 0
                ? { background: '#FFFBEB', borderColor: AMBER, color: '#92400E' }
                : { background: '#E1EFFB', borderColor: BASE, color: BASE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
