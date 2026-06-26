// OSN-25-SD-NAS-FINAL-Q5 — bus seating arrangement
//
// STEM ILLUSTRATION: front-row of 5 seats in a bus, top-down schematic.
// Layout: [1][2] | LORONG | [3][4][5]
//   • Window seats: 1 (left end) and 5 (right end)
//   • Aisle-adjacent seats: 2, 3, 4 (yields answer 2 × 3 × 3! = 36)
//
// Co-exports BusSeatRow so the explainer can render the same row
// with highlighted states per beat.
//
// SSR-safe: no hooks, no Math.random, no framer-motion.

// ── layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 380
export const SVG_H = 190

export const SEAT_W = 54
export const SEAT_H = 68
const SEAT_R = 9
const SEAT_GAP = 9
const AISLE_W = 44

// X origins of the 5 seats (left edge of each seat rect)
const X0 = 16
const X1 = X0
const X2 = X1 + SEAT_W + SEAT_GAP            // = 79
const AISLE_LEFT  = X2 + SEAT_W              // = 133
const AISLE_RIGHT = AISLE_LEFT + AISLE_W      // = 177
const X3 = AISLE_RIGHT                        // = 177
const X4 = X3 + SEAT_W + SEAT_GAP            // = 240
const X5 = X4 + SEAT_W + SEAT_GAP            // = 303
// X5 right edge: 303 + 54 = 357 (within 380) ✓

export const SEAT_XS = [X1, X2, X3, X4, X5] as const
export const AISLE_MID_X = (AISLE_LEFT + AISLE_RIGHT) / 2  // = 155
export const SEAT_TOP_Y = 64
export const SEAT_CY = SEAT_TOP_Y + SEAT_H / 2  // = 98

// ── colour tokens ─────────────────────────────────────────────────────────────

const FILL: Record<SeatState, string> = {
  normal:    '#F3F4F6',
  window:    '#BFDBFE',
  aisle:     '#BBF7D0',
  highlight: '#FEF08A',
  taken:     '#E5E7EB',
}
const STROKE_COLOR: Record<SeatState, string> = {
  normal:    '#9CA3AF',
  window:    '#3B82F6',
  aisle:     '#10B981',
  highlight: '#CA8A04',
  taken:     '#D1D5DB',
}
const TEXT_COLOR: Record<SeatState, string> = {
  normal:    '#4B5563',
  window:    '#1D4ED8',
  aisle:     '#065F46',
  highlight: '#78350F',
  taken:     '#9CA3AF',
}

// ── types ─────────────────────────────────────────────────────────────────────

export type SeatState = 'normal' | 'window' | 'aisle' | 'highlight' | 'taken'

// ── sub-components ────────────────────────────────────────────────────────────

interface BusSeatProps {
  x: number
  label: string
  state?: SeatState
}

export function BusSeat({ x, label, state = 'normal' }: BusSeatProps) {
  const fill       = FILL[state]
  const stroke     = STROKE_COLOR[state]
  const textFill   = TEXT_COLOR[state]
  const sw         = state === 'normal' || state === 'taken' ? 1.5 : 2.5

  return (
    <g>
      {/* shadow */}
      <rect
        x={x + 2} y={SEAT_TOP_Y + 3}
        width={SEAT_W} height={SEAT_H}
        rx={SEAT_R} fill="rgba(0,0,0,0.07)"
      />
      {/* seat body */}
      <rect
        x={x} y={SEAT_TOP_Y}
        width={SEAT_W} height={SEAT_H}
        rx={SEAT_R} fill={fill} stroke={stroke} strokeWidth={sw}
      />
      {/* headrest band */}
      <rect
        x={x + 5} y={SEAT_TOP_Y + 4}
        width={SEAT_W - 10} height={14}
        rx={6}
        fill={stroke} opacity={state === 'taken' ? 0.15 : 0.35}
      />
      {/* seat number */}
      <text
        x={x + SEAT_W / 2}
        y={SEAT_TOP_Y + SEAT_H / 2 + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={800}
        fill={textFill}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── reusable row component (exported for explainer) ───────────────────────────

export interface BusSeatRowProps {
  /** Per-seat visual state, length 5 (seats 1–5 left to right). */
  seatStates?: readonly SeatState[]
  /** Per-seat label override; defaults to '1'–'5'. */
  seatLabels?: readonly string[]
}

export function BusSeatRow({
  seatStates = ['normal', 'normal', 'normal', 'normal', 'normal'],
  seatLabels = ['1', '2', '3', '4', '5'],
}: BusSeatRowProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* bus body outline */}
      <rect
        x={4} y={4} width={SVG_W - 8} height={SVG_H - 8}
        rx={20} fill="#FAFAFA" stroke="#E5E7EB" strokeWidth={2}
      />

      {/* aisle zone */}
      <rect
        x={AISLE_LEFT} y={SEAT_TOP_Y - 4}
        width={AISLE_W} height={SEAT_H + 8}
        rx={4} fill="#F3F4F6" stroke="none"
      />
      <text
        x={AISLE_MID_X} y={SEAT_CY}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={700} fill="#9CA3AF"
        fontFamily="system-ui, sans-serif"
        style={{ letterSpacing: '0.08em' }}
      >
        LORONG
      </text>

      {/* dashed aisle dividers */}
      {([AISLE_LEFT, AISLE_RIGHT] as const).map((xi, k) => (
        <line
          key={k}
          x1={xi} y1={SEAT_TOP_Y + 4}
          x2={xi} y2={SEAT_TOP_Y + SEAT_H - 4}
          stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="5 4"
        />
      ))}

      {/* window labels above ends */}
      {([X1, X5] as const).map((xi, k) => (
        <g key={k}>
          <text
            x={xi + SEAT_W / 2} y={SEAT_TOP_Y - 20}
            textAnchor="middle"
            fontSize={11} fontWeight={600} fill="#6B7280"
            fontFamily="system-ui, sans-serif"
          >
            Jendela
          </text>
          <line
            x1={xi + SEAT_W / 2} y1={SEAT_TOP_Y - 11}
            x2={xi + SEAT_W / 2} y2={SEAT_TOP_Y - 2}
            stroke="#9CA3AF" strokeWidth={1.5}
          />
          {/* arrowhead */}
          <polygon
            points={`
              ${xi + SEAT_W / 2 - 4},${SEAT_TOP_Y - 5}
              ${xi + SEAT_W / 2 + 4},${SEAT_TOP_Y - 5}
              ${xi + SEAT_W / 2},${SEAT_TOP_Y}
            `}
            fill="#9CA3AF"
          />
        </g>
      ))}

      {/* 5 seats */}
      {SEAT_XS.map((x, i) => (
        <BusSeat
          key={i}
          x={x}
          label={seatLabels[i]}
          state={seatStates[i]}
        />
      ))}

      {/* bottom label */}
      <text
        x={SVG_W / 2} y={SVG_H - 14}
        textAnchor="middle"
        fontSize={11} fontWeight={600} fill="#9CA3AF"
        fontFamily="system-ui, sans-serif"
      >
        Baris Depan Bus
      </text>
    </svg>
  )
}

// ── default export: static stem illustration ─────────────────────────────────

export default function BusSeatOSN25NFQ5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Baris depan bus dengan 5 kursi: kursi 1 dan 2 di kiri lorong, kursi 3, 4, dan 5 di kanan lorong. Jendela di kursi 1 dan 5."
    >
      <BusSeatRow />
    </div>
  )
}
