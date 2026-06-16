// WMI-25F3A-Q4 — Three identical rectangles arranged side-by-side (portrait)
// to form a square. Each rectangle perimeter = 48 cm; long side L = 3w, w = 6 cm.
// Shows the setup only (dimensions labelled w and 3w), never the answer.

const INK = '#1F2937'

// Layout constants (all in SVG user units, scale-independent)
// Three rectangles side-by-side → combined shape is a square of side S.
// We draw S×S square subdivided by two inner verticals into three w×S panels,
// where S = 3w. Display with w = 54 px  →  S = 162 px.
const W = 54  // short side (one column)
const S = W * 3  // square side = long side of each rectangle = 162
const PAD = 24  // headroom around the square so strokes don't clip

// Overall SVG canvas
const VW = S + PAD * 2        // 210
const VH = S + PAD * 2 + 40  // extra 40 for dimension label row at bottom

// Square top-left origin
const X0 = PAD
const Y0 = PAD

export function RectSquare25G3Figure() {
  // Fill each of the 3 rectangle panels with a light blue tint
  const fills = ['#DBEAFE', '#EFF6FF', '#DBEAFE'] // alternating for visual clarity

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Three rectangle panels */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={X0 + i * W}
          y={Y0}
          width={W}
          height={S}
          fill={fills[i]}
          stroke={INK}
          strokeWidth={2}
        />
      ))}

      {/* Outer square border drawn on top for clean corners */}
      <rect
        x={X0}
        y={Y0}
        width={S}
        height={S}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* ── Dimension label: "w" above each column (top centre) ── */}
      {[0, 1, 2].map((i) => (
        <text
          key={i}
          x={X0 + i * W + W / 2}
          y={Y0 - 8}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={13}
          fontWeight={700}
          fill={INK}
        >
          w
        </text>
      ))}

      {/* ── Dimension label: "3w" on the right side (middle) ── */}
      <text
        x={X0 + S + 10}
        y={Y0 + S / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={INK}
      >
        3w
      </text>

      {/* ── Perimeter tag below each rectangle: "K = 48 cm" centred ── */}
      <text
        x={X0 + S / 2}
        y={Y0 + S + 18}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fill="#6B7280"
      >
        Keliling tiap persegi panjang = 48 cm
      </text>
    </svg>
  )
}

export default function RectSquare25G3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tiga persegi panjang identik disusun berdampingan membentuk persegi. Lebar tiap persegi panjang adalah w dan panjangnya 3w. Keliling tiap persegi panjang adalah 48 cm."
    >
      <RectSquare25G3Figure />
    </div>
  )
}
