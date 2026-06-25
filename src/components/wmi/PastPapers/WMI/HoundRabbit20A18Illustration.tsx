// SEAMO-20-A-Q18 — "Hound chases rabbit 30 m ahead; find catch-up time"
//
// SOURCE: OCR 2020.imgs/019.jpg — hound silhouette on the left, large right-pointing
// arrow in the centre, rabbit silhouette on the right, both on a flat track.
// The PROBLEM figure shows the initial positions; the 30 m gap + direction are shown.
// The answer (6 seconds) is NOT revealed here.
//
// Adapted from AnimalLine17ECIllustration (custom animal glyphs on a track lane)
// and CarsLane9ECIllustration (direction arrow, road lane strip).
//
// Co-exports (reused by HoundRabbit20A18Explainer):
//   HoundGlyph    — simplified hound silhouette, centred on (cx, cy)
//   RabbitGlyph   — simplified rabbit silhouette, centred on (cx, cy)
//   TRACK         — layout constants { SVG_W, SVG_H, LANE_Y, LANE_H }
//
// Pure SVG, no framer-motion, no hooks, no Math.random/Date, SSR-safe.

// ── Layout constants ──────────────────────────────────────────────────────────

export const TRACK = {
  SVG_W: 420,
  SVG_H: 140,
  LANE_Y: 70,   // top of road strip
  LANE_H: 50,   // road strip height
} as const

// ── Palette ──────────────────────────────────────────────────────────────────

const C = {
  BG: '#FFFFFF',
  ROAD: '#F1F5F9',
  ROAD_STROKE: '#CBD5E1',
  ROAD_DASH: '#CBD5E1',
  HOUND: '#92400E',      // warm brown
  HOUND_STROKE: '#451A03',
  RABBIT: '#D97706',     // amber-tan
  RABBIT_STROKE: '#92400E',
  ARROW: '#374151',
  GAP_LINE: '#3B82F6',   // blue brace
  GAP_TEXT: '#1D4ED8',
  INK: '#1F2937',
} as const

const FONT = 'ui-sans-serif, system-ui, sans-serif'

// ── HoundGlyph ───────────────────────────────────────────────────────────────

/**
 * Simplified hound (dog) silhouette: oval body, circle head, snout, four legs,
 * upward tail, ear drop.  Centred on (cx, cy).  Scale ≈ 40 px tall.
 */
export function HoundGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* tail — curves up */}
      <path
        d={`M ${cx + 20} ${cy - 6} Q ${cx + 30} ${cy - 22} ${cx + 24} ${cy - 28}`}
        fill="none"
        stroke={C.HOUND}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* body */}
      <ellipse
        cx={cx + 2}
        cy={cy}
        rx={19}
        ry={12}
        fill={C.HOUND}
        stroke={C.HOUND_STROKE}
        strokeWidth={1}
      />
      {/* neck */}
      <ellipse
        cx={cx - 18}
        cy={cy - 6}
        rx={7}
        ry={9}
        fill={C.HOUND}
        stroke={C.HOUND_STROKE}
        strokeWidth={0.8}
      />
      {/* head */}
      <circle
        cx={cx - 26}
        cy={cy - 10}
        r={10}
        fill={C.HOUND}
        stroke={C.HOUND_STROKE}
        strokeWidth={1}
      />
      {/* snout */}
      <ellipse
        cx={cx - 34}
        cy={cy - 7}
        rx={7}
        ry={5}
        fill={C.HOUND}
        stroke={C.HOUND_STROKE}
        strokeWidth={0.8}
      />
      {/* nose */}
      <ellipse cx={cx - 39} cy={cy - 8} rx={2.5} ry={2} fill={C.HOUND_STROKE} />
      {/* eye */}
      <circle cx={cx - 28} cy={cy - 13} r={1.8} fill={C.HOUND_STROKE} />
      <circle cx={cx - 27.4} cy={cy - 13.5} r={0.6} fill="#FFFFFF" />
      {/* ear — floppy drop */}
      <ellipse
        cx={cx - 22}
        cy={cy - 3}
        rx={4}
        ry={7}
        fill={C.HOUND_STROKE}
        opacity={0.75}
        transform={`rotate(10 ${cx - 22} ${cy - 3})`}
      />
      {/* front legs */}
      <line x1={cx - 14} y1={cy + 11} x2={cx - 16} y2={cy + 22} stroke={C.HOUND_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx - 6}  y1={cy + 12} x2={cx - 6}  y2={cy + 22} stroke={C.HOUND_STROKE} strokeWidth={3} strokeLinecap="round" />
      {/* back legs */}
      <line x1={cx + 10} y1={cy + 11} x2={cx + 12} y2={cy + 22} stroke={C.HOUND_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx + 18} y1={cy + 10} x2={cx + 20} y2={cy + 22} stroke={C.HOUND_STROKE} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

