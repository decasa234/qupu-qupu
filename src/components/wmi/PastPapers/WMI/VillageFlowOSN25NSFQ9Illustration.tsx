// OSN-25-SD-NAS-SEMIFINAL-Q9 — directed commuter-flow graph
//
// Three villages P, Q, R with 6 directed percentage arrows showing
// what fraction of each village's residents work in another village.
// P→Q=25%, Q→P=40%, P→R=15%, R→P=30%, Q→R=24%, R→Q=35%.
//
// Co-exports VillageFlowDiagram so the explainer can highlight individual
// edges (by key "P-Q", "R-Q", etc.) and nodes in each beat.
//
// NodeGraph primitive omitted: it doesn't support arrowheads.
// Pure SVG, SSR-safe, no hooks, no framer-motion.

const W = 320
const H = 280
const NODE_R = 24
const ARROW_OFFSET = 10   // perpendicular offset px separating opposing arrows

// ── Nodes ─────────────────────────────────────────────────────────────────────

const NODES = {
  P: { x: 80,  y: 90,  label: 'P' },
  Q: { x: 240, y: 90,  label: 'Q' },
  R: { x: 160, y: 220, label: 'R' },
} as const

export type NodeId = keyof typeof NODES

// ── Edges ─────────────────────────────────────────────────────────────────────

const EDGES: { from: NodeId; to: NodeId; pct: number }[] = [
  { from: 'P', to: 'Q', pct: 25 },
  { from: 'Q', to: 'P', pct: 40 },
  { from: 'P', to: 'R', pct: 15 },
  { from: 'R', to: 'P', pct: 30 },
  { from: 'Q', to: 'R', pct: 24 },
  { from: 'R', to: 'Q', pct: 35 },
]

// ── Geometry helper ───────────────────────────────────────────────────────────

/**
 * Computes a straight directed-arrow path from circle-A to circle-B,
 * offset ARROW_OFFSET pixels to the LEFT of the A→B direction.
 * Start/end are at the circle circumferences.
 * Returns the SVG path `d`, and label midpoint (lx, ly).
 */
function makeArrow(
  ax: number, ay: number,
  bx: number, by: number,
  R: number,
  offset: number,
): { d: string; lx: number; ly: number } {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  // Left-perpendicular of direction A→B
  const px = -uy
  const py =  ux

  const sx = ax + ux * R + px * offset
  const sy = ay + uy * R + py * offset
  const ex = bx - ux * R + px * offset
  const ey = by - uy * R + py * offset

  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    lx: (sx + ex) / 2,
    ly: (sy + ey) / 2,
  }
}

// ── Palette ───────────────────────────────────────────────────────────────────

const C_EDGE    = '#30598A'
const C_EDGE_HL = '#F59E0B'
const C_NODE_BG = '#F5F0E8'
const C_NODE_HL = '#D1FAE5'
const C_NODE_RG = '#FEF3C7'

// ── Shared diagram (also used by explainer) ───────────────────────────────────

export interface VillageFlowProps {
  /** Edge key to highlight amber, e.g. 'P-Q'. */
  highlightEdge?: string
  /** Node to highlight green (the worker-destination). */
  highlightNode?: NodeId
  /** Node to tint amber (contribution source). */
  sourceNode?: NodeId
}

export function VillageFlowDiagram({
  highlightEdge,
  highlightNode,
  sourceNode,
}: VillageFlowProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Default arrowhead */}
        <marker id="vfArr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <path d="M 0 0 L 8 3.5 L 0 7 Z" fill={C_EDGE} />
        </marker>
        {/* Highlighted (amber) arrowhead */}
        <marker id="vfArrHL" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <path d="M 0 0 L 8 3.5 L 0 7 Z" fill={C_EDGE_HL} />
        </marker>
      </defs>

      {/* ── Directed edges ──────────────────────────────────────────────────── */}
      {EDGES.map(({ from, to, pct }) => {
        const a = NODES[from]
        const b = NODES[to]
        const { d, lx, ly } = makeArrow(a.x, a.y, b.x, b.y, NODE_R, ARROW_OFFSET)
        const key = `${from}-${to}`
        const isHL = key === highlightEdge
        const stroke = isHL ? C_EDGE_HL : C_EDGE
        const marker = isHL ? 'url(#vfArrHL)' : 'url(#vfArr)'

        // Label offset: nudge 9px further in perpendicular direction for legibility
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const labelNudgeX = (-dy / len) * 9
        const labelNudgeY = ( dx / len) * 9

        return (
          <g key={key}>
            <path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={isHL ? 2.8 : 2}
              markerEnd={marker}
            />
            <text
              x={lx + labelNudgeX}
              y={ly + labelNudgeY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={isHL ? '#92400E' : '#374151'}
              stroke="white"
              strokeWidth={2.5}
              paintOrder="stroke"
            >
              {pct}%
            </text>
          </g>
        )
      })}

      {/* ── Nodes ───────────────────────────────────────────────────────────── */}
      {(Object.entries(NODES) as [NodeId, { x: number; y: number; label: string }][]).map(
        ([id, n]) => {
          const isHL   = id === highlightNode
          const isSrc  = id === sourceNode
          const fill   = isHL ? C_NODE_HL : isSrc ? C_NODE_RG : C_NODE_BG
          const stroke = isHL ? '#059669' : isSrc ? C_EDGE_HL : C_EDGE
          const textFill = isHL ? '#065F46' : isSrc ? '#92400E' : '#1F2937'
          return (
            <g key={id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={2.5}
              />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={900}
                fill={textFill}
              >
                {n.label}
              </text>
            </g>
          )
        },
      )}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

export default function VillageFlowOSN25NSFQ9Illustration() {
  return (
    <div className="mx-auto w-full max-w-xs">
      <VillageFlowDiagram />
    </div>
  )
}
