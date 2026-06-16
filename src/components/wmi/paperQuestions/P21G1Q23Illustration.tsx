// WMI-21P1A-Q23 (2021 WMI Semifinal Grade 1 Paper A, question 23).
//
// Recovered from db/seed/wmi/figures/2021-semifinal-g1-a-q23.jpg:
// Three bees look at the SAME solid from three directions; each sees a flat view
// (a little polyomino of unit squares). A big dashed cube in the middle holds a
// "?" — the unknown solid.
//   • Blue bee  (looks DOWN, top view):   ▢▢▢ over ▢▢   (3 on top, 2 on bottom-left)
//   • Green bee (looks from the RIGHT):   ▢ on top-right over a 2×2 block
//   • Pink bee  (looks UP / front):       a 1-2-3 descending staircase
// The four answer options ("Solid A"…"Solid D") were images in the source; only
// Solid A is consistent with all three views → answer A.
//
// The static figure draws ONLY the three views + the mystery cube (the problem).
// It NEVER draws the candidate solids or marks an answer — the explainer derives
// that only Solid A fits all three, via the co-exported PolyominoView primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const VIEW_FILL = '#FAF7CC' // cream cells (matches the scan)
const VIEW_INK = '#2B2622' // cell outlines
const BLUE = '#177CC2' // top bee / arrow
const GREEN = '#1B9145' // right bee / arrow
const PINK = '#DF0D7A' // bottom-left bee / arrow
const DASH = '#3A3A3A' // dashed mystery cube

/** A flat view = a set of filled [col,row] unit cells (row 0 = top). */
export type Cell = [number, number]

/** The three real views, read straight off the scan. */
export const TOP_VIEW: Cell[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1],
]
export const RIGHT_VIEW: Cell[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [0, 2],
  [1, 2],
]
export const FRONT_VIEW: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [0, 2],
  [1, 2],
  [2, 2],
]

/**
 * Draws a small polyomino view as a grid of filled unit squares, centered inside
 * a `box`×`box` region. Reusable primitive shared with the explainer.
 */
export function PolyominoView({
  cells,
  cell = 22,
  box = 96,
  fill = VIEW_FILL,
  stroke = VIEW_INK,
  glow = false,
}: {
  cells: Cell[]
  cell?: number
  box?: number
  fill?: string
  stroke?: string
  /** Highlight the whole view (used when the explainer checks one view). */
  glow?: boolean
}) {
  const cols = Math.max(...cells.map(([c]) => c)) + 1
  const rows = Math.max(...cells.map(([, r]) => r)) + 1
  const ox = (box - cols * cell) / 2
  const oy = (box - rows * cell) / 2
  return (
    <g>
      {cells.map(([c, r], i) => (
        <rect
          key={i}
          x={ox + c * cell}
          y={oy + r * cell}
          width={cell}
          height={cell}
          fill={fill}
          stroke={glow ? '#F97316' : stroke}
          strokeWidth={glow ? 3 : 2}
        />
      ))}
    </g>
  )
}

/** A small cartoon bee glyph drawn from basic shapes (no multi-codepoint emoji). */
function Bee({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* wings */}
      <ellipse cx={-3} cy={-9} rx={7} ry={5} fill="#CFE8FF" stroke="#9CC6E8" strokeWidth={1} opacity={0.9} />
      <ellipse cx={7} cy={-9} rx={7} ry={5} fill="#CFE8FF" stroke="#9CC6E8" strokeWidth={1} opacity={0.9} />
      {/* body */}
      <ellipse cx={2} cy={2} rx={13} ry={10} fill="#F5C53D" stroke="#7A5B12" strokeWidth={1.5} />
      <rect x={-4} y={-7} width={4} height={18} fill="#3A2E12" opacity={0.85} rx={1} />
      <rect x={5} y={-6} width={4} height={16} fill="#3A2E12" opacity={0.85} rx={1} />
      {/* face dot */}
      <circle cx={-9} cy={1} r={4.5} fill="#FFFFFF" stroke="#7A5B12" strokeWidth={1} />
      <circle cx={-10} cy={1} r={1.6} fill={color} />
    </g>
  )
}

/** A block arrow pointing toward the mystery cube. dir is the pointing direction. */
function Arrow({ x, y, dir, color }: { x: number; y: number; dir: 'down' | 'left' | 'up'; color: string }) {
  // Base shape points UP; rotate for other directions.
  const rot = dir === 'down' ? 180 : dir === 'left' ? 270 : 0
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <polygon points="0,-16 14,2 6,2 6,16 -6,16 -6,2 -14,2" fill={color} />
    </g>
  )
}

export const Q23_VIEW_W = 460
export const Q23_VIEW_H = 360

export interface Q23DiagramProps {
  /** Which view to spotlight (-1 = none): 0 top, 1 right, 2 front. */
  glowIndex?: number
}

/**
 * The full stem scene: three bubble views + bees + arrows pointing at the dashed
 * mystery cube. No candidate solids, no answer.
 */
export function Q23Diagram({ glowIndex = -1 }: Q23DiagramProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q23_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- mystery cube (dashed) in the middle ---- */}
      <g stroke={DASH} strokeWidth={2.5} strokeDasharray="7 6" fill="none">
        {/* front face */}
        <rect x={176} y={150} width={108} height={108} />
        {/* top + side as a simple isometric hint */}
        <polygon points="176,150 214,118 322,118 284,150" />
        <polygon points="284,150 322,118 322,226 284,258" />
      </g>
      <text x={230} y={204} fontSize={42} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill="#341857">
        ?
      </text>

      {/* ---- TOP view bubble (blue bee, looks down) ---- */}
      <ellipse cx={110} cy={56} rx={86} ry={50} fill="#FFFFFF" stroke={BLUE} strokeWidth={3} />
      <circle cx={188} cy={96} r={7} fill="#FFFFFF" stroke={BLUE} strokeWidth={2.5} />
      <g transform="translate(62, 8)">
        <PolyominoView cells={TOP_VIEW} glow={glowIndex === 0} />
      </g>
      <Arrow x={230} y={134} dir="down" color={BLUE} />
      <Bee x={228} y={70} color={BLUE} />

      {/* ---- RIGHT view bubble (green bee, looks from the right) ---- */}
      <ellipse cx={394} cy={92} rx={62} ry={62} fill="#FFFFFF" stroke={GREEN} strokeWidth={3} />
      <circle cx={388} cy={150} r={7} fill="#FFFFFF" stroke={GREEN} strokeWidth={2.5} />
      <g transform="translate(346, 44)">
        <PolyominoView cells={RIGHT_VIEW} glow={glowIndex === 1} />
      </g>
      <Arrow x={332} y={204} dir="left" color={GREEN} />
      <Bee x={420} y={206} color={GREEN} />

      {/* ---- FRONT view bubble (pink bee, looks up / front) ---- */}
      <circle cx={86} cy={262} r={68} fill="#FFFFFF" stroke={PINK} strokeWidth={3} />
      <circle cx={130} cy={322} r={7} fill="#FFFFFF" stroke={PINK} strokeWidth={2.5} />
      <g transform="translate(38, 214)">
        <PolyominoView cells={FRONT_VIEW} glow={glowIndex === 2} />
      </g>
      <Arrow x={178} y={236} dir="up" color={PINK} />
      <Bee x={120} y={344} color={PINK} />
    </svg>
  )
}

export default function P21G1Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three bees view one solid from three directions and each sees a flat shape: a top view, a right-side view, and a front view. Which solid matches all three views?"
    >
      <Q23Diagram />
    </div>
  )
}
