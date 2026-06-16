/**
 * WMI-19F2A-Q14 — "Arrange the animals from heaviest to lightest."
 *
 * The real figure shows THREE seesaw balances; on each, the heavier animal's
 * side tilts DOWN:
 *   1. 🐷 pig (down) vs 🐵 monkey (up)  → pig    > monkey
 *   2. 🐷 pig (up)   vs 🐄 cow (down)   → cow    > pig
 *   3. 🐘 elephant (down) vs 🐄 cow (up) → elephant > cow
 * Chaining: elephant > cow > pig > monkey.
 * Heaviest → lightest order = 🐘 🐄 🐷 🐵 → answer option C.
 */

export const PIG = '🐷'
export const MONKEY = '🐵'
export const COW = '🐄'
export const ELEPHANT = '🐘'

export type AnimalEmoji = typeof PIG | typeof MONKEY | typeof COW | typeof ELEPHANT

/** The three seesaw comparisons, in figure order. `heavy` sits on the side that tilts DOWN. */
export interface SeesawDef {
  left: AnimalEmoji
  right: AnimalEmoji
  /** Which side is heavier (tilts down). */
  heavy: 'left' | 'right'
}

export const SEESAWS: SeesawDef[] = [
  { left: PIG, right: MONKEY, heavy: 'left' }, // pig > monkey
  { left: PIG, right: COW, heavy: 'right' }, // cow > pig
  { left: ELEPHANT, right: COW, heavy: 'left' }, // elephant > cow
]

/** Heaviest → lightest, the chained result (= option C). */
export const ORDER_HEAVY_TO_LIGHT: AnimalEmoji[] = [ELEPHANT, COW, PIG, MONKEY]

const FULCRUM = '#341857'
const BEAM = '#2f6df0'

/** Per-seesaw geometry inside a 200×120 cell. */
const SEAT_DX = 62 // horizontal offset of each seat from centre
const PIVOT_X = 100
const PIVOT_Y = 84
const TILT = 18 // vertical rise/fall of the beam ends

/**
 * One seesaw: a triangle fulcrum + a tilted beam, the heavier animal lower.
 * Drawn deterministically; `dim` fades it; `glow` highlights the beam.
 */
export function Seesaw({
  def,
  glow = false,
  dim = false,
}: {
  def: SeesawDef
  glow?: boolean
  dim?: boolean
}) {
  const leftDown = def.heavy === 'left'
  const leftY = PIVOT_Y + (leftDown ? TILT : -TILT)
  const rightY = PIVOT_Y + (leftDown ? -TILT : TILT)
  const leftX = PIVOT_X - SEAT_DX
  const rightX = PIVOT_X + SEAT_DX

  const beamStroke = glow ? '#F97316' : BEAM
  const beamWidth = glow ? 7 : 5

  return (
    <g opacity={dim ? 0.3 : 1}>
      {/* Fulcrum triangle */}
      <polygon
        points={`${PIVOT_X},${PIVOT_Y - 2} ${PIVOT_X - 18},${PIVOT_Y + 26} ${PIVOT_X + 18},${PIVOT_Y + 26}`}
        fill={FULCRUM}
      />
      {/* Base line */}
      <line x1={PIVOT_X - 34} y1={PIVOT_Y + 26} x2={PIVOT_X + 34} y2={PIVOT_Y + 26} stroke={FULCRUM} strokeWidth={3} strokeLinecap="round" />

      {/* Tilted beam */}
      <line
        x1={leftX}
        y1={leftY}
        x2={rightX}
        y2={rightY}
        stroke={beamStroke}
        strokeWidth={beamWidth}
        strokeLinecap="round"
        style={glow ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))' } : undefined}
      />
      {/* Seat pads */}
      <circle cx={leftX} cy={leftY} r={4} fill={beamStroke} />
      <circle cx={rightX} cy={rightY} r={4} fill={beamStroke} />

      {/* Animals sitting on each seat */}
      <text x={leftX} y={leftY - 18} fontSize={30} textAnchor="middle" dominantBaseline="central">
        {def.left}
      </text>
      <text x={rightX} y={rightY - 18} fontSize={30} textAnchor="middle" dominantBaseline="central">
        {def.right}
      </text>
    </g>
  )
}

export const CELL_W = 200
export const CELL_H = 120

/** A panel of all three seesaws laid out in a row. */
export function SeesawPanel({ glowIndex = -1 }: { glowIndex?: number }) {
  return (
    <svg
      viewBox={`0 0 ${CELL_W * 3} ${CELL_H}`}
      width="100%"
      style={{ maxWidth: CELL_W * 3, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SEESAWS.map((def, i) => (
        <g key={i} transform={`translate(${i * CELL_W}, 0)`}>
          <Seesaw def={def} glow={glowIndex === i} dim={glowIndex !== -1 && glowIndex !== i} />
        </g>
      ))}
    </svg>
  )
}

export default function AnimalWeightsG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three seesaw balances: a pig outweighs a monkey; a cow outweighs a pig; an elephant outweighs a cow."
    >
      <SeesawPanel />
    </div>
  )
}
