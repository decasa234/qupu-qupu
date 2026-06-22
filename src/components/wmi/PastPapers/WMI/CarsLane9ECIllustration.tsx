// IKMC-22-EC-Q9 — "Five cars numbered 1–5 overtake one another"
//
// STEM (images 022–026.jpg): five cars in a single lane, all moving in the
// same direction (left), numbered 1 (front) through 5 (back).
//
// The stem illustration shows the INITIAL order: 1 2 3 4 5 front→back,
// with a direction arrow (←) above the lane. No answer state is shown.
//
// Colours match the scanned cars:
//   1 = red   (#EF4444 / #B91C1C)
//   2 = green (#22C55E / #15803D)
//   3 = teal  (#14B8A6 / #0F766E)
//   4 = amber (#F59E0B / #B45309)
//   5 = brown (#A16207 / #78350F)  — the original is brownish-orange
//
// Co-exported primitive: CarRow — renders an ordered array of car numbers in
// coloured boxes on a lane track; reused by CarsLane9ECExplainer.
//
// Pure render: no randomness, no Date, SSR-safe.

// ---- palette ----------------------------------------------------------------
const INK = '#1F2937'
const TRACK = '#CBD5E1'       // lane track line colour
const ROAD_BG = '#F1F5F9'    // road surface

// Per-car colours — index 0 = car 1, …, index 4 = car 5
const CAR_FILLS: Record<number, string> = {
  1: '#FCA5A5',   // red-300
  2: '#86EFAC',   // green-300
  3: '#99F6E4',   // teal-200
  4: '#FCD34D',   // amber-300
  5: '#D97706',   // amber-600 (brownish)
}
const CAR_STROKES: Record<number, string> = {
  1: '#DC2626',   // red-600
  2: '#16A34A',   // green-600
  3: '#0D9488',   // teal-600
  4: '#D97706',   // amber-600
  5: '#92400E',   // amber-800
}

// ---- geometry ---------------------------------------------------------------
const CAR_W = 48
const CAR_H = 30
const CAR_RX = 6          // rounded corner
const LABEL_FONT = 15
const GAP = 16            // space between cars
const PAD_X = 20          // left/right margin
const PAD_Y = 20          // top margin before the car row
const ARROW_AREA = 26     // height reserved for the "←" direction indicator

// Total SVG geometry
const N = 5
const TRACK_W = PAD_X * 2 + N * CAR_W + (N - 1) * GAP
const ROAD_H = CAR_H + 20  // road strip height
const SVG_H = ARROW_AREA + PAD_Y + ROAD_H + 12

/** x-centre of the i-th car (0-indexed, left = front of queue) */
export function carCX(i: number): number {
  return PAD_X + CAR_W / 2 + i * (CAR_W + GAP)
}

const ROAD_Y = ARROW_AREA + PAD_Y

// ---- primitives -------------------------------------------------------------

/** A single car box: coloured rect + bold number. */
function CarBox({
  num,
  cx,
  cy,
  highlight = false,
  dim = false,
}: {
  num: number
  cx: number
  cy: number
  highlight?: boolean
  dim?: boolean
}) {
  const fill = CAR_FILLS[num] ?? '#CBD5E1'
  const stroke = CAR_STROKES[num] ?? '#64748B'
  const x = cx - CAR_W / 2
  const y = cy - CAR_H / 2
  return (
    <g opacity={dim ? 0.25 : 1}>
      {highlight && (
        <rect
          x={x - 4}
          y={y - 4}
          width={CAR_W + 8}
          height={CAR_H + 8}
          rx={CAR_RX + 3}
          fill="none"
          stroke="#10B981"
          strokeWidth={3}
          strokeDasharray="5 3"
        />
      )}
      <rect
        x={x}
        y={y}
        width={CAR_W}
        height={CAR_H}
        rx={CAR_RX}
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={LABEL_FONT}
        fontWeight={800}
        fill={INK}
      >
        {num}
      </text>
    </g>
  )
}

