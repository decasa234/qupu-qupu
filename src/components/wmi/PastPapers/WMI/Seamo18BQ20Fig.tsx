// Seamo18BQ20Fig — SEAMO 2018 Paper B Q20
// "The diagram shows a square ABCD of side 10 cm and a shaded rectangle of
//  area 6 cm². What is the area of EFGH?"
//
// Source figure (2018.imgs/010.jpg):
//   Outer square ABCD (side 10 cm):
//     A = top-left, B = top-right, C = bottom-right, D = bottom-left.
//   Inner quadrilateral EFGH with vertices on the sides of ABCD:
//     E on left side AD, F on top side AB, G on right side BC, H on bottom side DC.
//   Diagonals AF↔DG and AE↔... are drawn through the figure, forming the
//   inner quadrilateral EFGH and a small shaded rectangle at their intersection.
//
// Geometry (scaled: 1 cm → 20 px, so square = 200×200 px):
//   Square:  A=(0,0) top-left, B=(200,0) top-right,
//            C=(200,200) bottom-right, D=(0,200) bottom-left.
//
//   From the image the diagonals appear to be:
//     Line 1: from A=(0,0) to C=(200,200)  [true diagonal AC]
//     Line 2: from D=(0,200) to B=(200,0)  [true diagonal DB]
//   But those cross at centre (100,100) producing a square (not the image shape).
//
//   The actual figure has EFGH as a non-symmetric tilted quadrilateral.
//   Reading the image:
//     E ≈ on left side at (0, 130)   [~6.5 cm from top]
//     F ≈ on top side  at (110,  0)  [~5.5 cm from left]
//     G ≈ on right side at (200, 60) [~3 cm from top]
//     H ≈ on bottom side at (60,200) [~3 cm from left]
//
//   The four outer triangles + shaded rectangle = 100 − 53 = 47 cm².
//   Shaded rectangle area = 6 cm², so outer triangles = 41 cm².
//
//   We verify with Shoelace for E=(0,130) F=(110,0) G=(200,60) H=(60,200):
//     Area = ½ |x_E(y_F−y_H) + x_F(y_G−y_E) + x_G(y_H−y_F) + x_H(y_E−y_G)|
//          = ½ |0(0−200) + 110(60−130) + 200(200−0) + 60(130−60)|
//          = ½ |0 − 7700 + 40000 + 4200|
//          = ½ × 36500 = 18250 sq-px
//   In cm²: 18250 / 400 = 45.625 cm².  Close but not 53.
//
//   Adjusting to visually match image AND give 53 cm² exactly:
//   We need corner triangles + shaded rect = 47, so corner triangles = 41.
//   Four triangles: Δ(A,F,E) + Δ(B,G,F) + Δ(C,H,G) + Δ(D,E,H) = 41 cm²
//
//   Let E=(0,e), F=(f,0), G=(200,g), H=(h,200) (all in px, 1cm=20px).
//   Δ(A,F,E) = ½·f·e  (right triangle at A with legs f,e)
//   Δ(B,G,F) = ½·(200-f)·g  (right triangle at B)
//   Δ(C,H,G) = ½·(200-h)·(200-g)  (right triangle at C)
//   Δ(D,E,H) = ½·h·(200-e)  (right triangle at D)
//
//   Sum × (1/400) = 41, so sum of px² = 16400.
//   Also shaded_rect_px = 6 × 400 = 2400.
//
//   Choose e=120, f=120, g=80, h=80 (px) → cm: E at 6, F at 6, G at 4, H at 4.
//   Δ(A) = ½·120·120 = 7200
//   Δ(B) = ½·80·80   = 3200
//   Δ(C) = ½·120·120 = 7200  (200-80=120, 200-80=120)
//   Δ(D) = ½·80·80   = 3200
//   Sum  = 20800  → 20800/400 = 52 cm²  → EFGH = 100−52 = 48 cm².  Not 53.
//
//   Try e=140, f=100, g=60, h=60:
//   Δ(A) = ½·100·140 = 7000
//   Δ(B) = ½·100·60  = 3000
//   Δ(C) = ½·140·140 = 9800
//   Δ(D) = ½·60·60   = 1800
//   Sum  = 21600 → 54 cm² → EFGH = 46.  Still off.
//
//   Work backwards from EFGH=53: corner sum = 47 cm² = 18800 px².
//   Ignore shaded rect separately (it's inside EFGH, just highlighted).
//   So EFGH Shoelace = 53 × 400 = 21200 px².
//
//   Choose e=130, f=110, g=70, h=50 (px):
//   Δ(A) = ½·110·130 = 7150
//   Δ(B) = ½·90·70   = 3150  (200-110=90)
//   Δ(C) = ½·150·130 = 9750  (200-50=150, 200-70=130)
//   Δ(D) = ½·50·70   = 1750  (h=50, 200-e=70)
//   Sum  = 21800 → 54.5 cm².  EFGH = 45.5.
//
//   Try e=120, f=100, g=60, h=40:
//   Δ(A) = ½·100·120 = 6000
//   Δ(B) = ½·100·60  = 3000
//   Δ(C) = ½·160·140 = 11200 (200-40=160, 200-60=140)
//   Δ(D) = ½·40·80   = 1600  (h=40, 200-120=80)
//   Sum  = 21800 → 54.5 cm². EFGH = 45.5.
//
//   The exact coord calculation is complex. For the illustration we use
//   visually faithful coordinates from the image (matching the SPIRIT of the
//   figure for teaching), and note the shaded rect + area annotation are the
//   key visual teaching elements. The exact answer (53 cm²) is derived by
//   the formula strategy, not by pixel-perfect shoelace.
//
//   Final chosen coords (px, matching image proportions):
//     E=(0,  130): 6.5 cm down the left side
//     F=(120,  0): 6 cm from left on the top
//     G=(200,  70): 3.5 cm from top on the right  (matches image G near top-right)
//     H=( 50, 200): 2.5 cm from left on the bottom
//
// Classification: STEM (figure in question stem; answer is choice)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

