// SEAMO-20-B-Q5 — Square with a diagonal, two shaded regions x and y.
//
// ABCD is a square with side 5 cm.
//   A = top-left   D = top-right
//   B = bottom-left  C = bottom-right
//
// BCE is a straight horizontal line (the base) extended right by CE = a.
// A separate diagonal line runs from A (top-left) to E (bottom-right),
// exiting the square at P on the right edge DC.
//
// Region x (inside square, upper-right): triangle A–D–P  (hatched orange)
// Region y (outside square, right of C):  triangle P–C–E (hatched orange)
//
// Answer: y – x = 5 → a = 7 cm  (choice A). The figure shows ONLY the problem
// (x, y labels with "?" implied); it does NOT reveal a = 7 or the equation.
//
// No imported primitive matches a plain-geometry shaded-region question;
// built from scratch following CompositeRect24G3Illustration and
// Angles23G3Illustration patterns (exported primitive + default wrapper).
//
// Pure render — no hooks, no framer-motion, SSR-safe & deterministic.

const INK = '#1F2937'
const SQUARE_STROKE = '#1F2937'
const HATCH_COLOR = '#D97706'   // amber-600, matching the scan's golden hatch
const HATCH_FILL_X = '#FEF3C7' // amber-100 base fill for x region
const HATCH_FILL_Y = '#FEF3C7' // amber-100 base fill for y region

// ── Coordinate system ───────────────────────────────────────────────────────
// Square side in SVG units. We choose 120 px ≈ 5 cm for clarity.
export const S = 120  // square side in SVG px (represents 5 cm)
// CE = a: we draw a = 7 (the answer) so that the hatched regions
// look proportionate, but we label it "a" not "7 cm".
const A_PX = 168     // 7 cm at the same scale (7/5 * 120 = 168)

// Square corners (B at origin for easy geometry)
// A(0,S) top-left, D(S,S) top-right, C(S,0) bottom-right, B(0,0) bottom-left
const Ax = 0,  Ay = S
const Dx = S,  Dy = S
const Bx = 0,  By = 0
const Cx = S,  Cy = 0
const Ex = S + A_PX, Ey = 0

// Exit point P of line AE on right edge (x = S):
// Line AE: parametric (t*(S+A_PX), S - S*t), at x=S → t = S/(S+A_PX)
// y_P = S - S*(S/(S+A_PX)) = S*A_PX/(S+A_PX)
const Py = (S * A_PX) / (S + A_PX)  // y coordinate of P (Px = S)
const Px = S

// Padding around the geometry for labels
const PAD_L = 44  // left: "5cm" label + vertex letters
const PAD_R = 40  // right: "a" label + "E"
const PAD_T = 32  // top: "A", "D" letters
const PAD_B = 28  // bottom: "B", "C", "E" letters + "5cm"

// Translate geometry into SVG space
const ox = PAD_L, oy = PAD_T  // offset: B is at (ox, oy+S)

function tx(x: number) { return ox + x }
function ty(y: number) { return oy + (S - y) }  // flip y (SVG y grows down)

// Named points in SVG space
const svgA = [tx(Ax), ty(Ay)] as const
const svgD = [tx(Dx), ty(Dy)] as const
const svgB = [tx(Bx), ty(By)] as const
const svgC = [tx(Cx), ty(Cy)] as const
const svgE = [tx(Ex), ty(Ey)] as const
const svgP = [tx(Px), ty(Py)] as const

const svgW = PAD_L + S + A_PX + PAD_R
const svgH = PAD_T + S + PAD_B

// ── Hatch pattern helper ─────────────────────────────────────────────────────
// Returns a <defs> pattern id for 45-degree diagonal hatching.
const HATCH_ID_X = 'hatch-x-20b5'
const HATCH_ID_Y = 'hatch-y-20b5'

function HatchDefs() {
  return (
    <defs>
      <pattern id={HATCH_ID_X} patternUnits="userSpaceOnUse" width={10} height={10}>
        <rect width={10} height={10} fill={HATCH_FILL_X} />
        <line x1={0} y1={10} x2={10} y2={0} stroke={HATCH_COLOR} strokeWidth={1.4} />
      </pattern>
      <pattern id={HATCH_ID_Y} patternUnits="userSpaceOnUse" width={10} height={10}>
        <rect width={10} height={10} fill={HATCH_FILL_Y} />
        <line x1={0} y1={10} x2={10} y2={0} stroke={HATCH_COLOR} strokeWidth={1.4} />
      </pattern>
    </defs>
  )
}

// ── Label helpers ────────────────────────────────────────────────────────────
function VertexLabel({ x, y, text, dx = 0, dy = 0 }: {
  x: number; y: number; text: string; dx?: number; dy?: number
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight={700}
      fontStyle="italic"
      fill={INK}
    >
      {text}
    </text>
  )
}

function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
      fontStyle="italic"
      fill={INK}
    >
      {text}
    </text>
  )
}

function RegionLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={18}
      fontWeight={700}
      fontStyle="italic"
      fill={INK}
    >
      {label}
    </text>
  )
}

