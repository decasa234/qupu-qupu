// Board-game path illustration for WMI-24F2A-Q24 (2024 Grade-2 Final, HARD).
// Reconstructed faithfully from db/seed/wmi/figures/2024-final-g2-a-q24.jpg:
// a snaking track START -> 1..15 -> FINISH on a 6-column grid, with four
// dotted "teleport" links (3->13, 14->5, 7->11, 10->8).
//
// Data constants (BOARD_NODES, BOARD_EDGES, TELEPORTS, the path order, and the
// node-centre lookup) are co-exported so the step-explainer binds to the same
// geometry and can drive the PathTrace primitive to walk the track.
//
// Pure render from fixed data: SSR-safe, deterministic, problem-only — the
// figure shows the board + links, never which roll-pairs solve it.

// ── colour tokens (qupu palette, kept as constants for the explainer to echo) ──
export const NODE_FILL = '#FFF2DF' // qupu-cream
export const NODE_STROKE = '#f0853a' // qupu-brand-orange
export const NODE_TEXT = '#30598A' // qupu-brand-blue
export const PIPE_COLOR = '#FFD3B1' // qupu-peach (the thick track pipes)
export const BLOCK_FILL = '#FFD3B1' // qupu-peach (START / FINISH blocks)
export const BLOCK_STROKE = '#f0853a'
export const TELEPORT_COLOR = '#30598A' // dotted jump arrows
export const TRACE_FILL = '#ffdd55' // qupu-brand-yellow (active token highlight)

// ── logical grid ──────────────────────────────────────────────────────────────
// gx 0..5 left-to-right columns, gy 0 (top) / 1 (middle) / 2 (bottom).
const GX = [70, 235, 400, 545, 700, 850]
const GY = [70, 232, 400]

export type BoardNode = {
  /** square number, or 'START' / 'FINISH' for the rounded blocks */
  id: number | 'START' | 'FINISH'
  gx: number // column index into GX
  gy: number // row index into GY
  /** drawn as a square tile instead of a circle (the linked squares) */
  squareTile?: boolean
  /** drawn as a rounded START/FINISH block */
  block?: boolean
}

// Faithful transcription of the scan. Square-tile nodes (3, 7, 10, 14) are the
// "linked" squares drawn as rounded squares; every other number is a circle.
export const BOARD_NODES: BoardNode[] = [
  { id: 'START', gx: 0, gy: 0, block: true },
  { id: 5, gx: 1, gy: 0 },
  { id: 6, gx: 2, gy: 0 },
  { id: 7, gx: 3, gy: 0, squareTile: true },
  { id: 8, gx: 4, gy: 0 },
  { id: 9, gx: 5, gy: 0 },
  { id: 1, gx: 0, gy: 1 },
  { id: 4, gx: 1, gy: 1 },
  { id: 15, gx: 2, gy: 1 },
  { id: 'FINISH', gx: 3, gy: 1, block: true },
  { id: 10, gx: 5, gy: 1, squareTile: true },
  { id: 2, gx: 0, gy: 2 },
  { id: 3, gx: 1, gy: 2, squareTile: true },
  { id: 14, gx: 2, gy: 2, squareTile: true },
  { id: 13, gx: 3, gy: 2 },
  { id: 12, gx: 4, gy: 2 },
  { id: 11, gx: 5, gy: 2 },
]

// The continuous track, in play order. FINISH is square 16.
export const PATH_ORDER: Array<number | 'START' | 'FINISH'> = [
  'START', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'FINISH',
]

// Adjacent pairs joined by a thick pipe (the solid track). Derived from
// PATH_ORDER so the pipes always match the walk order.
export const BOARD_EDGES: Array<[number | 'START' | 'FINISH', number | 'START' | 'FINISH']> =
  PATH_ORDER.slice(0, -1).map((a, i) => [a, PATH_ORDER[i + 1]])

// The dotted jump links: landing on a linked square sends you to its target.
export const TELEPORTS: Array<{ from: number; to: number }> = [
  { from: 3, to: 13 },
  { from: 14, to: 5 },
  { from: 7, to: 11 },
  { from: 10, to: 8 },
]

// ── layout ──────────────────────────────────────────────────────────────────
const VIEW_W = 920
const VIEW_H = 470
const R = 40 // circle / square-tile radius
const BLOCK_W = 116
const BLOCK_H = 96

function cx(n: BoardNode) {
  return GX[n.gx]
}
function cy(n: BoardNode) {
  return GY[n.gy]
}

const NODE_BY_ID = new Map<number | 'START' | 'FINISH', BoardNode>(
  BOARD_NODES.map((n) => [n.id, n]),
)

/** Public centre lookup so the explainer can position its own overlays. */
export function nodeCenter(id: number | 'START' | 'FINISH'): { x: number; y: number } | null {
  const n = NODE_BY_ID.get(id)
  return n ? { x: cx(n), y: cy(n) } : null
}

