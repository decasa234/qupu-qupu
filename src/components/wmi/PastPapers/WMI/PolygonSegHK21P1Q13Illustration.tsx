// HKIMO-21-P1H-Q13 — "How many line segment(s) is / are there in the polygon below?"
//
// Figure: 5-node graph with a central hub (C) connected to all 4 outer vertices
// plus the outer quadrilateral edges → 8 drawn line segments total. Answer = 8.
//
// PROBLEM ONLY — no segment numbering, no answer shown.
// Pure SVG, SSR-safe, deterministic. Uses NodeGraph primitive.

import { NodeGraph } from './primitives/NodeGraph'

export const SVG_W = 240
export const SVG_H = 270

// Node positions matching the source figure layout:
//   A = top-left, B = upper-right, C = centre hub, D = lower-right, E = bottom-left
export const NODES = [
  { id: 'A', x: 52,  y: 28  },
  { id: 'B', x: 202, y: 100 },
  { id: 'C', x: 138, y: 168 },
  { id: 'D', x: 202, y: 248 },
  { id: 'E', x: 48,  y: 252 },
] as const

// 8 drawn segments
export const EDGES = [
  { a: 'A', b: 'B' },  // seg 1 – top outer edge
  { a: 'A', b: 'E' },  // seg 2 – left outer edge
  { a: 'A', b: 'C' },  // seg 3 – diagonal A→centre
  { a: 'B', b: 'C' },  // seg 4 – diagonal B→centre
  { a: 'B', b: 'D' },  // seg 5 – right outer edge
  { a: 'C', b: 'D' },  // seg 6 – diagonal centre→D
  { a: 'C', b: 'E' },  // seg 7 – diagonal centre→E
  { a: 'D', b: 'E' },  // seg 8 – bottom outer edge
] as const

export default function PolygonSegHK21P1Q13Illustration() {
  return (
    <NodeGraph
      width={SVG_W}
      height={SVG_H}
      nodeR={10}
      nodes={NODES.map(n => ({ ...n, fill: '#1F2937' }))}
      edges={EDGES.map(e => ({ ...e, color: '#1F2937' }))}
    />
  )
}
