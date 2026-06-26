// OSN-25-SD-NAS-FINAL-Q10
// "Pak Kartono tinggal di kota A akan berkunjung ke semua kota dan kembali ke A.
//  Jarak minimum yang dilewati Pak Kartono adalah … km."
//
// GRAPH (reconstructed from OCR crop 2025-final.imgs/005.jpg):
//   8 cities A–H with road distances (schematic — weights ≠ visual lengths).
//   Edges:
//     A–B: 2   A–H: 2
//     B–C: 3   B–F: 5
//     C–D: 2   C–F: 2
//     D–E: 8   D–F: 4
//     E–F: 3   E–G: 4
//     F–G: 2   F–H: 3
//     G–H: 3
//
// NOTE: Seed answer is 38 km (flagged verify-answer). Independent analysis
// finds the shortest Hamiltonian circuit A→B→C→D→F→E→G→H→A = 23 km.
// The stem figure NEVER shows the optimal route; that is the explainer's job.
//
// Copy-adapted from MetroGraph23G3Illustration (same weighted-graph style).
// Pure render: no Math.random, no hooks, SSR-safe & deterministic.

export type CityId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

// ── node positions in viewBox "0 0 440 320" ──────────────────────────────────
export const CITY_NODES: Record<CityId, { x: number; y: number }> = {
  A: { x:  45, y: 155 },
  B: { x: 145, y:  82 },
  C: { x: 295, y:  25 },
  D: { x: 390, y: 125 },
  E: { x: 365, y: 275 },
  F: { x: 220, y: 185 },
  G: { x: 195, y: 285 },
  H: { x:  62, y: 268 },
}

// ── edges: [cityA, cityB, distKm] ────────────────────────────────────────────
export const CITY_EDGES: Array<[CityId, CityId, number]> = [
  ['A', 'B', 2],
  ['A', 'H', 2],
  ['B', 'C', 3],
  ['B', 'F', 5],
  ['C', 'D', 2],
  ['C', 'F', 2],
  ['D', 'E', 8],
  ['D', 'F', 4],
  ['E', 'F', 3],
  ['E', 'G', 4],
  ['F', 'G', 2],
  ['F', 'H', 3],
  ['G', 'H', 3],
]

// ── label offset table (perpendicular nudge per edge) ────────────────────────
// "a-b" key always uses alphabetical order to match CITY_EDGES.
const LABEL_OFFSET: Record<string, { dx: number; dy: number }> = {
  'A-B': { dx: -14, dy: -10 },
  'A-H': { dx: -18, dy:   2 },
  'B-C': { dx:   0, dy: -14 },
  'B-F': { dx: -18, dy:   2 },
  'C-D': { dx:  12, dy: -10 },
  'C-F': { dx:  18, dy:  -6 },
  'D-E': { dx:  18, dy:   0 },
  'D-F': { dx:   0, dy: -15 },
  'E-F': { dx:  18, dy:   0 },
  'E-G': { dx:   0, dy:  16 },
  'F-G': { dx: -18, dy:   2 },
  'F-H': { dx: -14, dy:  12 },
  'G-H': { dx:   0, dy:  16 },
}

function edgeKey(a: CityId, b: CityId): string {
  return [a, b].sort().join('-')
}

// ── constants ─────────────────────────────────────────────────────────────────
const VB_W = 440
const VB_H = 320
const NODE_R = 14
const EDGE_W = 2.5
const HL_W = 5

// ── shared primitive ─────────────────────────────────────────────────────────

export interface CityTourGraphProps {
  /** Ordered city-id list whose connecting edges are highlighted (explainer). */
  highlightPath?: CityId[] | null
}

/** Renders the 8-city road network. With highlightPath it tints the traversed
 *  route; without it (the default) it shows only the distances. SSR-safe. */
export function CityTourOSN25NFQ10Graph({ highlightPath = null }: CityTourGraphProps = {}) {
  const path = Array.isArray(highlightPath) && highlightPath.length > 0
    ? highlightPath
    : null

  function isOnPath(a: CityId, b: CityId): boolean {
    if (!path || path.length < 2) return false
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i]; const v = path[i + 1]
      if ((u === a && v === b) || (u === b && v === a)) return true
    }
    return false
  }

  function isNodeOnPath(id: CityId): boolean {
    return path ? path.includes(id) : false
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(360, VB_W)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* edges */}
      {CITY_EDGES.map(([a, b, dist]) => {
        const na = CITY_NODES[a]
        const nb = CITY_NODES[b]
        const lit = isOnPath(a, b)
        const key = edgeKey(a, b)
        const off = LABEL_OFFSET[key] ?? { dx: 0, dy: 0 }
        const mx = (na.x + nb.x) / 2 + off.dx
        const my = (na.y + nb.y) / 2 + off.dy

        return (
          <g key={key}>
            <line
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              strokeWidth={lit ? HL_W : EDGE_W}
              strokeLinecap="round"
              className={lit ? 'stroke-qupu-brand-orange' : 'stroke-qupu-brand-blue-shadow'}
            />
            {/* label halo then label */}
            <text
              x={mx} y={my}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight="bold"
              className="fill-qupu-shell stroke-qupu-shell"
              strokeWidth={4} paintOrder="stroke"
            >
              {dist}
            </text>
            <text
              x={mx} y={my}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight="bold"
              className={lit ? 'fill-qupu-brand-orange' : 'fill-qupu-brand-blue-shadow'}
            >
              {dist}
            </text>
          </g>
        )
      })}

      {/* city nodes */}
      {(Object.keys(CITY_NODES) as CityId[]).map((id) => {
        const n = CITY_NODES[id]
        const lit = isNodeOnPath(id)
        return (
          <g key={id}>
            <circle
              cx={n.x} cy={n.y} r={NODE_R}
              strokeWidth={2}
              className={
                lit
                  ? 'fill-qupu-brand-orange stroke-qupu-brand-orange'
                  : 'fill-qupu-shell stroke-qupu-brand-blue-shadow'
              }
            />
            <text
              x={n.x} y={n.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight="800"
              fontFamily="system-ui, sans-serif"
              className={lit ? 'fill-white' : 'fill-qupu-brand-blue'}
            >
              {id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── default export: stem illustration (no route highlighted) ─────────────────

/** CityTourOSN25NFQ10Illustration
 *
 * Stem figure for OSN-25-SD-NAS-FINAL-Q10.
 * Shows the 8-city road network (A–H) with all edge distances.
 * The optimal Hamiltonian circuit is NEVER revealed here; that is
 * the explainer's job.
 * SSR-safe: no hooks, no framer-motion.
 */
export default function CityTourOSN25NFQ10Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Graf jalan 8 kota A hingga H dengan jarak antar kota dalam km. ' +
        'Pak Kartono harus mengunjungi semua kota dan kembali ke A dengan jarak minimum.'
      }
    >
      <CityTourOSN25NFQ10Graph />
    </div>
  )
}
