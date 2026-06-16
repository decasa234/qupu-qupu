// WMI-24F2A-Q8 (2024 Grade-2 Final) — football / soccer field figure.
//
// The figure (db/seed/wmi/figures/2024-final-g2-a-q8.jpg) shows a green
// rectangular pitch divided into 4 equal vertical strips of 30 m each
// (total 120 m wide × 60 m tall).  Interior features:
//   • three vertical dividing lines (at x = 30, 60, 90 m)
//   • a large semicircle arc on the right side of the field
//   • a centre circle
//   • left and right goal areas (penalty box + inner goal area)
//   • small goal outlines protruding from the left and right edges
//   • dimension labels: "30m" × 4 across the top, "60m" on the right
//
// The figure shows ONLY the problem setup — it never reveals the answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

/** Exported constant – field geometry in problem-space metres (illustrative). */
export const FIELD_PARAMS = {
  /** Width of each strip in metres. */
  stripWidth: 30,
  /** Number of vertical strips. */
  strips: 4,
  /** Total field width in metres. */
  totalWidth: 120,
  /** Total field height in metres. */
  totalHeight: 60,
} as const

// ---- SVG layout (pixel space) -----------------------------------------------
//
// We scale: 1 m = 2.5 px  → field is 300 × 150 px.
// Add padding for labels and the right-side arc annotation.

const SCALE = 2.5
const FW = FIELD_PARAMS.totalWidth * SCALE  // 300 px — field width
const FH = FIELD_PARAMS.totalHeight * SCALE // 150 px — field height

// Strip width in pixels
const SW = FIELD_PARAMS.stripWidth * SCALE // 75 px

// Goal-area dimensions (visually faithful to scan)
const PENALTY_D = 18 * SCALE * 0.28 // depth ~ 12.6 px
const PENALTY_H = 20 * SCALE * 0.5  // half-height: 25 px each side (50 px total)
const GOAL_D = PENALTY_D * 0.45
const GOAL_H = PENALTY_H * 0.45

// Centre circle radius
const CC_R = 18 // px

// Right-side large semicircle radius = FH/2 (spans full field height)
const ARC_R = FH / 2 // 75 px

// Small goal net protrusion beyond the field boundary
const GOAL_NET_D = 7 // px

// Padding: note ARC_R must be defined before PAD_RIGHT
const PAD_LEFT = 10
const PAD_TOP = 28 // room for "30m" labels
const PAD_RIGHT = ARC_R + 36 // arc radius + brace + "60m" label = 111 px
const PAD_BOTTOM = 10
const VIEW_W = PAD_LEFT + FW + PAD_RIGHT
const VIEW_H = PAD_TOP + FH + PAD_BOTTOM

// Field origin in SVG space
const FX = PAD_LEFT
const FY = PAD_TOP

// Colours
const FIELD_GREEN = '#a8c850' // grass green (close to scan)
const INK = '#1a1a1a' // lines
const LABEL_COLOR = '#1a1a1a'

// ---- component ---------------------------------------------------------------

/**
 * SVG figure of the football field for WMI-24F2A-Q8.
 * Shows the field setup only — segment labels and interior lines, no answer.
 */
