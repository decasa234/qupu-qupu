// SEAMOX-22-A-Q5 — marble-funnel path-count illustration.
// Faithful SVG reconstruction of docs/reference/ocr-res/seamo-x/contest/paper-a/2022.imgs/006.jpg:
// a vertically-oriented hexagonal funnel with 7 junction nodes and 12 channels.
// The marble (purple circle) drops in at the top; the diagram shows the stem only
// (no path-count labels). The funnel topology gives exactly 11 distinct paths:
//
//   T  → UL, C, UR
//   UL → LL, C
//   UR → LR, C
//   C  → LL, LR, B
//   LL → B
//   LR → B
//
// Co-exports (for the explainer and the steps file to bind to the same geometry):
//   VW, VH, NR                        — viewBox / node-radius constants
//   NODES                              — {id → {x,y}} junction coordinates
//   EDGES                              — [[from,to],...] channel pairs
//   Color constants                    — WALL_COLOR, NODE_FILL, NODE_STROKE, etc.
//   FunnelDiagram                      — static (SSR-safe) SVG core component

// ── Viewport ────────────────────────────────────────────────────────────────
export const VW = 400
export const VH = 450
export const NR = 10   // junction circle radius (px)

// ── Node IDs and layout ──────────────────────────────────────────────────────
export type NodeId = 'T' | 'UL' | 'UR' | 'C' | 'LL' | 'LR' | 'B'

export const NODES: Record<NodeId, { x: number; y: number }> = {
  T:  { x: 200, y: 72  },   // top entry
  UL: { x: 72,  y: 170 },   // upper-left
  UR: { x: 328, y: 170 },   // upper-right
  C:  { x: 200, y: 220 },   // centre intersection
  LL: { x: 72,  y: 270 },   // lower-left
  LR: { x: 328, y: 270 },   // lower-right
  B:  { x: 200, y: 368 },   // bottom exit
}

// All channels drawn as lines (marble travels each in its downward direction only).
export const EDGES: Array<[NodeId, NodeId]> = [
  // outer hexagonal boundary
  ['T',  'UL'], ['T',  'UR'],
  ['UL', 'LL'], ['UR', 'LR'],
  ['LL', 'B'],  ['LR', 'B'],
  // inner channels connecting to/from the centre
  ['T',  'C'],
  ['UL', 'C'],  ['UR', 'C'],
  ['C',  'LL'], ['C',  'LR'],
  ['C',  'B'],
]

// ── Palette ──────────────────────────────────────────────────────────────────
export const WALL_COLOR   = '#30598A'   // qupu-brand-blue
export const WALL_W       = 3.5
export const NODE_FILL    = '#FFF2DF'   // qupu-cream
export const NODE_STROKE  = '#f0853a'   // qupu-brand-orange
export const MARBLE_FILL  = '#6B4EAA'   // purple (matches original image)
export const ARROW_COLOR  = '#E03B3B'   // red entry/exit arrows

// ── FunnelDiagram (shared static core — SSR-safe, no framer-motion) ───────────
/**
 * Renders all funnel channels and junction circles.
 * Emits only SVG children — wrap in your own `<svg>` with viewBox `0 0 VW VH`.
 *
 * @param countAt    Optional per-node path counts (shown inside the circle).
 * @param nodeColors Optional per-node fill overrides (for the explainer highlights).
 * @param activeEdgeKeys Set of "A-B" strings marking channels to draw highlighted.
 */
export function FunnelDiagram({
  countAt,
  nodeColors,
  activeEdgeKeys = new Set<string>(),
}: {
  countAt?: Partial<Record<NodeId, number>>
  nodeColors?: Partial<Record<NodeId, string>>
  activeEdgeKeys?: Set<string>
}) {
  return (
    <>
      {/* Channels */}
      {EDGES.map(([a, b]) => {
        const na = NODES[a]
        const nb = NODES[b]
        const key = `${a}-${b}`
        const active = activeEdgeKeys.has(key)
        return (
          <line
            key={key}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={active ? NODE_STROKE : WALL_COLOR}
            strokeWidth={active ? 5.5 : WALL_W}
            strokeLinecap="round"
          />
        )
      })}

      {/* Junction nodes */}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const { x, y } = NODES[id]
        const fill = nodeColors?.[id] ?? NODE_FILL
        const cnt = countAt?.[id]
        return (
          <g key={id}>
            <circle
              cx={x} cy={y} r={NR}
              fill={fill}
              stroke={NODE_STROKE}
              strokeWidth={2}
            />
            {cnt != null && (
              <text
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={900}
                fill="#1F2937"
                className="font-display"
              >
                {cnt}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
}

// ── Illustration (stem only — no path-count labels) ──────────────────────────
export function FunnelX22A5Illustration() {
  const ARIA =
    'A purple marble above a hexagonal funnel. Inside the funnel, six triangular ' +
    'channels branch left, straight, or right at each junction. An arrow at the ' +
    'bottom marks the single exit.'
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={280}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <defs>
          <marker
            id="fx22a5-arrow"
            markerWidth={8} markerHeight={8}
            refX={6} refY={3}
            orient="auto"
          >
            <path d="M0,0 L0,6 L7,3 Z" fill={ARROW_COLOR} />
          </marker>
        </defs>

        {/* Marble above the top entry */}
        <circle cx={NODES.T.x} cy={NODES.T.y - 33} r={15} fill={MARBLE_FILL} />

        {/* Entry arrow: below marble → top of the entry junction */}
        <line
          x1={NODES.T.x} y1={NODES.T.y - 17}
          x2={NODES.T.x} y2={NODES.T.y - NR - 3}
          stroke={ARROW_COLOR}
          strokeWidth={2.5}
          markerEnd="url(#fx22a5-arrow)"
        />

        <FunnelDiagram />

        {/* Exit arrow: below the bottom exit junction */}
        <line
          x1={NODES.B.x} y1={NODES.B.y + NR + 3}
          x2={NODES.B.x} y2={NODES.B.y + 30}
          stroke={ARROW_COLOR}
          strokeWidth={2.5}
          markerEnd="url(#fx22a5-arrow)"
        />
      </svg>
    </div>
  )
}

export default FunnelX22A5Illustration
