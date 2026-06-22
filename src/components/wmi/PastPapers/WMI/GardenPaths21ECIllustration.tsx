// GardenPaths21ECIllustration.tsx
//
// IKMC 2022 Ecolier Q21 — stem illustration.
//
// Figure: a square garden (5 m × 5 m) sits to the upper-left of a rectangular
// garden (10 m × 5 m), sharing corner point A. Ahmad starts at A and walks the
// square (arrow pointing left); Zhaleh starts at A and walks the rectangle
// (arrow pointing right). The figure shows the two gardens with their
// dimensions and the walker glyphs — NOT the answer (3 laps).
//
// Exported primitives (GardenFigure) let the explainer reuse the same geometry.

const INK = '#1F2937'

// ---- colours -----------------------------------------------------------------
const FILL_GARDEN   = '#D1FAE5'  // pale green — garden fill
const STROKE_GARDEN = '#059669'  // emerald border
const FILL_PATH     = '#FEF3C7'  // light amber — path / ground around gardens
const LABEL_CLR     = INK
const ARROW_CLR     = '#DC2626'  // red arrows (matching scan)

// ---- scale -------------------------------------------------------------------
// 1 m = PX_PER_M pixels in the SVG coordinate space.
export const PX_PER_M = 28

// ---- garden dimensions (metres) ---------------------------------------------
export const SQ_SIDE_M = 5          // square garden side
export const RECT_W_M  = 10         // rectangle garden width
export const RECT_H_M  = 5          // rectangle garden height

// ---- pixel sizes ------------------------------------------------------------
const sqSide = SQ_SIDE_M * PX_PER_M   // 140 px
const rectW  = RECT_W_M  * PX_PER_M   // 280 px
const rectH  = RECT_H_M  * PX_PER_M   // 140 px

// ---- SVG layout --------------------------------------------------------------
// We place point A at the junction:
//   • Square garden: top-left corner at (PAD_L, PAD_T),  bottom-right = A
//   • Rectangle garden: top-left = A, bottom-right = A + (rectW, rectH)
// Both gardens share the same height (5 m), so the tops align and the
// bottoms align. A is the top-right of the square = top-left of the rectangle.
const PAD_L = 40   // left space for "5m" vertical label on square
const PAD_T = 30   // top space for "5m" horizontal label on square
const PAD_R = 20   // right margin
const PAD_B = 36   // bottom space for "10m" label on rectangle

// Square garden: origin at (PAD_L, PAD_T)
const sqX = PAD_L
const sqY = PAD_T

// Point A — the shared corner:
export const AX = sqX + sqSide        // right side of square = left side of rect
export const AY = sqY + sqSide        // bottom of both (both are 5 m tall)

// Rectangle garden: top-left = (AX, sqY)
const rectX = AX
const rectY = sqY

const svgW = PAD_L + sqSide + rectW + PAD_R
const svgH = PAD_T + sqSide + PAD_B

// ---- helpers -----------------------------------------------------------------
function Tick({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LABEL_CLR} strokeWidth={1.2} />
}

function DimLabel({ x, y, text, fontSize = 12 }: { x: number; y: number; text: string; fontSize?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={700}
      fontStyle="italic"
      fill={LABEL_CLR}
    >
      {text}
    </text>
  )
}

// Small arrowhead pointing left (‹) or right (›).
function Arrow({ cx, cy, dir }: { cx: number; cy: number; dir: 'left' | 'right' }) {
  const hw = 7  // half-width of arrowhead
  const hh = 5  // half-height
  const pts =
    dir === 'left'
      ? `${cx - hw},${cy} ${cx + hw},${cy - hh} ${cx + hw},${cy + hh}`
      : `${cx + hw},${cy} ${cx - hw},${cy - hh} ${cx - hw},${cy + hh}`
  return <polygon points={pts} fill={ARROW_CLR} />
}