// ── RabbitGlyph ──────────────────────────────────────────────────────────────

/**
 * Simplified rabbit silhouette: rounded body, circle head, two tall ears,
 * stubby tail, front + back paws.  Centred on (cx, cy).  Scale ≈ 40 px tall.
 */
export function RabbitGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* tail */}
      <circle cx={cx + 17} cy={cy + 4} r={4} fill="#FEFCE8" stroke={C.RABBIT_STROKE} strokeWidth={0.7} />
      {/* body */}
      <ellipse
        cx={cx}
        cy={cy + 4}
        rx={15}
        ry={12}
        fill={C.RABBIT}
        stroke={C.RABBIT_STROKE}
        strokeWidth={1}
      />
      {/* head */}
      <circle
        cx={cx - 18}
        cy={cy - 6}
        r={9}
        fill={C.RABBIT}
        stroke={C.RABBIT_STROKE}
        strokeWidth={1}
      />
      {/* ears */}
      <ellipse
        cx={cx - 22}
        cy={cy - 24}
        rx={3.5}
        ry={11}
        fill={C.RABBIT}
        stroke={C.RABBIT_STROKE}
        strokeWidth={0.9}
      />
      <ellipse cx={cx - 22} cy={cy - 24} rx={1.5} ry={8} fill="#FECDD3" />
      <ellipse
        cx={cx - 13}
        cy={cy - 23}
        rx={3.5}
        ry={11}
        fill={C.RABBIT}
        stroke={C.RABBIT_STROKE}
        strokeWidth={0.9}
      />
      <ellipse cx={cx - 13} cy={cy - 23} rx={1.5} ry={8} fill="#FECDD3" />
      {/* eye */}
      <circle cx={cx - 22} cy={cy - 8} r={1.8} fill={C.RABBIT_STROKE} />
      <circle cx={cx - 21.4} cy={cy - 8.5} r={0.6} fill="#FFFFFF" />
      {/* nose */}
      <ellipse cx={cx - 26} cy={cy - 5} rx={1.5} ry={1} fill="#F43F5E" />
      {/* front paws */}
      <line x1={cx - 10} y1={cy + 15} x2={cx - 12} y2={cy + 24} stroke={C.RABBIT_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx - 4}  y1={cy + 16} x2={cx - 4}  y2={cy + 24} stroke={C.RABBIT_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* back paws */}
      <line x1={cx + 8}  y1={cy + 14} x2={cx + 10} y2={cy + 24} stroke={C.RABBIT_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + 14} y1={cy + 13} x2={cx + 16} y2={cy + 24} stroke={C.RABBIT_STROKE} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Filled chevron right-arrow for the "running direction" indicator. */
function DirectionArrow({ cx, cy }: { cx: number; cy: number }) {
  const hw = 14
  const hh = 10
  const notch = -5
  const pts = [
    `${cx + hw},${cy}`,
    `${cx + notch},${cy + hh}`,
    `${cx - hw * 0.1},${cy + hh * 0.4}`,
    `${cx - hw * 0.1},${cy - hh * 0.4}`,
    `${cx + notch},${cy - hh}`,
  ].join(' ')
  return <polygon points={pts} fill={C.ARROW} />
}

