// IKMC-23-PE-Q7 — "Pablo puts 10 toy cars on this racetrack. How many cars are in the tunnel?"
//
// The figure shows a straight road going left-to-right through a green
// tunnel/hill covering the middle section. Two cars are visible on the
// left approach, two on the right exit — 4 cars visible, 6 hidden inside.
//
// Quantities (from breakdown.quantities):
//   Total cars:               10
//   Cars visible outside:      4  (2 left, 2 right)
//   Cars in tunnel:  10 − 4 = 6  ← answer B
//
// PROBLEM illustration only — does NOT reveal the answer (tunnel is opaque).
// SSR-safe — no window/document access at module level.

// ── Shared layout constants (re-exported for the Explainer) ──────────────────

/** SVG viewport width */
export const SVG_W = 340
/** SVG viewport height */
export const SVG_H = 190

/** Road band (y-centre of the road) */
export const ROAD_Y = 110
/** Road height (pixels) */
export const ROAD_H = 36

/** Left visible zone: x range for the approach (left of tunnel) */
export const LEFT_ZONE = { x1: 0, x2: 110 }
/** Tunnel zone (opaque green hill covers this x range) */
export const TUNNEL_ZONE = { x1: 108, x2: 232 }
/** Right visible zone: x range for the exit (right of tunnel) */
export const RIGHT_ZONE = { x1: 230, x2: 340 }

/** Colour palette */
export const COLOR = {
  BG: '#F0FDF4',
  GRASS: '#22C55E',
  GRASS_DARK: '#16A34A',
  ROAD: '#475569',
  ROAD_STRIPE: '#FCD34D',
  ROAD_CURB: '#94A3B8',
  TUNNEL_ENTRANCE: '#64748B',
  TUNNEL_ARCH: '#1E293B',
  LABEL: '#1E3A8A',
  COUNT_BG: '#DBEAFE',
  VISIBLE_MARKER: '#3B82F6',
  HIDDEN_MARKER: '#6B7280',
} as const

// ── Car glyph (top-down view, small) ─────────────────────────────────────────

/**
 * CarGlyph — a simple top-down toy car.
 * cx/cy = centre; w/h = bounding box; fill = body colour.
 * Re-exported so the Explainer can reuse it.
 */
export function CarGlyph({
  cx,
  cy,
  w = 28,
  h = 16,
  fill,
  stroke = '#1E293B',
}: {
  cx: number
  cy: number
  w?: number
  h?: number
  fill: string
  stroke?: string
}) {
  const hw = w / 2
  const hh = h / 2
  const wheelR = hh * 0.55
  const wheelW = hw * 0.28

  return (
    <g aria-hidden="true">
      {/* Body */}
      <rect
        x={cx - hw}
        y={cy - hh}
        width={w}
        height={h}
        rx={hh * 0.65}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.2}
      />
      {/* Windshield (front right) */}
      <rect
        x={cx + hw * 0.15}
        y={cy - hh * 0.65}
        width={hw * 0.58}
        height={hh * 1.3}
        rx={2}
        fill="#BAE6FD"
        opacity={0.85}
      />
      {/* Left wheels */}
      <rect
        x={cx - hw - wheelW * 0.5}
        y={cy - hh * 0.85}
        width={wheelW}
        height={wheelR * 1.2}
        rx={wheelW * 0.4}
        fill="#1E293B"
      />
      <rect
        x={cx - hw - wheelW * 0.5}
        y={cy + hh * 0.85 - wheelR * 1.2}
        width={wheelW}
        height={wheelR * 1.2}
        rx={wheelW * 0.4}
        fill="#1E293B"
      />
      {/* Right wheels */}
      <rect
        x={cx + hw - wheelW * 0.5}
        y={cy - hh * 0.85}
        width={wheelW}
        height={wheelR * 1.2}
        rx={wheelW * 0.4}
        fill="#1E293B"
      />
      <rect
        x={cx + hw - wheelW * 0.5}
        y={cy + hh * 0.85 - wheelR * 1.2}
        width={wheelW}
        height={wheelR * 1.2}
        rx={wheelW * 0.4}
        fill="#1E293B"
      />
    </g>
  )
}

