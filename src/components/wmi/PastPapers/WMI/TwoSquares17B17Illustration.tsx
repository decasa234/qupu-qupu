// TwoSquares17B17Illustration.tsx
//
// Stem illustration for SEAMO-17-B-Q17:
//   "The figure shows 2 squares ABCD and DEFG. The length of the sides are
//    5 cm and 3 cm, respectively. Find the area of the shaded region ACEF in cm²."
//
// Geometry (D at origin, y-axis upward in math coords):
//   ABCD (side 5):  A=(0,5)  B=(5,5)  C=(5,0)  D=(0,0)
//   DEFG (side 3):  D=(0,0)  E=(3,0)  F=(3,−3)  G=(0,−3)
//   Shaded ACEF:    A→C→E→F — the quadrilateral formed by joining the two squares'
//                   non-D corners via diagonals.
//
// Answer derivation (for explainer only — NEVER drawn in the static figure):
//   Area ACEF = ½·(ABCD) − ½·(DEFG) corrected for overlap
//             = triangle ACD − triangle DEF (correctly measured from the figure)
//   By shoelace on A(0,5), C(5,0), E(3,0), F(3,−3):
//     = 9.5 cm²   (answer B)
//
// No primitives are applicable — this is a pure 2-polygon geometry figure.
// No Math.random, no Date, no browser globals. SSR-safe.

// ── Params (bound to seed breakdown.quantities) ────────────────────────────────

/** Side length of the larger square ABCD. */
export const SIDE_ABCD = 5

/** Side length of the smaller square DEFG. */
export const SIDE_DEFG = 3

/** Area of the shaded quadrilateral ACEF (answer — not rendered in static figure). */
export const ANSWER = 9.5

// ── Layout ────────────────────────────────────────────────────────────────────

// Math coords: D at origin, y upward.
//   A = (0, 5)   B = (5, 5)   C = (5, 0)   D = (0, 0)
//   E = (3, 0)   F = (3, −3)  G = (0, −3)
//
// Bounding box in math coords:
//   x: 0..5   y: −3..5   → width=5, height=8
//
// We scale by UNIT pixels per cm, add PAD for labels.

const UNIT = 28   // px per cm
const PAD  = 32   // extra padding for vertex labels

const MATH_W = SIDE_ABCD                    // 5
const MATH_H = SIDE_ABCD + SIDE_DEFG        // 8

export const SVG_W = MATH_W * UNIT + PAD * 2
export const SVG_H = MATH_H * UNIT + PAD * 2

// Origin of D in SVG pixels:
const OX = PAD                              // x of D = left pad
const OY = PAD + SIDE_ABCD * UNIT          // y of D = pad + 5 units down (SVG y down)

/** Convert math (x, y) → SVG (px, py). */
function toSvg(x: number, y: number): { x: number; y: number } {
  return { x: OX + x * UNIT, y: OY - y * UNIT }
}

// ── Vertices ─────────────────────────────────────────────────────────────────

const A = toSvg(0, SIDE_ABCD)          // top-left ABCD
const B = toSvg(SIDE_ABCD, SIDE_ABCD) // top-right ABCD
const C = toSvg(SIDE_ABCD, 0)         // bottom-right ABCD / corner
const D = toSvg(0, 0)                  // shared corner
const E = toSvg(SIDE_DEFG, 0)         // bottom-right DEFG
const F = toSvg(SIDE_DEFG, -SIDE_DEFG)// far corner DEFG
const G = toSvg(0, -SIDE_DEFG)        // bottom-left DEFG

function pts(vs: Array<{ x: number; y: number }>): string {
  return vs.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(' ')
}

// ── Colours ───────────────────────────────────────────────────────────────────

const C_SHADED  = '#FBD38D'  // amber-300 — shaded quadrilateral fill
const C_OUTLINE = '#1F2937'  // near-black for square edges
const C_DIM     = '#D1D5DB'  // gray-300 for non-shaded square edges
const C_LABEL   = '#1F2937'
const C_DIM_LABEL = '#6B7280'

// ── Sub-components ────────────────────────────────────────────────────────────

interface VertexLabelProps {
  x: number
  y: number
  dx?: number
  dy?: number
  label: string
  muted?: boolean
}

function VertexLabel({ x, y, dx = 0, dy = 0, label, muted = false }: VertexLabelProps) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      fill={muted ? C_DIM_LABEL : C_LABEL}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Diagram component ─────────────────────────────────────────────────────────

