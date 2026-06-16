// Parking-lot illustration for WMI-24F2A-Q21.
// Two rows of numbered spaces (odd 11–27, even 12–26) with several cars already
// parked. Shows the problem setup; does NOT reveal Marcus's space (21).
// Pure render — no random, no state, SSR-safe.

// ---- layout constants (co-exported so animators / explainers can bind) -------

/** The top row: odd spaces 11–27 (Marcus is in this row). */
export const TOP_ROW = [11, 13, 15, 17, 19, 21, 23, 25, 27] as const

/** The bottom row: even spaces 12–26. */
export const BOTTOM_ROW = [12, 14, 16, 18, 20, 22, 24, 26] as const

/**
 * Cars visible in the figure as printed.
 * row=0 → top, row=1 → bottom. `color` is a qupu token key.
 */
export type CarColor = 'red' | 'yellow' | 'blue'
export interface ParkedCar {
  row: 0 | 1
  space: number
  color: CarColor
}

export const PARKED_CARS: readonly ParkedCar[] = [
  // top row (odd)
  { row: 0, space: 17, color: 'red' },
  { row: 0, space: 19, color: 'yellow' },
  { row: 0, space: 21, color: 'blue' },
  // bottom row (even)
  { row: 1, space: 20, color: 'blue' },
  { row: 1, space: 22, color: 'red' },
] as const

// ---- colour map: car body fills using qupu-adjacent hex values ---------------
const CAR_FILLS: Record<CarColor, string> = {
  red: '#E63946',
  yellow: '#F4D03F',
  blue: '#2D9CDB',
}
const CAR_STROKE: Record<CarColor, string> = {
  red: '#9B1C25',
  yellow: '#B8860B',
  blue: '#1565A0',
}

// ---- geometry ----------------------------------------------------------------
const SPACE_W = 40   // parking-space width
const SPACE_H = 56   // parking-space height
const SPACE_GAP = 2  // gap between spaces
const ROW_GAP = 20   // vertical gap between the two rows

// top-left of the SVG content area
const PAD_X = 8
const PAD_Y = 10

const COLS_TOP = TOP_ROW.length      // 9

const ROW_TOP_Y = PAD_Y
const ROW_BOT_Y = PAD_Y + SPACE_H + ROW_GAP

const TOP_ROW_W = COLS_TOP * SPACE_W + (COLS_TOP - 1) * SPACE_GAP
const SVG_W = PAD_X * 2 + TOP_ROW_W

// wall thickness on the right of the bottom row
const WALL_W = 14
const WALL_H = SPACE_H + 12

const SVG_H = PAD_Y + SPACE_H + ROW_GAP + SPACE_H + PAD_Y

// ---- car glyph (top-down view) ----------------------------------------------
function Car({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: CarColor }) {
  const fill = CAR_FILLS[color]
  const stroke = CAR_STROKE[color]
  const bw = w * 0.7  // body width
  const bx = x + (w - bw) / 2
  const windH = h * 0.22
  return (
    <g>
      {/* body */}
      <rect x={bx} y={y + h * 0.06} width={bw} height={h * 0.88} rx={bw * 0.3} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {/* front windscreen */}
      <rect x={bx + bw * 0.12} y={y + h * 0.1} width={bw * 0.76} height={windH} rx={3} fill="white" opacity={0.7} />
      {/* rear windscreen */}
      <rect x={bx + bw * 0.12} y={y + h * 0.68} width={bw * 0.76} height={windH} rx={3} fill="white" opacity={0.5} />
      {/* wheels (four dots) */}
      <circle cx={bx + bw * 0.1} cy={y + h * 0.22} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.9} cy={y + h * 0.22} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.1} cy={y + h * 0.78} r={bw * 0.1} fill="#1F2937" />
      <circle cx={bx + bw * 0.9} cy={y + h * 0.78} r={bw * 0.1} fill="#1F2937" />
    </g>
  )
}

// ---- parking-space rectangle with number label ------------------------------
function ParkingSpace({
  x, y, number, car,
}: {
  x: number
  y: number
  number: number
  car?: CarColor | undefined
}) {
  const mid = x + SPACE_W / 2
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={SPACE_W}
        height={SPACE_H}
        fill={car ? '#F0F0F0' : 'white'}
        stroke="#374151"
        strokeWidth={1.8}
      />
      {/* space number */}
      {!car && (
        <text
          x={mid}
          y={y + SPACE_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          fill="#1F2937"
        >
          {number}
        </text>
      )}
      {/* car glyph when parked */}
      {car && (
        <>
          <Car x={x + 3} y={y + 4} w={SPACE_W - 6} h={SPACE_H - 8} color={car} />
        </>
      )}
    </g>
  )
}

// ---- sample params (fallback for concept-preview) ---------------------------
export const SAMPLE = {
  topRow: [...TOP_ROW],
  bottomRow: [...BOTTOM_ROW],
  parkedCars: PARKED_CARS,
}

// ---- main component ---------------------------------------------------------
/**
 * Parking24G2Illustration — problem-only figure for WMI-24F2A-Q21.
 * Shows two rows of numbered spaces with a few parked cars, does NOT
 * reveal which space Marcus occupies.
 *
 * `params` is accepted but ignored — the layout is fully determined by the
 * question's printed figure and never varies.
 */
export default function Parking24G2Illustration() {
  // Build car lookup: `${row}-${space}` → color
  const carMap = new Map<string, CarColor>()
  for (const car of PARKED_CARS) {
    carMap.set(`${car.row}-${car.space}`, car.color)
  }

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tempat parkir dua baris: baris atas bernomor 11, 13, 15 lalu tiga mobil terparkir, lalu 23, 25, 27. ' +
        'Baris bawah bernomor 12, 14, 16, 18 lalu dua mobil terparkir, lalu 24, 26, dan tembok di ujung kanan. ' +
        'Temukan nomor tempat parkir Marcus.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(400, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* ── top row (odd: 11..27) ─────────────────────────────────── */}
        {TOP_ROW.map((num, i) => {
          const x = PAD_X + i * (SPACE_W + SPACE_GAP)
          const car = carMap.get(`0-${num}`)
          return (
            <ParkingSpace key={`top-${num}`} x={x} y={ROW_TOP_Y} number={num} car={car} />
          )
        })}

        {/* ── bottom row (even: 12..26) ─────────────────────────────── */}
        {BOTTOM_ROW.map((num, i) => {
          const x = PAD_X + i * (SPACE_W + SPACE_GAP)
          const car = carMap.get(`1-${num}`)
          return (
            <ParkingSpace key={`bot-${num}`} x={x} y={ROW_BOT_Y} number={num} car={car} />
          )
        })}

        {/* ── wall / barrier at the right end of the bottom row ─────── */}
        {(() => {
          const wallX = PAD_X + BOTTOM_ROW.length * (SPACE_W + SPACE_GAP)
          return (
            <g>
              {/* vertical wall */}
              <rect
                x={wallX}
                y={ROW_BOT_Y - 6}
                width={WALL_W}
                height={WALL_H}
                rx={2}
                fill="#374151"
              />
              {/* horizontal cap at the bottom (L-shape) — extends leftward into the lot */}
              <rect
                x={wallX - SPACE_W}
                y={ROW_BOT_Y + SPACE_H - 2}
                width={SPACE_W + WALL_W}
                height={8}
                fill="#374151"
              />
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
