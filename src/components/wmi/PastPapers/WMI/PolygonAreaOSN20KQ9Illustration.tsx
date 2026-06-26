// OSN-20-SD-KAB-Q9 — Polygon ABCDEF area problem
//
// PROBLEM ONLY: shows the static figure the student sees in the paper:
//   - Polygon ABCDEF with FE ∥ CD, A–C–D collinear
//   - Right angles at F (FE⊥FA) and at E (FE⊥EB)
//   - Labeled sides: FE=9, FA=25, AB=15, BC=13
//   - Dashed line EB (construction line, perpendicular from E to the base)
//   - CD marked with "?" — this is what we find
//
// Coordinates (A at origin, scale 6 px/cm, y-flipped for screen):
//   A=(40,205), F=(40,55), E=(94,55), B=(94,133), C=(124,205), D=(202,205)
//
// Does NOT reveal: EB=13, CD=13, or the coordinate derivation.
// Pure render — no Math.random, no Date, SSR-safe, deterministic.

// ── shared layout constants (re-exported so the explainer can share the same coords) ──

export const SVG_W = 250
export const SVG_H = 230

// Vertex screen-space positions
export const A = { x: 40, y: 205 }
export const F = { x: 40, y: 55 }
export const E = { x: 94, y: 55 }
export const B = { x: 94, y: 133 }
export const C = { x: 124, y: 205 }
export const D = { x: 202, y: 205 }

export const COLOR = {
  FILL: '#dbeafe',          // light blue polygon fill
  STROKE: '#1e40af',        // blue polygon stroke
  DASHED: '#6b7280',        // gray dashed construction line
  LABEL: '#1e293b',         // vertex labels
  DIM: '#1d4ed8',           // dimension labels (blue)
  QUESTION: '#dc2626',      // "?" in red
  RIGHT_ANGLE: '#1e40af',   // right-angle square
} as const

// ── Right-angle square marker ─────────────────────────────────────────────────
/** Draws a small square at the corner of two perpendicular directions. */
export function RightAngle({
  cx, cy,
  dx1, dy1,  // direction of side 1 (unit vector)
  dx2, dy2,  // direction of side 2 (unit vector)
  size = 8,
}: {
  cx: number; cy: number
  dx1: number; dy1: number
  dx2: number; dy2: number
  size?: number
}) {
  const p1 = { x: cx + dx1 * size, y: cy + dy1 * size }
  const p2 = { x: cx + dx1 * size + dx2 * size, y: cy + dy1 * size + dy2 * size }
  const p3 = { x: cx + dx2 * size, y: cy + dy2 * size }
  const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`
  return <path d={d} fill="none" stroke={COLOR.RIGHT_ANGLE} strokeWidth={1.5} />
}

// ── Default export ────────────────────────────────────────────────────────────
export default function PolygonAreaOSN20KQ9Illustration() {
  const poly = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Segi enam ABCDEF dengan FE sejajar CD. ' +
        'Sisi diketahui: FE=9 cm, FA=25 cm, AB=15 cm, BC=13 cm. ' +
        'Luas daerah = 366 cm². Tentukan panjang CD.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* polygon fill */}
        <polygon
          points={poly}
          fill={COLOR.FILL}
          stroke={COLOR.STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* dashed construction line E→B */}
        <line
          x1={E.x} y1={E.y}
          x2={B.x} y2={B.y}
          stroke={COLOR.DASHED}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />

        {/* Right-angle marker at F: FA goes down (0,1), FE goes right (1,0) */}
        <RightAngle cx={F.x} cy={F.y} dx1={0} dy1={1} dx2={1} dy2={0} />

        {/* Right-angle marker at E: EF goes left (-1,0), EB goes down (0,1) */}
        <RightAngle cx={E.x} cy={E.y} dx1={-1} dy1={0} dx2={0} dy2={1} />

        {/* ── Dimension labels ─────────────────────────────────── */}

        {/* FA = 25, on left side */}
        <text
          x={F.x - 14}
          y={(F.y + A.y) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          25
        </text>

        {/* FE = 9, above top */}
        <text
          x={(F.x + E.x) / 2}
          y={F.y - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          9
        </text>

        {/* AB = 15, along diagonal left of center */}
        <text
          x={(A.x + B.x) / 2 - 10}
          y={(A.y + B.y) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          15
        </text>

        {/* BC = 13, along diagonal right of center */}
        <text
          x={(B.x + C.x) / 2 + 11}
          y={(B.y + C.y) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          13
        </text>

        {/* CD = ? below bottom line */}
        <text
          x={(C.x + D.x) / 2}
          y={D.y + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={900}
          fill={COLOR.QUESTION}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ?
        </text>

        {/* ── Vertex labels ─────────────────────────────────────── */}
        {[
          { pt: F, label: 'F', dx: -10, dy: -2 },
          { pt: E, label: 'E', dx: 10,  dy: -2 },
          { pt: A, label: 'A', dx: -10, dy: 8  },
          { pt: B, label: 'B', dx: 10,  dy: 0  },
          { pt: C, label: 'C', dx: 0,   dy: 12 },
          { pt: D, label: 'D', dx: 10,  dy: 8  },
        ].map(({ pt, label, dx, dy }) => (
          <text
            key={label}
            x={pt.x + dx}
            y={pt.y + dy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
