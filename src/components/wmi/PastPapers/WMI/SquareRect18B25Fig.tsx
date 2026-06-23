// SEAMO 2018 Paper B Q25 — Square + Rectangle with similar triangles.
//
// ABCD is a square of side 4 cm (A top-left, B bottom-left, C bottom-right,
// D top-right). DEFG is a rectangle (D top-right, E above the midline, F
// to the left below A, G below C). EAF is a straight line through vertex A.
// CG = 3 cm, DG = 5 cm. Find DE.
//
// Key geometry: triangle CDG is a 3-4-5 right-angle triangle (right angle at C).
// DG is the hypotenuse; DE ⊥ DG (since DEFG is a rectangle). EAF collinear
// through A gives DE = DA² / DG = 16/5 = 3.2 cm via similar triangles.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

const INK = '#1F2937'
const SQUARE_FILL = '#EFF6FF'   // pale blue
const RECT_FILL   = '#F0FDF4'   // pale green
const STROKE_COL  = INK
const DIM_COL     = '#374151'
const DASHED_COL  = '#6B7280'   // grey dashed altitude

// ---------------------------------------------------------------------------
// Layout — work in "cm-units" scaled to pixels.
// Square side = 4 cm → choose PX = 28 px/cm so square = 112 × 112 px.
const PX = 28   // px per cm

const SIDE = 4 * PX   // 112 — square side in px

// CG = 3 → G is 3 cm below C.  Place everything so:
//   B = square bottom-left, C = bottom-right, A = top-left, D = top-right.
//   G is on the line extending CD downward by CG = 3 cm.
//   DG = 5 cm (hypotenuse of 3-4-5 → DC = 4, CG = 3).
const CG = 3 * PX   // 84 px below C

// Coordinate origin at top-left of the canvas (with padding).
const PAD_L = 52
const PAD_T = 80   // room above square for E label and rectangle top edge
const PAD_R = 40
const PAD_B = 48   // room below G for dimension label

// Square corners (px)
const Ax = PAD_L
const Ay = PAD_T
const Bx = PAD_L
const By = PAD_T + SIDE
const Cx = PAD_L + SIDE
const Cy = PAD_T + SIDE
const Dx = PAD_L + SIDE
const Dy = PAD_T

// G: CG=3 below C (same x as C/D)
const Gx = Cx              // same x-column as C and D
const Gy = Cy + CG         // 84 px below C

// DG direction: D=(Dx,Dy), G=(Gx,Gy). |DG| = 5 cm = 140 px.
// The rectangle DEFG has DG as one side and DE ⊥ DG.
// DE = 3.2 cm = 16 px * PX/PX... = 3.2 * 28 = 89.6 px
const DE_cm = 3.2
const DE = DE_cm * PX  // 89.6 px

// Unit vector along DG (from D to G)
const dgDx = Gx - Dx   // 0
const dgDy = Gy - Dy   // SIDE + CG = 112 + 84 = 196
const dgLen = Math.hypot(dgDx, dgDy)  // = 5*PX = 140
const dgUx = dgDx / dgLen
const dgUy = dgDy / dgLen

// Perpendicular to DG (rotate 90° left = (-uy, ux))
const perpUx = -dgUy
const perpUy =  dgUx

// E = D + DE * perp  (perpendicular from D, going left since E is to the left of D)
const Ex = Dx + DE * perpUx
const Ey = Dy + DE * perpUy

// F = G + DE * perp
const Fx = Gx + DE * perpUx
const Fy = Gy + DE * perpUy

// Verify EAF collinearity: A should lie on segment EF.
// (A - E) and (F - E) must be parallel. With DE=3.2 this is exact by construction.

// Dashed altitude: foot of perpendicular from A onto DG.
// Parametric: foot = D + t*(G-D) where t = dot(A-D, G-D)/|DG|²
const tFoot = ((Ax - Dx) * dgDx + (Ay - Dy) * dgDy) / (dgLen * dgLen)
const Footx = Dx + tFoot * dgDx
const Footy = Dy + tFoot * dgDy

// Canvas size
const SVG_W = PAD_L + SIDE + PAD_R + 20  // a bit extra for E label
const SVG_H = PAD_T + SIDE + CG + PAD_B

// ---------------------------------------------------------------------------
// Small helpers

function Label({ x, y, text, anchor = 'middle', baseline = 'central', size = 13, bold = false }:
  { x: number; y: number; text: string; anchor?: string; baseline?: string; size?: number; bold?: boolean }) {
  return (
    <text
      x={x} y={y}
      textAnchor={anchor as 'start' | 'middle' | 'end'}
      dominantBaseline={baseline as 'central' | 'middle' | 'auto'}
      fontSize={size}
      fontWeight={bold ? 700 : 500}
      fontStyle="italic"
      fill={DIM_COL}
    >
      {text}
    </text>
  )
}

