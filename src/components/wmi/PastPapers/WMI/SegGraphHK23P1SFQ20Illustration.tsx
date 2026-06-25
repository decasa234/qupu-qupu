// HKIMO-23-P1SF-Q20 — "How many line segment(s) is / are there in the figure below?"
//
// Reconstructed from docs/reference/ocr-res/hkimo/semifinal/primary-1/2023.imgs/009.jpg:
// a connected graph of 9 nodes and 10 edges.
//   • Upper-left triangle : UL1–UL2–HUB
//   • Right quadrilateral : HUB–TR1–TR2–RC–HUB
//   • Lower Y from LC     : HUB–LC, LC–BL, LC–BC
//
// Answer = 10 line segments.
// PROBLEM ONLY — no numbering, no answer shown.
// Pure SVG, SSR-safe, deterministic. Uses NodeGraph primitive.

import { NodeGraph } from './primitives/NodeGraph'

export const SVG_W = 295
export const SVG_H = 275

// Node positions matching the source figure layout.
export const NODES = [
  { id: 'UL1', x: 78,  y: 36  }, // upper-left top
  { id: 'UL2', x: 60,  y: 70  }, // upper-left bottom (close to UL1)
  { id: 'HUB', x: 138, y: 106 }, // centre hub (degree-5 junction)
  { id: 'TR1', x: 200, y: 24  }, // top-right inner
  { id: 'TR2', x: 260, y: 14  }, // top-rightmost
  { id: 'RC',  x: 268, y: 112 }, // right-centre
  { id: 'LC',  x: 48,  y: 192 }, // left-centre (Y junction)
  { id: 'BL',  x: 14,  y: 258 }, // bottom-left arm end
  { id: 'BC',  x: 160, y: 258 }, // bottom-centre arm end
] as const

// 10 drawn line segments
export const EDGES = [
  { a: 'UL1', b: 'UL2' }, // seg  1 — upper-left short edge
  { a: 'UL1', b: 'HUB' }, // seg  2 — upper-left to hub (diagonal)
  { a: 'UL2', b: 'HUB' }, // seg  3 — upper-left lower to hub
  { a: 'HUB', b: 'TR1' }, // seg  4 — hub to top-right inner
  { a: 'TR1', b: 'TR2' }, // seg  5 — top-right pair
  { a: 'TR2', b: 'RC'  }, // seg  6 — top-right to right-centre
  { a: 'RC',  b: 'HUB' }, // seg  7 — right-centre back to hub
  { a: 'HUB', b: 'LC'  }, // seg  8 — hub to left-centre Y junction
  { a: 'LC',  b: 'BL'  }, // seg  9 — Y lower-left arm
  { a: 'LC',  b: 'BC'  }, // seg 10 — Y lower-right arm
] as const

export default function SegGraphHK23P1SFQ20Illustration() {
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