// Scale: 1 cm = 20 px  →  10 cm square = 200×200 px
const SCALE  = 20
const SIDE   = 10 * SCALE  // 200

// Outer padding so labels don't clip
const PAD    = 24
const VW     = SIDE + PAD * 2  // 248
const VH     = SIDE + PAD * 2  // 248

// Square corners (in local coords, origin = top-left of SVG)
const AX = PAD,        AY = PAD         // A top-left
const BX = PAD + SIDE, BY = PAD         // B top-right
const CX = PAD + SIDE, CY = PAD + SIDE  // C bottom-right
const DX = PAD,        DY = PAD + SIDE  // D bottom-left

// Inner quadrilateral vertices (chosen to match the image proportions)
// E on left side AD  (x=AX, y varies)
// F on top side AB   (y=AY, x varies)
// G on right side BC (x=BX, y varies)
// H on bottom side DC (y=DY, x varies)
const EX = AX,          EY = PAD + 7 * SCALE   // 6.5→7 cm from A down left
const FX = PAD + 6 * SCALE, FY = AY            // 6 cm from A right on top
const GX = BX,          GY = PAD + 3 * SCALE   // 3 cm from B down right
const HX = PAD + 3 * SCALE, HY = DY            // 3 cm from D right on bottom

// ── Diagonal lines (connecting outer corners through EFGH) ────────────────────
//
// From the image the diagonals appear to be:
//   Line α: from D (bottom-left) through E and continues to B (top-right)
//   Line β: from A (top-left)  through F → H → C or similar
// Actually reading image: four lines radiate from the four corners:
//   From A to G  (top-left → right side)
//   From B to H  (top-right → bottom side)
//   From C to E  (bottom-right → left side)
//   From D to F  (bottom-left → top side)
// These four lines form the inner quadrilateral EFGH at their intersections.
//
// Lines for diagram:
//   Line AG: A(PAD,PAD) → G(BX, GY)
//   Line BH: B(BX,PAD)  → H(HX, DY)
//   Line CE: C(CX,DY)   → E(AX, EY)
//   Line DF: D(AX,DY)   → F(FX, PAD)

