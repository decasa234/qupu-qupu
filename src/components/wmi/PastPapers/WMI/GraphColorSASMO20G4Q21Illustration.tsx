/**
 * GraphColorSASMO20G4Q21Illustration — SASMO-20-G4-Q21
 *
 * "Colour the circles so that any pair connected by a segment has different colours.
 *  What is the least number of colours needed?"
 * Answer: 2 (the graph is the cube graph Q_3 — bipartite, chromatic number = 2).
 *
 * Figure: 8 circles arranged as a 3-D cube projection (outer 4-corner square +
 * inner 4-corner square with diagonal cross-edges). Faithfully reconstructed from
 * OCR crop docs/reference/ocr-res/sasmo/contest/g4/2019-2020.imgs/031.jpg.
 *
 * Reuses NodeGraph from ./primitives/NodeGraph.
 */

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── Graph data ─────────────────────────────────────────────────────────────────
//
// Outer square corners (larger square):
//   TL = top-left, TR = top-right, BL = bottom-left, BR = bottom-right
// Inner square corners (smaller square):
//   ITL, ITR, IBL, IBR
//
// Viewbox: 200 × 200  (nodeR = 18)

const R = 18
const W = 200
const H = 200

export const CUBE_NODES: NodeDef[] = [
  { id: 'TL',  x: 22,  y: 22  },
  { id: 'TR',  x: 178, y: 22  },
  { id: 'BL',  x: 22,  y: 178 },
  { id: 'BR',  x: 178, y: 178 },
  { id: 'ITL', x: 68,  y: 68  },
  { id: 'ITR', x: 132, y: 68  },
  { id: 'IBL', x: 68,  y: 132 },
  { id: 'IBR', x: 132, y: 132 },
]

export const CUBE_EDGES: EdgeDef[] = [
  // Outer square
  { a: 'TL', b: 'TR' },
  { a: 'TR', b: 'BR' },
  { a: 'BR', b: 'BL' },
  { a: 'BL', b: 'TL' },
  // Inner square
  { a: 'ITL', b: 'ITR' },
  { a: 'ITR', b: 'IBR' },
  { a: 'IBR', b: 'IBL' },
  { a: 'IBL', b: 'ITL' },
  // Cross connections (outer → inner)
  { a: 'TL', b: 'ITL' },
  { a: 'TR', b: 'ITR' },
  { a: 'BR', b: 'IBR' },
  { a: 'BL', b: 'IBL' },
]

// ── Stem illustration (problem only — no colours shown) ────────────────────────

export default function GraphColorSASMO20G4Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Delapan lingkaran tersusun seperti proyeksi kubus 3-D: ' +
        '4 sudut luar dan 4 sudut dalam, dihubungkan oleh garis. ' +
        'Warnai sehingga setiap pasang lingkaran yang dihubungkan memiliki warna berbeda.'
      }
    >
      <NodeGraph
        nodes={CUBE_NODES}
        edges={CUBE_EDGES}
        nodeR={R}
        width={W}
        height={H}
      />
    </div>
  )
}
