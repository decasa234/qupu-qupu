// IKMC-19-PE-Q22 — "Tim and Tom built a sandcastle..."
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - a ground line
//   - a sandcastle (simple mound/tower shape) of unknown height
//   - a vertical flagpole with upper tip labeled "80 cm" and lower tip labeled "20 cm"
//     on a vertical cm scale on the right side of the pole
//
// Does NOT show:
//   - the total pole length (60 cm)
//   - the buried half (30 cm)
//   - the answer (50 cm)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ──────

/** Total SVG width. */
export const SVG_W = 240

/** Total SVG height. */
export const SVG_H = 240

/** Y coordinate of the ground line. */
export const GROUND_Y = 200

/** X centre of the pole (and castle). */
export const POLE_X = 100

/** Half-width of the pole rectangle. */
export const POLE_HW = 5

/** Y coordinate of the upper tip of the pole (80 cm above ground). */
export const POLE_TOP_Y = GROUND_Y - 160   // 80 cm → scale: 2 px/cm → 160 px

/** Y coordinate of the lower tip of the pole (20 cm above ground). */
export const POLE_BOT_Y = GROUND_Y - 40    // 20 cm → scale: 2 px/cm → 40 px

/** Y coordinate of the castle top (midpoint of the pole = 50 cm, NOT revealed in static figure). */
export const CASTLE_TOP_Y = GROUND_Y - 100 // 50 cm (midpoint) — buried inside the castle

/** Width of the castle at the top. */
export const CASTLE_W = 80

/** Colour tokens (echoing qupu palette). */
export const COLOR = {
  GROUND: '#D4B896',
  CASTLE: '#E8C97A',
  CASTLE_STROKE: '#B8860B',
  POLE: '#4B5563',
  POLE_STROKE: '#1F2937',
  FLAG: '#DC2626',
  LABEL: '#1F2937',
  BRACKET: '#30598A',
  ARROW: '#1F2937',
} as const

// ── Castle primitive ─────────────────────────────────────────────────────────────────────────────

/**
 * Sandcastle silhouette — a simple stepped tower shape.
 * Sits on the ground line; `topY` is the castle top in SVG coords.
 * Width: CASTLE_W at base, narrower at top (crenellated feel without codepoints).
 */
export function CastleShape({ topY }: { topY: number }) {
  const baseLeft = POLE_X - CASTLE_W / 2
  const baseRight = POLE_X + CASTLE_W / 2
  const midLeft = POLE_X - CASTLE_W * 0.38
  const midRight = POLE_X + CASTLE_W * 0.38
  const topLeft = POLE_X - CASTLE_W * 0.22
  const topRight = POLE_X + CASTLE_W * 0.22
  const midY = GROUND_Y - (GROUND_Y - topY) * 0.35

  // Stepped silhouette: wide base → narrower middle → narrow top tower
  const d = [
    `M ${baseLeft} ${GROUND_Y}`,
    `L ${baseLeft} ${GROUND_Y - (GROUND_Y - topY) * 0.6}`,
    `L ${midLeft} ${midY}`,
    `L ${midLeft} ${topY + (GROUND_Y - topY) * 0.28}`,
    `L ${topLeft} ${topY + (GROUND_Y - topY) * 0.18}`,
    `L ${topLeft} ${topY}`,
    `L ${topRight} ${topY}`,
    `L ${topRight} ${topY + (GROUND_Y - topY) * 0.18}`,
    `L ${midRight} ${topY + (GROUND_Y - topY) * 0.28}`,
    `L ${midRight} ${midY}`,
    `L ${baseRight} ${GROUND_Y - (GROUND_Y - topY) * 0.6}`,
    `L ${baseRight} ${GROUND_Y}`,
    'Z',
  ].join(' ')

  return (
    <g>
      <path d={d} fill={COLOR.CASTLE} stroke={COLOR.CASTLE_STROKE} strokeWidth={2} strokeLinejoin="round" />
      {/* thin shadow line at base */}
      <line x1={baseLeft + 4} y1={GROUND_Y} x2={baseRight - 4} y2={GROUND_Y} stroke={COLOR.CASTLE_STROKE} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  )
}

