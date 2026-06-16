// Shape-addition flow figure for WMI-24F1A-Q15 (2024 Grade 1 Final).
//
// "The figure shows addition relationships where the same shape stands for the
// same number. Find ★."
//
// The scan is TWO little flow trees that both feed one shared total box of 20:
//
//   Left tree:   13                Right tree:    ★
//               /  \                            /  \
//          [____]    7                        3    [____]
//               \  /                            \  /
//                20  <------ shared total ------>  20
//
// Each tree's TOP number plus its labelled bottom sibling makes the total 20:
//   Left :  13 + 7 = 20   (so the left empty box = 13)
//   Right:  ★ + 3 = 20    →   ★ = 20 − 3 = 17
//
// Derivation (NEVER shown in the pristine question figure): ★ = 17.
// The static figure shows ONLY the given numbers (13, 7, 3, 20) and the ★
// placeholder; it must NOT reveal ★ = 17.
//
// House-style reference: ShapeAdd23G1Illustration (the 2023 sibling).
// Pure render, SSR-safe, deterministic (no random / dates / state).

const INK = '#1F2937'
const STAR_FILL = '#FBBF6B' // single warm fill for the unknown ★ glyph
const STAR_VALUE = 17 // used ONLY when the animator reveals the answer

// --- layout -----------------------------------------------------------------
const VIEW_W = 320
const VIEW_H = 250

const BOX_W = 58
const BOX_H = 40
const BOX_RX = 8

// Row y-centres: top number, the two children, the shared total.
const TOP_Y = 36
const MID_Y = 124
const BOT_Y = 212

// x-centres of the four columns of mid boxes (two per tree).
const COL_X = [46, 118, 202, 274]
// x-centre of each tree's top box (above its two children).
const LEFT_TOP_X = (COL_X[0] + COL_X[1]) / 2
const RIGHT_TOP_X = (COL_X[2] + COL_X[3]) / 2
// the single shared total box, centred between the trees.
const TOTAL_X = VIEW_W / 2

/** One rounded box centred at (cx, cy) holding either a number, the ★, or nothing. */
function FlowBox({
  cx,
  cy,
  value,
  star,
  revealStar,
}: {
  cx: number
  cy: number
  value?: number
  star?: boolean
  revealStar?: boolean
}) {
  const x = cx - BOX_W / 2
  const y = cy - BOX_H / 2
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={BOX_RX}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.5}
      />
      {typeof value === 'number' && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={900}
          fill={INK}
        >
          {value}
        </text>
      )}
      {star && <StarGlyph cx={cx} cy={cy} reveal={revealStar} />}
    </g>
  )
}

/** Filled monochrome five-pointed ★ glyph; shows its value only once revealed. */
function StarGlyph({ cx, cy, reveal }: { cx: number; cy: number; reveal?: boolean }) {
  const R = 13
  const inner = R * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? R : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return (
    <g>
      <polygon
        points={pts.join(' ')}
        fill={STAR_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {reveal && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={900}
          fill={INK}
        >
          {STAR_VALUE}
        </text>
      )}
    </g>
  )
}

/** A downward arrow from one box edge toward another box edge, with a head. */
function FlowArrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  const head = 7
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(ang)
  const hy = y2 - head * Math.sin(ang)
  const left = `${(hx + head * Math.cos(ang - Math.PI / 2) * 0.8).toFixed(2)},${(hy + head * Math.sin(ang - Math.PI / 2) * 0.8).toFixed(2)}`
  const right = `${(hx + head * Math.cos(ang + Math.PI / 2) * 0.8).toFixed(2)},${(hy + head * Math.sin(ang + Math.PI / 2) * 0.8).toFixed(2)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <polygon points={`${x2.toFixed(2)},${y2.toFixed(2)} ${left} ${right}`} fill={INK} />
    </g>
  )
}

/** One tree's arrows: top → its two children, then both children → total. */
function TreeArrows({
  topX,
  leftX,
  rightX,
}: {
  topX: number
  leftX: number
  rightX: number
}) {
  const half = BOX_H / 2
  return (
    <g>
      {/* top box splits down to the two child boxes */}
      <FlowArrow x1={topX - 8} y1={TOP_Y + half} x2={leftX} y2={MID_Y - half - 2} />
      <FlowArrow x1={topX + 8} y1={TOP_Y + half} x2={rightX} y2={MID_Y - half - 2} />
      {/* both children converge down into the shared total */}
      <FlowArrow x1={leftX} y1={MID_Y + half} x2={TOTAL_X - 16} y2={BOT_Y - half - 2} />
      <FlowArrow x1={rightX} y1={MID_Y + half} x2={TOTAL_X + 16} y2={BOT_Y - half - 2} />
    </g>
  )
}

export interface ShapeAdd24G1Props {
  /** When true, the ★ box shows its solved value (17). Animator-only. */
  revealStar?: boolean
}

/**
 * Primitive board for the two shape-addition flow trees. The animator passes
 * `revealStar` to fill ★ with 17. At the default (false) the figure is the
 * pristine question: ★ carries no number.
 */
export function ShapeAdd24G1({ revealStar = false }: ShapeAdd24G1Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* arrows behind the boxes */}
      <TreeArrows topX={LEFT_TOP_X} leftX={COL_X[0]} rightX={COL_X[1]} />
      <TreeArrows topX={RIGHT_TOP_X} leftX={COL_X[2]} rightX={COL_X[3]} />

      {/* left tree boxes: top 13, children [empty] & 7 */}
      <FlowBox cx={LEFT_TOP_X} cy={TOP_Y} value={13} />
      <FlowBox cx={COL_X[0]} cy={MID_Y} />
      <FlowBox cx={COL_X[1]} cy={MID_Y} value={7} />

      {/* right tree boxes: top ★, children 3 & [empty] */}
      <FlowBox cx={RIGHT_TOP_X} cy={TOP_Y} star revealStar={revealStar} />
      <FlowBox cx={COL_X[2]} cy={MID_Y} value={3} />
      <FlowBox cx={COL_X[3]} cy={MID_Y} />

      {/* shared total */}
      <FlowBox cx={TOTAL_X} cy={BOT_Y} value={20} />
    </svg>
  )
}

// Indonesian aria description (numbers named, ★ NOT solved).
const ARIA =
  'Diagram penjumlahan dengan bentuk yang sama mewakili bilangan yang sama. ' +
  'Pohon kiri: kotak atas 13 bercabang ke kotak kosong dan 7, keduanya menuju total 20. ' +
  'Pohon kanan: kotak atas bintang bercabang ke 3 dan kotak kosong, keduanya menuju total 20. ' +
  'Cari nilai bintang.'

/** Question figure — ★ unknown. Sits in the card, no box. */
export default function ShapeAdd24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ShapeAdd24G1 revealStar={false} />
    </div>
  )
}