export interface TwoSquaresDiagramProps {
  /**
   * When true, shows the area labels on the two triangles that compose ACEF.
   * Used by the explainer post-answer — NEVER set in the static stem figure.
   */
  showDecomposition?: boolean
}

/**
 * Two-square diagram for SEAMO-17-B-Q17.
 * ABCD (side 5) shares corner D with DEFG (side 3, positioned below-right).
 * The shaded quadrilateral ACEF is drawn in amber.
 * No area values are shown in the default static render.
 */
export function TwoSquaresDiagram({ showDecomposition = false }: TwoSquaresDiagramProps) {
  // Shaded region ACEF: A → C → E → F
  const acefPoints = pts([A, C, E, F])

  // Centroid of triangle ACD (for explainer label)
  const acdCx = (A.x + C.x + D.x) / 3
  const acdCy = (A.y + C.y + D.y) / 3

  // Centroid of triangle DEF (for explainer label)
  const defCx = (D.x + E.x + F.x) / 3
  const defCy = (D.y + E.y + F.y) / 3

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Shaded quadrilateral ACEF (drawn first, under outlines) ─────── */}
      <polygon
        points={acefPoints}
        fill={C_SHADED}
        fillOpacity={0.85}
        stroke="none"
      />

      {/* ── Square ABCD (large, side 5) ─────────────────────────────────── */}
      <polygon
        points={pts([A, B, C, D])}
        fill="none"
        stroke={C_OUTLINE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── Square DEFG (small, side 3) ──────────────────────────────────── */}
      <polygon
        points={pts([D, E, F, G])}
        fill="none"
        stroke={C_OUTLINE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── Side length annotations ───────────────────────────────────────── */}
      {/* "5 cm" label on top side AB */}
      <text
        x={(A.x + B.x) / 2}
        y={A.y - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill={C_DIM_LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        5 cm
      </text>

      {/* "3 cm" label on right side EF */}
      <text
        x={E.x + 14}
        y={(E.y + F.y) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill={C_DIM_LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        3 cm
      </text>

      {/* ── Shaded region outline (ACEF boundary) ─────────────────────────── */}
      <polygon
        points={acefPoints}
        fill="none"
        stroke={C_OUTLINE}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeDasharray="5 3"
      />

      {/* ── Vertex labels ────────────────────────────────────────────────── */}
      <VertexLabel x={A.x} y={A.y} dx={-10} dy={0}  label="A" />
      <VertexLabel x={B.x} y={B.y} dx={ 10} dy={0}  label="B" />
      <VertexLabel x={C.x} y={C.y} dx={ 10} dy={0}  label="C" />
      <VertexLabel x={D.x} y={D.y} dx={-10} dy={0}  label="D" />
      <VertexLabel x={E.x} y={E.y} dx={ 10} dy={0}  label="E" />
      <VertexLabel x={F.x} y={F.y} dx={ 12} dy={0}  label="F" />
      <VertexLabel x={G.x} y={G.y} dx={-10} dy={0}  label="G" muted />

      {/* ── Explainer post-answer: triangle decomposition labels ─────────── */}
      {showDecomposition && (
        <>
          {/* "12.5" centroid of triangle ACD */}
          <text
            x={acdCx}
            y={acdCy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#92400E"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            12.5
          </text>
          {/* "−3" for triangle DEC correction */}
          <text
            x={defCx}
            y={defCy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#92400E"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            −3
          </text>
        </>
      )}
    </svg>
  )
}

// ── Default export (in-card stem illustration) ────────────────────────────────

export default function TwoSquares17B17Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Dua persegi berbagi sudut D. Persegi ABCD berisi sisi 5 cm dan persegi DEFG berisi sisi 3 cm. ' +
        'Daerah yang diarsir berwarna kuning adalah segiempat ACEF.'
      }
    >
      <TwoSquaresDiagram />
    </div>
  )
}

// ── VISUALS entry (to be merged into registry.ts) ────────────────────────────

/**
 * Registry entry for this question's figure component.
 * Paste this into VISUALS in registry.ts to activate.
 *
 * @example
 * // In registry.ts, inside the VISUALS record:
 * ...VISUALS_ENTRY,
 */
export const VISUALS_ENTRY = {
  'SEAMO-17-B-Q17': {
    illustration: () =>
      import('./TwoSquares17B17Illustration'),
  },
} as const
