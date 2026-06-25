/**
 * SEAMO-22-B-Q10 — Stem illustration
 * "A car left Point A and a motorcycle left Point B at the same time.
 *  Both travelling in the same direction.
 *  If car travels at 60 km/h → catches up in 5 h.
 *  If car travels at 70 km/h → catches up in 3 h.
 *  Find the speed of the motorcycle."
 *
 * Diagram (matches 2022.imgs/005.jpg):
 *   Horizontal road with point markers A (left) and B (right).
 *   A red car sits at A with a rightward arrow.
 *   A dark motorcycle sits at B with a rightward arrow.
 *   A question badge asks "Kecepatan motor = ? km/jam".
 *   Answer (45 km/h) is NOT shown.
 *
 * Copy-adapted from CarSpeed20B24Illustration (road layout + CarGlyph).
 * Pure render — no Math.random, no Date, SSR-safe.
 */

// ── Layout constants ───────────────────────────────────────────────────────────

const SVG_W  = 360
const SVG_H  = 150
const ROAD_Y = 72    // top of road strip
const ROAD_H = 28    // road height
const A_X    = 40    // x of point A marker
const B_X    = SVG_W - 40  // x of point B marker

// ── Colour tokens ──────────────────────────────────────────────────────────────

const C = {
  SKY:       '#EFF6FF',  // blue-50
  ROAD_BG:   '#6B7280',  // asphalt
  STRIPE:    '#FCD34D',  // dashed lane line
  MARKER_BG: '#F3F4F6',  // point circle fill
  MARKER_BD: '#9CA3AF',  // point circle stroke
  MARKER_TXT:'#374151',  // point label colour
  CAR_BODY:  '#DC2626',  // red-600
  CAR_DARK:  '#7F1D1D',  // red-900
  CAR_WIN:   '#BAE6FD',  // sky-200
  CAR_WHEEL: '#111827',  // gray-900
  CAR_HUB:   '#E5E7EB',  // gray-200
  MOTO_BODY: '#374151',  // gray-700
  MOTO_DARK: '#111827',  // gray-900
  MOTO_WIN:  '#D1D5DB',  // gray-300
  MOTO_WHEEL:'#111827',
  MOTO_HUB:  '#E5E7EB',
  ARROW:     '#4B5563',  // gray-600
  Q_CLR:     '#7C3AED',  // purple-700
} as const

const ROAD_CY = ROAD_Y + ROAD_H / 2

// ── CarGlyph ───────────────────────────────────────────────────────────────────