// Simplified walker glyph: head (circle) + body (line) + legs (two lines).
function Walker({ x, y, dir }: { x: number; y: number; dir: 'left' | 'right' }) {
  const flip = dir === 'left' ? -1 : 1
  const headR = 5
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* head */}
      <circle cx={0} cy={-headR * 2 - 4} r={headR} fill="#F9A8D4" stroke={INK} strokeWidth={1} />
      {/* body */}
      <line x1={0} y1={-headR} x2={0} y2={10} stroke={INK} strokeWidth={1.5} />
      {/* arms */}
      <line x1={-6 * flip} y1={0} x2={6 * flip} y2={-4} stroke={INK} strokeWidth={1.2} />
      {/* legs */}
      <line x1={0} y1={10} x2={-4 * flip} y2={20} stroke={INK} strokeWidth={1.2} />
      <line x1={0} y1={10} x2={4 * flip} y2={20} stroke={INK} strokeWidth={1.2} />
    </g>
  )
}

// ---- exported figure primitive -----------------------------------------------

export interface GardenFigureProps {
  /** Optional: highlight the square perimeter path. */
  highlightSquare?: boolean
  /** Optional: highlight the rectangle perimeter path. */
  highlightRect?: boolean
  /** Optional: show lap count for Ahmad (square). */
  ahmadLaps?: number
  /** Optional: show lap count for Zhaleh (rectangle). */
  zhalehLaps?: number
  /** Omit walkers (e.g., when showing the perimeter calculation). */
  hideWalkers?: boolean
}