// Right-angle mark at vertex v, with legs toward a and b, side s px.
function RightMark({ vx, vy, ax, ay, bx, by, s = 8 }:
  { vx: number; vy: number; ax: number; ay: number; bx: number; by: number; s?: number }) {
  const unit = (px: number, py: number, qx: number, qy: number) => {
    const dx = qx - px; const dy = qy - py
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len] as [number, number]
  }
  const [uax, uay] = unit(vx, vy, ax, ay)
  const [ubx, uby] = unit(vx, vy, bx, by)
  const p1x = vx + uax * s; const p1y = vy + uay * s
  const p3x = vx + ubx * s; const p3y = vy + uby * s
  const p2x = p1x + ubx * s; const p2y = p1y + uby * s
  return (
    <path
      d={`M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y}`}
      fill="none"
      stroke={STROKE_COL}
      strokeWidth={1.2}
    />
  )
}

// ---------------------------------------------------------------------------

export function SquareRect18B25Figure() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(280, SVG_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Rectangle DEFG — drawn first so square renders on top */}
      <polygon
        points={`${Dx},${Dy} ${Ex},${Ey} ${Fx},${Fy} ${Gx},${Gy}`}
        fill={RECT_FILL}
        stroke={STROKE_COL}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* Square ABCD */}
      <rect
        x={Ax} y={Ay}
        width={SIDE} height={SIDE}
        fill={SQUARE_FILL}
        stroke={STROKE_COL}
        strokeWidth={2}
      />

      {/* Dashed altitude from A to foot on DG */}
      <line
        x1={Ax} y1={Ay}
        x2={Footx} y2={Footy}
        stroke={DASHED_COL}
        strokeWidth={1.4}
        strokeDasharray="5 3"
      />

      {/* Right-angle mark at foot of altitude (angle between altitude and DG) */}
      <RightMark
        vx={Footx} vy={Footy}
        ax={Ax}    ay={Ay}
        bx={Dx}    by={Dy}
        s={6}
      />

      {/* Right-angle mark at C (the 3-4-5 right angle) */}
      <RightMark
        vx={Cx} vy={Cy}
        ax={Dx} ay={Dy}
        bx={Gx} by={Gy}
        s={7}
      />

      {/* Vertex labels */}
      <Label x={Ax - 12} y={Ay}      text="A" />
      <Label x={Bx - 12} y={By}      text="B" />
      <Label x={Cx + 12} y={Cy}      text="C" />
      <Label x={Dx + 12} y={Dy}      text="D" />
      <Label x={Ex - 4}  y={Ey - 14} text="E" />
      <Label x={Fx - 14} y={Fy}      text="F" />
      <Label x={Gx + 12} y={Gy}      text="G" />

      {/* CG = 3 cm — right side between C and G */}
      <line
        x1={Cx + 16} y1={Cy}
        x2={Gx + 16} y2={Gy}
        stroke={DIM_COL} strokeWidth={1}
      />
      <line x1={Cx + 12} y1={Cy} x2={Cx + 20} y2={Cy} stroke={DIM_COL} strokeWidth={1} />
      <line x1={Gx + 12} y1={Gy} x2={Gx + 20} y2={Gy} stroke={DIM_COL} strokeWidth={1} />
      <Label x={Cx + 30} y={(Cy + Gy) / 2} text="3 cm" anchor="start" />

      {/* Square side = 4 cm — bottom edge */}
      <line
        x1={Bx} y1={By + 18}
        x2={Cx} y2={Cy + 18}
        stroke={DIM_COL} strokeWidth={1}
      />
      <line x1={Bx} y1={By + 14} x2={Bx} y2={By + 22} stroke={DIM_COL} strokeWidth={1} />
      <line x1={Cx} y1={Cy + 14} x2={Cx} y2={Cy + 22} stroke={DIM_COL} strokeWidth={1} />
      <Label x={(Bx + Cx) / 2} y={By + 30} text="4 cm" />
    </svg>
  )
}

const ARIA =
  'Diagram: ABCD adalah persegi sisi 4 cm dengan A kiri-atas, B kiri-bawah, C kanan-bawah, D kanan-atas. ' +
  'DEFG adalah persegi panjang. EAF adalah garis lurus. CG = 3 cm, DG = 5 cm. Cari panjang DE.'

export default function SquareRect18B25Fig() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <SquareRect18B25Figure />
    </div>
  )
}

// VISUALS entry — consumed by the SEAMO paper registry
// (registry wiring centralized)
