// WMI-23P1A-Q17 (2023 Grade 1 Semifinal) — "How many DIGITS are both outside the
// square and inside the circle? (3 is one digit; 24 is two digits.)"  Answer B = 6.
//
// Reconstructed from db/seed/wmi/figures/2023-semifinal-g1-a-q17.jpg (the JPG is
// NOT embedded): an axis-aligned SQUARE on the left overlapping a CIRCLE on the
// right. Each number sits in one of four regions. Membership traced from the scan
// and verified geometrically (point-in-square ∧ point-in-circle):
//   OUTSIDE both           : 16, 5, 1, 27
//   SQUARE only            : 8, 39, 10
//   SQUARE ∩ CIRCLE        : 4, 32
//   CIRCLE only (the ask)  : 25, 6, 13, 7   ← outside square, inside circle
//
// The question counts DIGITS, not numbers, in the circle-only region:
//   25 → 2, 6 → 1, 13 → 2, 7 → 1  =>  6 digits  (answer B).
//
// The static figure shows ONLY the numbers in their regions — never a highlight,
// never a count. The explainer imports NumberSquareCircleVenn and passes
// `highlightCircleOnly` to ring {25, 6, 13, 7} in amber post-answer.
//
// Pure render, SSR-safe, deterministic — no window/document/Math.random/Date.

interface VennNumber {
  value: number
  x: number
  y: number
}

// Number placements traced from the scan; each falls in exactly its region.
// Coordinates are in viewBox units.
const NUMBERS: VennNumber[] = [
  // outside both
  { value: 16, x: 28, y: 130 }, // far left, mid
  { value: 5, x: 392, y: 40 }, // top right, above circle
  { value: 1, x: 40, y: 268 }, // lower left
  { value: 27, x: 132, y: 312 }, // bottom, below square
  // square only
  { value: 8, x: 122, y: 66 }, // top-left of square
  { value: 39, x: 208, y: 60 }, // top of square
  { value: 10, x: 120, y: 200 }, // left of square, lower
  // square ∩ circle (overlap)
  { value: 4, x: 280, y: 118 }, // upper overlap
  { value: 32, x: 262, y: 200 }, // lower overlap
  // circle only — the region the question asks about
  { value: 25, x: 372, y: 138 }, // right of square, inside circle
  { value: 6, x: 356, y: 230 }, // below square corner, inside circle
  { value: 13, x: 252, y: 286 }, // bottom of circle, left
  { value: 7, x: 410, y: 286 }, // bottom-right of circle
]

// Numbers in the CIRCLE-ONLY region (outside square, inside circle). Used only by
// the explainer via `highlightCircleOnly` — never drawn in the static figure.
export const CIRCLE_ONLY = [25, 6, 13, 7]

// --- shape geometry (in viewBox units) -----------------------------------
const VIEW_W = 470
const VIEW_H = 348

// Square sits on the left; circle large to the right; they overlap in the middle.
const SQUARE = { x: 92, y: 22, w: 224, h: 212 }
const CIRCLE = { cx: 330, cy: 168, r: 150 }

const INK = '#2B2B2B'
const ORANGE = '#F08522' // square outline (matches the scan's orange square)
const BLUE = '#1FA2E6' // circle outline (matches the scan's blue circle)

/**
 * Reusable primitive: the overlapping outlined SQUARE + CIRCLE with the thirteen
 * numbers placed per the verified membership. `highlightCircleOnly` (optional)
 * rings the circle-only numbers {25, 6, 13, 7} in amber — used by the explainer
 * to reveal the answer set post-answer. By default it draws only the problem.
 */
export function NumberSquareCircleVenn({ highlightCircleOnly }: { highlightCircleOnly?: boolean } = {}) {
  const ringSet = new Set(highlightCircleOnly ? CIRCLE_ONLY : [])
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 380 }}
      aria-hidden="true"
    >
      {/* SQUARE — orange */}
      <rect
        x={SQUARE.x}
        y={SQUARE.y}
        width={SQUARE.w}
        height={SQUARE.h}
        fill="none"
        stroke={ORANGE}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* CIRCLE — blue */}
      <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} fill="none" stroke={BLUE} strokeWidth={4} />

      {/* the thirteen numbers */}
      {NUMBERS.map(({ value, x, y }) => (
        <g key={value}>
          {ringSet.has(value) && (
            <circle cx={x} cy={y} r={22} fill="none" stroke={ORANGE} strokeWidth={3} />
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

export default function P23G1Q17Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah persegi jingga di kiri beririsan dengan sebuah lingkaran biru di kanan, memuat tiga belas bilangan. Di luar kedua bangun: 16, 5, 1, 27. Hanya di persegi: 8, 39, 10. Irisan persegi dan lingkaran: 4, 32. Hanya di lingkaran (di luar persegi): 25, 6, 13, 7."
    >
      <NumberSquareCircleVenn />
    </div>
  )
}