/** Lane road background + track line. */
function Road() {
  return (
    <>
      {/* road strip */}
      <rect
        x={0}
        y={ROAD_Y}
        width={TRACK_W}
        height={ROAD_H}
        fill={ROAD_BG}
        stroke={TRACK}
        strokeWidth={1.5}
      />
      {/* centre dotted divider line */}
      <line
        x1={PAD_X}
        y1={ROAD_Y + ROAD_H / 2}
        x2={TRACK_W - PAD_X}
        y2={ROAD_Y + ROAD_H / 2}
        stroke={TRACK}
        strokeWidth={2}
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
    </>
  )
}

// ---- CarRow (exported for explainer) ----------------------------------------

export interface CarRowProps {
  /** Car numbers left→right (front→back of queue). Length 1–5. */
  order: number[]
  /** 0-based indices to highlight (the overtaking car). */
  highlightSet?: Set<number>
  /** 0-based indices to dim. */
  dimSet?: Set<number>
}

const ROAD_CY = ROAD_Y + ROAD_H / 2

/**
 * Horizontal row of numbered car boxes on a lane.  Left = front of queue.
 * Exported so CarsLane9ECExplainer can render intermediate states.
 */
export function CarRow({ order, highlightSet, dimSet }: CarRowProps) {
  const n = order.length
  // Total width needed for this row
  const rowW = PAD_X * 2 + n * CAR_W + (n - 1) * GAP

  return (
    <svg
      viewBox={`0 0 ${rowW} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: Math.min(rowW, 520), display: 'block' }}
      aria-hidden="true"
    >
      {/* direction arrow above lane */}
      <text
        x={rowW / 2}
        y={ARROW_AREA / 2 + 4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill="#64748B"
        aria-hidden="true"
      >
        ←
      </text>
      <text
        x={rowW / 2 + 22}
        y={ARROW_AREA / 2 + 4}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={10}
        fill="#94A3B8"
        aria-hidden="true"
      >
        direction
      </text>

      {/* road */}
      <rect
        x={0}
        y={ROAD_Y}
        width={rowW}
        height={ROAD_H}
        fill={ROAD_BG}
        stroke={TRACK}
        strokeWidth={1.5}
      />
      <line
        x1={PAD_X / 2}
        y1={ROAD_CY}
        x2={rowW - PAD_X / 2}
        y2={ROAD_CY}
        stroke={TRACK}
        strokeWidth={2}
        strokeDasharray="8 6"
        strokeLinecap="round"
      />

      {/* car boxes */}
      {order.map((num, i) => {
        const cx = PAD_X + CAR_W / 2 + i * (CAR_W + GAP)
        return (
          <CarBox
            key={`${i}-${num}`}
            num={num}
            cx={cx}
            cy={ROAD_CY}
            highlight={highlightSet?.has(i)}
            dim={dimSet?.has(i)}
          />
        )
      })}

      {/* "front" label */}
      <text
        x={PAD_X + CAR_W / 2}
        y={SVG_H - 3}
        textAnchor="middle"
        fontSize={9}
        fill="#94A3B8"
        aria-hidden="true"
      >
        front
      </text>
      {/* "back" label */}
      <text
        x={PAD_X + CAR_W / 2 + (n - 1) * (CAR_W + GAP)}
        y={SVG_H - 3}
        textAnchor="middle"
        fontSize={9}
        fill="#94A3B8"
        aria-hidden="true"
      >
        back
      </text>
    </svg>
  )
}

// ---- default export: static stem illustration --------------------------------
const ARIA_EN =
  'Five cars in a lane, all moving in the same direction. ' +
  'From front to back: car 1 (red), car 2 (green), car 3 (teal), car 4 (amber), car 5 (brown).'
const ARIA_ID =
  'Lima mobil dalam satu jalur, semuanya bergerak ke arah yang sama. ' +
  'Dari depan ke belakang: mobil 1 (merah), mobil 2 (hijau), mobil 3 (teal), mobil 4 (kuning), mobil 5 (coklat).'

export default function CarsLane9ECIllustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const aria = lang === 'id' ? ARIA_ID : ARIA_EN
  return (
    <div className="my-4 flex flex-col items-center" role="img" aria-label={aria}>
      <CarRow order={[1, 2, 3, 4, 5]} />
    </div>
  )
}