/** Side-view car silhouette facing right, centred at (cx, cy). */
function CarGlyph({ cx, cy }: { cx: number; cy: number }) {
  const bW = 56; const bH = 17; const cH = 13; const cW = 32; const wR = 7
  const bX = cx - bW / 2; const bY = cy - bH / 2
  const cX = bX + 9;     const cY = bY - cH + 2
  const wheelY = bY + bH + wR - 4
  const w1X = bX + 12;   const w2X = bX + bW - 12
  return (
    <g>
      <rect x={bX} y={bY} width={bW} height={bH} rx={5} fill={C.CAR_BODY} stroke={C.CAR_DARK} strokeWidth={1.5} />
      <rect x={cX} y={cY} width={cW} height={cH} rx={4} fill={C.CAR_BODY} stroke={C.CAR_DARK} strokeWidth={1.5} />
      <rect x={cX + 3}  y={cY + 2} width={11} height={cH - 5} rx={2} fill={C.CAR_WIN} />
      <rect x={cX + 17} y={cY + 2} width={11} height={cH - 5} rx={2} fill={C.CAR_WIN} />
      <rect x={bX + bW - 4} y={bY + 4} width={4} height={8} rx={2} fill="#FCA5A5" stroke={C.CAR_DARK} strokeWidth={0.5} />
      <circle cx={bX + bW - 2} cy={bY + 6} r={2} fill="#FEF08A" />
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

// ── MotoGlyph ─────────────────────────────────────────────────────────────────

/** Side-view motorcycle silhouette facing right, centred at (cx, cy). */
function MotoGlyph({ cx, cy }: { cx: number; cy: number }) {
  const wR = 9   // wheel radius
  const w1X = cx - 22; const w2X = cx + 22
  const wheelY = cy + 6
  // Body: simple trapezoid-ish shape
  const bodyPts = `${cx - 16},${cy - 2} ${cx + 18},${cy - 2} ${cx + 14},${cy - 12} ${cx - 10},${cy - 12}`
  // Handlebars
  const hbX = cx + 18; const hbY = cy - 12
  return (
    <g>
      {/* Wheels */}
      {[w1X, w2X].map((wx, i) => (
        <g key={i}>
          <circle cx={wx} cy={wheelY} r={wR} fill={C.MOTO_WHEEL} />
          <circle cx={wx} cy={wheelY} r={wR - 3} fill="#374151" />
          <circle cx={wx} cy={wheelY} r={3} fill={C.MOTO_HUB} />
        </g>
      ))}
      {/* Body */}
      <polygon points={bodyPts} fill={C.MOTO_BODY} stroke={C.MOTO_DARK} strokeWidth={1.5} />
      {/* Seat */}
      <rect x={cx - 14} y={cy - 16} width={20} height={6} rx={3} fill={C.MOTO_BODY} stroke={C.MOTO_DARK} strokeWidth={1} />
      {/* Handlebar */}
      <line x1={hbX} y1={hbY} x2={hbX + 2} y2={hbY - 9} stroke={C.MOTO_DARK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={hbX + 2} y1={hbY - 9} x2={hbX + 8} y2={hbY - 7} stroke={C.MOTO_DARK} strokeWidth={2} strokeLinecap="round" />
      {/* Headlight */}
      <circle cx={w2X + 1} cy={cy - 4} r={3} fill="#FEF08A" stroke={C.MOTO_DARK} strokeWidth={0.5} />
    </g>
  )
}

// ── Arrow glyph ───────────────────────────────────────────────────────────────

function RightArrow({ x, y }: { x: number; y: number }) {
  const aW = 20; const aH = 6; const aHd = 10
  return (
    <g fill={C.ARROW}>
      <rect x={x} y={y - aH / 2} width={aW - aHd / 2} height={aH} rx={2} />
      <polygon points={`${x + aW - aHd},${y - aHd / 2} ${x + aW},${y} ${x + aW - aHd},${y + aHd / 2}`} />
    </g>
  )
}

// ── Point marker ──────────────────────────────────────────────────────────────

function PointMarker({ x, label }: { x: number; label: string }) {
  return (
    <g>
      {/* Tick on road */}
      <line x1={x} y1={ROAD_Y + ROAD_H} x2={x} y2={ROAD_Y + ROAD_H + 6} stroke={C.MARKER_BD} strokeWidth={2} />
      {/* Label */}
      <text
        x={x}
        y={ROAD_Y + ROAD_H + 17}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={700}
        fill={C.MARKER_TXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * CatchUp22B10Illustration
 *
 * Static stem figure for SEAMO-22-B-Q10.
 * Shows a road: car at A (left), motorcycle at B (right), both with
 * rightward arrows, matching the source scan (005.jpg).
 * The answer (45 km/h) is NOT shown.
 */
export default function CatchUp22B10Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const ariaLabel =
    lang === 'id'
      ? 'Jalan dengan mobil di Titik A dan sepeda motor di Titik B, keduanya bergerak ke kanan.'
      : 'Road with a car at Point A and a motorcycle at Point B, both moving in the same direction (right).'

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(400, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={C.SKY} />

        {/* Road */}
        <rect x={A_X - 12} y={ROAD_Y} width={B_X - A_X + 24} height={ROAD_H} rx={3} fill={C.ROAD_BG} />

        {/* Dashed centre stripe */}
        {Array.from({ length: 9 }).map((_, i) => {
          const dx = (B_X - A_X) / 10
          const sx = A_X + 4 + i * dx * 1.1
          return (
            <rect
              key={i}
              x={sx}
              y={ROAD_CY - 1.5}
              width={10}
              height={3}
              rx={1}
              fill={C.STRIPE}
            />
          )
        })}

        {/* Point A marker */}
        <PointMarker x={A_X} label="A" />

        {/* Point B marker */}
        <PointMarker x={B_X} label="B" />

        {/* Car at A, centred above road */}
        <CarGlyph cx={A_X + 30} cy={ROAD_CY - 4} />

        {/* Rightward arrow for car */}
        <RightArrow x={A_X - 8} y={ROAD_CY - 22} />

        {/* Motorcycle at B */}
        <MotoGlyph cx={B_X - 24} cy={ROAD_CY - 4} />

        {/* Rightward arrow for motorcycle */}
        <RightArrow x={B_X - 8} y={ROAD_CY - 22} />

        {/* Question prompt */}
        <text
          x={SVG_W / 2}
          y={12}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={11}
          fontWeight={900}
          fill={C.Q_CLR}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {lang === 'id' ? 'Kecepatan motor = ? km/jam' : 'Motorcycle speed = ? km/h'}
        </text>
      </svg>
    </div>
  )
}
