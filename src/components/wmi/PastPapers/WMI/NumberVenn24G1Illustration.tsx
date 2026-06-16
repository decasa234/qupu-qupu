// WMI-24F1A-Q10 (Grade 1) — three overlapping shapes holding nineteen numbers.
//
// Recovered from db/seed/wmi/figures/2024-final-g1-a-q10.jpg: an axis-aligned
// SQUARE (top-left), a large CIRCLE (right), and a TRIANGLE (apex up, base down,
// sitting over the circle∩square overlap). Each number sits in its region.
// Membership verified geometrically (point-in-shape test, all 19 match the scan):
//   SQUARE only            : 2, 16, 75
//   CIRCLE only            : 55, 92, 30, 46, 88
//   TRIANGLE only          : 54, 81
//   SQUARE ∩ CIRCLE        : 90, 13, 58, 44, 32, 8
//   CIRCLE ∩ TRIANGLE      : 48
//   SQUARE ∩ CIRCLE ∩ TRI  : 71, 63
//
// The question asks: numbers inside BOTH square and circle, NOT inside the
// triangle, AND larger than 40. From {90, 13, 58, 44, 32, 8} the values > 40 are
// {90, 58, 44} → exactly 3 (answer C).
//
// The static figure shows ONLY the numbers in their regions — never a highlight
// or the answer. The animator imports NumberVenn24G1 and passes
// `highlightQualifying` to ring {90, 58, 44} in amber post-answer.

interface VennNumber {
  value: number
  x: number
  y: number
}

// Number placements traced from the scan; verified so each falls in exactly its
// region (see geometry check). Coordinates are in viewBox units.
const NUMBERS: VennNumber[] = [
  { value: 55, x: 200, y: 58 }, // circle only — top
  { value: 92, x: 318, y: 60 }, // circle only — top right
  { value: 2, x: 55, y: 138 }, // square only — left
  { value: 90, x: 124, y: 118 }, // square ∩ circle
  { value: 13, x: 203, y: 132 }, // square ∩ circle
  { value: 30, x: 272, y: 142 }, // circle only — right of square
  { value: 46, x: 378, y: 165 }, // circle only — far right
  { value: 58, x: 168, y: 160 }, // square ∩ circle
  { value: 16, x: 56, y: 218 }, // square only — left
  { value: 44, x: 132, y: 220 }, // square ∩ circle
  { value: 32, x: 178, y: 200 }, // square ∩ circle
  { value: 88, x: 352, y: 222 }, // circle only — right
  { value: 8, x: 150, y: 264 }, // square ∩ circle (left of triangle)
  { value: 71, x: 207, y: 256 }, // all three
  { value: 48, x: 290, y: 282 }, // circle ∩ triangle
  { value: 75, x: 92, y: 288 }, // square only — lower left
  { value: 63, x: 192, y: 292 }, // all three
  { value: 54, x: 202, y: 348 }, // triangle only — bottom
  { value: 81, x: 307, y: 346 }, // triangle only — bottom right
]

// Numbers that qualify: square ∩ circle, NOT triangle, value > 40. Used only by
// the animator via `highlightQualifying` — never drawn in the static figure.
const QUALIFYING = [90, 58, 44]

// --- shape geometry (in viewBox units) ----------------------------------
// Square top-left, circle large to the right, triangle apex-up over the overlap.
const VIEW_W = 412
const VIEW_H = 380

const SQUARE = { x: 12, y: 88, w: 233, h: 234 }
const CIRCLE = { cx: 250, cy: 168, r: 158 }
// Triangle: apex up (at the circle∩square overlap), base across the bottom.
const TRIANGLE = { points: ['207,150', '118,348', '358,348'].join(' ') }

const INK = '#2B2B2B'
// No green qupu token exists, so the circle outline uses a raw green; the square
// (blue) and triangle (gray) bind to qupu tokens via className.
const GREEN = '#3C9D5A'

/**
 * Reusable primitive: the three overlapping outlined shapes with the nineteen
 * numbers placed per the verified membership. `highlightQualifying` (optional)
 * rings the three qualifying numbers {90, 58, 44} in amber — used by the
 * animator to reveal the answer set post-answer.
 */
export function NumberVenn24G1({ highlightQualifying }: { highlightQualifying?: boolean } = {}) {
  const ringSet = new Set(highlightQualifying ? QUALIFYING : [])
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 360 }}
      aria-hidden="true"
    >
      {/* SQUARE — blue */}
      <rect
        x={SQUARE.x}
        y={SQUARE.y}
        width={SQUARE.w}
        height={SQUARE.h}
        fill="none"
        className="stroke-qupu-brand-blue"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* CIRCLE — green (no green qupu token; raw hex) */}
      <circle
        cx={CIRCLE.cx}
        cy={CIRCLE.cy}
        r={CIRCLE.r}
        fill="none"
        stroke={GREEN}
        strokeWidth={2.5}
      />
      {/* TRIANGLE — gray */}
      <polygon
        points={TRIANGLE.points}
        fill="none"
        className="stroke-qupu-muted"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* the nineteen numbers */}
      {NUMBERS.map(({ value, x, y }) => (
        <g key={value}>
          {ringSet.has(value) && (
            <circle
              cx={x}
              cy={y}
              r={22}
              fill="none"
              className="stroke-qupu-brand-orange"
              strokeWidth={3}
            />
          )}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={26}
            fontWeight={800}
            fill={INK}
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function NumberVenn24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga bangun yang saling bertindih — persegi di kiri atas, lingkaran besar di kanan, dan segitiga — memuat sembilan belas angka. Persegi dan lingkaran bertindih memuat 90, 13, 58, 44, 32, 8; segitiga menutupi bagian tengah memuat 71, 63, 48, 54, 81."
    >
      <NumberVenn24G1 />
    </div>
  )
}