// ── node glyph ──────────────────────────────────────────────────────────────
function NodeGlyph({ node, active }: { node: BoardNode; active?: boolean }) {
  const x = cx(node)
  const y = cy(node)
  if (node.block) {
    const label = node.id as string
    return (
      <g>
        <rect
          x={x - BLOCK_W / 2}
          y={y - BLOCK_H / 2}
          width={BLOCK_W}
          height={BLOCK_H}
          rx={18}
          fill={active ? TRACE_FILL : BLOCK_FILL}
          stroke={BLOCK_STROKE}
          strokeWidth={3}
        />
        <text
          x={x}
          y={y + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight={900}
          fill={NODE_TEXT}
          className="font-display"
        >
          {label}
        </text>
      </g>
    )
  }
  const shape = node.squareTile ? (
    <rect
      x={x - R}
      y={y - R}
      width={2 * R}
      height={2 * R}
      rx={10}
      fill={active ? TRACE_FILL : NODE_FILL}
      stroke={NODE_STROKE}
      strokeWidth={3.5}
    />
  ) : (
    <circle cx={x} cy={y} r={R} fill={active ? TRACE_FILL : NODE_FILL} stroke={NODE_STROKE} strokeWidth={3.5} />
  )
  return (
    <g>
      {shape}
      <text
        x={x}
        y={y + 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
        fontWeight={900}
        fill={NODE_TEXT}
        className="font-display"
      >
        {node.id}
      </text>
    </g>
  )
}

// ── thick track pipe between two nodes (drawn behind the glyphs) ──────────────
function Pipe({ a, b }: { a: BoardNode; b: BoardNode }) {
  return (
    <line
      x1={cx(a)}
      y1={cy(a)}
      x2={cx(b)}
      y2={cy(b)}
      stroke={PIPE_COLOR}
      strokeWidth={22}
      strokeLinecap="round"
    />
  )
}

// ── dotted teleport arrow (curved, with an arrowhead at the target) ───────────
function Teleport({ from, to, idx }: { from: BoardNode; to: BoardNode; idx: number }) {
  const x1 = cx(from)
  const y1 = cy(from)
  const x2 = cx(to)
  const y2 = cy(to)
  // pull start/end onto the node edge so the dotted line doesn't bury under glyphs
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const sx = x1 + ux * (R + 6)
  const sy = y1 + uy * (R + 6)
  const ex = x2 - ux * (R + 10)
  const ey = y2 - uy * (R + 10)
  // bow the curve to the side so links don't overlap the track pipes
  const mx = (sx + ex) / 2
  const my = (sy + ey) / 2
  const bow = 46
  const qx = mx - uy * bow
  const qy = my + ux * bow
  const headId = `bp24-arrow-${idx}`
  return (
    <g>
      <defs>
        <marker
          id={headId}
          markerWidth={10}
          markerHeight={10}
          refX={7}
          refY={3}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L7,3 L0,6 Z" fill={TELEPORT_COLOR} />
        </marker>
      </defs>
      <path
        d={`M ${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}`}
        fill="none"
        stroke={TELEPORT_COLOR}
        strokeWidth={3}
        strokeDasharray="2 7"
        strokeLinecap="round"
        markerEnd={`url(#${headId})`}
      />
    </g>
  )
}

/**
 * PathTrace — reusable primitive the explainer drives to highlight a walk.
 * `activeIds` are filled with the trace colour; everything else renders normally.
 * `showTeleports` lets the explainer hide the dotted links while walking.
 */
export function PathTrace({
  activeIds = [],
  showTeleports = true,
  width,
}: {
  activeIds?: Array<number | 'START' | 'FINISH'>
  showTeleports?: boolean
  width?: number
}) {
  const active = new Set(activeIds)
  const w = Math.min(width ?? 560, 560)
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: w, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* track pipes first, behind everything */}
      {BOARD_EDGES.map(([aId, bId], i) => {
        const a = NODE_BY_ID.get(aId)
        const b = NODE_BY_ID.get(bId)
        if (!a || !b) return null
        return <Pipe key={`pipe-${i}`} a={a} b={b} />
      })}
      {/* dotted teleport links */}
      {showTeleports &&
        TELEPORTS.map((t, i) => {
          const f = NODE_BY_ID.get(t.from)
          const to = NODE_BY_ID.get(t.to)
          if (!f || !to) return null
          return <Teleport key={`tp-${i}`} from={f} to={to} idx={i} />
        })}
      {/* nodes on top */}
      {BOARD_NODES.map((n) => (
        <NodeGlyph key={String(n.id)} node={n} active={active.has(n.id)} />
      ))}
    </svg>
  )
}

const ARIA =
  'Papan permainan: jalur dari START melewati kotak 1 sampai 15 menuju FINISH, ' +
  'mengular lewat pipa tebal. Empat kotak tertaut dengan panah putus-putus: ' +
  'kotak 3 melompat ke 13, kotak 14 ke 5, kotak 7 ke 11, dan kotak 10 ke 8. ' +
  'FINISH adalah kotak ke-16.'

export function BoardPath24G2Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <PathTrace />
    </div>
  )
}

export default BoardPath24G2Illustration
