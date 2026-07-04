/**
 * WMI-22F3A-Q4 — Street map illustration.
 *
 * A triangular lattice of 7 nodes (5 cyan house icons + Tom bottom-left +
 * Mary bottom-right) connected by 11 street segments (each 130 m).
 * Matches the source scan db/seed/wmi/figures/2022-final-g3-a-q4.jpg.
 *
 * Graph topology (solver-verified against the scan):
 *   Nodes: T=Tom, M=Mary, 0–4 (five cyan houses:
 *     0 top-left, 1 upper-middle, 2 left-middle, 3 right, 4 centre)
 *   Edges (11):
 *     T-2, T-4
 *     0-1, 0-2
 *     1-2, 1-3, 1-4
 *     2-4
 *     3-4, 3-M
 *     4-M
 *
 * Shortest Tom→Mary path  : 2 edges = 260 m  (T→4→M)
 * Longest non-repeating trail: 9 edges = 1170 m  (T→2→0→1→2→4→1→3→4→M)
 *
 * This file also exports StreetGraph, a reusable primitive that the animator
 * can import to overlay a highlighted route on top.
 *
 * Pure render — no Math.random, no Date, no useState/useEffect side effects.
 * SSR-safe and deterministic. Falls back to built-in data (no runtime params).
 */

// ─── geometry ────────────────────────────────────────────────────────────────

/** Node positions in the 520×420 coordinate space. */
export const NODES: Record<string, { x: number; y: number; label?: string }> = {
  '0': { x: 130, y: 46 },   // top-left cyan house
  '1': { x: 268, y: 118 },  // upper-middle cyan house
  '2': { x: 130, y: 202 },  // left-middle cyan house
  '3': { x: 404, y: 202 },  // right cyan house
  '4': { x: 268, y: 286 },  // centre cyan house (hub)
  T:   { x: 130, y: 372, label: 'Tom' },
  M:   { x: 404, y: 372, label: 'Mary' },
}

/** Edge list — pairs of node IDs. */
export const EDGES: Array<[string, string]> = [
  ['T', '2'],
  ['T', '4'],
  ['0', '1'],
  ['0', '2'],
  ['1', '2'],
  ['1', '3'],
  ['1', '4'],
  ['2', '4'],
  ['3', '4'],
  ['3', 'M'],
  ['4', 'M'],
]

// ─── colours ─────────────────────────────────────────────────────────────────

const STREET_COLOR   = '#7fd4d4'   // teal/cyan street bar — matches source figure
const STREET_OUTLINE = '#3a9999'   // slightly darker teal outline
const HOUSE_CYAN     = '#4dc8d8'   // interior house body (cyan)
const HOUSE_ROOF     = '#2494a8'   // darker cyan for roof
const TOM_BODY       = '#2d5090'   // dark blue body for Tom's house
const TOM_ROOF       = '#1a3566'   // darker blue roof for Tom
const MARY_BODY      = '#d04040'   // red body for Mary's house
const MARY_ROOF      = '#961e1e'   // darker red roof for Mary
const LABEL_INK      = '#1f2937'   // near-black for labels

// ─── HouseIcon ───────────────────────────────────────────────────────────────

type HouseColor = 'cyan' | 'tom' | 'mary'

function HouseIcon({
  cx,
  cy,
  size = 22,
  color = 'cyan',
}: {
  cx: number
  cy: number
  size?: number
  color?: HouseColor
}) {
  const w = size
  const h = size * 0.85
  const roofH = size * 0.38
  const body = color === 'tom' ? TOM_BODY : color === 'mary' ? MARY_BODY : HOUSE_CYAN
  const roof = color === 'tom' ? TOM_ROOF : color === 'mary' ? MARY_ROOF : HOUSE_ROOF
  const doorW = w * 0.26
  const doorH = h * 0.38
  // house sits with bottom at cy+h/2, top body at cy-h/2, roof apex at cy-h/2-roofH
  const x = cx - w / 2
  const y = cy - h / 2
  return (
    <g>
      {/* body */}
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill={body} />
      {/* roof triangle */}
      <polygon
        points={`${cx},${y - roofH} ${x - 2},${y} ${x + w + 2},${y}`}
        fill={roof}
      />
      {/* door */}
      <rect
        x={cx - doorW / 2}
        y={y + h - doorH}
        width={doorW}
        height={doorH}
        rx={1}
        fill="rgba(255,255,255,0.35)"
      />
      {/* window */}
      <rect
        x={cx - doorW * 0.75}
        y={y + h * 0.22}
        width={doorW * 0.55}
        height={doorW * 0.55}
        rx={1}
        fill="rgba(255,255,255,0.45)"
      />
      <rect
        x={cx + doorW * 0.2}
        y={y + h * 0.22}
        width={doorW * 0.55}
        height={doorW * 0.55}
        rx={1}
        fill="rgba(255,255,255,0.45)"
      />
    </g>
  )
}

