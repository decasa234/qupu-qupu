// OSN-24-SD-NAS-TEORI1-Q18 — Two circles, external tangent from midpoint T.
// Source: docs/reference/ocr-res/osn/nasional/sd/2024-teori1.imgs/008.jpg
//
// Problem (id): "Diketahui lingkaran dengan titik pusat A dan B berturut-turut
//   berjari-jari 4 cm dan 3 cm. Jika T titik tengah ruas garis AB dan jarak
//   dua titik pusat lingkaran 10 cm, maka luas daerah yang diarsir adalah … cm²."
// Problem (en): "Circles with centres A and B have radii 4 cm and 3 cm. T is the
//   midpoint of AB; the distance between centres is 10 cm. Find the hatched area."
//
// Answer: 24 cm²
//
// Geometry (25 px per cm):
//   A = (110, 150), rA = 100 px (4 cm)
//   B = (360, 150), rB =  75 px (3 cm)
//   T = (235, 150)  [midpoint, AT = BT = 5 cm]
//   Tangent points from T:
//     P1 = (190,  90) — upper on circle A   [AT=5, rA=4 → tan=3; 3-4-5]
//     P4 = (190, 210) — lower on circle A
//     P2 = (315,  90) — upper on circle B   [BT=5, rB=3 → tan=4; 3-4-5]
//     P3 = (315, 210) — lower on circle B
//   P1 P2 P3 P4 form a rectangle:
//     width = 315 − 190 = 125 px = 5 cm
//     height = 210 − 90  = 120 px = 4.8 cm
//     area = 5 × 4.8 = 24 cm²  ✓
//
// Co-exports TwoCirclesTangentFigure — shared with the explainer.
// SSR-safe: no hooks, no framer-motion, no window/document/Date/random.

// ── layout constants ──────────────────────────────────────────────────────
const AX = 110, AY = 150     // centre of circle A
const BX = 360, BY = 150     // centre of circle B
const RA = 100                // 4 cm × 25 px/cm
const RB = 75                 // 3 cm × 25 px/cm
const TX = 235, TY = 150     // midpoint T

// Tangent points (exact geometry — see header comment)
const P1X = 190, P1Y = 90    // upper on A
const P4X = 190, P4Y = 210   // lower on A
const P2X = 315, P2Y = 90    // upper on B
const P3X = 315, P3Y = 210   // lower on B

const VW = 490, VH = 300

// ── colours ──────────────────────────────────────────────────────────────
const INK   = '#374151'
const CIRC  = '#1E3A5F'
const SHADE = 'rgba(99,102,241,0.18)'
const HATCH = '#6366F1'
const GREEN = '#059669'
const AMBER = '#D97706'

// ── right-angle mark helper ───────────────────────────────────────────────
// Returns polygon points for a right-angle mark at (px,py).
// inR = unit vector from tangent-point TOWARD the circle centre (inward radius dir).
// inT = unit vector from tangent-point TOWARD T (tangent direction).
// s   = size of the square in px.
function raPoints(
  px: number, py: number,
  irx: number, iry: number,  // inward radius direction (toward centre)
  itx: number, ity: number,  // toward T direction
  s: number = 7,
): string {
  const c1x = px + s * irx, c1y = py + s * iry
  const c2x = px + s * itx, c2y = py + s * ity
  const c3x = c1x + s * itx, c3y = c1y + s * ity
  return `${px},${py} ${c1x},${c1y} ${c3x},${c3y} ${c2x},${c2y}`
}

// Precomputed unit vectors for each tangent point.
// At P1 (upper A): inward-to-A = (-0.8,0.6), toward-T = (0.6,0.8)
const RA_P1 = raPoints(P1X, P1Y, -0.8,  0.6,  0.6, 0.8)
// At P4 (lower A): inward-to-A = (-0.8,-0.6), toward-T = (0.6,-0.8)
const RA_P4 = raPoints(P4X, P4Y, -0.8, -0.6,  0.6, -0.8)
// At P2 (upper B): inward-to-B = (0.6,0.8), toward-T = (-0.8,0.6)
const RA_P2 = raPoints(P2X, P2Y,  0.6,  0.8, -0.8, 0.6)
// At P3 (lower B): inward-to-B = (0.6,-0.8), toward-T = (-0.8,-0.6)
const RA_P3 = raPoints(P3X, P3Y,  0.6, -0.8, -0.8, -0.6)