// ── Flagpole primitive ────────────────────────────────────────────────────────────────────────

/**
 * Flagpole as a thin vertical rectangle.
 * Shows the pole from topY to botY (the two labeled endpoints).
 * A small flag hangs at the top.
 */
export function FlagpolePrimitive() {
  const poleLeft = POLE_X - POLE_HW
  const poleRight = POLE_X + POLE_HW

  // Small triangular flag at the top
  const flagLeft = poleRight
  const flagRight = poleRight + 28
  const flagTop = POLE_TOP_Y
  const flagMid = POLE_TOP_Y + 12

  return (
    <g>
      {/* pole shaft */}
      <rect
        x={poleLeft}
        y={POLE_TOP_Y}
        width={POLE_HW * 2}
        height={POLE_BOT_Y - POLE_TOP_Y}
        fill={COLOR.POLE}
        stroke={COLOR.POLE_STROKE}
        strokeWidth={1}
      />
      {/* flag */}
      <path
        d={`M ${flagLeft} ${flagTop} L ${flagRight} ${flagMid} L ${flagLeft} ${flagMid + 10} Z`}
        fill={COLOR.FLAG}
      />
    </g>
  )
}

// ── Vertical scale labels ─────────────────────────────────────────────────────────────────────

/**
 * Bracket + label for a height measurement shown on the right side of the pole.
 */
function HeightLabel({ y, label }: { y: number; label: string }) {
  const tickX = POLE_X + POLE_HW + 10
  const textX = POLE_X + POLE_HW + 14
  const INK = COLOR.LABEL

  return (
    <g fontSize={11} fontWeight={700} fill={INK}>
      {/* horizontal tick mark */}
      <line x1={POLE_X + POLE_HW} y1={y} x2={tickX} y2={y} stroke={INK} strokeWidth={1.5} />
      {/* label text */}
      <text x={textX} y={y} dominantBaseline="central" textAnchor="start">
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────────────────

/**
 * FlagpoleCastle22Illustration
 *
 * Static, problem-only figure for IKMC-19-PE-Q22.
 * Shows: ground, sandcastle of unknown height, flagpole with upper tip at 80 cm
 * and lower tip at 20 cm. Does NOT reveal the total pole length, half-pole, or
 * the answer (50 cm).
 */
export default function FlagpoleCastle22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Istana pasir di atas tanah, tiang bendera ditancapkan di puncaknya. ' +
        'Ujung atas tiang berada 80 cm di atas tanah, ujung bawah 20 cm di atas tanah. ' +
        'Berapa tinggi istana pasir?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ground strip */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#8B6914" strokeWidth={2} />

        {/* sandcastle — castle top is hidden (not labeled) */}
        <CastleShape topY={CASTLE_TOP_Y} />

        {/* flagpole + flag */}
        <FlagpolePrimitive />

        {/* height labels */}
        <HeightLabel y={POLE_TOP_Y} label="80 cm" />
        <HeightLabel y={POLE_BOT_Y} label="20 cm" />

        {/* vertical scale line */}
        <line
          x1={POLE_X + POLE_HW + 8}
          y1={POLE_TOP_Y}
          x2={POLE_X + POLE_HW + 8}
          y2={POLE_BOT_Y}
          stroke={COLOR.BRACKET}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* question mark over the castle: how tall? */}
        <text
          x={POLE_X - CASTLE_W * 0.55}
          y={CASTLE_TOP_Y + (GROUND_Y - CASTLE_TOP_Y) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={COLOR.BRACKET}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ?
        </text>

        {/* small vertical arrow alongside the "?" to indicate height dimension */}
        <line
          x1={POLE_X - CASTLE_W * 0.55}
          y1={CASTLE_TOP_Y + 10}
          x2={POLE_X - CASTLE_W * 0.55}
          y2={GROUND_Y - 8}
          stroke={COLOR.BRACKET}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  )
}