export function Field24G2Figure() {
  const strips = FIELD_PARAMS.strips
  const sw = SW

  // Penalty-box rectangles (left and right)
  // Left penalty box sits against the left edge, centred vertically
  const lPenX = FX - 0 // flush with left edge (drawn inward)
  const lPenW = PENALTY_D
  const lPenY = FY + FH / 2 - PENALTY_H
  const lPenH = PENALTY_H * 2

  // Left inner goal area
  const lGoalX = FX
  const lGoalW = GOAL_D
  const lGoalY = FY + FH / 2 - GOAL_H
  const lGoalH = GOAL_H * 2

  // Right penalty box (mirror)
  const rPenX = FX + FW - PENALTY_D
  const rPenW = PENALTY_D
  const rPenY = lPenY
  const rPenH = lPenH

  // Right inner goal area
  const rGoalX = FX + FW - GOAL_D
  const rGoalW = GOAL_D
  const rGoalY = lGoalY
  const rGoalH = lGoalH

  // Small goal nets (protrude outside the field)
  const lNetX = FX - GOAL_NET_D
  const lNetY = FY + FH / 2 - GOAL_H * 0.55
  const lNetH = GOAL_H * 1.1

  const rNetX = FX + FW
  const rNetY = lNetY
  const rNetH = lNetH

  // Arc for the right side of the field (large D-shaped arc, centred at right edge midpoint)
  const arcCx = FX + FW
  const arcCy = FY + FH / 2

  // Dimension label positions
  const labelY = FY - 14 // above the top edge

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(340, VIEW_W)}
      aria-hidden="true"
    >
      {/* Field background */}
      <rect x={FX} y={FY} width={FW} height={FH} fill={FIELD_GREEN} />

      {/* Three interior vertical dividing lines (creating 4 strips) */}
      {Array.from({ length: strips - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`vline-${i}`}
          x1={FX + i * sw}
          y1={FY}
          x2={FX + i * sw}
          y2={FY + FH}
          stroke={INK}
          strokeWidth={1.2}
        />
      ))}

      {/* Centre circle */}
      <circle
        cx={FX + FW / 2}
        cy={FY + FH / 2}
        r={CC_R}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Centre spot */}
      <circle cx={FX + FW / 2} cy={FY + FH / 2} r={1.5} fill={INK} />

      {/* Large right-side semicircle arc (opens to the right) */}
      <path
        d={`M ${arcCx} ${arcCy - ARC_R} A ${ARC_R} ${ARC_R} 0 0 1 ${arcCx} ${arcCy + ARC_R}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* Left penalty box */}
      <rect x={lPenX} y={lPenY} width={lPenW} height={lPenH} fill="none" stroke={INK} strokeWidth={1.2} />

      {/* Left inner goal area */}
      <rect x={lGoalX} y={lGoalY} width={lGoalW} height={lGoalH} fill="none" stroke={INK} strokeWidth={1.2} />

      {/* Left goal net protrusion */}
      <rect x={lNetX} y={lNetY} width={GOAL_NET_D} height={lNetH} fill="none" stroke={INK} strokeWidth={1} />

      {/* Right penalty box */}
      <rect x={rPenX} y={rPenY} width={rPenW} height={rPenH} fill="none" stroke={INK} strokeWidth={1.2} />

      {/* Right inner goal area */}
      <rect x={rGoalX} y={rGoalY} width={rGoalW} height={rGoalH} fill="none" stroke={INK} strokeWidth={1.2} />

      {/* Right goal net protrusion */}
      <rect x={rNetX} y={rNetY} width={GOAL_NET_D} height={rNetH} fill="none" stroke={INK} strokeWidth={1} />

      {/* Field outer border (drawn last so it sits on top) */}
      <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke={INK} strokeWidth={2} />

      {/* Dimension labels: "30m" × 4 across the top */}
      {Array.from({ length: strips }, (_, i) => (
        <text
          key={`label-${i}`}
          x={FX + i * sw + sw / 2}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill={LABEL_COLOR}
        >
          30m
        </text>
      ))}

      {/* Tick marks below each "30m" label on the top edge */}
      {Array.from({ length: strips - 1 }, (_, i) => i + 1).map((i) => (
        <line
          key={`tick-${i}`}
          x1={FX + i * sw}
          y1={FY - 4}
          x2={FX + i * sw}
          y2={FY}
          stroke={INK}
          strokeWidth={1}
        />
      ))}

      {/* Right-side "60m" dimension annotation */}
      {/* Vertical brace line on the right of the arc */}
      <line
        x1={FX + FW + ARC_R + 8}
        y1={FY}
        x2={FX + FW + ARC_R + 8}
        y2={FY + FH}
        stroke={INK}
        strokeWidth={1}
      />
      {/* Top cap */}
      <line
        x1={FX + FW + ARC_R + 4}
        y1={FY}
        x2={FX + FW + ARC_R + 12}
        y2={FY}
        stroke={INK}
        strokeWidth={1}
      />
      {/* Bottom cap */}
      <line
        x1={FX + FW + ARC_R + 4}
        y1={FY + FH}
        x2={FX + FW + ARC_R + 12}
        y2={FY + FH}
        stroke={INK}
        strokeWidth={1}
      />
      {/* "60m" label */}
      <text
        x={FX + FW + ARC_R + 20}
        y={FY + FH / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        fill={LABEL_COLOR}
      >
        60m
      </text>
    </svg>
  )
}

// ---- default export (illustration card) -------------------------------------

export default function Field24G2Illustration({ params }: { params: unknown }) {
  // params is not used for this figure — the field geometry is fixed.
  // We accept the prop to satisfy the standard Illustration signature and
  // fall back gracefully if anything unexpected is passed.
  void params

  const ariaLabel =
    'Lapangan sepak bola berukuran 120 m kali 60 m, dibagi menjadi 4 jalur vertikal selebar 30 m. ' +
    'Terdapat garis-garis interior, lingkaran tengah, kotak penalti kiri dan kanan, serta setengah lingkaran besar di sisi kanan. ' +
    'Hitung berapa banyak persegi panjang (bukan persegi) yang terbentuk.'

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <Field24G2Figure />
    </div>
  )
}
