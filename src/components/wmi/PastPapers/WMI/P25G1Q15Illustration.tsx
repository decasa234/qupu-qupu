// Dartboard figure for WMI-25P1A-Q15 (2025 Semifinal Grade 1 Paper A).
//
// "Ally and Luka each throw 5 darts. Inner ring = 10, middle ring = 5, outer
//  ring = 1, a miss = 0. The picture shows Ally's result. If Ally wins, which
//  option CANNOT be Luka's result?"  Five image options A-E; answer = D.
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q15.jpg as a clean
// SVG redraw (the JPG is NOT embedded). The scan shows Ally's board:
//   - concentric rings (outer yellow = 1, middle green = 5, inner pink = 10)
//   - five darts: two land in the 10 ring, two in the outer 1 ring, one MISS
//     (lands off the board, 0 points).
//   Ally's total = 10 + 10 + 1 + 1 + 0 = 22.
//
// The static figure shows ONLY the problem (Ally's board + the ring legend); it
// never prints Ally's total and never reveals the answer letter. Totalling the
// board and comparing options is the explainer's job, via the co-exported
// Dartboard primitive (its `showTotal` prop).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.

const INK = '#1F2937'

// Ring palette (matches the scan).
const OUTER = '#FAF0A0' // outer ring, 1 point (yellow)
const MIDDLE = '#CFE9DB' // middle ring, 5 points (green)
const INNER = '#FBD5D8' // bullseye, 10 points (pink)
const RING_STROKE = '#9AA0A6'

const DART_BODY = '#9D2449'
const DART_FLIGHT = '#E0457B'
const DART_TIP = '#D11A2A'
const BLUE = '#2f6df0'

export const ALLY_DARTS = [10, 10, 1, 1, 0] // two bull, two outer, one miss
export const ALLY_TOTAL = ALLY_DARTS.reduce((a, b) => a + b, 0) // 22

export const RING_VALUES = { inner: 10, middle: 5, outer: 1, miss: 0 }

const CX = 130 // board centre
const CY = 130
const R_INNER = 38 // 10 ring radius
const R_MIDDLE = 76 // 5 ring outer radius
const R_OUTER = 112 // 1 ring outer radius (board edge)

/** A single dart: a small landing dot at (x, y) with a flight tail along `angle`. */
function Dart({ x, y, angle }: { x: number; y: number; angle: number }) {
  const len = 46
  const tailX = x + Math.cos(angle) * len
  const tailY = y + Math.sin(angle) * len
  // shaft mid + flight (heart-ish feather) at the tail end
  const fx = x + Math.cos(angle) * (len + 9)
  const fy = y + Math.sin(angle) * (len + 9)
  return (
    <g>
      <line x1={x} y1={y} x2={tailX} y2={tailY} stroke={DART_BODY} strokeWidth={4} strokeLinecap="round" />
      <circle cx={fx} cy={fy} r={9} fill={DART_FLIGHT} stroke={INK} strokeWidth={1} />
      <circle cx={x} cy={y} r={4.5} fill={DART_TIP} stroke="#FFFFFF" strokeWidth={1} />
    </g>
  )
}

export interface DartboardProps {
  /** Show "= 22" total badge beside the board (explainer use only). */
  showTotal?: boolean
  /** Highlight ring i (0..4 in ALLY_DARTS order) as it is tallied. */
  countedDarts?: number
}

/**
 * Ally's dartboard. At its defaults (no total) it is the pristine question figure:
 * the rings, the point labels, and Ally's five darts — no total, no answer.
 */
export function Dartboard({ showTotal = false, countedDarts = 0 }: DartboardProps) {
  // Dart landing points (board coords) + flight angles, read from the scan.
  const darts = [
    { x: CX - 12, y: CY - 18, angle: (-2.4 * Math.PI) / 3, val: 10 }, // top-left -> 10
    { x: CX + 16, y: CY - 6, angle: -0.25 * Math.PI, val: 10 }, // right -> 10
    { x: CX + 58, y: CY - 78, angle: -0.6 * Math.PI, val: 1 }, // top-right -> 1 (outer)
    { x: CX + 60, y: CY + 70, angle: -0.35 * Math.PI, val: 1 }, // bottom-right -> 1 (outer)
    { x: CX + 122, y: CY + 8, angle: -0.15 * Math.PI, val: 0 }, // far right OFF board -> miss
  ]

  return (
    <svg
      viewBox="0 0 300 268"
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* rings, outer -> inner */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={OUTER} stroke={RING_STROKE} strokeWidth={3} />
      <circle cx={CX} cy={CY} r={R_MIDDLE} fill={MIDDLE} stroke={RING_STROKE} strokeWidth={3} />
      <circle cx={CX} cy={CY} r={R_INNER} fill={INNER} stroke={RING_STROKE} strokeWidth={3} />

      {/* point labels along the vertical axis (as in the scan) */}
      <text x={CX} y={CY - 94} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>
        1
      </text>
      <text x={CX} y={CY - 57} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>
        5
      </text>
      <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={INK}>
        10
      </text>
      <text x={CX} y={CY + 57} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>
        5
      </text>
      <text x={CX} y={CY + 94} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>
        1
      </text>

      {/* darts */}
      {darts.map((d, i) => (
        <g key={i} opacity={showTotal && countedDarts > 0 && i >= countedDarts ? 0.35 : 1}>
          <Dart x={d.x} y={d.y} angle={d.angle} />
        </g>
      ))}

      {showTotal && (
        <text x={262} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={BLUE}>
          {`= ${ALLY_TOTAL}`}
        </text>
      )}
    </svg>
  )
}

export default function P25G1Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Ally's dartboard: three concentric rings worth 1 (outer), 5 (middle) and 10 (centre). Five darts are thrown — two land in the centre 10 ring, two in the outer 1 ring, and one misses the board. The total is not shown."
    >
      <Dartboard />
    </div>
  )
}