export function GardenFigure({
  highlightSquare,
  highlightRect,
  ahmadLaps,
  zhalehLaps,
  hideWalkers,
}: GardenFigureProps) {
  const tickLen = 4

  // Square dimension lines
  const sqTop_Y   = sqY - 10
  const sqLeft_X  = sqX - 14

  // Rectangle dimension lines
  const rectBot_Y = rectY + rectH + 14
  const rectRight_X = rectX + rectW + 14

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={Math.min(380, svgW)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- background / ground ---- */}
      <rect x={0} y={0} width={svgW} height={svgH} fill={FILL_PATH} />

      {/* ---- square garden ---- */}
      <rect
        x={sqX}
        y={sqY}
        width={sqSide}
        height={sqSide}
        fill={FILL_GARDEN}
        stroke={highlightSquare ? '#F59E0B' : STROKE_GARDEN}
        strokeWidth={highlightSquare ? 3.5 : 2}
      />

      {/* ---- rectangle garden ---- */}
      <rect
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        fill={FILL_GARDEN}
        stroke={highlightRect ? '#F59E0B' : STROKE_GARDEN}
        strokeWidth={highlightRect ? 3.5 : 2}
      />

      {/* ---- tree glyphs inside gardens (simplified circles) ---- */}
      {[
        [sqX + 20, sqY + 25], [sqX + 55, sqY + 20], [sqX + 100, sqY + 28],
        [sqX + 18, sqY + 72], [sqX + 75, sqY + 68], [sqX + 110, sqY + 75],
        [sqX + 40, sqY + 105], [sqX + 85, sqY + 108],
      ].map(([tx, ty], i) => (
        <g key={`sq-tree-${i}`}>
          <circle cx={tx} cy={ty} r={8} fill="#16A34A" opacity={0.55} />
          <circle cx={tx} cy={ty! - 4} r={5} fill="#15803D" opacity={0.65} />
        </g>
      ))}
      {[
        [rectX + 25, rectY + 25], [rectX + 80, rectY + 20], [rectX + 180, rectY + 28], [rectX + 240, rectY + 22],
        [rectX + 30, rectY + 95], [rectX + 100, rectY + 90], [rectX + 200, rectY + 95], [rectX + 255, rectY + 90],
      ].map(([tx, ty], i) => (
        <g key={`rect-tree-${i}`}>
          <circle cx={tx} cy={ty} r={8} fill="#16A34A" opacity={0.55} />
          <circle cx={tx} cy={ty! - 4} r={5} fill="#15803D" opacity={0.65} />
        </g>
      ))}

      {/* ---- lake in the rectangle (ellipse) ---- */}
      <ellipse cx={rectX + 155} cy={rectY + 63} rx={42} ry={24} fill="#7DD3FC" opacity={0.75} />

      {/* ---- point A label ---- */}
      <circle cx={AX} cy={AY} r={3.5} fill={INK} />
      <text x={AX - 4} y={AY + 14} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK}>
        A
      </text>

      {/* ---- walkers + direction arrows ---- */}
      {!hideWalkers && (
        <>
          {/* Ahmad at A going left (around the square) */}
          <Walker x={AX - 22} y={AY - 30} dir="left" />
          <Arrow cx={AX - 36} cy={AY - 20} dir="left" />

          {/* Zhaleh at A going right (around the rectangle) */}
          <Walker x={AX + 22} y={AY - 30} dir="right" />
          <Arrow cx={AX + 36} cy={AY - 20} dir="right" />
        </>
      )}

      {/* ---- lap counters (shown by explainer) ---- */}
      {ahmadLaps != null && (
        <text
          x={sqX + sqSide / 2}
          y={sqY + sqSide / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill="#B45309"
        >
          ×{ahmadLaps}
        </text>
      )}
      {zhalehLaps != null && (
        <text
          x={rectX + rectW / 2}
          y={rectY + rectH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill="#B45309"
        >
          ×{zhalehLaps}
        </text>
      )}

      {/* ---- dimension lines: square ---- */}
      {/* top edge of square: "5m" */}
      <line x1={sqX} y1={sqTop_Y} x2={sqX + sqSide} y2={sqTop_Y} stroke={LABEL_CLR} strokeWidth={1.2} />
      <Tick x1={sqX}          y1={sqTop_Y - tickLen} x2={sqX}          y2={sqTop_Y + tickLen} />
      <Tick x1={sqX + sqSide} y1={sqTop_Y - tickLen} x2={sqX + sqSide} y2={sqTop_Y + tickLen} />
      <DimLabel x={sqX + sqSide / 2} y={sqTop_Y - 10} text="5m" />

      {/* left side of square: "5m" */}
      <line x1={sqLeft_X} y1={sqY} x2={sqLeft_X} y2={sqY + sqSide} stroke={LABEL_CLR} strokeWidth={1.2} />
      <Tick x1={sqLeft_X - tickLen} y1={sqY}          x2={sqLeft_X + tickLen} y2={sqY} />
      <Tick x1={sqLeft_X - tickLen} y1={sqY + sqSide} x2={sqLeft_X + tickLen} y2={sqY + sqSide} />
      <DimLabel x={sqLeft_X - 10} y={sqY + sqSide / 2} text="5m" />

      {/* ---- dimension lines: rectangle ---- */}
      {/* bottom edge of rect: "10m" */}
      <line x1={rectX} y1={rectBot_Y} x2={rectX + rectW} y2={rectBot_Y} stroke={LABEL_CLR} strokeWidth={1.2} />
      <Tick x1={rectX}         y1={rectBot_Y - tickLen} x2={rectX}         y2={rectBot_Y + tickLen} />
      <Tick x1={rectX + rectW} y1={rectBot_Y - tickLen} x2={rectX + rectW} y2={rectBot_Y + tickLen} />
      <DimLabel x={rectX + rectW / 2} y={rectBot_Y + 12} text="10m" />

      {/* right side of rect: "5m" */}
      <line x1={rectRight_X} y1={rectY} x2={rectRight_X} y2={rectY + rectH} stroke={LABEL_CLR} strokeWidth={1.2} />
      <Tick x1={rectRight_X - tickLen} y1={rectY}         x2={rectRight_X + tickLen} y2={rectY} />
      <Tick x1={rectRight_X - tickLen} y1={rectY + rectH} x2={rectRight_X + tickLen} y2={rectY + rectH} />
      <DimLabel x={rectRight_X + 12} y={rectY + rectH / 2} text="5m" />
    </svg>
  )
}

// ---- default export -----------------------------------------------------------

export default function GardenPaths21ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Taman persegi (5m × 5m) di kiri dan taman persegi panjang (10m × 5m) di kanan, bertemu di titik A. Ahmad berjalan mengelilingi persegi (panah ke kiri), Zhaleh mengelilingi persegi panjang (panah ke kanan)."
    >
      <GardenFigure />
    </div>
  )
}
