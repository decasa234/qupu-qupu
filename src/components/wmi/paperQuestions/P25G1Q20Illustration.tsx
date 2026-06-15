// In-card figure for WMI-25P1A-Q20 (2025 Grade 1 Semifinal Paper A, question 20).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q20.jpg:
//   A garden drawn as a tilted rectangle with green planting areas separated by
//   white walkways. Four gate-posts sit on the four sides, labelled
//   A (left), B (bottom), C (right), D (top). A "road" runs all the way around
//   the garden, and walkways cross the inside.
//
// The puzzle is a one-stroke (Eulerian path) problem: place an entrance and an
// exit at two of A, B, C, D so EVERY path (including the surrounding road) is
// walked exactly once. The start and end must be the two gates with an ODD
// number of paths meeting there.
//
// Path network used (verified): the road links the gates around the outside
//   A–D, D–C, C–B, B–A  (so far each gate has 2 paths → even)
// plus ONE internal walkway straight across from A to C
//   A–C  (+1 to A, +1 to C)
// Degrees: A = 3, B = 2, C = 3, D = 2  →  odd gates are A and C  →  answer C.
//
// PROBLEM-ONLY: shows the garden, the road, the walkways, and the four labelled
// gates. It never marks which gates are the entrance/exit. SSR-safe +
// deterministic (no window / Date / random).

// ---------------------------------------------------------------------------
// Exported primitives (illustration + explainer bind to these)
// ---------------------------------------------------------------------------

export const VIEW_W = 360
export const VIEW_H = 300

const INK = '#3A322E'
const GARDEN = '#8DC63F'
const WALK = '#FFFFFF'
const POST = '#A1887F'
const POST_DARK = '#795548'
const BASE = '#FBC02D'

/** Gate label keys in clockwise order from the left. */
export type Gate = 'A' | 'B' | 'C' | 'D'

/** Pixel position of each gate-post anchor (centre of its base). */
export const GATE_XY: Record<Gate, [number, number]> = {
  A: [40, 165], // left side
  B: [185, 262], // bottom side
  C: [322, 178], // right side
  D: [205, 50], // top side
}

/** The four corners of the tilted garden rectangle (clockwise from top-left). */
const CORNERS: Array<[number, number]> = [
  [30, 78], // top-left
  [320, 58], // top-right
  [335, 230], // bottom-right
  [55, 256], // bottom-left
]

/**
 * The path network as gate-to-gate segments (for the explainer to trace /
 * count). Each entry is the straight walkway drawn between two gates.
 */
export const PATHS: Array<[Gate, Gate]> = [
  ['A', 'D'],
  ['D', 'C'],
  ['C', 'B'],
  ['B', 'A'],
  ['A', 'C'], // the internal walkway straight across
]

/** How many paths meet at a gate (its degree). */
export function gateDegree(g: Gate): number {
  return PATHS.reduce((n, [u, v]) => n + (u === g || v === g ? 1 : 0), 0)
}

/** A single gate-post glyph: a yellow base with a brown post on top. */
export function GatePost({ gate, highlight = null }: { gate: Gate; highlight?: string | null }) {
  const [x, y] = GATE_XY[gate]
  return (
    <g aria-hidden="true">
      {/* yellow base disc */}
      <ellipse cx={x} cy={y} rx={20} ry={14} fill={BASE} stroke="#F9A825" strokeWidth={1.5} />
      {/* post */}
      <rect x={x - 8} y={y - 30} width={16} height={26} rx={6} fill={POST} stroke={POST_DARK} strokeWidth={1.5} />
      <rect x={x - 8} y={y - 30} width={16} height={7} rx={4} fill={POST_DARK} opacity={0.55} />
      {highlight && <circle cx={x} cy={y} r={26} fill="none" stroke={highlight} strokeWidth={4} />}
    </g>
  )
}

interface GardenProps {
  /** Optional per-gate ring colour, e.g. to mark odd gates in the explainer. */
  gateRings?: Partial<Record<Gate, string>>
  /** Optional per-gate badge text (e.g. the path count), shown beside the gate. */
  gateBadges?: Partial<Record<Gate, string>>
  /** Optional path to emphasise, given as [Gate, Gate]; matched either order. */
  litPath?: [Gate, Gate] | null
}

/** The shared garden + paths + gates figure. */
export function GardenPlan({ gateRings = {}, gateBadges = {}, litPath = null }: GardenProps) {
  const isLit = (u: Gate, v: Gate) =>
    litPath != null && ((litPath[0] === u && litPath[1] === v) || (litPath[0] === v && litPath[1] === u))

  const outline = CORNERS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z'

  return (
    <g>
      {/* garden field */}
      <path d={outline} fill={GARDEN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />

      {/* walkways: thick white strokes along each path segment */}
      {PATHS.map(([u, v]) => {
        const [ux, uy] = GATE_XY[u]
        const [vx, vy] = GATE_XY[v]
        return <line key={`w${u}${v}`} x1={ux} y1={uy} x2={vx} y2={vy} stroke={WALK} strokeWidth={16} strokeLinecap="round" />
      })}
      {/* faint walkway edges so the white roads read on white background */}
      {PATHS.map(([u, v]) => {
        const [ux, uy] = GATE_XY[u]
        const [vx, vy] = GATE_XY[v]
        return (
          <line
            key={`we${u}${v}`}
            x1={ux}
            y1={uy}
            x2={vx}
            y2={vy}
            stroke={isLit(u, v) ? '#2563EB' : '#CFCFCF'}
            strokeWidth={isLit(u, v) ? 5 : 1.5}
            strokeLinecap="round"
            opacity={isLit(u, v) ? 0.9 : 0.7}
          />
        )
      })}

      {/* gates */}
      {(['A', 'B', 'C', 'D'] as Gate[]).map((g) => (
        <GatePost key={g} gate={g} highlight={gateRings[g] ?? null} />
      ))}

      {/* gate letter labels */}
      {(['A', 'B', 'C', 'D'] as Gate[]).map((g) => {
        const [x, y] = GATE_XY[g]
        const lx = g === 'A' ? x - 30 : g === 'C' ? x + 30 : x
        const ly = g === 'D' ? y - 42 : g === 'B' ? y + 30 : y - 4
        return (
          <text key={`l${g}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fontStyle="italic" fill={INK}>
            {g}
          </text>
        )
      })}

      {/* optional path-count badges */}
      {(['A', 'B', 'C', 'D'] as Gate[]).map((g) => {
        const badge = gateBadges[g]
        if (!badge) return null
        const [x, y] = GATE_XY[g]
        const bx = g === 'A' ? x - 30 : g === 'C' ? x + 30 : x
        const by = (g === 'D' ? y - 42 : g === 'B' ? y + 30 : y - 4) + 22
        return (
          <g key={`b${g}`}>
            <circle cx={bx} cy={by} r={12} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
            <text x={bx} y={by} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#92400E">
              {badge}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function P25G1Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A garden plan with a road around it and a walkway across the middle. Four gate-posts on the sides are labelled A (left), B (bottom), C (right), and D (top)."
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
        <GardenPlan />
      </svg>
    </div>
  )
}
