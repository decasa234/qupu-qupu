// TiledSquareSASMO19G4Q17Illustration — SASMO-19-G4-Q17
//
// "Persegi besar terbuat dari 8 persegi panjang identik dan 1 persegi kecil.
//  Lebar persegi panjang adalah 2 cm dan luas persegi kecil adalah 64 cm².
//  Temukan keliling, dalam cm, dari persegi besar."
//
// GEOMETRY (scale: 20 SVG px = 1 cm → 240×240 outer square):
//   Inner square : (40,40)→(200,200)   [8 cm × 8 cm = 64 cm²]
//   Rect 1 : (  0,  0)→(100, 40)  landscape 5×2 cm  [top-left of top strip]
//   Rect 2 : (100,  0)→(200, 40)  landscape 5×2 cm  [top-right of top strip]
//   Rect 3 : (200,  0)→(240,100)  portrait  2×5 cm  [right top, incl. TR corner]
//   Rect 4 : (200,100)→(240,200)  portrait  2×5 cm  [right bottom]
//   Rect 5 : (140,200)→(240,240)  landscape 5×2 cm  [bottom-right, incl. BR corner]
//   Rect 6 : ( 40,200)→(140,240)  landscape 5×2 cm  [bottom-left of bottom strip]
//   Rect 7 : (  0,140)→( 40,240)  portrait  2×5 cm  [left bottom, incl. BL corner]
//   Rect 8 : (  0, 40)→( 40,140)  portrait  2×5 cm  [left top]
//
// Verification: 8 × (2×5) + 8² = 80 + 64 = 144 = 12²  ✓
//               Each rect is 40px × 100px = 2 cm × 5 cm (all identical)  ✓
//               No overlap between any rect or inner square  ✓
//               Entire outer square covered  ✓
//
// No primitive covers a "tiled frame composition" → fresh SVG.
// SSR-safe: no hooks, no framer-motion.
// Co-exports TiledSquareSASMO19G4Q17Figure for the explainer.

// ── Constants ─────────────────────────────────────────────────────────────────
const PX   = 20   // SVG pixels per cm
const W    = 240  // outer square SVG size (12 cm)
const FP   = 40   // frame px (2 cm)
const IN   = 160  // inner square px (8 cm)

// ── Colours ───────────────────────────────────────────────────────────────────
const INK        = '#1F2937'
const INNER_FILL = '#EFF6FF'
const RECT_FILL  = '#FEF9C3'
const BORDER     = '#374151'
const INNER_HL   = '#BFDBFE'
const INNER_HL_S = '#2563EB'
const RECT_HL    = '#FDE68A'
const RECT_HL_S  = '#D97706'
const LABEL_COL  = '#30598A'
const DIM_COL    = '#DC2626'
const GREEN_INK  = '#065F46'

// ── Rectangle list: [x1, y1, x2, y2] ─────────────────────────────────────────
const RECTS: [number, number, number, number][] = [
  [  0,   0, 100,  40],  // 1 top-left horizontal
  [100,   0, 200,  40],  // 2 top-right horizontal
  [200,   0, 240, 100],  // 3 right-top vertical
  [200, 100, 240, 200],  // 4 right-bottom vertical
  [140, 200, 240, 240],  // 5 bottom-right horizontal
  [ 40, 200, 140, 240],  // 6 bottom-left horizontal
  [  0, 140,  40, 240],  // 7 left-bottom vertical
  [  0,  40,  40, 140],  // 8 left-top vertical
]

// ── Shared figure props ───────────────────────────────────────────────────────
export type TiledSquareHighlight = 'inner' | 'frame' | 'side' | null

export interface TiledSquareFigureProps {
  highlight?: TiledSquareHighlight
  showAnswer?: boolean
}

// ── Core figure (reused by explainer) ────────────────────────────────────────
export function TiledSquareSASMO19G4Q17Figure({
  highlight = null,
  showAnswer = false,
}: TiledSquareFigureProps = {}) {
  const hlInner  = highlight === 'inner'
  const hlFrame  = highlight === 'frame'
  const hlSide   = highlight === 'side' || showAnswer

  const innerFill   = hlInner ? INNER_HL   : INNER_FILL
  const innerStroke = hlInner ? INNER_HL_S : BORDER
  const innerSW     = hlInner ? 2.5        : 1.5
  const rectFill    = hlFrame ? RECT_HL    : RECT_FILL
  const rectStroke  = hlFrame ? RECT_HL_S  : BORDER

  return (
    <svg viewBox="-32 -32 304 304" width={240} aria-hidden="true"
      fontFamily="ui-sans-serif, system-ui, sans-serif">

      {/* Outer square */}
      <rect x={0} y={0} width={W} height={W} fill="#F9FAFB" stroke={INK} strokeWidth={2} />

      {/* 8 rectangles */}
      {RECTS.map(([x1, y1, x2, y2], i) => (
        <rect
          key={i}
          x={x1} y={y1}
          width={x2 - x1} height={y2 - y1}
          fill={rectFill}
          stroke={rectStroke}
          strokeWidth={1.5}
        />
      ))}

      {/* Inner square */}
      <rect x={FP} y={FP} width={IN} height={IN}
        fill={innerFill} stroke={innerStroke} strokeWidth={innerSW} />

      {/* "8 cm" label inside inner square (inner highlight or answer) */}
      {(hlInner || showAnswer) && (
        <text
          x={FP + IN / 2} y={FP + IN / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={18} fontWeight={800}
          fill={hlInner ? '#1D4ED8' : LABEL_COL}>
          8 cm
        </text>
      )}

      {/* "2 cm" bracket — left side, matches source image placement */}
      <line x1={-10} y1={0}  x2={-10} y2={FP} stroke={DIM_COL} strokeWidth={1.5} />
      <line x1={-14} y1={0}  x2={-6}  y2={0}  stroke={DIM_COL} strokeWidth={1.5} />
      <line x1={-14} y1={FP} x2={-6}  y2={FP} stroke={DIM_COL} strokeWidth={1.5} />
      <text x={-22} y={FP / 2} textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700} fill={DIM_COL}
        transform={`rotate(-90 -22 ${FP / 2})`}>
        2 cm
      </text>

      {/* "12 cm" top brace (side highlight or answer) */}
      {hlSide && (
        <>
          <line x1={0}  y1={-14} x2={W}  y2={-14} stroke={LABEL_COL} strokeWidth={1.5} />
          <line x1={0}  y1={-18} x2={0}  y2={-10} stroke={LABEL_COL} strokeWidth={1.5} />
          <line x1={W}  y1={-18} x2={W}  y2={-10} stroke={LABEL_COL} strokeWidth={1.5} />
          <text x={W / 2} y={-20} textAnchor="middle" dominantBaseline="auto"
            fontSize={12} fontWeight={800} fill={LABEL_COL}>
            12 cm
          </text>
        </>
      )}

      {/* "48 cm" answer label (bottom, only when showAnswer) */}
      {showAnswer && (
        <text x={W / 2} y={W + 18} textAnchor="middle" dominantBaseline="central"
          fontSize={15} fontWeight={900} fill={GREEN_INK}>
          Keliling = 48 cm
        </text>
      )}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────
const ARIA =
  'A 12×12 cm big square containing a centered 8×8 cm inner square. ' +
  'Eight identical 2×5 cm rectangles tile the 2-cm frame around the inner square. ' +
  'The frame width is 2 cm, labelled on the left side.'

export default function TiledSquareSASMO19G4Q17Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <TiledSquareSASMO19G4Q17Figure />
    </div>
  )
}