// Intersection helper: find where line (p1→p2) meets line (p3→p4)
function intersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): [number, number] {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(d) < 1e-9) return [x1, y1] // parallel fallback
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
}

// The four bounding-corner lines:
//   AG: (AX,AY)→(GX,GY)
//   BH: (BX,BY)→(HX,HY)
//   CE: (CX,CY)→(EX,EY)
//   DF: (DX,DY)→(FX,FY)

// EFGH intersections (the inner quadrilateral vertices ARE E,F,G,H themselves
// in the actual figure — the diagonals pass through them). But the shaded
// rectangle is formed by the intersections of the four lines INSIDE the figure.
//
// Shaded rectangle corners = pairwise intersections of the four inner lines:
//   P1 = AG ∩ DF
//   P2 = AG ∩ BH
//   P3 = CE ∩ BH
//   P4 = CE ∩ DF

const P1 = intersect(AX, AY, GX, GY, DX, DY, FX, FY)
const P2 = intersect(AX, AY, GX, GY, BX, BY, HX, HY)
const P3 = intersect(CX, CY, EX, EY, BX, BY, HX, HY)
const P4 = intersect(CX, CY, EX, EY, DX, DY, FX, FY)

// ── Colours ───────────────────────────────────────────────────────────────────

const BG          = '#FFFBF0'
const SQUARE_FILL = '#F9FAFB'   // very light gray for the square
const STROKE      = '#374151'   // dark gray lines
const EFGH_STROKE = '#374151'
const SHADE_FILL  = '#FCD34D'   // amber-300 (matches the yellow rectangle in image)
const SHADE_FILL_A = 'rgba(252,211,77,0.85)'
const LABEL_CLR   = '#111827'
const DIM_CLR     = '#6B7280'   // gray-500 for dimension labels

function pt(x: number, y: number) { return `${x.toFixed(1)},${y.toFixed(1)}` }

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface Seamo18BQ20FigureProps {
  /** Show dimension labels on the outer square (10 cm side). Default true. */
  showDimensions?: boolean
  /** Highlight the inner quadrilateral EFGH with a ring. */
  highlightEFGH?: boolean
  /** Show the area label on the shaded rectangle (6 cm²). */
  showShadedLabel?: boolean
  /** Show the answer area of EFGH (53 cm²). */
  showAnswer?: boolean
}

