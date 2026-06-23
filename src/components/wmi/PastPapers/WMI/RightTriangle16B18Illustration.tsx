// SEAMO-16-B-Q18 — right-angled triangle with perimeter 12 cm and area 6 cm².
//
// Stem figure (016.jpg): a right-angled triangle. No side lengths shown in the
// problem — the question gives perimeter and area as text. The illustration
// shows the triangle with a right-angle marker and the given data as labels.
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.
// No primitives match a plain labelled right triangle → fresh SVG (simple case).

// ── Geometry ──────────────────────────────────────────────────────────────────
// Viewbox 200×160. Triangle vertices:
//   Right-angle corner at bottom-left: (30, 130)
//   Base runs right:                   (130, 130)
//   Apex at top-right:                 (130, 50)
// This places the right angle bottom-left with the hypotenuse as the diagonal.

const VBW = 200
const VBH = 160

// Vertices
const A = { x: 30,  y: 130 } // right-angle corner (bottom-left)
const B = { x: 130, y: 130 } // bottom-right
const C = { x: 130, y: 50  } // top-right

// Right-angle square size
const SQ = 10

// ── Colour tokens ─────────────────────────────────────────────────────────────
const FILL   = '#EFF6FF'  // very light blue fill
const STROKE = '#1D4ED8'  // blue outline
const SW     = 2          // stroke width
const TEXT   = '#1E293B'  // label colour
const DIM    = '#6B7280'  // dimension label colour

// ── Right-angle marker ────────────────────────────────────────────────────────
function RightAngleMarker() {
  // Corner at A = (30, 130). Square goes right and up.
  const { x, y } = A
  return (
    <path
      d={`M ${x + SQ},${y} L ${x + SQ},${y - SQ} L ${x},${y - SQ}`}
      fill="none"
      stroke={STROKE}
      strokeWidth={1.5}
    />
  )
}

// ── Main exported illustration ────────────────────────────────────────────────
export default function RightTriangle16B18Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={VBW}
      height={VBH}
      aria-label="Right-angled triangle with perimeter 12 cm and area 6 cm²"
    >
      {/* Triangle fill */}
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />

      {/* Right-angle marker */}
      <RightAngleMarker />

      {/* Side labels — generic (a, b, h) since no values given in stem */}

      {/* Label for the horizontal leg (a) — bottom edge, below */}
      <text
        x={(A.x + B.x) / 2}
        y={A.y + 16}
        textAnchor="middle"
        fontSize={12}
        fill={DIM}
        fontStyle="italic"
      >
        a
      </text>

      {/* Label for the vertical leg (b) — right edge, right */}
      <text
        x={B.x + 12}
        y={(B.y + C.y) / 2 + 4}
        textAnchor="start"
        fontSize={12}
        fill={DIM}
        fontStyle="italic"
      >
        b
      </text>

      {/* Label for the hypotenuse (h) — diagonal, centred */}
      {/* Midpoint of AC */}
      <text
        x={(A.x + C.x) / 2 - 14}
        y={(A.y + C.y) / 2}
        textAnchor="middle"
        fontSize={12}
        fill={DIM}
        fontStyle="italic"
      >
        h
      </text>

      {/* Given data box */}
      <rect x={2} y={2} width={140} height={38} rx={5} fill="#DBEAFE" stroke="#93C5FD" strokeWidth={1} />
      <text x={10} y={17} fontSize={11} fill={TEXT} fontWeight="600">
        Perimeter = 12 cm
      </text>
      <text x={10} y={33} fontSize={11} fill={TEXT} fontWeight="600">
        Area = 6 cm²
      </text>
    </svg>
  )
}