// ─── StreetSegment ────────────────────────────────────────────────────────────

function StreetSegment({
  x1, y1, x2, y2,
  highlighted = false,
  highlightColor = '#ff6b2b',
}: {
  x1: number; y1: number; x2: number; y2: number
  highlighted?: boolean
  highlightColor?: string
}) {
  return (
    <g>
      {/* thick teal bar */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={highlighted ? highlightColor : STREET_COLOR}
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* subtle outline for depth */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={highlighted ? highlightColor : STREET_OUTLINE}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.5}
      />
    </g>
  )
}

// ─── StreetGraph (reusable primitive) ─────────────────────────────────────────

export interface StreetGraphProps {
  /** Edges to highlight (the animator passes a subset). */
  highlightedEdges?: Array<[string, string]>
  /** Colour for highlighted edges. */
  highlightColor?: string
  /** Scale factor applied uniformly around the SVG centre. */
  scale?: number
}

/**
 * StreetGraph — draws the full node-and-edge graph: nodes (house icons) plus
 * all street edges. The animator imports this and passes `highlightedEdges` to
 * mark a route in a second colour.
 *
 * Exported so the animator can import it directly.
 */
export function StreetGraph({
  highlightedEdges = [],
  highlightColor = '#ff6b2b',
}: StreetGraphProps) {
  const isHighlighted = (a: string, b: string) =>
    highlightedEdges.some(
      ([u, v]) => (u === a && v === b) || (u === b && v === a),
    )

  return (
    <g>
      {/* streets first (behind houses) */}
      {EDGES.map(([a, b]) => {
        const na = NODES[a]
        const nb = NODES[b]
        return (
          <StreetSegment
            key={`${a}-${b}`}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            highlighted={isHighlighted(a, b)}
            highlightColor={highlightColor}
          />
        )
      })}

      {/* house icons (on top of streets) */}
      {Object.entries(NODES).map(([id, node]) => {
        const color: HouseColor =
          id === 'T' ? 'tom' : id === 'M' ? 'mary' : 'cyan'
        return (
          <HouseIcon
            key={id}
            cx={node.x}
            cy={node.y}
            size={id === 'T' || id === 'M' ? 26 : 22}
            color={color}
          />
        )
      })}

      {/* Tom / Mary labels */}
      {Object.entries(NODES)
        .filter(([, n]) => n.label)
        .map(([id, node]) => (
          <text
            key={`lbl-${id}`}
            x={node.x}
            y={node.y + 30}
            textAnchor="middle"
            fontSize={13}
            fontWeight="700"
            fill={LABEL_INK}
          >
            {node.label}
          </text>
        ))}
    </g>
  )
}

// ─── Main illustration ────────────────────────────────────────────────────────

const VIEW_W = 520
const VIEW_H = 420

export default function StreetMap22G3Illustration() {
  // This illustration is fully determined by the problem statement.
  // _params is accepted (but unused) to satisfy the standard { params: unknown } signature.

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Peta jalan: rumah Tom (biru) di sudut kiri bawah, rumah Mary (merah) di sudut kanan bawah. ' +
        'Lima rumah lain (biru muda) terhubung oleh 11 jalan masing-masing 130 m. ' +
        'Rute terpendek Tom ke Mary = 2 jalan = 260 m. ' +
        'Rute terpanjang tanpa mengulang jalan = 9 jalan = 1170 m.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(380, VIEW_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <StreetGraph />
      </svg>
    </div>
  )
}