// ── 4 visible cars — positions & colours ─────────────────────────────────────

/** The 4 cars visible outside the tunnel (left 2, right 2). */
export const VISIBLE_CARS: Array<{
  cx: number
  cy: number
  fill: string
  side: 'left' | 'right'
}> = [
  // Left approach — car 1 (further back)
  { cx: 34,  cy: ROAD_Y, fill: '#EF4444', side: 'left' },
  // Left approach — car 2 (nearer tunnel)
  { cx: 78,  cy: ROAD_Y, fill: '#EAB308', side: 'left' },
  // Right exit — car 3 (nearer tunnel)
  { cx: 262, cy: ROAD_Y, fill: '#A3E635', side: 'right' },
  // Right exit — car 4 (further away)
  { cx: 308, cy: ROAD_Y, fill: '#EC4899', side: 'right' },
]

// ── Road stripe positions ─────────────────────────────────────────────────────

const STRIPE_Y = ROAD_Y
const STRIPE_H = 5
const STRIPE_W = 18
const STRIPE_GAP = 14

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Racetrack7PEIllustration
 *
 * Static problem figure for IKMC-23-PE-Q7.
 * A straight road passes through an opaque green hill/tunnel.
 * 4 cars are visible (2 left, 2 right); the rest are hidden inside.
 * Does NOT reveal how many cars are inside.
 */