// ── shared primitive ──────────────────────────────────────────────────────
export interface TwoCirclesTangentFigureProps {
  /** Hatch / shade the rectangle P1P2P3P4. Default true. */
  showHatch?: boolean
  /** Show dashed radii from A to P1,P4 and B to P2,P3. Default true. */
  showRadii?: boolean
  /** Show right-angle marks at all four tangent points. Default true. */
  showRightAngles?: boolean
  /** Show the straight tangent lines (rectangle sides). Default true. */
  showTangentLines?: boolean
  /** Highlight the rectangle border in amber. Default false. */
  highlightRect?: boolean
  /** Show dimension labels (r=4, r=3, AB=10, AT=TB=5). Default false. */
  showDimensions?: boolean
  /** Show A, B, T labels. Default true. */
  showPointLabels?: boolean
  /** Highlight radii of circle A in colour. Default false. */
  highlightRadiiA?: boolean
  /** Highlight radii of circle B in colour. Default false. */
  highlightRadiiB?: boolean
  /** Highlight only the shaded rectangle (bolder border). Default false. */
  highlightShaded?: boolean
}

export function TwoCirclesTangentFigure({
  showHatch         = true,
  showRadii         = true,
  showRightAngles   = true,
  showTangentLines  = true,
  highlightRect     = false,
  showDimensions    = false,
  showPointLabels   = true,
  highlightRadiiA   = false,
  highlightRadiiB   = false,
  highlightShaded   = false,
}: TwoCirclesTangentFigureProps) {

  const radiiAColor = highlightRadiiA ? GREEN  : INK
  const radiiBColor = highlightRadiiB ? AMBER  : INK
  const rectStroke  = highlightRect   ? AMBER  : HATCH
  const rectWidth   = highlightRect || highlightShaded ? 3 : 1.5
  const hatchFill   = highlightShaded ? 'rgba(99,102,241,0.30)' : SHADE

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* hatch pattern */}
      <defs>
        <pattern id="tcq18hatch" patternUnits="userSpaceOnUse" width="10" height="10"
          patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10"
            stroke={HATCH} strokeWidth="1.4" strokeOpacity="0.5" />
        </pattern>
      </defs>

      <rect width={VW} height={VH} fill="#FAFAF9" />

      {/* ── hatched rectangle ─────────────────────────────────────────── */}
      {showHatch && (
        <rect
          x={P1X} y={P1Y}
          width={P2X - P1X} height={P4Y - P1Y}
          fill="url(#tcq18hatch)"
          stroke={rectStroke}
          strokeWidth={rectWidth}
        />
      )}

      {/* ── circles ───────────────────────────────────────────────────── */}
      <circle cx={AX} cy={AY} r={RA}
        fill="rgba(30,58,95,0.05)" stroke={CIRC} strokeWidth={2} />
      <circle cx={BX} cy={BY} r={RB}
        fill="rgba(30,58,95,0.05)" stroke={CIRC} strokeWidth={2} />

      {/* ── dashed radii from A ───────────────────────────────────────── */}
      {showRadii && (
        <>
          <line x1={AX} y1={AY} x2={P1X} y2={P1Y}
            stroke={radiiAColor} strokeWidth={1.5} strokeDasharray="6 3" />
          <line x1={AX} y1={AY} x2={P4X} y2={P4Y}
            stroke={radiiAColor} strokeWidth={1.5} strokeDasharray="6 3" />
        </>
      )}

      {/* ── dashed radii from B ───────────────────────────────────────── */}
      {showRadii && (
        <>
          <line x1={BX} y1={BY} x2={P2X} y2={P2Y}
            stroke={radiiBColor} strokeWidth={1.5} strokeDasharray="6 3" />
          <line x1={BX} y1={BY} x2={P3X} y2={P3Y}
            stroke={radiiBColor} strokeWidth={1.5} strokeDasharray="6 3" />
        </>
      )}

      {/* ── tangent lines from T (as rectangle diagonals crossing T) ─── */}
      {showTangentLines && (
        <>
          {/* T to P1 and T to P3 (one diagonal) */}
          <line x1={TX} y1={TY} x2={P1X} y2={P1Y}
            stroke={INK} strokeWidth={1.5} />
          <line x1={TX} y1={TY} x2={P3X} y2={P3Y}
            stroke={INK} strokeWidth={1.5} />
          {/* T to P4 and T to P2 (other diagonal) */}
          <line x1={TX} y1={TY} x2={P4X} y2={P4Y}
            stroke={INK} strokeWidth={1.5} />
          <line x1={TX} y1={TY} x2={P2X} y2={P2Y}
            stroke={INK} strokeWidth={1.5} />
        </>
      )}

      {/* ── right-angle marks at tangent points ──────────────────────── */}
      {showRightAngles && (
        <>
          <polygon points={RA_P1} fill={GREEN} fillOpacity="0.6"
            stroke={GREEN} strokeWidth="0.8" />
          <polygon points={RA_P4} fill={GREEN} fillOpacity="0.6"
            stroke={GREEN} strokeWidth="0.8" />
          <polygon points={RA_P2} fill={GREEN} fillOpacity="0.6"
            stroke={GREEN} strokeWidth="0.8" />
          <polygon points={RA_P3} fill={GREEN} fillOpacity="0.6"
            stroke={GREEN} strokeWidth="0.8" />
        </>
      )}

      {/* ── dimension labels ──────────────────────────────────────────── */}
      {showDimensions && (
        <>
          {/* rA = 4 cm along radius to P1 */}
          <text x={(AX+P1X)/2 - 10} y={(AY+P1Y)/2 - 4}
            fontSize={12} fill={GREEN} fontWeight="bold" textAnchor="middle">
            4 cm
          </text>
          {/* rB = 3 cm along radius to P2 */}
          <text x={(BX+P2X)/2 + 12} y={(BY+P2Y)/2 - 4}
            fontSize={12} fill={AMBER} fontWeight="bold" textAnchor="middle">
            3 cm
          </text>
          {/* AT = 5 cm */}
          <text x={(AX+TX)/2} y={AY + 18}
            fontSize={12} fill={CIRC} fontWeight="bold" textAnchor="middle">
            5 cm
          </text>
          {/* BT = 5 cm */}
          <text x={(BX+TX)/2} y={AY + 18}
            fontSize={12} fill={CIRC} fontWeight="bold" textAnchor="middle">
            5 cm
          </text>
        </>
      )}

      {/* ── point labels ──────────────────────────────────────────────── */}
      {showPointLabels && (
        <>
          {/* A */}
          <circle cx={AX} cy={AY} r={3.5} fill={CIRC} />
          <text x={AX - 14} y={AY + 5}
            fontSize={15} fontWeight="bold" fill={CIRC} textAnchor="middle">
            A
          </text>
          {/* B */}
          <circle cx={BX} cy={BY} r={3.5} fill={CIRC} />
          <text x={BX + 14} y={BY + 5}
            fontSize={15} fontWeight="bold" fill={CIRC} textAnchor="middle">
            B
          </text>
          {/* T */}
          <circle cx={TX} cy={TY} r={3.5} fill={INK} />
          <text x={TX} y={TY + 18}
            fontSize={14} fontWeight="bold" fill={INK} textAnchor="middle">
            T
          </text>
        </>
      )}

      {/* ── tangent point dots ────────────────────────────────────────── */}
      {showTangentLines && (
        <>
          <circle cx={P1X} cy={P1Y} r={3} fill={INK} />
          <circle cx={P4X} cy={P4Y} r={3} fill={INK} />
          <circle cx={P2X} cy={P2Y} r={3} fill={INK} />
          <circle cx={P3X} cy={P3Y} r={3} fill={INK} />
        </>
      )}
    </svg>
  )
}

// ── default export: static illustration ──────────────────────────────────
export default function TwoCirclesTangentOSN24NT1Q18Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Dua lingkaran dengan pusat A (jari-jari 4 cm) dan B (jari-jari 3 cm), jarak AB = 10 cm. T titik tengah AB. Garis singgung dari T menyinggung masing-masing lingkaran di dua titik. Daerah yang diarsir adalah segiempat yang dibentuk oleh keempat titik singgung, luasnya 24 cm²."
    >
      <TwoCirclesTangentFigure />
    </div>
  )
}
