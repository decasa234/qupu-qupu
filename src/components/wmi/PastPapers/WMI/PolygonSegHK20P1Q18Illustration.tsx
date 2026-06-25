// HKIMO-20-P1H-Q18 — "How many line segment(s) is / are there in the polygon below?"
//
// Figure: 8-node graph with junction hub B connected to 3 branches:
//   • spike A-B at top-left
//   • right branch B-C-D-E-F (4 segments)
//   • lower-left branch B-G-H (2 segments)
//   Total = 7 line segments. Answer = 7.
//
// PROBLEM ONLY — no segment numbering, no answer shown.
// Pure SVG, SSR-safe, deterministic. Uses NodeGraph primitive.

import { NodeGraph } from './primitives/NodeGraph'

export const SVG_W = 310
export const SVG_H = 350

// Node positions matching the source figure layout:
//   A = top-left spike tip
//   B = upper-left junction hub (degree 3)
//   C = upper-right
//   D = far right
//   E = lower right
//   F = bottom
//   G = left-centre
//   H = lower-left spike tip
export const NODES = [
  { id: 'A', x: 60,  y: 20  },
  { id: 'B', x: 128, y: 92  },
  { id: 'C', x: 202, y: 68  },
  { id: 'D', x: 288, y: 90  },
  { id: 'E', x: 288, y: 210 },
  { id: 'F', x: 218, y: 318 },
  { id: 'G', x: 112, y: 248 },
  { id: 'H', x: 22,  y: 232 },
] as const

// 7 drawn segments
export const EDGES = [
  { a: 'A', b: 'B' },  // seg 1 – top spike
  { a: 'B', b: 'C' },  // seg 2 – top of right branch
  { a: 'C', b: 'D' },  // seg 3 – upper right
  { a: 'D', b: 'E' },  // seg 4 – right side
  { a: 'E', b: 'F' },  // seg 5 – lower right
  { a: 'B', b: 'G' },  // seg 6 – left branch upper
  { a: 'G', b: 'H' },  // seg 7 – left branch lower / spike
] as const

export default function PolygonSegHK20P1Q18Illustration() {
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
