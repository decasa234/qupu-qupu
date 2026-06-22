// Sticks16ECIllustration — IKMC-20-EC-Q16
//
// Stem figure: two clusters of sticks scattered on the page.
//   Left cluster  — short sticks (1 cm), many, small and tilted at various angles.
//   Right cluster — long sticks  (3 cm), fewer, larger, crossing each other.
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/045.jpg
// Faithful to the source: short sticks on left, long sticks on right, all black lines.
// PROBLEM only — does NOT show the answer or which combination works.
//
// Co-exports:
//   SHORT_L, LONG_L   — logical lengths in px used by the explainer
//   StickBar          — reusable stick primitive (thin rounded-cap line)

// ── Design tokens ────────────────────────────────────────────────────────────

/** SVG stroke colour — matches the black lines in the source figure. */
export const STICK_COLOR = '#1F2937'

/** Stroke width for all sticks (px). */
export const STROKE_W = 3.5

/** Logical pixel length of a SHORT stick (1 cm) in the explainer's square diagram. */
export const SHORT_L = 30

/** Logical pixel length of a LONG stick (3 cm) in the explainer's square diagram. */
export const LONG_L = 90

// ── Shared primitive ─────────────────────────────────────────────────────────

/**
 * StickBar — a single stick rendered as a thick rounded-cap line.
 * Position: centre at (cx, cy), angled `angleDeg` degrees from horizontal.
 * `length` is the full pixel length of the stick.
 */
export function StickBar({
  cx,
  cy,
  length,
  angleDeg,
  color = STICK_COLOR,
  strokeWidth = STROKE_W,
}: {
  cx: number
  cy: number
  length: number
  angleDeg: number
  color?: string
  strokeWidth?: number
}) {
  const rad = (angleDeg * Math.PI) / 180
  const dx = (length / 2) * Math.cos(rad)
  const dy = (length / 2) * Math.sin(rad)
  return (
    <line
      x1={cx - dx}
      y1={cy - dy}
      x2={cx + dx}
      y2={cy + dy}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  )
}

// ── Illustration layout ───────────────────────────────────────────────────────
// viewBox: 340 × 120 — matches the wide, low aspect ratio of the source figure.
// Short-stick cluster: left 30–140 px, long-stick cluster: right 180–320 px.

const VW = 340
const VH = 120

// Short sticks — 12 sticks, positions + angles loosely mimicking the source scan.
// (cx, cy, angleDeg)
const SHORT_STICKS: [number, number, number][] = [
  [42,  38, -42],
  [62,  30, -38],
  [78,  46, -50],
  [52,  58, -33],
  [72,  65, -48],
  [90,  52, -35],
  [38,  72, -55],
  [60,  80, -40],
  [82,  78, -45],
  [102, 42, -30],
  [108, 62, -52],
  [48,  48, -25],
]

// Long sticks — 6 sticks, larger, crossing pattern like the source scan.
// (cx, cy, angleDeg)
const LONG_STICKS: [number, number, number][] = [
  [205, 60, -40],
  [225, 50,  -8],
  [248, 68, -50],
  [265, 45, -20],
  [280, 70,  -5],
  [240, 82, -30],
]

// Short stick visual length (slightly shorter than LONG_L / 3 to stay within cluster bounds)
const SHORT_VIS = 22
// Long stick visual length
const LONG_VIS  = 64

export default function Sticks16ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Two groups of sticks: short sticks (1 cm) clustered on the left, ' +
        'long sticks (3 cm) clustered on the right.'
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* short-stick cluster label */}
        <text x={72} y={14} textAnchor="middle" fontSize={10} fontWeight={700} fill="#6B7280">
          1 cm
        </text>

        {/* long-stick cluster label */}
        <text x={248} y={14} textAnchor="middle" fontSize={10} fontWeight={700} fill="#6B7280">
          3 cm
        </text>

        {/* short sticks */}
        {SHORT_STICKS.map(([cx, cy, deg], i) => (
          <StickBar key={`s${i}`} cx={cx} cy={cy} length={SHORT_VIS} angleDeg={deg} />
        ))}

        {/* long sticks */}
        {LONG_STICKS.map(([cx, cy, deg], i) => (
          <StickBar key={`l${i}`} cx={cx} cy={cy} length={LONG_VIS} angleDeg={deg} />
        ))}
      </svg>
    </div>
  )
}