export default function Racetrack7PEIllustration() {
  const roadTop = ROAD_Y - ROAD_H / 2
  const roadBot = ROAD_Y + ROAD_H / 2

  // Green hill (tunnel body) — rises above the road
  const hillTop = 28
  const hillCx = (TUNNEL_ZONE.x1 + TUNNEL_ZONE.x2) / 2
  const hillW = TUNNEL_ZONE.x2 - TUNNEL_ZONE.x1

  // Tunnel arch dimensions
  const archW = 30
  const archH = 26

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah jalur balap lurus melewati terowongan hijau. ' +
        '2 mobil terlihat di sebelah kiri terowongan, 2 mobil terlihat di sebelah kanan. ' +
        'Berapa banyak mobil yang tersembunyi di dalam terowongan?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Background sky / grass */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* Ground strip (grass under road) */}
        <rect x={0} y={roadBot - 4} width={SVG_W} height={SVG_H - roadBot + 4} fill="#BBF7D0" />

        {/* Road surface (full width, drawn under tunnel) */}
        <rect x={0} y={roadTop} width={SVG_W} height={ROAD_H} fill={COLOR.ROAD} />

        {/* Road curb lines */}
        <line x1={0} y1={roadTop} x2={SVG_W} y2={roadTop} stroke={COLOR.ROAD_CURB} strokeWidth={2} />
        <line x1={0} y1={roadBot} x2={SVG_W} y2={roadBot} stroke={COLOR.ROAD_CURB} strokeWidth={2} />

        {/* Road centre dashes — left visible zone */}
        {Array.from({ length: 3 }, (_, i) => (
          <rect
            key={`ls-${i}`}
            x={LEFT_ZONE.x1 + 8 + i * (STRIPE_W + STRIPE_GAP)}
            y={STRIPE_Y - STRIPE_H / 2}
            width={STRIPE_W}
            height={STRIPE_H}
            rx={2}
            fill={COLOR.ROAD_STRIPE}
            opacity={0.7}
          />
        ))}
        {/* Road centre dashes — right visible zone */}
        {Array.from({ length: 3 }, (_, i) => (
          <rect
            key={`rs-${i}`}
            x={RIGHT_ZONE.x1 + 6 + i * (STRIPE_W + STRIPE_GAP)}
            y={STRIPE_Y - STRIPE_H / 2}
            width={STRIPE_W}
            height={STRIPE_H}
            rx={2}
            fill={COLOR.ROAD_STRIPE}
            opacity={0.7}
          />
        ))}

        {/* Green hill body (covers the tunnel section) */}
        {/* Use an ellipse for the hill top, rectangle for the base */}
        <ellipse
          cx={hillCx}
          cy={hillTop + 30}
          rx={hillW / 2 + 10}
          ry={roadBot - hillTop - 10}
          fill={COLOR.GRASS}
        />
        {/* Cover the road under the hill with a flat rectangle */}
        <rect
          x={TUNNEL_ZONE.x1 - 2}
          y={roadTop}
          width={hillW + 4}
          height={ROAD_H}
          fill={COLOR.GRASS}
        />

        {/* Darker grass shading on the hill sides */}
        <ellipse
          cx={hillCx - hillW * 0.18}
          cy={hillTop + 20}
          rx={hillW * 0.18}
          ry={20}
          fill={COLOR.GRASS_DARK}
          opacity={0.35}
        />
        <ellipse
          cx={hillCx + hillW * 0.18}
          cy={hillTop + 20}
          rx={hillW * 0.18}
          ry={20}
          fill={COLOR.GRASS_DARK}
          opacity={0.35}
        />

        {/* Tunnel portal — left entrance */}
        {/* Dark arch opening */}
        <rect
          x={TUNNEL_ZONE.x1 - 2}
          y={roadTop}
          width={archW}
          height={ROAD_H}
          fill={COLOR.TUNNEL_ENTRANCE}
        />
        <ellipse
          cx={TUNNEL_ZONE.x1 + archW / 2 - 2}
          cy={roadTop}
          rx={archW / 2}
          ry={archH / 2}
          fill={COLOR.TUNNEL_ENTRANCE}
        />
        {/* Arch frame */}
        <path
          d={`M ${TUNNEL_ZONE.x1 - 2} ${roadBot} L ${TUNNEL_ZONE.x1 - 2} ${roadTop} A ${archW / 2} ${archH / 2} 0 0 1 ${TUNNEL_ZONE.x1 + archW - 2} ${roadTop} L ${TUNNEL_ZONE.x1 + archW - 2} ${roadBot}`}
          fill="none"
          stroke={COLOR.TUNNEL_ARCH}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Tunnel portal — right exit */}
        <rect
          x={TUNNEL_ZONE.x2 - archW + 2}
          y={roadTop}
          width={archW}
          height={ROAD_H}
          fill={COLOR.TUNNEL_ENTRANCE}
        />
        <ellipse
          cx={TUNNEL_ZONE.x2 - archW / 2 + 2}
          cy={roadTop}
          rx={archW / 2}
          ry={archH / 2}
          fill={COLOR.TUNNEL_ENTRANCE}
        />
        <path
          d={`M ${TUNNEL_ZONE.x2 - archW + 2} ${roadBot} L ${TUNNEL_ZONE.x2 - archW + 2} ${roadTop} A ${archW / 2} ${archH / 2} 0 0 1 ${TUNNEL_ZONE.x2 + 2} ${roadTop} L ${TUNNEL_ZONE.x2 + 2} ${roadBot}`}
          fill="none"
          stroke={COLOR.TUNNEL_ARCH}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* "?" inside the tunnel — signals hidden content */}
        <text
          x={hillCx}
          y={ROAD_Y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill="#CBD5E1"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          opacity={0.6}
        >
          ?
        </text>

        {/* Visible cars (4 total) */}
        {VISIBLE_CARS.map((car, i) => (
          <CarGlyph key={i} cx={car.cx} cy={car.cy} fill={car.fill} />
        ))}

        {/* "10 cars total" badge — top right */}
        <rect x={SVG_W - 86} y={8} width={78} height={22} rx={11} fill="#DBEAFE" />
        <text
          x={SVG_W - 47}
          y={19}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={800}
          fill="#1E3A8A"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          10 mobil
        </text>

        {/* "TEROWONGAN" label on the hill */}
        <text
          x={hillCx}
          y={hillTop + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={700}
          fill="#FFFFFF"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          letterSpacing={0.5}
        >
          TEROWONGAN
        </text>
      </svg>
    </div>
  )
}
