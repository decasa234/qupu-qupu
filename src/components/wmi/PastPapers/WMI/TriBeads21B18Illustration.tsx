// SEAMO-21-B-Q18 — 4 triangles from 9 equal-length segments, beads on each.
//
// The figure shows one large equilateral triangle subdivided into 4 smaller
// equilateral triangles by connecting the midpoints of each side (the classic
// 2-level triangle subdivision / Sierpiński Step 1).
//
// This creates 9 equal-length line segments:
//   - 6 outer half-sides (3 outer sides, each split at its midpoint)
//   - 3 inner segments connecting the 3 midpoints
//
// "4 beads at equal intervals" along each segment = 4 beads INCLUDING the two
// endpoint positions ⟹ 3 equal intervals ⟹ beads at 0, 1/3, 2/3, 1 of length.
//   • Vertices (segment endpoints, shared): 6 unique points
//   • Interior beads (at 1/3 and 2/3 per segment): 2 × 9 = 18
//   Total beads = 6 + 18 = 24  ✓  Answer D.
//
// The illustration shows ONLY the problem: the triangle structure with all 24
// bead positions marked. It does NOT annotate the count.
//
// SSR-safe: pure render, no Math.random, no Date, no hooks.

// ── Geometry ──────────────────────────────────────────────────────────────────

const W = 280
const H = 260

/** Compute an equilateral triangle's three vertices centred in the SVG. */
function equilateral(cx: number, cy: number, size: number) {
  // size = side length in SVG units; centroid at (cx, cy)
  // height of equilateral triangle
  const h = (size * Math.sqrt(3)) / 2
  // centroid is 1/3 from base, 2/3 from apex
  const top: [number, number] = [cx, cy - (2 * h) / 3]
  const bl: [number, number] = [cx - size / 2, cy + h / 3]
  const br: [number, number] = [cx + size / 2, cy + h / 3]
  return { top, bl, br }
}

const SIDE = 220
const CX = W / 2
const CY = H / 2 + 10

const { top: A, bl: B, br: C } = equilateral(CX, CY, SIDE)

// Midpoints of the three outer sides
const M_AB: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] // mid left side
const M_AC: [number, number] = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2] // mid right side
const M_BC: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2] // mid base

// The 6 structural vertices (outer corners + midpoints)
const VERTICES: [number, number][] = [A, B, C, M_AB, M_AC, M_BC]

// The 9 segments (pairs of vertex indices from VERTICES)
// Outer half-sides: A–M_AB, M_AB–B, B–M_BC, M_BC–C, C–M_AC, M_AC–A
// Inner segments:   M_AB–M_BC, M_BC–M_AC, M_AC–M_AB
const SEGMENTS: [number, number][] = [
  [0, 3], // A – M_AB
  [3, 1], // M_AB – B
  [1, 5], // B – M_BC
  [5, 2], // M_BC – C
  [2, 4], // C – M_AC
  [4, 0], // M_AC – A
  [3, 5], // M_AB – M_BC  (inner)
  [5, 4], // M_BC – M_AC  (inner)
  [4, 3], // M_AC – M_AB  (inner)
]

/** Beads at 1/3 and 2/3 along a segment (the two interior positions). */
function interiorBeads(
  p0: [number, number],
  p1: [number, number],
): [number, number][] {
  return [1 / 3, 2 / 3].map(
    (t) => [p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])] as [number, number],
  )
}

// All 18 interior bead positions (2 per segment × 9 segments)
const INTERIOR_BEADS: [number, number][] = SEGMENTS.flatMap(([i, j]) =>
  interiorBeads(VERTICES[i], VERTICES[j]),
)

// ── SVG constants ─────────────────────────────────────────────────────────────
const BEAD_R = 5
const VERTEX_R = 6.5
const STROKE_COLOR = '#374151' // dark grey line
const STROKE_W = 2
const BEAD_FILL = '#3B82F6'    // blue beads
const VERTEX_FILL = '#1D4ED8'  // darker blue for vertex beads

// ── Sub-components ────────────────────────────────────────────────────────────

/** Shared SVG figure (illustration + explainer can both import this). */
export function TriBeads21B18Figure() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Draw the 9 equal-length segments */}
      {SEGMENTS.map(([i, j], k) => {
        const [x1, y1] = VERTICES[i]
        const [x2, y2] = VERTICES[j]
        return (
          <line
            key={k}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={STROKE_COLOR}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
          />
        )
      })}

      {/* Interior beads (at 1/3 and 2/3 of each segment) */}
      {INTERIOR_BEADS.map(([cx, cy], k) => (
        <circle
          key={k}
          cx={cx}
          cy={cy}
          r={BEAD_R}
          fill={BEAD_FILL}
          stroke="white"
          strokeWidth={1}
        />
      ))}

      {/* Vertex beads (6 shared endpoint positions) */}
      {VERTICES.map(([cx, cy], k) => (
        <circle
          key={k}
          cx={cx}
          cy={cy}
          r={VERTEX_R}
          fill={VERTEX_FILL}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

/**
 * TriBeads21B18Illustration
 *
 * Shows a large equilateral triangle subdivided into 4 equal triangles (9
 * equal-length segments) with all 24 bead positions marked. Faithful to
 * SEAMO 2021 Paper B Q18. Does NOT annotate the count (answer not revealed).
 */
export default function TriBeads21B18Illustration({ params }: { params?: unknown }) {
  void params // fully determined by the question

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Segitiga besar yang dibagi menjadi 4 segitiga kecil menggunakan 9 segmen garis ' +
        'dengan panjang yang sama, dengan manik-manik yang ditempatkan di sepanjang setiap segmen.'
      }
    >
      <TriBeads21B18Figure />
    </div>
  )
}
