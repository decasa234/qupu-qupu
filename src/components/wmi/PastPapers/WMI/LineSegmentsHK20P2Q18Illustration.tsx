// HKIMO-20-P2H-Q18 — "How many line segment(s) is / are there in the polygon below?"
//
// OCR source: docs/reference/ocr-res/hkimo/heat/primary-2/2020.md Q18
// Image crop:  docs/reference/ocr-res/hkimo/heat/primary-2/2020.imgs/006.jpg
// Answer: 9 line segments.
//
// FIGURE: 7 nodes, 9 edges.
//   L (far-left) connects to D, E, G — 3 segments.
//   D (upper hub) connects to B, C, L, E — satellite leaves + trunk.
//   Right triangle: E–F, E–G, F–G.
//
// Primitive: NodeGraph from ./primitives/NodeGraph
// SSR-safe — no hooks, no framer-motion, pure SVG.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Geometry (exported for Explainer reuse) ───────────────────────────────────

export const SVG_W = 400
export const SVG_H = 400
export const NODE_R = 12

const NODE_FILL = '#1F2937'   // near-black, matching source image dots

export const NODES: NodeDef[] = [
  { id: 'L', x:  45, y: 248, fill: NODE_FILL },   // far-left hub
  { id: 'B', x: 108, y:  98, fill: NODE_FILL },   // upper-left satellite
  { id: 'C', x: 190, y:  36, fill: NODE_FILL },   // top satellite
  { id: 'D', x: 218, y: 138, fill: NODE_FILL },   // upper hub (B, C, L → here → E)
  { id: 'E', x: 262, y: 210, fill: NODE_FILL },   // centre (L, D → here → F, G)
  { id: 'F', x: 355, y: 100, fill: NODE_FILL },   // upper-right
  { id: 'G', x: 375, y: 345, fill: NODE_FILL },   // bottom-right
]

// 9 edges
export const EDGES: EdgeDef[] = [
  { a: 'L', b: 'D' },   // 1  far-left → upper hub
  { a: 'L', b: 'E' },   // 2  far-left → centre
  { a: 'L', b: 'G' },   // 3  far-left → bottom-right (long diagonal)
  { a: 'B', b: 'D' },   // 4  upper-left satellite → upper hub
  { a: 'C', b: 'D' },   // 5  top satellite → upper hub
  { a: 'D', b: 'E' },   // 6  upper hub → centre
  { a: 'E', b: 'F' },   // 7  centre → upper-right
  { a: 'E', b: 'G' },   // 8  centre → bottom-right
  { a: 'F', b: 'G' },   // 9  right side (upper-right → bottom-right)
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LineSegmentsHK20P2Q18Illustration() {
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
