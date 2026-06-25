// HKIMO-25-P2H-Q18 — "How many line segment(s) is/are there in the polygon below?"
// Answer: 10  (5-cycle B-C-E-H-I-B plus 5 antennae: A-B, C-D, D-E, E-F, E-G)
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-2/2025.imgs/005.jpg:
// 9 dot-nodes connected by 10 straight segments forming an irregular node-graph.
// Pure SVG via NodeGraph primitive. SSR-safe, no hooks, no framer-motion.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Graph data (shared with explainer) ────────────────────────────────────────

const NODE_FILL = '#1F2937'

export const GRAPH_NODES: NodeDef[] = [
  { id: 'A', x:  35, y:  25, fill: NODE_FILL }, // top-left leaf
  { id: 'B', x: 110, y: 130, fill: NODE_FILL }, // upper-left junction
  { id: 'C', x: 200, y: 100, fill: NODE_FILL }, // upper-center junction
  { id: 'D', x: 290, y:  25, fill: NODE_FILL }, // top-right leaf
  { id: 'E', x: 275, y: 195, fill: NODE_FILL }, // right-center hub (degree 5)
  { id: 'F', x: 390, y: 155, fill: NODE_FILL }, // far-right leaf
  { id: 'G', x: 355, y: 290, fill: NODE_FILL }, // lower-right leaf
  { id: 'H', x: 215, y: 305, fill: NODE_FILL }, // lower-center
  { id: 'I', x: 100, y: 268, fill: NODE_FILL }, // lower-left
]

export const GRAPH_EDGES: EdgeDef[] = [
  { a: 'A', b: 'B' }, // 1
  { a: 'B', b: 'I' }, // 2 — part of 5-cycle
  { a: 'B', b: 'C' }, // 3 — part of 5-cycle
  { a: 'C', b: 'D' }, // 4
  { a: 'C', b: 'E' }, // 5 — part of 5-cycle
  { a: 'D', b: 'E' }, // 6
  { a: 'E', b: 'F' }, // 7
  { a: 'E', b: 'G' }, // 8
  { a: 'E', b: 'H' }, // 9 — part of 5-cycle
  { a: 'H', b: 'I' }, // 10 — part of 5-cycle
]

// ── Illustration (stem — no answer revealed) ───────────────────────────────────

export default function SegmentGraphHK25P2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Sebuah graf dengan 9 titik yang dihubungkan oleh 10 segmen garis."
    >
      <NodeGraph
        nodes={GRAPH_NODES}
        edges={GRAPH_EDGES}
        nodeR={8}
        width={420}
        height={320}
      />
    </div>
  )
}