// ── Default export ────────────────────────────────────────────────────────────

const ARIA_EN =
  'A hound on the left and a rabbit on the right on a flat track. ' +
  'Both run in the same direction (right). The rabbit is 30 metres ahead of the hound.'
const ARIA_ID =
  'Seekor anjing pemburu di kiri dan kelinci di kanan pada lintasan datar. ' +
  'Keduanya berlari ke kanan. Kelinci berada 30 meter di depan anjing.'

/**
 * HoundRabbit20A18Illustration
 *
 * Stem figure for SEAMO-20-A-Q18.
 * Shows a hound (left) and a rabbit (right) both running to the right on a track,
 * separated by a 30 m gap label. Does NOT show the answer.
 */
export default function HoundRabbit20A18Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const { SVG_W, SVG_H, LANE_Y, LANE_H } = TRACK
  const ariaLabel = lang === 'id' ? ARIA_ID : ARIA_EN

  // Positions along the track
  const HOUND_CX = 80
  const ANIMAL_CY = LANE_Y + LANE_H * 0.42
  const RABBIT_CX = 340
  const ARROW_CX = 210
  const ARROW_CY = ANIMAL_CY

  // Gap brace (between hound right-edge and rabbit left-edge)
  const BRACE_X1 = HOUND_CX + 24
  const BRACE_X2 = RABBIT_CX - 18
  const BRACE_Y = LANE_Y + LANE_H + 14

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={C.BG} />

        {/* road lane strip */}
        <rect
          x={0}
          y={LANE_Y}
          width={SVG_W}
          height={LANE_H}
          fill={C.ROAD}
          stroke={C.ROAD_STROKE}
          strokeWidth={1.5}
        />
        {/* centre dashed line */}
        <line
          x1={12}
          y1={LANE_Y + LANE_H / 2}
          x2={SVG_W - 12}
          y2={LANE_Y + LANE_H / 2}
          stroke={C.ROAD_DASH}
          strokeWidth={1.5}
          strokeDasharray="10 7"
          strokeLinecap="round"
        />

        {/* animals */}
        <HoundGlyph cx={HOUND_CX} cy={ANIMAL_CY} />
        <RabbitGlyph cx={RABBIT_CX} cy={ANIMAL_CY} />

        {/* direction arrow */}
        <DirectionArrow cx={ARROW_CX} cy={ARROW_CY} />

        {/* 30 m gap brace below the lane */}
        {/* horizontal line */}
        <line
          x1={BRACE_X1}
          y1={BRACE_Y}
          x2={BRACE_X2}
          y2={BRACE_Y}
          stroke={C.GAP_LINE}
          strokeWidth={1.8}
        />
        {/* left tick */}
        <line x1={BRACE_X1} y1={BRACE_Y - 5} x2={BRACE_X1} y2={BRACE_Y + 5} stroke={C.GAP_LINE} strokeWidth={1.8} />
        {/* right tick */}
        <line x1={BRACE_X2} y1={BRACE_Y - 5} x2={BRACE_X2} y2={BRACE_Y + 5} stroke={C.GAP_LINE} strokeWidth={1.8} />
        {/* gap label */}
        <text
          x={(BRACE_X1 + BRACE_X2) / 2}
          y={BRACE_Y + 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={C.GAP_TEXT}
          fontFamily={FONT}
        >
          30 m
        </text>

        {/* "Anjing" / "Hound" label above hound */}
        <text
          x={HOUND_CX}
          y={LANE_Y - 8}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={C.INK}
          fontFamily={FONT}
        >
          {lang === 'id' ? 'Anjing' : 'Hound'}
        </text>
        {/* "Kelinci" / "Rabbit" label above rabbit */}
        <text
          x={RABBIT_CX}
          y={LANE_Y - 8}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={C.INK}
          fontFamily={FONT}
        >
          {lang === 'id' ? 'Kelinci' : 'Rabbit'}
        </text>
      </svg>
    </div>
  )
}
