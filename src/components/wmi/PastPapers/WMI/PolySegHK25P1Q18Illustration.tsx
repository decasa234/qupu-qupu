// HKIMO-25-P1H-Q18 — "How many line segment(s) is/are there in the polygon below?"
//
// OCR: docs/reference/ocr-res/hkimo/heat/primary-1/2025.md Q18
// Image: docs/reference/ocr-res/hkimo/heat/primary-1/2025.imgs/007.jpg
// Answer: 11 line segments.
//
// Figure: 8-node polygon graph.
//   Outer boundary (7): A-B, B-E, E-H, H-G, G-F, F-D, D-A
//   Inner diagonals (4, split at C intersection): A-C, C-E, B-C, C-D
//   Total: 11 line segments.
//
// Primitive: NodeGraph from ./primitives/NodeGraph
// SSR-safe — no hooks, no framer-motion, pure SVG.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Geometry (exported for Explainer reuse) ───────────────────────────────────

export const SVG_W = 320
export const SVG_H = 360
export const NODE_R = 10

const F = '#1F2937'  // near-black dot fill, matching source image

export const NODES: NodeDef[] = [
  { id: 'A', x:  65, y:  30, fill: F },  // top-left
  { id: 'B', x: 248, y:  15, fill: F },  // top-right
  { id: 'C', x: 150, y:  82, fill: F },  // center-inner (intersection of A→E and B→D diagonals)
  { id: 'D', x:  50, y: 155, fill: F },  // left-middle
  { id: 'E', x: 268, y: 162, fill: F },  // right-middle
  { id: 'F', x:  28, y: 288, fill: F },  // bottom-left
  { id: 'G', x: 148, y: 320, fill: F },  // bottom-center
  { id: 'H', x: 258, y: 298, fill: F },  // bottom-right
]

// 11 edges: 7 outer boundary + 4 inner
export const EDGES: EdgeDef[] = [
  // Outer boundary (7)
  { a: 'A', b: 'B' },  // 1
  { a: 'B', b: 'E' },  // 2
  { a: 'E', b: 'H' },  // 3
  { a: 'H', b: 'G' },  // 4
  { a: 'G', b: 'F' },  // 5
  { a: 'F', b: 'D' },  // 6
  { a: 'D', b: 'A' },  // 7
  // Inner diagonals split at C (4)
  { a: 'A', b: 'C' },  // 8
  { a: 'C', b: 'E' },  // 9
  { a: 'B', b: 'C' },  // 10
  { a: 'C', b: 'D' },  // 11
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PolySegHK25P1Q18Illustration() {
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
