// IKMC-22-PE-Q9 — "Kanga covered each digit with a shape"
//
// Recovered from docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/026.jpg:
// Five card-suit shapes are displayed in a row, each covering one digit of
// a 5-digit number written on a light card strip.
//
// Shape order (left → right):
//   pos 1: Heart    (♥)  — unique at position 1
//   pos 2: Diamond  (◆)  — identical to pos 3  ← key fact
//   pos 3: Diamond  (◆)  — identical to pos 2
//   pos 4: Club     (♣)  — unique at position 4
//   pos 5: Spade    (♠)  — unique at position 5
//
// The illustration shows ONLY the shape row — never the digits underneath.
//
// Co-exports `ShapeRowPrimitive` so the explainer can reuse the same row
// and animate the "reveal" overlay when the answer is shown.

export const SVG_W = 360
export const SVG_H = 120

// Card strip background
export const STRIP = { x: 12, y: 28, w: 336, h: 64, rx: 8 } as const

// Centre-x positions for the 5 shapes (evenly spaced within the strip)
// Spacing: 336 / 6 = 56; centres at 56, 112, 168, 224, 280 + offset 12
const CX = [68, 124, 180, 236, 292] as const

export const COLOR = {
  STRIP_BG:     '#FEF9EE',   // warm cream card
  STRIP_STROKE: '#D1A535',   // golden border
  HEART:        '#DC2626',   // red heart
  DIAMOND:      '#1D4ED8',   // blue diamond
  CLUB:         '#16A34A',   // green club
  SPADE:        '#111827',   // black spade
  SHAPE_STROKE: 'none',
} as const

// ── shape renderers ───────────────────────────────────────────────────────────

