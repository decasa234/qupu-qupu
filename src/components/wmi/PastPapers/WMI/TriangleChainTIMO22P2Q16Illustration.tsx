// TIMO-22-P2H-Q16 — "How many line segments are there in the figure below?"
//
// Figure: 9 dots (2 peaks + 5 on a horizontal row + 2 hanging ends) connected
// by 10 drawn edges forming two upward triangles. Counting all distinct line
// segments formed by collinear labeled dots gives 18:
//   B,D,E,F,H collinear (horizontal) → C(5,2) = 10
//   A,B,C collinear (left diagonal)  → C(3,2) =  3
//   G,H,I collinear (right diagonal) → C(3,2) =  3
//   C–D (left inner edge)            →          1
//   F–G (right inner edge)           →          1
//                                       ─────────
//                                              18
//
// Stem only — does NOT show the count or the answer.
// Pure SVG, SSR-safe, deterministic: no hooks, no framer-motion.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Layout constants (re-exported so the explainer can overlay the same grid) ─

export const SVG_W = 490
export const SVG_H = 360
export const NODE_R = 13

/**
 * Nine nodes. Coordinates are chosen so that:
 *   A(40,300) – B(80,200) – C(120,100)  are exactly collinear (slope –2.5)
 *   G(360,100) – H(400,200) – I(440,300) are exactly collinear (slope +2.5)
 *   B, D, E, F, H all share y = 200 (horizontal row)
 */
export const NODES: NodeDef[] = [
  { id: 'A', x:  40, y: 300 },   // bottom-left hanger
  { id: 'B', x:  80, y: 200 },   // left of horizontal row
  { id: 'C', x: 120, y: 100 },   // left peak
  { id: 'D', x: 160, y: 200 },   // center-left horizontal
  { id: 'E', x: 240, y: 200 },   // center horizontal
  { id: 'F', x: 320, y: 200 },   // center-right horizontal
  { id: 'G', x: 360, y: 100 },   // right peak
  { id: 'H', x: 400, y: 200 },   // right horizontal
  { id: 'I', x: 440, y: 300 },   // bottom-right hanger
]

/** The 10 edges drawn in the original figure. */
export const EDGES: EdgeDef[] = [
  { a: 'A', b: 'B' },   // left hanger
  { a: 'B', b: 'C' },   // left side of left triangle
  { a: 'C', b: 'D' },   // right side of left triangle (inner)
  { a: 'B', b: 'D' },   // base of left triangle
  { a: 'D', b: 'E' },   // middle horizontal
  { a: 'E', b: 'F' },   // middle horizontal
  { a: 'F', b: 'G' },   // left side of right triangle (inner)
  { a: 'G', b: 'H' },   // right side of right triangle
  { a: 'F', b: 'H' },   // base of right triangle
  { a: 'H', b: 'I' },   // right hanger
]

// ── Default export: static stem illustration ──────────────────────────────────

export default function TriangleChainTIMO22P2Q16Illustration() {
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
