// HKIMO-22-P2H-Q17 — "How many line segment(s) is / are there in the polygon below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/heat/primary-2/2022.imgs/004.jpg:
// a connected graph (tree) of 8 nodes and 7 edges — one long arm from A (bottom-left)
// to junction B, a short arm B→C (far-left), backbone B→E (center), top arm E→F,
// then a V-fork E→G→{H, I} on the right.  Answer = 7 line segments.
//
// PROBLEM ONLY — no segment numbering, no answer shown.
// Pure SVG, SSR-safe, deterministic. Uses NodeGraph primitive.

import { NodeGraph } from './primitives/NodeGraph'

export const SVG_W = 330
export const SVG_H = 285

// Node positions matching the source figure layout.
export const NODES = [
  { id: 'A', x: 26,  y: 272 }, // bottom-far-left arm end
  { id: 'B', x: 108, y: 148 }, // center-left junction
  { id: 'C', x: 28,  y: 100 }, // far-left short arm end
  { id: 'E', x: 210, y: 106 }, // main center
  { id: 'F', x: 248, y: 28  }, // top arm end
  { id: 'G', x: 266, y: 182 }, // right fork
  { id: 'H', x: 312, y: 84  }, // upper-right arm end
  { id: 'I', x: 322, y: 266 }, // lower-right arm end
] as const

// 7 drawn line segments
export const EDGES = [
  { a: 'A', b: 'B' }, // seg 1 — long bottom arm
  { a: 'B', b: 'C' }, // seg 2 — short far-left arm
  { a: 'B', b: 'E' }, // seg 3 — junction to center
  { a: 'E', b: 'F' }, // seg 4 — top arm
  { a: 'E', b: 'G' }, // seg 5 — center to right fork
  { a: 'G', b: 'H' }, // seg 6 — fork upper-right arm
  { a: 'G', b: 'I' }, // seg 7 — fork lower-right arm
] as const

export default function GraphSegmentsHK22P2Q17Illustration() {
  return (
    <NodeGraph
      width={SVG_W}
      height={SVG_H}
      nodeR={9}
      nodes={NODES.map(n => ({ ...n, fill: '#1F2937' }))}
      edges={EDGES.map(e => ({ ...e, color: '#1F2937' }))}
    />
  )
}