export function Seamo18BQ20Figure({
  showDimensions  = true,
  highlightEFGH   = false,
  showShadedLabel = false,
  showAnswer      = false,
}: Seamo18BQ20FigureProps) {
  const outerPts = `${pt(AX,AY)} ${pt(BX,BY)} ${pt(CX,CY)} ${pt(DX,DY)}`
  const efghPts  = `${pt(EX,EY)} ${pt(FX,FY)} ${pt(GX,GY)} ${pt(HX,HY)}`
  const shadePts = `${pt(P1[0],P1[1])} ${pt(P2[0],P2[1])} ${pt(P3[0],P3[1])} ${pt(P4[0],P4[1])}`

  // Centre of shaded region for label
  const shadeCX = (P1[0] + P2[0] + P3[0] + P4[0]) / 4
  const shadeCY = (P1[1] + P2[1] + P3[1] + P4[1]) / 4

  // Centre of EFGH for answer label
  const efghCX = (EX + FX + GX + HX) / 4
  const efghCY = (EY + FY + GY + HY) / 4

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width={VW} height={VH} fill={BG} rx={8} />

      {/* Outer square fill */}
      <polygon points={outerPts} fill={SQUARE_FILL} />

      {/* Shaded rectangle (the 6 cm² region) */}
      <polygon points={shadePts} fill={SHADE_FILL_A} />

      {/* Four diagonal lines from corners through EFGH */}
      {/* AG: A → G */}
      <line x1={AX} y1={AY} x2={GX} y2={GY} stroke={STROKE} strokeWidth={1.2} />
      {/* BH: B → H */}
      <line x1={BX} y1={BY} x2={HX} y2={HY} stroke={STROKE} strokeWidth={1.2} />
      {/* CE: C → E */}
      <line x1={CX} y1={CY} x2={EX} y2={EY} stroke={STROKE} strokeWidth={1.2} />
      {/* DF: D → F */}
      <line x1={DX} y1={DY} x2={FX} y2={FY} stroke={STROKE} strokeWidth={1.2} />

      {/* Inner quadrilateral EFGH border */}
      <polygon
        points={efghPts}
        fill="none"
        stroke={highlightEFGH ? '#2563EB' : EFGH_STROKE}
        strokeWidth={highlightEFGH ? 2.5 : 1.5}
        strokeDasharray={highlightEFGH ? '6 3' : undefined}
      />

      {/* Outer square border (drawn on top) */}
      <polygon
        points={outerPts}
        fill="none"
        stroke={STROKE}
        strokeWidth={2}
      />

      {/* Vertex labels — A B C D */}
      <text x={AX - 6} y={AY - 6} textAnchor="end"   dominantBaseline="auto"     fontSize={13} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">A</text>
      <text x={BX + 6} y={BY - 6} textAnchor="start"  dominantBaseline="auto"     fontSize={13} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">B</text>
      <text x={CX + 6} y={CY + 6} textAnchor="start"  dominantBaseline="hanging"  fontSize={13} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">C</text>
      <text x={DX - 6} y={DY + 6} textAnchor="end"    dominantBaseline="hanging"  fontSize={13} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">D</text>

      {/* Inner vertex labels — E F G H */}
      <text x={EX - 8} y={EY}     textAnchor="end"   dominantBaseline="central"  fontSize={12} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">E</text>
      <text x={FX}     y={FY - 8} textAnchor="middle" dominantBaseline="auto"    fontSize={12} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">F</text>
      <text x={GX + 8} y={GY}     textAnchor="start"  dominantBaseline="central" fontSize={12} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">G</text>
      <text x={HX}     y={HY + 8} textAnchor="middle" dominantBaseline="hanging" fontSize={12} fontWeight={700} fill={LABEL_CLR} fontFamily="ui-sans-serif,system-ui,sans-serif">H</text>

      {/* Dimension labels */}
      {showDimensions && (
        <>
          {/* Top side label: 10 cm */}
          <text
            x={(AX + BX) / 2}
            y={AY - 10}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize={11}
            fill={DIM_CLR}
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            10 cm
          </text>
        </>
      )}

      {/* Shaded area label (6 cm²) */}
      {showShadedLabel && (
        <text
          x={shadeCX}
          y={shadeCY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={700}
          fill="#92400E"
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          6 cm²
        </text>
      )}

      {/* Static 6 cm² label on the shaded region */}
      {!showShadedLabel && (
        <text
          x={shadeCX}
          y={shadeCY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={600}
          fill="#78350F"
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          6 cm²
        </text>
      )}

      {/* Answer label for EFGH area */}
      {showAnswer && (
        <text
          x={efghCX}
          y={efghCY + 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={900}
          fill="#2563EB"
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          53 cm²
        </text>
      )}
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function Seamo18BQ20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Square ABCD with side 10 cm. Points E on left side, F on top side, ' +
        'G on right side, H on bottom side form inner quadrilateral EFGH. ' +
        'Four lines from corners A, B, C, D to opposite side points create a ' +
        'small shaded yellow rectangle of area 6 cm² inside. ' +
        'Find the area of quadrilateral EFGH. Answer: 53 cm².'
      }
    >
      <Seamo18BQ20Figure showDimensions showShadedLabel={false} />
    </div>
  )
}

// ── VISUALS export ─────────────────────────────────────────────────────────────

// (registry wiring centralized)
