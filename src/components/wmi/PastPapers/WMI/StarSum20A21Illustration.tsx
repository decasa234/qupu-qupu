// SEAMO-20-A-Q21 — Star number puzzle
//
// Source figure: 2020.imgs/022.jpg
//
// A 3-arm star with 7 circles: one centre node, three inner nodes, three outer
// nodes.  Each arm is a straight line of 3 circles (outer → inner → centre).
// Place numbers 1–7 so that each arm sums to 12.
//
// Answer:
//   centre = 4, arms: (2,6) top, (1,7) bottom-left, (3,5) bottom-right
//   (or any rotation of the three pairs — the canonical shown answer is above)
//
// The STEM illustration shows empty circles (no numbers placed yet).
// The primitive NodeGraph fits perfectly: each circle is a node, each
// arm connection is an edge.
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

import { NodeGraph } from './primitives/NodeGraph'

// ── Palette ──────────────────────────────────────────────────────────────────

const FILL_EMPTY  = '#FFFFFF'          // blank circles in stem
const STROKE_NODE = '#30598A'          // qupu-brand-blue
const FILL_CENTER = '#EFF6FF'          // subtle blue tint for centre

// ── Geometry ─────────────────────────────────────────────────────────────────
//
// Viewbox: 260 × 280
// Centre circle at (130, 145)
//
// Three arms at 90°, 210°, 330° (top, bottom-left, bottom-right)
// matching the figure:  top arm points straight up, the two lower arms
// spread 60° either side of straight down.
//
//  Arm angles (measured from positive-x, counter-clockwise):
//    top:         90°  → dx=0,         dy=-1
//    bottom-left: 210° → dx=-cos30,    dy=+sin30  ≈ (-0.866, +0.5)
//    bottom-right:330° → dx=+cos30,    dy=+sin30  ≈ (+0.866, +0.5)
//
// Distances from centre:
//   inner node: 62 px
//   outer node: 124 px

const CX = 130
const CY = 145

// arm direction unit vectors (pointing away from centre)
const ARM_DIRS: [number, number][] = [
  [0, -1],                              // top
  [-Math.sqrt(3) / 2, 0.5],            // bottom-left
  [ Math.sqrt(3) / 2, 0.5],            // bottom-right
]

const INNER_DIST = 62
const OUTER_DIST = 124

// Build node array
const nodes = [
  {
    id: 'c',
    x: CX,
    y: CY,
    fill: FILL_CENTER,
  },
  // inner & outer nodes for each arm
  ...ARM_DIRS.flatMap(([dx, dy], i) => [
    {
      id: `i${i}`,
      x: CX + dx * INNER_DIST,
      y: CY + dy * INNER_DIST,
      fill: FILL_EMPTY,
    },
    {
      id: `o${i}`,
      x: CX + dx * OUTER_DIST,
      y: CY + dy * OUTER_DIST,
      fill: FILL_EMPTY,
    },
  ]),
]

// Edges: centre – inner, inner – outer  (for each arm)
const edges = ARM_DIRS.flatMap((_, i) => [
  { a: 'c',  b: `i${i}`, color: STROKE_NODE },
  { a: `i${i}`, b: `o${i}`, color: STROKE_NODE },
])

// ── Exported data (for Explainer/Steps) ──────────────────────────────────────

/** The canonical solution: centre=4, with pairs (2,6), (1,7), (3,5). */
export const STAR_SUM_SOLUTION = {
  center: 4,
  arms: [
    { inner: 2, outer: 6 },   // top arm
    { inner: 1, outer: 7 },   // bottom-left arm
    { inner: 3, outer: 5 },   // bottom-right arm
  ] as const,
}

/** Total sum constant: 3 × 12 = 36 = 28 + 2×centre */
export const STAR_SUM_TARGET = 12

// ── Sub-components ────────────────────────────────────────────────────────────

/** Renders the 7-circle star graph.
 *
 * @param labels  Optional map from node id → display text.
 *                If omitted every circle is shown empty.
 */
function StarGraph({ labels }: { labels?: Map<string, string> }) {
  const labelledNodes = nodes.map((n) => ({
    ...n,
    label: labels?.get(n.id),
  }))

  return (
    <NodeGraph
      nodes={labelledNodes}
      edges={edges}
      nodeR={22}
      width={260}
      height={280}
    />
  )
}

// ── Main component export ─────────────────────────────────────────────────────

export { StarGraph }

/** Static stem illustration: empty 7-circle star (no numbers placed). */
export default function StarSum20A21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Pola bintang dengan 7 lingkaran kosong: satu lingkaran di tengah, ' +
        'dan tiga pasang lingkaran yang terhubung ke pusat melalui garis ' +
        '(atas, kiri bawah, kanan bawah). Isi angka 1–7 sehingga setiap ' +
        'garis berjumlah 12.'
      }
    >
      <StarGraph />
    </div>
  )
}
