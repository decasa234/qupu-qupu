// HKIMO-22-P1H-Q18 — "Refer to the figure below, how many line segment(s) is / are there?"
//
// OCR source: docs/reference/ocr-res/hkimo/heat/primary-1/2022.md Q18
// Image crop:  docs/reference/ocr-res/hkimo/heat/primary-1/2022.imgs/004.jpg
// Answer: 9 line segments.
//
// FIGURE: 7 nodes connected by 9 edges (segment IDs = a+b of endpoint node IDs).
//   Hub (B) → A (top-right apex), C (far-left), D (inner-left), E (inner-right).
//   Outer frame: C–F, F–G, E–G.
//   Inner cross:  D–E, D–F.
//
// Primitive: NodeGraph from ./primitives/NodeGraph
// SSR-safe — no hooks, no framer-motion, pure SVG.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Geometry (exported for Explainer reuse) ───────────────────────────────────

export const SVG_W = 400
export const SVG_H = 420
export const NODE_R = 12

const NODE_FILL = '#1F2937'   // near-black, matching source image dots

export const NODES: NodeDef[] = [
  { id: 'A', x: 350, y:  40, fill: NODE_FILL },   // top-right apex
  { id: 'B', x: 195, y: 140, fill: NODE_FILL },   // hub — 4 segments meet here
  { id: 'C', x:  25, y: 295, fill: NODE_FILL },   // far-left
  { id: 'D', x: 140, y: 265, fill: NODE_FILL },   // inner-left
  { id: 'E', x: 265, y: 255, fill: NODE_FILL },   // inner-right
  { id: 'F', x:  65, y: 375, fill: NODE_FILL },   // bottom-left
  { id: 'G', x: 375, y: 375, fill: NODE_FILL },   // bottom-right
]

// 9 edges — edge key = a + b (e.g. 'AB', 'BC', …)
export const EDGES: EdgeDef[] = [
  { a: 'A', b: 'B' },   // 1  hub → apex
  { a: 'B', b: 'C' },   // 2  hub → far-left
  { a: 'B', b: 'D' },   // 3  hub → inner-left
  { a: 'B', b: 'E' },   // 4  hub → inner-right
  { a: 'C', b: 'F' },   // 5  far-left → bottom-left
  { a: 'F', b: 'G' },   // 6  bottom-left → bottom-right
  { a: 'E', b: 'G' },   // 7  inner-right → bottom-right
  { a: 'D', b: 'E' },   // 8  inner cross horizontal
  { a: 'D', b: 'F' },   // 9  inner cross diagonal
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LineSegmentsHK22P1Q18Illustration() {
  return (
    <NodeGraph
      nodes={NODES}
      edges={EDGES}
      nodeR={NODE_R}
      width={SVG_W}
      height={SVG_H}
    />
  )
}
