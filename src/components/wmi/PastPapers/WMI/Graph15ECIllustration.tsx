// IKMC-23-EC-Q15 — "Hatice wants to paint the circles in the picture. She wants
// to paint any 2 circles connected with a line in different colours. What is the
// smallest number of colours she needs?" (answer B = 3).
//
// OCR source: docs/reference/ocr-res/ikmc/contest/ecolier/2023.md Q15,
// crop: 2023.imgs/040.jpg
//
// GRAPH STRUCTURE (9 circles, reconstructed from the source image):
//   Layout: 9-node graph, roughly hexagonal with an inner triangle.
//
//   Node ids and approximate positions (viewBox 0 0 220 220):
//     T  — top         (110, 18)
//     UL — upper-left  ( 52, 62)
//     UR — upper-right (168, 62)
//     L  — left        ( 24, 128)
//     C  — centre      (110, 106)
//     R  — right       (196, 128)
//     LL — lower-left  ( 52, 162)
//     LR — lower-right (168, 162)
//     B  — bottom      (110, 204)
//
//   Edges (from source image — every pair connected by a line):
//     T–UL, T–UR
//     UL–L, UL–C
//     UR–C, UR–R
//     L–C,  L–LL
//     C–R
//     R–LR
//     LL–B, LL–C
//     LR–B, LR–C
//
// MATH (chromatic number = 3 — never revealed in the static figure):
//   Inner triangle L–C–(LL or LR) and LL–C–LR force 3 colours.
//   The graph can be 3-coloured:
//     colour-1: T, C, B
//     colour-2: UL, R, LL
//     colour-3: UR, L, LR
//   No pair of the same colour shares an edge — 3 suffices, and the triangle
//   prevents doing it with 2.
//
// Co-exported primitive: `Graph15EC` — renders the network, optionally with
// per-node colour fill (for the explainer's greedy-colouring animation).
//
// Default export: plain figure (no colours revealed). SSR-safe & deterministic.

// ─── node model ──────────────────────────────────────────────────────────────
export type NodeId = 'T' | 'UL' | 'UR' | 'L' | 'C' | 'R' | 'LL' | 'LR' | 'B'

export const NODES: Record<NodeId, { x: number; y: number }> = {
  T:  { x: 110, y: 18 },
  UL: { x:  52, y: 62 },
  UR: { x: 168, y: 62 },
  L:  { x:  24, y: 128 },
  C:  { x: 110, y: 106 },
  R:  { x: 196, y: 128 },
  LL: { x:  52, y: 162 },
  LR: { x: 168, y: 162 },
  B:  { x: 110, y: 204 },
}

// Undirected edges — every pair connected by a line in the source figure.
export const EDGES: Array<[NodeId, NodeId]> = [
  ['T',  'UL'],
  ['T',  'UR'],
  ['UL', 'L'],
  ['UL', 'C'],
  ['UR', 'C'],
  ['UR', 'R'],
  ['L',  'C'],
  ['L',  'LL'],
  ['C',  'R'],
  ['C',  'LL'],
  ['C',  'LR'],
  ['R',  'LR'],
  ['LL', 'B'],
  ['LR', 'B'],
]

// ─── valid 3-colouring (explainer only — never shown in the static figure) ───
// Colour index 0, 1, 2 assigned by greedy traversal order.
export const SOLUTION_COLOURS: Record<NodeId, 0 | 1 | 2> = {
  T:  0,
  UL: 1,
  UR: 2,
  L:  2,
  C:  0,
  R:  1,
  LL: 1,
  LR: 2,
  B:  0,
}

// ─── palette (3 colours used in the explainer) ───────────────────────────────
export const COLOUR_FILL = ['#F87171', '#34D399', '#60A5FA'] as const  // red, green, blue
export const COLOUR_STROKE = ['#B91C1C', '#059669', '#1D4ED8'] as const

// ─── geometry ────────────────────────────────────────────────────────────────
export const VB_W = 220
export const VB_H = 222
const NODE_R = 14          // circle radius
const EDGE_W = 2.4         // line stroke width
const FILL_PLAIN = '#F5F0E8'   // unpainted circle fill (qupu-shell-like)
const STROKE_PLAIN = '#30598A' // qupu-brand-blue-shadow approximation
const STROKE_W_PLAIN = 2.4

// ─── primitive ───────────────────────────────────────────────────────────────
export interface Graph15ECProps {
  /**
   * Optional per-node colour assignment (0=red, 1=green, 2=blue).
   * Nodes not listed use the plain style. Default = plain (no colours).
   */
  colours?: Partial<Record<NodeId, 0 | 1 | 2 | null>>
}

/**
 * Shared primitive — the 9-circle graph.
 * Without `colours`, every circle is plain white with a blue outline
 * (the static figure).  With `colours`, coloured nodes get a painted fill
 * matching COLOUR_FILL[c].
 */
export function Graph15EC({ colours = {} }: Graph15ECProps = {}) {
  function edgeKey(a: NodeId, b: NodeId) {
    return `${a}-${b}`
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(220, VB_W)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* edges — drawn behind nodes */}
      {EDGES.map(([a, b]) => {
        const na = NODES[a]
        const nb = NODES[b]
        return (
          <line
            key={edgeKey(a, b)}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            strokeWidth={EDGE_W}
            strokeLinecap="round"
            stroke={STROKE_PLAIN}
          />
        )
      })}

      {/* nodes */}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id]
        const ci = colours[id] ?? null
        const fill = ci != null ? COLOUR_FILL[ci] : FILL_PLAIN
        const stroke = ci != null ? COLOUR_STROKE[ci] : STROKE_PLAIN
        const sw = ci != null ? 2.8 : STROKE_W_PLAIN
        return (
          <circle
            key={id}
            cx={n.x}
            cy={n.y}
            r={NODE_R}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        )
      })}
    </svg>
  )
}

// ─── default export ───────────────────────────────────────────────────────────
/**
 * Graph15ECIllustration
 *
 * Static, problem-only figure for IKMC-23-EC-Q15.
 * Shows: 9 circles connected by 14 lines — no colour fill, no answer hint.
 */
export default function Graph15ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sembilan lingkaran yang saling dihubungkan oleh garis. ' +
        'Setiap dua lingkaran yang terhubung harus diberi warna berbeda. ' +
        'Berapa jumlah warna minimum yang diperlukan?'
      }
    >
      <Graph15EC />
    </div>
  )
}
