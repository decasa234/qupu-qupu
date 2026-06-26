// Post-answer explainer for SASMO-20-G4-Q21.
// "Colour 8 circles (cube-graph projection) so connected pairs differ — minimum colours?"
// Answer: 2 (bipartite graph).
//
// Animation strategy:
//   intro      — plain graph, introduce rule
//   try_one    — TL coloured Yellow, rest plain
//   propagate  — all outer nodes coloured (TL=Y, TR=G, BL=G, BR=Y)
//   inner      — inner nodes coloured (ITL=G, ITR=Y, IBL=Y, IBR=G)
//   check      — full colouring with edges highlighted green
//   answer     — full colouring, caption announces answer 2

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'
import { CUBE_NODES, CUBE_EDGES } from './GraphColorSASMO20G4Q21Illustration'
import { buildGraphColorSASMO20G4Q21Steps } from './graphColorSASMO20G4Q21Steps'
import type { GraphColorPhase } from './graphColorSASMO20G4Q21Steps'

// ── Palette ────────────────────────────────────────────────────────────────────

const PLAIN       = '#F5F0E8'   // default node fill
const YELLOW      = '#FDE047'   // colour A
const GREEN_NODE  = '#34D399'   // colour B
const EDGE_NORMAL = '#30598A'
const EDGE_OK     = '#10B981'
const DIM_EDGE    = '#CBD5E1'
const GREEN_CONFIRM = '#10B981'

// Which nodes are Yellow in the final 2-colouring (bipartition set A)
const SET_A = new Set(['TL', 'BR', 'ITR', 'IBL'])

function nodeColor(id: string, phase: GraphColorPhase): string {
  switch (phase) {
    case 'intro':
      return PLAIN

    case 'try_one':
      return id === 'TL' ? YELLOW : PLAIN

    case 'propagate': {
      // Only outer nodes coloured
      const outerA = new Set(['TL', 'BR'])
      const outerB = new Set(['TR', 'BL'])
      if (outerA.has(id)) return YELLOW
      if (outerB.has(id)) return GREEN_NODE
      return PLAIN
    }

    case 'inner':
    case 'check':
    case 'answer':
      return SET_A.has(id) ? YELLOW : GREEN_NODE

    default:
      return PLAIN
  }
}

function buildNodes(phase: GraphColorPhase): NodeDef[] {
  return CUBE_NODES.map((n) => ({ ...n, fill: nodeColor(n.id, phase) }))
}

function buildEdges(phase: GraphColorPhase): EdgeDef[] {
  if (phase === 'check' || phase === 'answer') {
    // All edges highlighted green
    return CUBE_EDGES.map((e) => ({ ...e, color: EDGE_OK }))
  }
  if (phase === 'propagate') {
    // Outer-ring edges highlighted; inner + cross dimmed
    const outerIds = new Set(['TL', 'TR', 'BL', 'BR'])
    return CUBE_EDGES.map((e) => ({
      ...e,
      color: outerIds.has(e.a) && outerIds.has(e.b) ? EDGE_NORMAL : DIM_EDGE,
    }))
  }
  return CUBE_EDGES.map((e) => ({ ...e, color: EDGE_NORMAL }))
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GraphColorSASMO20G4Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildGraphColorSASMO20G4Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const nodes = buildNodes(beat.phase)
  const edges = buildEdges(beat.phase)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: graf kubus 8 simpul diwarnai 2 warna — bipartit, jawaban 2.'
      : 'Explainer: 8-node cube graph coloured with 2 colours — bipartite, answer 2.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Graph */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <NodeGraph
            nodes={nodes}
            edges={edges as EdgeDef[]}
            nodeR={18}
            width={200}
            height={200}
          />
        </div>

        {/* Answer badge */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: GREEN_CONFIRM }}
          >
            2
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN_CONFIRM, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
