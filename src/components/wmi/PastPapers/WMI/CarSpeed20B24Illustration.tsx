/**
 * SEAMO-20-B-Q24 — Stem illustration
 * "A car travels for 10 minutes at half its full speed. It then travels at
 *  full speed for the next 10 minutes. If the car travelled 21 km altogether,
 *  what is its full speed in km/h?"
 *
 * Diagram: a horizontal road strip with two labelled segments:
 *   Leg 1 (left half)  — ½v, 10 min, distance = v/12
 *   Leg 2 (right half) — v,  10 min, distance = v/6
 * A simple car silhouette travels left → right.
 * Total distance label "21 km" spans both segments.
 * The answer (v = 84 km/h) is NOT revealed.
 *
 * No existing primitive covers a speed/distance road diagram.
 * Copy-adapted from the decorative-illustration pattern
 * (e.g. FarmOstrichGoat20A6Illustration).
 *
 * Pure render — no Math.random, no Date, SSR-safe.
 */

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W   = 360
export const SVG_H   = 180
export const ROAD_Y  = 110   // top of road strip
export const ROAD_H  = 28    // road height
export const MID_X   = SVG_W / 2   // boundary between leg 1 and leg 2
export const LEG1_X0 = 24
export const LEG2_X1 = SVG_W - 24

// ── Colour tokens ─────────────────────────────────────────────────────────────

const C = {
  SKY:        '#EFF6FF', // blue-50
  GROUND:     '#6B7280', // road asphalt
  LANE:       '#F9FAFB', // centre-line dashes
  STRIPE:     '#FCD34D', // dashed lane line colour
  LEG1_BG:    '#DBEAFE', // blue-100 — first segment
  LEG1_BD:    '#3B82F6', // blue-500
  LEG1_TEXT:  '#1D4ED8', // blue-700
  LEG2_BG:    '#DCFCE7', // green-100 — second segment
  LEG2_BD:    '#22C55E', // green-500
  LEG2_TEXT:  '#15803D', // green-700
  TOTAL_BG:   '#FEF3C7', // amber-100
  TOTAL_BD:   '#D97706', // amber-600
  TOTAL_TEXT: '#92400E', // amber-900
  Q_CLR:      '#7C3AED', // purple-700
  CAR_BODY:   '#DC2626', // red-600
  CAR_DARK:   '#7F1D1D', // red-900
  CAR_WIN:    '#BAE6FD', // sky-200
  CAR_WHEEL:  '#111827', // gray-900
  CAR_HUB:    '#E5E7EB', // gray-200
} as const

// ── CarGlyph ──────────────────────────────────────────────────────────────────

/**
 * Simple side-view car silhouette facing right.
 * cx = horizontal centre of car body; cy = vertical centre.
 */
