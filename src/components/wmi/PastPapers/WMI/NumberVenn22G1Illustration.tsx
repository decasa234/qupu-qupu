// WMI-22F1A-Q4 (Grade 1) — three overlapping shapes holding the digits 1–9.
//
// Recovered from db/seed/wmi/figures/2022-final-g1-a-q4.jpg: a CIRCLE, a tilted
// SQUARE (top-left) and a large TRIANGLE all overlap, and the nine digits sit in
// their regions. Verified membership (consistent with the scan AND the key):
//   CIRCLE   : 2, 4, 5, 7, 9
//   SQUARE   : 1, 3, 5, 7
//   TRIANGLE : 4, 6, 7, 8
// So 5 & 7 are circle∩square, 7 is in all three, 4 is circle∩triangle,
//    1 & 3 are square-only, 2 & 9 are circle-only, 6 & 8 are triangle-only.
//
// The question asks the sum of digits INSIDE the circle but OUTSIDE the square,
// = {2, 4, 9} = 15 (answer D). The static figure shows ONLY the nine digits in
// their regions — never any highlight or the answer. The animator imports
// NumberVenn and passes `highlight` to ring digits in amber post-answer.

interface VennDigit {
  value: number
  x: number
  y: number
}

// Digit placements traced from the scan; verified (see tmp geometry check) so
// each digit falls in exactly its region. Coordinates are in viewBox units.
const DIGITS: VennDigit[] = [
  { value: 3, x: 92, y: 64 }, // square only — upper
  { value: 5, x: 158, y: 78 }, // circle ∩ square
  { value: 4, x: 206, y: 110 }, // circle ∩ triangle
  { value: 1, x: 58, y: 122 }, // square only — left
  { value: 7, x: 126, y: 126 }, // all three — centre
  { value: 8, x: 338, y: 118 }, // triangle only — right
  { value: 9, x: 196, y: 202 }, // circle only — lower centre
  { value: 6, x: 96, y: 214 }, // triangle only — lower left
  { value: 2, x: 232, y: 220 }, // circle only — lower right
]

// --- shape geometry (in viewBox units) ----------------------------------
// Circle centred, square tilted over its top-left, triangle wide and shallow.
const VIEW_W = 396
const VIEW_H = 270

const CIRCLE = { cx: 196, cy: 138, r: 92 }

// Tilted square: a unit square rotated -15° about its centre.
const SQUARE = (() => {
  const cx = 116
  const cy = 96
  const half = 64
  const deg = -15
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const corners: Array<[number, number]> = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ]
  const points = corners
    .map(([dx, dy]) => {
      const x = cx + dx * cos - dy * sin
      const y = cy + dx * sin + dy * cos
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return { points }
})()

// Large shallow triangle: top-left vertex, far-right vertex, bottom vertex.
const TRIANGLE = {
  points: ['64,78', '382,104', '96,250'].join(' '),
}

const INK = '#2B2B2B'
// No green qupu token exists, so the circle outline uses a raw green; the
// square (blue) and triangle (gray) bind to qupu tokens via className.
const GREEN = '#3C9D5A'

/**
 * Reusable primitive: the three overlapping outlined shapes with the nine
 * digits placed per the verified membership. `highlight` (optional) rings the
 * listed digit values in amber — used by the animator to reveal a region.
 */
export function NumberVenn({ highlight }: { highlight?: number[] }) {
  const ringSet = new Set(highlight ?? [])
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 340 }}
      aria-hidden="true"
    >
      {/* TRIANGLE — gray */}
      <polygon
        points={TRIANGLE.points}
        fill="none"
        className="stroke-qupu-muted"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* SQUARE (tilted) — blue */}
      <polygon
        points={SQUARE.points}
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

      {/* the nine digits */}
      {DIGITS.map(({ value, x, y }) => (
        <g key={value}>
          {ringSet.has(value) && (
            <circle cx={x} cy={y} r={20} fill="none" className="stroke-qupu-brand-orange" strokeWidth={3} />
          )}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={30}
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

export default function NumberVenn22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga bangun yang saling bertindih — lingkaran, persegi miring, dan segitiga besar — memuat angka 1 sampai 9. Lingkaran berisi 2, 4, 5, 7, 9; persegi berisi 1, 3, 5, 7; segitiga berisi 4, 6, 7, 8."
    >
      <NumberVenn />
    </div>
  )
}