/** Heart ♥ drawn with two circular arcs and a downward point. */
function Heart({ cx, cy, size = 20 }: { cx: number; cy: number; size?: number }) {
  const s = size
  // Heart path: two semicircles on top-left and top-right, meeting at bottom point
  const d = [
    `M ${cx} ${cy + s * 0.5}`,
    `C ${cx - s * 1.1} ${cy - s * 0.2}, ${cx - s * 1.1} ${cy - s * 1.1}, ${cx} ${cy - s * 0.4}`,
    `C ${cx + s * 1.1} ${cy - s * 1.1}, ${cx + s * 1.1} ${cy - s * 0.2}, ${cx} ${cy + s * 0.5}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={COLOR.HEART} stroke={COLOR.SHAPE_STROKE} />
}

/** Diamond ◆ — upright rhombus. */
function Diamond({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size
  const pts = [
    `${cx},${cy - s}`,
    `${cx + s * 0.65},${cy}`,
    `${cx},${cy + s}`,
    `${cx - s * 0.65},${cy}`,
  ].join(' ')
  return <polygon points={pts} fill={COLOR.DIAMOND} stroke={COLOR.SHAPE_STROKE} />
}

/** Club ♣ — three circles + stem. */
function Club({ cx, cy, size = 16 }: { cx: number; cy: number; size?: number }) {
  const r = size * 0.42
  const top = cy - size * 0.28
  const stemH = size * 0.55
  return (
    <g fill={COLOR.CLUB}>
      <circle cx={cx} cy={top - r * 0.2} r={r} />
      <circle cx={cx - r * 0.9} cy={top + r * 0.8} r={r} />
      <circle cx={cx + r * 0.9} cy={top + r * 0.8} r={r} />
      {/* stem */}
      <rect
        x={cx - size * 0.13}
        y={top + r * 0.8}
        width={size * 0.26}
        height={stemH}
        rx={size * 0.05}
      />
      {/* foot flare */}
      <rect
        x={cx - size * 0.38}
        y={top + r * 0.8 + stemH - size * 0.06}
        width={size * 0.76}
        height={size * 0.18}
        rx={size * 0.06}
      />
    </g>
  )
}

/** Spade ♠ — inverted heart on top + stem. */
function Spade({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size
  // Inverted-heart path (point at top, curves at bottom)
  const d = [
    `M ${cx} ${cy - s * 0.48}`,
    `C ${cx + s * 1.05} ${cy - s * 1.3}, ${cx + s * 1.05} ${cy - s * 0.2}, ${cx} ${cy + s * 0.42}`,
    `C ${cx - s * 1.05} ${cy - s * 0.2}, ${cx - s * 1.05} ${cy - s * 1.3}, ${cx} ${cy - s * 0.48}`,
    'Z',
  ].join(' ')
  const stemH = s * 0.44
  const stemTop = cy + s * 0.42
  return (
    <g fill={COLOR.SPADE}>
      <path d={d} />
      <rect x={cx - s * 0.12} y={stemTop} width={s * 0.24} height={stemH} rx={s * 0.05} />
      <rect
        x={cx - s * 0.36}
        y={stemTop + stemH - s * 0.06}
        width={s * 0.72}
        height={s * 0.17}
        rx={s * 0.05}
      />
    </g>
  )
}

// ── shape sequence (mirrors the exam figure) ─────────────────────────────────

export type ShapeId = 'heart' | 'diamond' | 'club' | 'spade'

/**
 * The 5-position shape row, exactly as it appears in the exam:
 *   Heart, Diamond, Diamond, Club, Spade
 */
export const SHAPE_ROW: ReadonlyArray<ShapeId> = [
  'heart', 'diamond', 'diamond', 'club', 'spade',
]

// ── reusable primitive ────────────────────────────────────────────────────────

/**
 * The card strip with all 5 shapes.
 * `revealIndex` (0-based): when set, reveals the hidden digit at that position
 * (overlays a white badge with the digit from `revealDigits`).
 */
export function ShapeRowPrimitive({
  revealIndex,
  revealDigits,
}: {
  revealIndex?: number
  revealDigits?: string[]
}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: SVG_W }}
      aria-hidden="true"
    >
      {/* card strip */}
      <rect
        x={STRIP.x}
        y={STRIP.y}
        width={STRIP.w}
        height={STRIP.h}
        rx={STRIP.rx}
        fill={COLOR.STRIP_BG}
        stroke={COLOR.STRIP_STROKE}
        strokeWidth={2}
      />

      {/* divider lines between digit slots */}
      {[1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={(CX[i - 1] + CX[i]) / 2}
          y1={STRIP.y + 4}
          x2={(CX[i - 1] + CX[i]) / 2}
          y2={STRIP.y + STRIP.h - 4}
          stroke={COLOR.STRIP_STROKE}
          strokeWidth={1}
          strokeOpacity={0.35}
        />
      ))}

      {/* shapes (or revealed digit) */}
      {SHAPE_ROW.map((shape, i) => {
        const cx = CX[i]
        const cy = SVG_H / 2

        // Reveal overlay: white badge + digit
        if (revealIndex === i && revealDigits && revealDigits[i]) {
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={20} fill="#FFFFFF" stroke="#10B981" strokeWidth={2.5} />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill="#065F46"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {revealDigits[i]}
              </text>
            </g>
          )
        }

        if (shape === 'heart')   return <Heart   key={i} cx={cx} cy={cy} />
        if (shape === 'diamond') return <Diamond key={i} cx={cx} cy={cy} />
        if (shape === 'club')    return <Club    key={i} cx={cx} cy={cy} />
        return                          <Spade   key={i} cx={cx} cy={cy} />
      })}
    </svg>
  )
}

// ── stem illustration (default export) ───────────────────────────────────────

export default function CoveredNum9PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah angka 5 digit yang setiap digitnya ditutupi oleh bentuk kartu: hati, berlian, berlian, semanggi, sekop. Dua berlian yang identik menunjukkan dua digit yang sama."
    >
      <ShapeRowPrimitive />
    </div>
  )
}