function CarGlyph({ cx, cy }: { cx: number; cy: number }) {
  const bW = 60   // body width
  const bH = 18   // body height
  const cH = 14   // cabin height
  const cW = 34   // cabin width
  const wR  = 8   // wheel radius

  const bX = cx - bW / 2
  const bY = cy - bH / 2

  // Cabin sits on top of body, slightly indented
  const cX = bX + 10
  const cY = bY - cH + 2

  // Wheel centres (below body bottom)
  const wheelY = bY + bH + wR - 4
  const w1X    = bX + 13
  const w2X    = bX + bW - 13

  return (
    <g>
      {/* Main body */}
      <rect x={bX} y={bY} width={bW} height={bH} rx={5} fill={C.CAR_BODY} stroke={C.CAR_DARK} strokeWidth={1.5} />

      {/* Cabin */}
      <rect x={cX} y={cY} width={cW} height={cH} rx={4} fill={C.CAR_BODY} stroke={C.CAR_DARK} strokeWidth={1.5} />

      {/* Windows (two panes) */}
      <rect x={cX + 3} y={cY + 2} width={12} height={cH - 5} rx={2} fill={C.CAR_WIN} stroke={C.CAR_WIN} strokeWidth={0.5} />
      <rect x={cX + 18} y={cY + 2} width={12} height={cH - 5} rx={2} fill={C.CAR_WIN} stroke={C.CAR_WIN} strokeWidth={0.5} />

      {/* Front bumper highlight */}
      <rect x={bX + bW - 4} y={bY + 4} width={4} height={8} rx={2} fill="#FCA5A5" stroke={C.CAR_DARK} strokeWidth={0.5} />

      {/* Headlights */}
      <circle cx={bX + bW - 2} cy={bY + 6} r={2} fill="#FEF08A" />

      {/* Wheels */}
      {[w1X, w2X].map((wx, i) => (
        <g key={i}>
          <circle cx={wx} cy={wheelY} r={wR} fill={C.CAR_WHEEL} />
          <circle cx={wx} cy={wheelY} r={wR - 3} fill={C.CAR_DARK} />
          <circle cx={wx} cy={wheelY} r={3} fill={C.CAR_HUB} />
        </g>
      ))}
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * CarSpeed20B24Illustration
 *
 * Static stem figure for SEAMO-20-B-Q24.
 * Shows a road with two labelled segments:
 *   • Leg 1 (blue): ½ kecepatan, 10 menit → jarak = v/12
 *   • Leg 2 (green): kecepatan penuh, 10 menit → jarak = v/6
 * Total distance "21 km" spans both.
 * Answer (84 km/h) NOT shown.
 */
export default function CarSpeed20B24Illustration() {
  const roadBot = ROAD_Y + ROAD_H

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Diagram jalan dengan dua segmen: segmen pertama dengan setengah kecepatan selama 10 menit, segmen kedua dengan kecepatan penuh selama 10 menit. Total jarak 21 km."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(400, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Sky / background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={C.SKY} />

        {/* Road */}
        <rect x={LEG1_X0} y={ROAD_Y} width={LEG2_X1 - LEG1_X0} height={ROAD_H} rx={3} fill={C.GROUND} />

        {/* Centre dashes */}
        {Array.from({ length: 10 }).map((_, i) => {
          const dashX = LEG1_X0 + i * ((LEG2_X1 - LEG1_X0) / 10) + 4
          return (
            <rect
              key={i}
              x={dashX}
              y={ROAD_Y + ROAD_H / 2 - 1.5}
              width={12}
              height={3}
              rx={1}
              fill={C.STRIPE}
            />
          )
        })}

        {/* Segment divider (vertical dashed) */}
        <line
          x1={MID_X}
          y1={ROAD_Y - 4}
          x2={MID_X}
          y2={roadBot + 4}
          stroke="#CBD5E1"
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />

        {/* Road end markers */}
        <circle cx={LEG1_X0} cy={ROAD_Y + ROAD_H / 2} r={5} fill="#F3F4F6" stroke="#9CA3AF" strokeWidth={1} />
        <text x={LEG1_X0} y={ROAD_Y + ROAD_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={700} fill="#374151" fontFamily="ui-sans-serif, system-ui, sans-serif">A</text>

        <circle cx={MID_X} cy={ROAD_Y + ROAD_H / 2} r={5} fill="#F3F4F6" stroke="#9CA3AF" strokeWidth={1} />
        <text x={MID_X} y={ROAD_Y + ROAD_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={700} fill="#374151" fontFamily="ui-sans-serif, system-ui, sans-serif">B</text>

        <circle cx={LEG2_X1} cy={ROAD_Y + ROAD_H / 2} r={5} fill="#F3F4F6" stroke="#9CA3AF" strokeWidth={1} />
        <text x={LEG2_X1} y={ROAD_Y + ROAD_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={700} fill="#374151" fontFamily="ui-sans-serif, system-ui, sans-serif">C</text>

        {/* ── Leg 1 label (above road, left half) ─────────────────────── */}
        <rect
          x={LEG1_X0 + 4}
          y={ROAD_Y - 42}
          width={(MID_X - LEG1_X0) - 8}
          height={36}
          rx={6}
          fill={C.LEG1_BG}
          stroke={C.LEG1_BD}
          strokeWidth={1}
        />
        <text
          x={(LEG1_X0 + MID_X) / 2}
          y={ROAD_Y - 32}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={C.LEG1_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ½ kecepatan
        </text>
        <text
          x={(LEG1_X0 + MID_X) / 2}
          y={ROAD_Y - 18}
          textAnchor="middle"
          fontSize={9}
          fill={C.LEG1_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          10 menit → d = v/12
        </text>

        {/* ── Leg 2 label (above road, right half) ─────────────────────── */}
        <rect
          x={MID_X + 4}
          y={ROAD_Y - 42}
          width={(LEG2_X1 - MID_X) - 8}
          height={36}
          rx={6}
          fill={C.LEG2_BG}
          stroke={C.LEG2_BD}
          strokeWidth={1}
        />
        <text
          x={(MID_X + LEG2_X1) / 2}
          y={ROAD_Y - 32}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={C.LEG2_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          kecepatan penuh
        </text>
        <text
          x={(MID_X + LEG2_X1) / 2}
          y={ROAD_Y - 18}
          textAnchor="middle"
          fontSize={9}
          fill={C.LEG2_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          10 menit → d = v/6
        </text>

        {/* ── Total distance bracket (below road) ─────────────────────── */}
        {/* bracket lines */}
        <line x1={LEG1_X0} y1={roadBot + 6} x2={LEG1_X0} y2={roadBot + 16} stroke={C.TOTAL_BD} strokeWidth={1.5} />
        <line x1={LEG1_X0} y1={roadBot + 16} x2={LEG2_X1} y2={roadBot + 16} stroke={C.TOTAL_BD} strokeWidth={1.5} />
        <line x1={LEG2_X1} y1={roadBot + 6} x2={LEG2_X1} y2={roadBot + 16} stroke={C.TOTAL_BD} strokeWidth={1.5} />

        <rect
          x={SVG_W / 2 - 30}
          y={roadBot + 20}
          width={60}
          height={20}
          rx={5}
          fill={C.TOTAL_BG}
          stroke={C.TOTAL_BD}
          strokeWidth={1}
        />
        <text
          x={SVG_W / 2}
          y={roadBot + 33}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={C.TOTAL_TEXT}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          21 km
        </text>

        {/* ── Car (positioned on leg-2, moving right) ────────────────── */}
        <CarGlyph cx={(MID_X + LEG2_X1) / 2 - 10} cy={ROAD_Y + ROAD_H / 2 - 4} />

        {/* ── Question prompt ──────────────────────────────────────────── */}
        <text
          x={SVG_W / 2}
          y={14}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={11}
          fontWeight={900}
          fill={C.Q_CLR}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Kecepatan penuh = ? km/jam
        </text>
      </svg>
    </div>
  )
}
