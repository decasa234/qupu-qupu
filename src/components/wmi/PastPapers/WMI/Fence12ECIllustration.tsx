// IKMC-20-EC-Q12 — "Lonneke builds a fence using 1 metre long poles."
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - a 4-metre fence built from 1 m poles
//   - 2 horizontal rails (top + bottom), vertical posts at each junction
//   - dimension arrow beneath labelled "4 metres"
//   - question text is in the stem; this shows ONLY the fence diagram.
//
// Does NOT show:
//   - the pole count (18)
//   - the formula (n×4+2)
//   - the answer (42)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ────

/** Total SVG width. */
export const SVG_W = 320

/** Total SVG height. */
export const SVG_H = 180

/** Number of fence sections shown (= 4 m). */
export const SECTIONS = 4

/** Height of the fence in SVG px. */
export const FENCE_H = 80

/** Width of each 1 m section in SVG px. */
export const SECTION_W = 56

/** Thickness of each pole in SVG px. */
export const POLE_W = 10

/** Y coordinate of the top-rail top edge. */
export const TOP_RAIL_Y = 30

/** Y coordinate of the bottom-rail top edge. */
export const BOT_RAIL_Y = TOP_RAIL_Y + FENCE_H - POLE_W

/** X coordinate of the left edge of the first post. */
export const FENCE_LEFT = (SVG_W - (SECTIONS * SECTION_W + POLE_W)) / 2

/** Colour tokens (echoing qupu warm palette). */
export const COLOR = {
  POLE: '#D4A574',          // warm tan — wood colour
  POLE_STROKE: '#8B6914',  // darker brown stroke
  LABEL: '#1F2937',
  DIM_ARROW: '#374151',
} as const

// ── Shared fence primitive ─────────────────────────────────────────────────────────────────

interface FencePrimitiveProps {
  /** Number of 1 m sections to draw. */
  sections: number
  /** Left X origin of the fence (left edge of first post). */
  originX: number
  /** Optional highlight function — returns fill colour for a pole by (row, col, kind). */
  highlight?: (row: 'top' | 'bot', col: number, kind: 'post' | 'rail') => string | undefined
}

/**
 * FencePrimitive — draws an N-section horizontal fence made of 1 m poles.
 *
 * Structure per section (0-indexed):
 *   - top horizontal rail: x = originX + col*SECTION_W + POLE_W,  y = TOP_RAIL_Y
 *   - bot horizontal rail: x = originX + col*SECTION_W + POLE_W,  y = BOT_RAIL_Y
 *   - vertical post:       x = originX + col*SECTION_W,            spanning TOP_RAIL_Y → BOT_RAIL_Y + POLE_W
 * Plus a closing post at column = sections.
 */
export function FencePrimitive({ sections, originX, highlight }: FencePrimitiveProps) {
  const fill = (row: 'top' | 'bot', col: number, kind: 'post' | 'rail') =>
    highlight?.(row, col, kind) ?? COLOR.POLE

  const posts: React.ReactNode[] = []
  const topRails: React.ReactNode[] = []
  const botRails: React.ReactNode[] = []

  for (let col = 0; col < sections; col++) {
    const postX = originX + col * SECTION_W
    const railX = postX + POLE_W
    const railW = SECTION_W - POLE_W

    // vertical post for this column
    posts.push(
      <rect
        key={`post-${col}`}
        x={postX}
        y={TOP_RAIL_Y}
        width={POLE_W}
        height={FENCE_H}
        rx={3}
        fill={fill('top', col, 'post')}
        stroke={COLOR.POLE_STROKE}
        strokeWidth={1}
      />
    )

    // top horizontal rail
    topRails.push(
      <rect
        key={`top-rail-${col}`}
        x={railX}
        y={TOP_RAIL_Y}
        width={railW}
        height={POLE_W}
        rx={3}
        fill={fill('top', col, 'rail')}
        stroke={COLOR.POLE_STROKE}
        strokeWidth={1}
      />
    )

    // bottom horizontal rail
    botRails.push(
      <rect
        key={`bot-rail-${col}`}
        x={railX}
        y={BOT_RAIL_Y}
        width={railW}
        height={POLE_W}
        rx={3}
        fill={fill('bot', col, 'rail')}
        stroke={COLOR.POLE_STROKE}
        strokeWidth={1}
      />
    )
  }

  // closing right-end post (the +2 end cap)
  const closingPostX = originX + sections * SECTION_W
  posts.push(
    <rect
      key="post-close"
      x={closingPostX}
      y={TOP_RAIL_Y}
      width={POLE_W}
      height={FENCE_H}
      rx={3}
      fill={fill('top', sections, 'post')}
      stroke={COLOR.POLE_STROKE}
      strokeWidth={1}
    />
  )

  return (
    <g>
      {/* draw rails first so posts sit on top at junctions */}
      {topRails}
      {botRails}
      {posts}
    </g>
  )
}

// ── Dimension arrow + label ────────────────────────────────────────────────────────────────

interface DimArrowProps {
  x1: number
  x2: number
  y: number
  label: string
  color?: string
}

/** Horizontal dimension arrow with ticks at each end and a centred label. */
export function DimArrow({ x1, x2, y, label, color = COLOR.DIM_ARROW }: DimArrowProps) {
  const midX = (x1 + x2) / 2
  const tickH = 6
  const arrowHead = 6

  return (
    <g fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round">
      {/* main line */}
      <line x1={x1} y1={y} x2={x2} y2={y} />
      {/* left tick */}
      <line x1={x1} y1={y - tickH} x2={x1} y2={y + tickH} />
      {/* right tick */}
      <line x1={x2} y1={y - tickH} x2={x2} y2={y + tickH} />
      {/* left arrow head */}
      <polyline points={`${x1 + arrowHead},${y - 4} ${x1},${y} ${x1 + arrowHead},${y + 4}`} fill="none" />
      {/* right arrow head */}
      <polyline points={`${x2 - arrowHead},${y - 4} ${x2},${y} ${x2 - arrowHead},${y + 4}`} fill="none" />
      {/* label on white pill so it floats over the line */}
      <rect x={midX - 30} y={y - 10} width={60} height={18} rx={4} fill="white" stroke="none" />
      <text
        x={midX}
        y={y}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────────────

/**
 * Fence12ECIllustration
 *
 * Static, problem-only figure for IKMC-20-EC-Q12.
 * Shows: a 4-metre fence built from 1 m poles (2 horizontal rails,
 * vertical posts at each section boundary) with a "4 metres" dimension
 * arrow underneath. Does NOT reveal pole count or the answer.
 */
export default function Fence12ECIllustration() {
  const dimY = TOP_RAIL_Y + FENCE_H + 22
  const fenceRight = FENCE_LEFT + SECTIONS * SECTION_W + POLE_W

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Pagar sepanjang 4 meter yang terbuat dari tiang-tiang 1 meter. ' +
        'Ada tiang vertikal di setiap batas bagian dan rel horizontal di atas dan bawah. ' +
        'Berapa banyak tiang yang dibutuhkan untuk pagar 10 meter?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* 4-section fence */}
        <FencePrimitive sections={SECTIONS} originX={FENCE_LEFT} />

        {/* dimension arrow beneath the fence */}
        <DimArrow x1={FENCE_LEFT} x2={fenceRight} y={dimY} label="4 metres" />
      </svg>
    </div>
  )
}
