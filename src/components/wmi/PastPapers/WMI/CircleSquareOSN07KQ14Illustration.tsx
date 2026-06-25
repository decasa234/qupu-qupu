// OSN-07-SD-KAB-Q14 — Circle centred at a corner of square DEFG.
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2007.imgs/012.jpg
//
// Problem (id): "Pada gambar di bawah, F adalah titik pusat lingkaran.
//   Luas persegi DEFG adalah 4 satuan luas. Luas lingkaran tersebut adalah … satuan luas."
// Problem (en): "In the figure below, F is the centre of the circle.
//   The area of square DEFG is 4 square units. What is the area of the circle?"
//
// Seed answer: 2π  (_low_confidence — see seed note for alternate readings)
//
// FIGURE (source image): Square DEFG — D top-left, E top-right, F bottom-right,
//   G bottom-left. F is the centre of a circle. Side = √4 = 2 units. The circle
//   passes through the two vertices adjacent to F (E and G, both at distance 2).
//
// Solution path used in explainer (seed): radius = √2 (F to centre of square),
//   so area = π(√2)² = 2π.  (NOTE: r = side = 2 gives 4π for the drawn figure.)
//
// Co-exports CircleSquareFigure — used by the explainer.
// SSR-safe: no hooks, no framer-motion, no window/document/Date/random.

// ── layout constants ──────────────────────────────────────────────────────
const SCALE = 60          // px per unit
const SIDE  = 2 * SCALE   // 120 px

// F (circle centre = bottom-right corner of square) placed so the circle fits.
const FX = 200, FY = 200
const EX = FX,       EY = FY - SIDE   // top-right
const DX = FX - SIDE, DY = FY - SIDE  // top-left
const GX = FX - SIDE, GY = FY         // bottom-left

// Centre of the square (= midpoint of diagonal DF; distance √2 units from F).
export const SQ_CX = FX - SIDE / 2   // 140
export const SQ_CY = FY - SIDE / 2   // 140

// Radius as drawn in the source image: passes through E and G (adjacent vertices).
export const R_DRAWN = SIDE           // 120 px  → visual r = 2 units

const VW = 340, VH = 340

const INK  = '#374151'
const CIRC = '#1E3A5F'
const FILL_SQ = '#FFFBEB'

// ── primitive (reused by explainer) ──────────────────────────────────────
export interface CircleSquareFigureProps {
  /** Show the radius annotation line from F to squareCentre. Default false. */
  showRadiusLine?: boolean
  /** Highlight circle stroke (for the explainer beats). Default false. */
  highlightCircle?: boolean
  /** Highlight one side of the square to indicate "side = 2". Default: none. */
  highlightSide?: 'EF' | 'FG' | null
  /** Override circle radius in px. Default: R_DRAWN (120 px). */
  circleR?: number
}

export function CircleSquareFigure({
  showRadiusLine  = false,
  highlightCircle = false,
  highlightSide   = null,
  circleR         = R_DRAWN,
}: CircleSquareFigureProps) {
  const circleStroke = highlightCircle ? '#E74C3C' : CIRC
  const circleWidth  = highlightCircle ? 2.5 : 2

  const sideEF: [number,number,number,number] = [EX, EY, FX, FY]
  const sideFG: [number,number,number,number] = [FX, FY, GX, GY]

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VW} height={VH} fill="#FAFAFA" />

      {/* circle */}
      <circle
        cx={FX} cy={FY} r={circleR}
        fill="rgba(30,58,95,0.07)"
        stroke={circleStroke}
        strokeWidth={circleWidth}
      />

      {/* square body */}
      <polygon
        points={`${DX},${DY} ${EX},${EY} ${FX},${FY} ${GX},${GY}`}
        fill={FILL_SQ}
        stroke={INK}
        strokeWidth={2}
      />

      {/* highlighted side */}
      {highlightSide === 'EF' && (
        <line x1={sideEF[0]} y1={sideEF[1]} x2={sideEF[2]} y2={sideEF[3]}
          stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
      )}
      {highlightSide === 'FG' && (
        <line x1={sideFG[0]} y1={sideFG[1]} x2={sideFG[2]} y2={sideFG[3]}
          stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
      )}

      {/* radius line from F to centre of square */}
      {showRadiusLine && (
        <>
          <line
            x1={FX} y1={FY} x2={SQ_CX} y2={SQ_CY}
            stroke="#E74C3C" strokeWidth={2.5} strokeDasharray="6 3"
          />
          <circle cx={SQ_CX} cy={SQ_CY} r={4}
            fill="#E74C3C" />
          <text
            x={(FX + SQ_CX) / 2 + 10}
            y={(FY + SQ_CY) / 2 + 4}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill="#E74C3C"
          >
            r = √2
          </text>
        </>
      )}

      {/* vertex labels */}
      <text x={DX - 14} y={DY + 5}  fontSize={15} fontWeight="bold" fill={INK}>D</text>
      <text x={EX + 6}  y={EY + 5}  fontSize={15} fontWeight="bold" fill={INK}>E</text>
      <text x={FX + 6}  y={FY + 5}  fontSize={15} fontWeight="bold" fill={INK}>F</text>
      <text x={GX - 14} y={GY + 5}  fontSize={15} fontWeight="bold" fill={INK}>G</text>

      {/* centre dot at F */}
      <circle cx={FX} cy={FY} r={4} fill={CIRC} />
    </svg>
  )
}

// ── default export: static illustration ──────────────────────────────────
export default function CircleSquareOSN07KQ14Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Persegi DEFG dengan F di sudut kanan bawah sebagai pusat lingkaran. Lingkaran melewati titik E dan G yang bersebelahan dengan F. Luas persegi adalah 4 satuan luas."
    >
      <CircleSquareFigure />
    </div>
  )
}
