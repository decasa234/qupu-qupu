// SEAMO-19-A-Q8 — "How many ways are there to spell the word 'SUGAR'?"
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-a/2019.md Q8
// Crop: 2019.imgs/004.jpg
//
// FIGURE: A diamond-shaped letter graph.
// Moving left → right through adjacent nodes, you must visit S → U → G → A → R.
//
// Node layout (diamond):
//          G-top
//      U-top       A-top
//  S       G-ctr       R
//      U-bot       A-bot
//          G-bot
//
// Edges (adjacency in the source image):
//   S — U-top,  S — U-bot
//   U-top — G-top,  U-top — G-ctr
//   U-bot — G-ctr,  U-bot — G-bot
//   G-top — A-top,  G-ctr — A-top,  G-ctr — A-bot,  G-bot — A-bot
//   A-top — R,  A-bot — R
//
// PATH COUNT (S→U→G→A→R):
//   From S choose U: 2 ways (Utop or Ubot)
//   From Utop choose G: Gtop or Gctr (2)
//   From Ubot choose G: Gctr or Gbot (2)
//   From Gtop choose A: Atop (1)
//   From Gctr choose A: Atop or Abot (2)
//   From Gbot choose A: Abot (1)
//   From either A → R: exactly 1
//
//   Total = (1×1 + 1×2 + 1×1) × ... = 1 + 2 + 2 + 1 = 6 ✓  (Answer C)
//
// Co-exported primitive: `SugarGraph` — renders the node graph, with optional
// highlighted path for the explainer animation.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Geometry ──────────────────────────────────────────────────────────────────
// viewBox 0 0 280 200

export const VB_W = 280
export const VB_H = 200

// Node ids
export type SugarNodeId =
  | 'S'
  | 'Utop' | 'Ubot'
  | 'Gtop' | 'Gctr' | 'Gbot'
  | 'Atop' | 'Abot'
  | 'R'

// Pixel positions
export const NODE_POS: Record<SugarNodeId, { x: number; y: number }> = {
  S:    { x:  28, y: 100 },
  Utop: { x:  84, y:  52 },
  Ubot: { x:  84, y: 148 },
  Gtop: { x: 140, y:  18 },
  Gctr: { x: 140, y: 100 },
  Gbot: { x: 140, y: 182 },
  Atop: { x: 196, y:  52 },
  Abot: { x: 196, y: 148 },
  R:    { x: 252, y: 100 },
}

// Edges from the source figure
export const GRAPH_EDGES: Array<[SugarNodeId, SugarNodeId]> = [
  ['S',    'Utop'],
  ['S',    'Ubot'],
  ['Utop', 'Gtop'],
  ['Utop', 'Gctr'],
  ['Ubot', 'Gctr'],
  ['Ubot', 'Gbot'],
  ['Gtop', 'Atop'],
  ['Gctr', 'Atop'],
  ['Gctr', 'Abot'],
  ['Gbot', 'Abot'],
  ['Atop', 'R'],
  ['Abot', 'R'],
]

// Labels shown on the nodes — repeated letters (U×2, G×3, A×2) rendered faithfully
const NODE_LABEL: Record<SugarNodeId, string> = {
  S:    'S',
  Utop: 'U',
  Ubot: 'U',
  Gtop: 'G',
  Gctr: 'G',
  Gbot: 'G',
  Atop: 'A',
  Abot: 'A',
  R:    'R',
}

// ── Palette ──────────────────────────────────────────────────────────────────
const FILL_DEFAULT  = '#F5F0E8'
const FILL_ACTIVE   = '#FEF3C7'   // amber-100 — highlighted node in explainer
const FILL_DONE     = '#D1FAE5'   // emerald-100 — locked-in path node
const STROKE_DEFAULT = '#30598A'
const STROKE_ACTIVE  = '#D97706'  // amber-600
const STROKE_DONE    = '#059669'  // emerald-600
const EDGE_DEFAULT   = '#30598A'
const EDGE_ACTIVE    = '#D97706'
const EDGE_DONE      = '#059669'

export type NodeState = 'default' | 'active' | 'done'

export interface SugarGraphProps {
  /** Per-node override state (for explainer animation). */
  nodeStates?: Partial<Record<SugarNodeId, NodeState>>
  /** Active edges (drawn in amber). */
  activeEdges?: Array<[SugarNodeId, SugarNodeId]>
  /** Done edges (drawn in green). */
  doneEdges?: Array<[SugarNodeId, SugarNodeId]>
}

function edgeKey(a: SugarNodeId, b: SugarNodeId) {
  return `${a}|${b}`
}

/**
 * Shared primitive — the SUGAR diamond graph.
 * Without props, all nodes are plain (the static figure).
 * With nodeStates/activeEdges/doneEdges, the explainer can animate paths.
 */
export function SugarGraph({
  nodeStates = {},
  activeEdges = [],
  doneEdges = [],
}: SugarGraphProps = {}) {
  // Build sets for fast lookup
  const activeSet = new Set(activeEdges.map(([a, b]) => edgeKey(a, b)))
  const doneSet   = new Set(doneEdges.map(([a, b]) => edgeKey(a, b)))

  // Build NodeGraph-compatible arrays
  const nodes: NodeDef[] = (Object.keys(NODE_POS) as SugarNodeId[]).map((id) => {
    const state = nodeStates[id] ?? 'default'
    const fill   = state === 'active' ? FILL_ACTIVE : state === 'done' ? FILL_DONE : FILL_DEFAULT
    const stroke = state === 'active' ? STROKE_ACTIVE : state === 'done' ? STROKE_DONE : STROKE_DEFAULT
    return {
      id,
      x: NODE_POS[id].x,
      y: NODE_POS[id].y,
      label: NODE_LABEL[id],
      fill,
      stroke, // note: NodeGraph uses its own STROKE_DEFAULT unless we override fill
    } as NodeDef & { stroke: string }
  })

  const edges: EdgeDef[] = GRAPH_EDGES.map(([a, b]) => {
    const key = edgeKey(a, b)
    const color = doneSet.has(key) ? EDGE_DONE : activeSet.has(key) ? EDGE_ACTIVE : EDGE_DEFAULT
    return { a, b, color }
  })

  return (
    <NodeGraph
      nodes={nodes}
      edges={edges}
      nodeR={18}
      width={VB_W}
      height={VB_H}
    />
  )
}

// ── Default export — static stem illustration ─────────────────────────────────

/**
 * SugarPath19A8Illustration
 *
 * Shows the SUGAR diamond graph from SEAMO 2019 Paper A Q8.
 * No path highlighted — problem statement only.
 */
export default function SugarPath19A8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi huruf berbentuk berlian untuk mengeja kata SUGAR. ' +
        'S di kiri, dua U di tengah-atas dan tengah-bawah, ' +
        'tiga G di atas, tengah, dan bawah, dua A di kanan-atas dan kanan-bawah, ' +
        'R di ujung kanan. Huruf-huruf dihubungkan oleh garis.'
      }
    >
      <SugarGraph />
    </div>
  )
}
