/**
 * WMI-24P3A-Q3 (2024 Grade 3 Semifinal, Paper A) — bus seat map.
 *
 * Source figure (db/seed/wmi/figures/2024-semifinal-g3-a-q3.jpg): a top-down
 * plan of a bus drawn on a pale-green floor with rounded corners and four small
 * dark wheel tabs on the long edges. The seats are little chair glyphs (a back
 * + two side arms, like a "C"). A steering wheel (a circle with a cross, ⊕) and
 * the word "Driver" sit in the top-right corner.
 *
 * Counting the chairs row by row (top → bottom, pixel-verified on the scan):
 *     row 1 : 8        row 2 : 7        row 3 : 1 (single seat, driver area
 *     beside it)       row 4 : 7        row 5 : 8
 * Total seats = 8 + 7 + 1 + 7 + 8 = 31.
 *
 * Jansen's class has 9 × 3 = 27 students. Empty seats = 31 − 27 = 4 (answer C).
 *
 * The static figure shows ONLY the seat map (the problem), never the answer.
 *
 * Co-exports SEAT_ROWS / TOTAL_SEATS and the `BusSeatMap` primitive so the
 * explainer can re-draw the same bus and tint seats as it counts.
 *
 * Pure render — no Math.random, no Date, no window/document at module load.
 * SSR-safe + deterministic.
 */

// ── seat layout ──────────────────────────────────────────────────────────────
/** Seats per drawn row, top to bottom (matches the scanned plan). */
export const SEAT_ROWS = [8, 7, 1, 7, 8] as const
export const TOTAL_SEATS = SEAT_ROWS.reduce((a, b) => a + b, 0) // 31
export const STUDENTS = 9 * 3 // 27
export const EMPTY_SEATS = TOTAL_SEATS - STUDENTS // 4

// ── colour tokens ────────────────────────────────────────────────────────────
const FLOOR = '#E3EFE0' // pale-green bus floor
const FLOOR_EDGE = '#2B2118'
const WHEEL_TAB = '#2B2118'
const SEAT_DARK = '#2B2118' // empty seat glyph (matches the scan)
const SEAT_FILLED = '#3B82F6' // a seated student
const DRIVER_PANEL = '#E8E6C2' // faint dashboard panel by the driver

// ── geometry ─────────────────────────────────────────────────────────────────
const VW = 470
const VH = 270
const BODY_X = 20
const BODY_Y = 26
const BODY_W = VW - 2 * BODY_X
const BODY_H = VH - 2 * BODY_Y

// Seat grid placement.
const FIRST_X = 56
const FIRST_Y = 64
const COL_GAP = 44
const ROW_GAP = 44

/** One chair glyph (back wall + two arms) centred at (cx, cy). When `filled`,
 *  a coloured dot (a seated student) sits inside it. */
function Seat({ cx, cy, filled = false }: { cx: number; cy: number; filled?: boolean }) {
  const color = filled ? SEAT_FILLED : SEAT_DARK
  // a thick "C": vertical back on the left + short top & bottom arms reaching right
  const x = cx - 9
  const y = cy - 11
  return (
    <g>
      <path
        d={`M ${x + 14} ${y} L ${x} ${y} L ${x} ${y + 22} L ${x + 14} ${y + 22}`}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {filled && <circle cx={cx + 2} cy={cy} r={4.2} fill="#FFFFFF" />}
    </g>
  )
}

export interface BusSeatMapProps {
  /** How many seats are filled with students (counted from the first row). */
  filledSeats?: number
  /** Show the "= N" seat-count badge in the corner. */
  showTotal?: boolean
}

/** Pure SVG primitive of the bus seat map, reused by the explainer. */
export function BusSeatMap({ filledSeats = 0, showTotal = false }: BusSeatMapProps) {
  // Flatten the rows into ordered seat centres so `filledSeats` can fill them in order.
  const seats: Array<{ x: number; y: number }> = []
  SEAT_ROWS.forEach((count, r) => {
    for (let c = 0; c < count; c++) {
      seats.push({ x: FIRST_X + c * COL_GAP, y: FIRST_Y + r * ROW_GAP })
    }
  })

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 470 }}
      aria-hidden="true"
    >
      {/* wheel tabs on the top and bottom edges */}
      {[
        [BODY_X + 70, BODY_Y - 11],
        [BODY_X + BODY_W - 110, BODY_Y - 11],
        [BODY_X + 70, BODY_Y + BODY_H - 5],
        [BODY_X + BODY_W - 110, BODY_Y + BODY_H - 5],
      ].map(([x, y], i) => (
        <rect key={`tab${i}`} x={x} y={y} width={40} height={16} rx={4} fill={WHEEL_TAB} />
      ))}

      {/* bus floor */}
      <rect x={BODY_X} y={BODY_Y} width={BODY_W} height={BODY_H} rx={22} fill={FLOOR} stroke={FLOOR_EDGE} strokeWidth={3} />

      {/* driver corner: dashboard panel, steering wheel ⊕, "Driver" label */}
      <rect x={VW - 116} y={134} width={64} height={26} rx={5} fill={DRIVER_PANEL} />
      <g>
        <circle cx={VW - 70} cy={66} r={15} fill="none" stroke={FLOOR_EDGE} strokeWidth={3} />
        <line x1={VW - 85} y1={66} x2={VW - 55} y2={66} stroke={FLOOR_EDGE} strokeWidth={3} />
        <line x1={VW - 70} y1={51} x2={VW - 70} y2={81} stroke={FLOOR_EDGE} strokeWidth={3} />
      </g>
      <text x={VW - 70} y={104} textAnchor="middle" fontSize={18} fontStyle="italic" fontWeight={700} fill={FLOOR_EDGE}>
        Driver
      </text>

      {/* seats */}
      {seats.map((s, i) => (
        <Seat key={`s${i}`} cx={s.x} cy={s.y} filled={i < filledSeats} />
      ))}

      {/* seat-count badge */}
      {showTotal && (
        <g>
          <rect x={VW - 118} y={196} width={66} height={30} rx={8} fill="#2563EB" />
          <text x={VW - 85} y={211} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#FFFFFF">
            {TOTAL_SEATS} seats
          </text>
        </g>
      )}
    </svg>
  )
}

// ── default export ───────────────────────────────────────────────────────────

export default function P24G3Q3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Denah tempat duduk sebuah bus dilihat dari atas: lima baris kursi (8, 7, 1, 7, 8) berbentuk huruf C, dengan setir dan tulisan Driver di pojok kanan atas."
    >
      <BusSeatMap />
    </div>
  )
}
