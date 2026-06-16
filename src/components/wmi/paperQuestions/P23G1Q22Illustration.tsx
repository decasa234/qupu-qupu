// Bunting-of-flags picture for WMI-23P1A-Q22 (2023 Grade 1 Semifinal, Paper A).
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g1-a-q22.jpg): a string of
// six triangular pennant flags hanging from a curved cord. Reading left to
// right they are numbered 5, 3, 4, 1, 6, 2 — the "misplaced" classroom order.
// The puzzle: at least how many ADJACENT swaps turn this into 1, 2, 3, 4, 5, 6?
// (= the number of inversions = 9, answer C). The static figure shows ONLY the
// scrambled order, never the count.

/** Current (scrambled) order of the flags, left to right. */
export const FLAG_ORDER = [5, 3, 4, 1, 6, 2]
/** Target sorted order. */
export const TARGET_ORDER = [1, 2, 3, 4, 5, 6]

/** A soft, kid-friendly colour per flag, keyed by the number it carries. */
const FLAG_FILL: Record<number, string> = {
  1: '#9CD3F0', // light blue
  2: '#B7A6E0', // lavender
  3: '#A8D8B0', // mint
  4: '#F2A8A8', // pink
  5: '#F4C430', // gold
  6: '#A3CF4A', // lime
}

const CORD = '#3A332E'
const INK = '#2B2622'

export const FLAG_VIEW_W = 460
export const FLAG_VIEW_H = 220

const FIRST_X = 50 // x of the first flag's left top corner
const GAP_X = 72 // horizontal spacing between flags
const FLAG_W = 58 // top width of each pennant
const FLAG_H = 92 // height (apex drop) of each pennant

/** y of the cord (and the flags' top edge) at a given column index, following a
 * gentle smile curve so the bunting droops in the middle like the real photo. */
function cordY(i: number): number {
  const mid = (FLAG_ORDER.length - 1) / 2
  const t = (i - mid) / mid // -1 .. 1
  return 38 + 26 * t * t // lowest at the ends, highest dip in the middle? -> ends low
}

/**
 * One triangular pennant flag hanging at column `i`, carrying `value`. Optional
 * `highlight` ring + dimming for the explainer to spotlight the pair being
 * swapped; `faded` greys a flag that is already settled in its final place.
 */
export function Pennant({
  i,
  value,
  highlight = false,
  faded = false,
}: {
  i: number
  value: number
  highlight?: boolean
  faded?: boolean
}) {
  const xL = FIRST_X + i * GAP_X
  const xR = xL + FLAG_W
  const yTop = cordY(i)
  const apexX = xL + FLAG_W / 2
  const apexY = yTop + FLAG_H
  const fill = FLAG_FILL[value] ?? '#D9D2C8'
  return (
    <g opacity={faded ? 0.32 : 1}>
      {highlight && (
        <polygon
          points={`${xL - 6},${yTop - 6} ${xR + 6},${yTop - 6} ${apexX},${apexY + 8}`}
          fill="none"
          stroke="#F97316"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      )}
      <polygon
        points={`${xL},${yTop} ${xR},${yTop} ${apexX},${apexY}`}
        fill={fill}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* two little fold lines near the tip, like the photo */}
      <line x1={apexX - 11} y1={apexY - 30} x2={apexX + 9} y2={apexY - 22} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.75} strokeLinecap="round" />
      <line x1={apexX - 9} y1={apexY - 22} x2={apexX + 9} y2={apexY - 14} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.75} strokeLinecap="round" />
      <text x={apexX} y={yTop + 34} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">
        {value}
      </text>
    </g>
  )
}

export interface FlagBuntingProps {
  /** Flag values in left-to-right order (defaults to the scrambled FLAG_ORDER). */
  order?: number[]
  /** Column indices to ring (the adjacent pair being swapped). */
  highlightAt?: number[]
  /** Column indices that are settled into their final spot (drawn faded). */
  fadedAt?: number[]
}

export function FlagBunting({ order = FLAG_ORDER, highlightAt = [], fadedAt = [] }: FlagBuntingProps) {
  // The cord: a smooth path threading the top centre of every flag.
  const pts = order.map((_, i) => {
    const cx = FIRST_X + i * GAP_X + FLAG_W / 2
    const cy = cordY(i)
    return { cx, cy }
  })
  const cordPath =
    `M ${FIRST_X - 24} ${cordY(0) - 6} ` +
    pts.map((p) => `L ${p.cx} ${p.cy}`).join(' ') +
    ` L ${FIRST_X + (order.length - 1) * GAP_X + FLAG_W + 24} ${cordY(order.length - 1) - 6}`

  return (
    <svg
      viewBox={`0 0 ${FLAG_VIEW_W} ${FLAG_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <path d={cordPath} fill="none" stroke={CORD} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {order.map((value, i) => (
        <Pennant key={i} i={i} value={value} highlight={highlightAt.includes(i)} faded={fadedAt.includes(i)} />
      ))}
    </svg>
  )
}

export default function P23G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A string of six pennant flags numbered, left to right, 5, 3, 4, 1, 6, 2."
    >
      <FlagBunting />
    </div>
  )
}
