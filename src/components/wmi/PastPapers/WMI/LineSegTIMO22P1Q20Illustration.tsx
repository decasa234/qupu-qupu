// TIMO-22-P1H-Q20 — "Ada berapa ruas garis dalam gambar di bawah ini?"
// TIMO 2022 Primary 1 Heat, answer: 12
//
// Source OCR: docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.md line 2445
// Crop: docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.imgs/099.jpg
//
// ─── Figure reconstruction ────────────────────────────────────────────────────
// 9 nodes, 8 drawn edges → 12 counted segments (including all sub-segments on
// collinear sets):
//
//   COLLINEAR GROUP 1 — horizontal (y = 112):
//     P4(30,112) – P3(125,112) – P7(240,112) – P8(330,112)
//     4 collinear points → C(4,2) = 6 distinct segments
//
//   COLLINEAR GROUP 2 — diagonal:
//     P1(50,28) – P3(125,112) – P5(200,196)  [Δ = (75,84) each hop]
//     3 collinear points → C(3,2) = 3 distinct segments
//
//   INDEPENDENT BRANCHES (1 each):
//     P2(140,28) – P3   (upper branch off left hub)
//     P7 – P6(255,192)  (lower branch off right hub)
//     P7 – P9(295,28)   (upper-right branch off right hub)
//
//   Total: 6 + 3 + 3 = 12 ✓
//
// ─── Primitive ────────────────────────────────────────────────────────────────
// Co-exports `LineSegTIMO22P1Q20` (the bare graph component used by the
// explainer to recolour edge groups).
//
// IMPORT-FIRST: uses `NodeGraph` from `./primitives/NodeGraph`.

import { NodeGraph } from './primitives/NodeGraph'
import type { NodeDef, EdgeDef } from './primitives/NodeGraph'

// ── shared geometry ───────────────────────────────────────────────────────────

export const VB_W = 340
export const VB_H = 220
export const NODE_R = 8

/** Which collinear group each edge belongs to (for the explainer colouring). */
export type EdgeGroup = 'horizontal' | 'diagonal' | 'branch'

export interface EdgeDefEx extends EdgeDef {
  group: EdgeGroup
}

export const NODES: NodeDef[] = [
  { id: 'P1', x:  50, y:  28, fill: '#1c1917' }, // far upper-left
  { id: 'P2', x: 140, y:  28, fill: '#1c1917' }, // upper-center (branch off left hub)
  { id: 'P3', x: 125, y: 112, fill: '#1c1917' }, // LEFT HUB
  { id: 'P4', x:  30, y: 112, fill: '#1c1917' }, // far-left  ← horizontal collinear
  { id: 'P5', x: 200, y: 196, fill: '#1c1917' }, // lower-right ← diagonal collinear P1–P3–P5
  { id: 'P6', x: 255, y: 192, fill: '#1c1917' }, // lower branch off right hub
  { id: 'P7', x: 240, y: 112, fill: '#1c1917' }, // RIGHT HUB ← horizontal collinear
  { id: 'P8', x: 330, y: 112, fill: '#1c1917' }, // far-right  ← horizontal collinear
  { id: 'P9', x: 295, y:  28, fill: '#1c1917' }, // upper-right branch off right hub
]

export const EDGES: EdgeDefEx[] = [
  // Horizontal collinear group (P4–P3–P7–P8)
  { a: 'P4', b: 'P3', group: 'horizontal' },
  { a: 'P3', b: 'P7', group: 'horizontal' },
  { a: 'P7', b: 'P8', group: 'horizontal' },
  // Diagonal collinear group (P1–P3–P5)
  { a: 'P1', b: 'P3', group: 'diagonal' },
  { a: 'P3', b: 'P5', group: 'diagonal' },
  // Independent branches
  { a: 'P2', b: 'P3', group: 'branch' },
  { a: 'P7', b: 'P6', group: 'branch' },
  { a: 'P7', b: 'P9', group: 'branch' },
]

// Default (un-highlighted) edge colour — dark, matching source figure dots.
const EDGE_DEFAULT = '#1c1917'

// ── co-exported primitive ─────────────────────────────────────────────────────

export interface LineSegTIMO22P1Q20Props {
  /** Colour override by group. Absent groups use EDGE_DEFAULT. */
  groupColors?: Partial<Record<EdgeGroup, string>>
}

/**
 * The bare graph, re-exported so the explainer can recolour edge groups
 * without duplicating the geometry.
 */
export function LineSegTIMO22P1Q20({ groupColors = {} }: LineSegTIMO22P1Q20Props = {}) {
  const coloredEdges = EDGES.map((e) => ({
    ...e,
    color: groupColors[e.group] ?? EDGE_DEFAULT,
  }))

  return (
    <NodeGraph
      nodes={NODES}
      edges={coloredEdges}
      nodeR={NODE_R}
      width={VB_W}
      height={VB_H}
    />
  )
}

// ── default export — static illustration ──────────────────────────────────────

/**
 * LineSegTIMO22P1Q20Illustration
 *
 * Static problem figure for TIMO-22-P1H-Q20.
 * Shows 9 dots connected by 8 line segments — no answer hint.
 */
export default function LineSegTIMO22P1Q20Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar titik-titik yang dihubungkan oleh ruas garis. Ada berapa ruas garis dalam gambar ini?"
    >
      <LineSegTIMO22P1Q20 />
    </div>
  )
}
