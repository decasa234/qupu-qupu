// OSN-25-SD-PROV-Q4 — Keliling bangun di bawah ini (notched rectangle)
//
// PROBLEM ONLY: the L-shaped figure from the paper.
//   - Outer dimensions 8 wide × 6 tall (labeled).
//   - Rectangular notch cut from the lower-right corner (4 units wide × 3 units tall).
//   - Right-angle markers at all 6 corners.
// Does NOT show the perimeter value or any calculation.
//
// Pure render — no hooks, no framer-motion, SSR-safe, deterministic.

// ── Layout constants (re-exported so the explainer can share them) ────────────

/** Pixels per unit length. */
export const U = 20

/** Outer shape dimensions in units. */
export const SHAPE_W = 8
export const SHAPE_H = 6

/** Notch dimensions in units (lower-right corner). */
export const NOTCH_W = 4
export const NOTCH_H = 3

/** SVG origin offsets (px from canvas edge to shape edge). */
export const OX = 36
export const OY = 24

/** Right-angle square size (px). */
export const RA_SIZE = 7

// Derived pixel dimensions
const W  = SHAPE_W * U   // 160 px
const H  = SHAPE_H * U   // 120 px
const NW = NOTCH_W * U   //  80 px
const NH = NOTCH_H * U   //  60 px

/**
 * 6 vertices of the L-polygon in pixel coordinates.
 *
 *  A ─────────────── B
 *  │                 │
 *  │         C ──── (notch right)
 *  │         │
 *  │    D ───┘ (inner-top)
 *  │    │
 *  │    E (inner-bottom)
 *  │    │
 *  F ───┘
 *
 * Polygon: A → B → C → D... wait, the actual path with notch at lower-right:
 *
 *  A ─────────────── B
 *  │                 │
 *  │                 C
 *  │           D ───/   ← notch horizontal
 *  │           │
 *  F ──────── E        ← notch bottom
 */
export const V = {
  A: [OX,          OY         ] as [number, number],   // top-left
  B: [OX + W,      OY         ] as [number, number],   // top-right
  C: [OX + W,      OY + NH    ] as [number, number],   // notch right (goes left into notch)
  D: [OX + W - NW, OY + NH    ] as [number, number],   // notch inner-top (goes down)
  E: [OX + W - NW, OY + H     ] as [number, number],   // notch inner-bottom (goes left)
  F: [OX,          OY + H     ] as [number, number],   // bottom-left (goes up to A)
}

/** Canvas dimensions (px). */
export const SVG_W = W + OX + 50   // 246
export const SVG_H = H + OY + 40   // 184

/** Colour palette. */
export const COLOR = {
  FILL:   '#DBEAFE',
  STROKE: '#1E3A5F',
  LABEL:  '#1F2937',
  GHOST:  '#94A3B8',
  AMBER:  '#D97706',
  GREEN:  '#10B981',
} as const

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * Small right-angle square at vertex `v`, extending inward along `d1` and `d2`
 * (unit vectors [dx, dy]). Marks a 90° corner.
 */
function RightAngleMark({
  v,
  d1,
  d2,
}: {
  v: [number, number]
  d1: [number, number]
  d2: [number, number]
}) {
  const s = RA_SIZE
  const [vx, vy] = v
  const [d1x, d1y] = d1
  const [d2x, d2y] = d2
  const p1 = [vx + d1x * s, vy + d1y * s]
  const p2 = [vx + d1x * s + d2x * s, vy + d1y * s + d2y * s]
  const p3 = [vx + d2x * s, vy + d2y * s]
  return (
    <path
      d={`M ${vx} ${vy} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`}
      fill="none"
      stroke={COLOR.STROKE}
      strokeWidth={1}
      strokeLinejoin="miter"
    />
  )
}

/** The L-shaped polygon. */
export function LShape({ fill = COLOR.FILL }: { fill?: string }) {
  const { A, B, C, D, E, F } = V
  const pts = [A, B, C, D, E, F]
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z'
  return (
    <path
      d={d}
      fill={fill}
      stroke={COLOR.STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/** Dimension labels (8 on top, 6 on left). */
export function DimLabels() {
  const { A, B, F } = V
  const midX = (A[0] + B[0]) / 2
  const midY = (A[1] + F[1]) / 2
  return (
    <g
      fontSize={13}
      fontWeight={700}
      fill={COLOR.LABEL}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {/* "8" above the top edge */}
      <text x={midX} y={A[1] - 8} textAnchor="middle" dominantBaseline="auto">
        8
      </text>
      {/* "6" left of the left edge */}
      <text x={A[0] - 10} y={midY} textAnchor="middle" dominantBaseline="central">
        6
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * NotchedRectOSN25PQ4Illustration
 *
 * Static, problem-only figure for OSN-25-SD-PROV-Q4.
 * Shows the L-shaped figure: an 8×6 rectangle with a rectangular notch at the
 * lower-right corner. Labels "8" and "6". Right-angle marks at all 6 corners.
 * Does NOT reveal the perimeter or any calculation.
 */
export default function NotchedRectOSN25PQ4Illustration() {
  const { A, B, C, D, E, F } = V

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Bangun berbentuk L: persegi panjang 8 × 6 dengan lekukan di sudut kanan bawah. Cari kelilingnya.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* L-shaped polygon */}
        <LShape />

        {/* Dimension labels */}
        <DimLabels />

        {/* Right-angle marks at all 6 corners.
            Directions d1, d2 are unit vectors pointing INTO the angle opening:
            - Convex corners (A, B, C, F): opening is into the shape interior.
            - Concave corners (D, E): opening is into the notch cut-out. */}

        {/* A: top-left — right (+x) and down (+y) into shape */}
        <RightAngleMark v={A} d1={[1, 0]} d2={[0, 1]} />
        {/* B: top-right — left (−x) and down (+y) into shape */}
        <RightAngleMark v={B} d1={[-1, 0]} d2={[0, 1]} />
        {/* C: notch right — up (−y) and left (−x) into shape */}
        <RightAngleMark v={C} d1={[0, -1]} d2={[-1, 0]} />
        {/* D: notch inner-top — right (+x) and down (+y) into notch cutout */}
        <RightAngleMark v={D} d1={[1, 0]} d2={[0, 1]} />
        {/* E: notch inner-bottom — right (+x) and up (−y) into notch cutout */}
        <RightAngleMark v={E} d1={[1, 0]} d2={[0, -1]} />
        {/* F: bottom-left — right (+x) and up (−y) into shape */}
        <RightAngleMark v={F} d1={[1, 0]} d2={[0, -1]} />
      </svg>
    </div>
  )
}