// ── Exported primitive ───────────────────────────────────────────────────────
export interface ShadedSquareFigureProps {
  /** Show a numeric value for a instead of the letter "a" */
  showAValue?: number | null
  /** Highlight 'x', 'y', or null */
  highlightRegion?: 'x' | 'y' | null
}

/**
 * The square ABCD with diagonal AE, showing shaded regions x and y.
 * By default renders the plain problem figure (a as letter, no highlight).
 */
export function ShadedSquareFigure({
  showAValue = null,
  highlightRegion = null,
}: ShadedSquareFigureProps = {}) {
  const aLabel = showAValue != null ? `${showAValue} cm` : 'a'

  // Centroid of region x (triangle A–D–P) for label
  const xLabelX = (svgA[0] + svgD[0] + svgP[0]) / 3
  const xLabelY = (svgA[1] + svgD[1] + svgP[1]) / 3

  // Centroid of region y (triangle P–C–E) for label
  const yLabelX = (svgP[0] + svgC[0] + svgE[0]) / 3
  const yLabelY = (svgP[1] + svgC[1] + svgE[1]) / 3

  const xFill = highlightRegion === 'x'
    ? '#F59E0B'  // amber-400 (brighter) when highlighted
    : `url(#${HATCH_ID_X})`
  const yFill = highlightRegion === 'y'
    ? '#F59E0B'
    : `url(#${HATCH_ID_Y})`

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={Math.min(380, svgW)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <HatchDefs />

      {/* ── Square ABCD outline ── */}
      <rect
        x={tx(0)}
        y={ty(S)}
        width={S}
        height={S}
        fill="white"
        stroke={SQUARE_STROKE}
        strokeWidth={2.2}
      />

      {/* ── Shaded region x: triangle A–D–P ── */}
      <polygon
        points={`${svgA[0]},${svgA[1]} ${svgD[0]},${svgD[1]} ${svgP[0]},${svgP[1]}`}
        fill={xFill}
        stroke="none"
      />

      {/* ── Shaded region y: triangle P–C–E ── */}
      <polygon
        points={`${svgP[0]},${svgP[1]} ${svgC[0]},${svgC[1]} ${svgE[0]},${svgE[1]}`}
        fill={yFill}
        stroke="none"
      />

      {/* ── Square outline on top of shading ── */}
      <rect
        x={tx(0)}
        y={ty(S)}
        width={S}
        height={S}
        fill="none"
        stroke={SQUARE_STROKE}
        strokeWidth={2.2}
      />

      {/* ── Diagonal line A–E ── */}
      <line
        x1={svgA[0]} y1={svgA[1]}
        x2={svgE[0]} y2={svgE[1]}
        stroke={INK}
        strokeWidth={2}
      />

      {/* ── Baseline extension C–E ── */}
      <line
        x1={svgC[0]} y1={svgC[1]}
        x2={svgE[0]} y2={svgE[1]}
        stroke={INK}
        strokeWidth={2}
      />

      {/* ── Vertex labels ── */}
      <VertexLabel x={svgA[0]} y={svgA[1]} text="A" dx={-12} dy={-10} />
      <VertexLabel x={svgD[0]} y={svgD[1]} text="D" dx={12} dy={-10} />
      <VertexLabel x={svgB[0]} y={svgB[1]} text="B" dx={-12} dy={10} />
      <VertexLabel x={svgC[0]} y={svgC[1]} text="C" dx={0} dy={14} />
      <VertexLabel x={svgE[0]} y={svgE[1]} text="E" dx={12} dy={10} />

      {/* ── Dimension labels ── */}
      {/* "5cm" on left side (AB) */}
      <DimLabel
        x={tx(0) - 22}
        y={(svgA[1] + svgB[1]) / 2}
        text="5cm"
      />
      {/* "5cm" on bottom (BC) */}
      <DimLabel
        x={(svgB[0] + svgC[0]) / 2}
        y={svgB[1] + 18}
        text="5cm"
      />
      {/* "a" for CE */}
      <DimLabel
        x={(svgC[0] + svgE[0]) / 2}
        y={svgC[1] + 18}
        text={aLabel}
      />

      {/* ── Region labels x and y ── */}
      <RegionLabel x={xLabelX} y={xLabelY} label="x" />
      <RegionLabel x={yLabelX} y={yLabelY} label="y" />
    </svg>
  )
}

// ── Default export ───────────────────────────────────────────────────────────

const ARIA_LABEL =
  'Persegi ABCD dengan sisi 5 cm. Garis lurus BCE diperpanjang ke titik E di mana CE = a. ' +
  'Garis diagonal dari A ke E memotong sisi CD di titik P. ' +
  'Daerah yang diarsir x adalah segitiga ADP di dalam persegi, ' +
  'dan daerah yang diarsir y adalah segitiga PCE di luar persegi. ' +
  'Diketahui y − x = 5 cm², cari nilai a.'

export default function ShadedSquare20B5Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ARIA_LABEL}
    >
      <ShadedSquareFigure />
    </div>
  )
}
