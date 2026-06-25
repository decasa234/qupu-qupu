// OSN 2010 SD Kabupaten Q22 — square s = 4r with two semicircular notches
// cut into the left and right sides (each radius r = 10 cm). Shaded region
// is the square minus the two semicircles: s² − πr² = 1600 − 314 = 1286 cm².
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2010.imgs/009.jpg
// No primitive covers this shape; built as fresh SVG geometry.

export type ConcavePhase = 'problem' | 'square' | 'circles' | 'result'

export interface ConcaveSquareFigureProps {
  phase?: ConcavePhase
  lang?: 'en' | 'id'
}

// ── Layout constants ─────────────────────────────────────────────────────────
const VB  = 200           // viewBox side length
const PAD = 20            // padding on all sides
const S   = VB - 2 * PAD // 160 px = square side (represents s = 40 cm)
const R   = S / 4         // 40 px = semicircle radius (r = s/4 = 10 cm)

const X0 = PAD            // 20  = left edge of square
const X1 = PAD + S        // 180 = right edge of square
const Y0 = PAD            // 20  = top edge
const Y1 = PAD + S        // 180 = bottom edge
const CX = (X0 + X1) / 2 // 100 = horizontal centre
const CY = (Y0 + Y1) / 2 // 100 = vertical centre
const AY0 = CY - R        // 60  = top of arc zone
const AY1 = CY + R        // 140 = bottom of arc zone

// Shaded concave-square path (clockwise winding):
//   top edge → right side (straight + inward arc + straight) → bottom → left side.
const SHADED_PATH = [
  `M ${X0} ${Y0}`,
  `L ${X1} ${Y0}`,
  `L ${X1} ${AY0}`,
  `A ${R} ${R} 0 0 0 ${X1} ${AY1}`, // right arc CCW → curves left (inward)
  `L ${X1} ${Y1}`,
  `L ${X0} ${Y1}`,
  `L ${X0} ${AY1}`,
  `A ${R} ${R} 0 0 1 ${X0} ${AY0}`, // left arc CW → curves right (inward)
  'Z',
].join(' ')

// Full square (used for square-area highlight in phase = 'square')
const SQUARE_PATH = `M ${X0} ${Y0} L ${X1} ${Y0} L ${X1} ${Y1} L ${X0} ${Y1} Z`

// Left semicircle region (CW arc from AY0 to AY1 along left edge)
const L_SEMI = `M ${X0} ${AY0} A ${R} ${R} 0 0 1 ${X0} ${AY1} Z`
// Right semicircle region (CCW arc from AY0 to AY1 along right edge)
const R_SEMI = `M ${X1} ${AY0} A ${R} ${R} 0 0 0 ${X1} ${AY1} Z`

/** Shared SVG figure — imported by the explainer. */
export function ConcaveSquareFigure({ phase = 'problem', lang = 'id' }: ConcaveSquareFigureProps) {
  const showSquare   = phase === 'square'
  const showCircles  = phase === 'circles'
  const showResult   = phase === 'result'

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Square outline — visible only in 'square' phase */}
      {showSquare && (
        <path
          d={SQUARE_PATH}
          fill="#DBEAFE"
          stroke="#2563EB"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          opacity={0.6}
        />
      )}

      {/* Main shaded region */}
      <path
        d={SHADED_PATH}
        fill={showResult ? '#D1FAE5' : '#FEF3C7'}
        stroke="#1E40AF"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Semicircle highlight — visible only in 'circles' phase */}
      {showCircles && (
        <>
          <path d={L_SEMI} fill="#FEE2E2" stroke="#DC2626" strokeWidth={1.5} opacity={0.85} />
          <path d={R_SEMI} fill="#FEE2E2" stroke="#DC2626" strokeWidth={1.5} opacity={0.85} />
          {/* "r" label inside left semi */}
          <line x1={X0} y1={CY} x2={X0 + R} y2={CY} stroke="#DC2626" strokeWidth={1.5} />
          <text
            x={X0 + R / 2}
            y={CY - 6}
            textAnchor="middle"
            fontSize={11}
            fontStyle="italic"
            fill="#DC2626"
          >
            r
          </text>
        </>
      )}

      {/* "s" dimension labels */}
      <text
        x={CX}
        y={Y0 - 6}
        textAnchor="middle"
        fontSize={13}
        fontStyle="italic"
        fontWeight={600}
        fill="#374151"
      >
        s
      </text>
      <text
        x={CX}
        y={Y1 + 16}
        textAnchor="middle"
        fontSize={13}
        fontStyle="italic"
        fontWeight={600}
        fill="#374151"
      >
        s
      </text>

      {/* Phase annotation text */}
      {showSquare && (
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#1E40AF"
        >
          {lang === 'id' ? 's × s = 1.600 cm²' : 's × s = 1,600 cm²'}
        </text>
      )}
      {showCircles && (
        <text
          x={CX}
          y={CY + R + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={700}
          fill="#DC2626"
        >
          {'π × r² = 314 cm²'}
        </text>
      )}
      {showResult && (
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill="#065F46"
        >
          {lang === 'id' ? '1.286 cm²' : '1,286 cm²'}
        </text>
      )}
    </svg>
  )
}

export default function ConcaveSquareOSN10KQ22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Persegi dengan sisi s = 4r = 40 cm dan dua setengah lingkaran cekung di sisi kiri dan kanan (r = 10 cm). Tentukan luas daerah yang diarsir."
    >
      <ConcaveSquareFigure phase="problem" />
    </div>
  )
}
