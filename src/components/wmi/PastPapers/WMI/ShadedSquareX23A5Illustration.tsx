// SEAMO-X 2023 Paper A Q5 — nested-squares shaded region.
// Outer 12×12 cm square. Diamond (rotated 45°) with vertices at midpoints of outer sides.
// Shaded inner axis-aligned square with vertices at midpoints of diamond sides.
// Geometry: outer area 144 → diamond ½×144=72 → shaded ½×72=36 cm².
// Fresh SVG: no matching primitive for nested-rotated-squares geometry.
// SSR-safe: no hooks, no framer-motion, no Date.

const INK = '#1F2937'
const SHADE_FILL_DEFAULT = '#CBD5E1'    // slate-300 — matches paper's gray shading
const SHADE_FILL_RESULT = '#BBF7D0'    // green-200 — final answer highlight

// Highlight palette per beat phase
const AMBER = '#F59E0B'
const BLUE = '#3B82F6'
const INDIGO = '#6366F1'
const GREEN = '#10B981'

// SVG canvas
const V_W = 340
const V_H = 340

// Outer square in px (represents 12 cm)
const OX = 30   // outer square left x
const OY = 30   // outer square top y
const OS = 240  // outer square side

const CX = OX + OS / 2  // 150
const CY = OY + OS / 2  // 150

// Diamond vertices — midpoints of outer square sides
const DT = { x: CX,      y: OY }        // top    (150, 30)
const DR = { x: OX + OS, y: CY }        // right  (270, 150)
const DB = { x: CX,      y: OY + OS }   // bottom (150, 270)
const DL = { x: OX,      y: CY }        // left   (30,  150)

// Inner (shaded) square vertices — midpoints of diamond sides
// top-right:   mid of DT→DR = (210,  90)
// bottom-right: mid of DR→DB = (210, 210)
// bottom-left:  mid of DB→DL = (90,  210)
// top-left:    mid of DL→DT = (90,   90)
const ITR = { x: (DT.x + DR.x) / 2, y: (DT.y + DR.y) / 2 }  // (210, 90)
const IBR = { x: (DR.x + DB.x) / 2, y: (DR.y + DB.y) / 2 }  // (210, 210)
const IBL = { x: (DB.x + DL.x) / 2, y: (DB.y + DL.y) / 2 }  // (90, 210)
const ITL = { x: (DL.x + DT.x) / 2, y: (DL.y + DT.y) / 2 }  // (90, 90)

const diaPoints =
  `${DT.x},${DT.y} ${DR.x},${DR.y} ${DB.x},${DB.y} ${DL.x},${DL.y}`
const innerPoints =
  `${ITR.x},${ITR.y} ${IBR.x},${IBR.y} ${IBL.x},${IBL.y} ${ITL.x},${ITL.y}`

// Dimension line/label geometry
const DIM_OFFSET = 18   // px from outer square edge
const DIM_TICK = 6      // half-length of end ticks

export type ShadedSquareX23A5Phase = 'intro' | 'outer' | 'diamond' | 'shaded' | 'result'

/** Named primitive — imported by the explainer to drive per-beat highlighting. */
export function ShadedSquareX23A5({ phase = 'intro' }: { phase?: ShadedSquareX23A5Phase }) {
  // Compute per-phase styling
  const isOuter   = phase === 'outer'
  const isDiamond = phase === 'diamond'
  const isShaded  = phase === 'shaded'
  const isResult  = phase === 'result'

  const outerStroke   = isOuter   ? AMBER   : INK
  const outerWidth    = isOuter   ? 4       : 2.5
  const diaStroke     = isDiamond ? BLUE    : INK
  const diaWidth      = isDiamond ? 4       : 2
  const shadeFill     = isResult  ? SHADE_FILL_RESULT : SHADE_FILL_DEFAULT
  const shadeStroke   = (isShaded || isResult) ? (isResult ? GREEN : INDIGO) : '#64748B'
  const shadeWidth    = (isShaded || isResult) ? 4 : 2
  const labelColor    = isOuter   ? AMBER   : INK
  const labelWeight   = isOuter   ? '700'   : '400'

  // Bottom dim line y
  const dimBotY  = OY + OS + DIM_OFFSET
  // Right dim line x
  const dimRightX = OX + OS + DIM_OFFSET

  return (
    <svg
      viewBox={`0 0 ${V_W} ${V_H}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Outer square ── */}
      <rect
        x={OX} y={OY} width={OS} height={OS}
        fill="white"
        stroke={outerStroke}
        strokeWidth={outerWidth}
      />

      {/* ── Diamond ── */}
      <polygon
        points={diaPoints}
        fill="none"
        stroke={diaStroke}
        strokeWidth={diaWidth}
        strokeLinejoin="round"
      />

      {/* ── Inner shaded square ── */}
      <polygon
        points={innerPoints}
        fill={shadeFill}
        stroke={shadeStroke}
        strokeWidth={shadeWidth}
        strokeLinejoin="round"
      />

      {/* ── Dimension: bottom side (12 cm) ── */}
      <line
        x1={OX} y1={dimBotY}
        x2={OX + OS} y2={dimBotY}
        stroke={labelColor} strokeWidth={1.5}
      />
      {/* end ticks */}
      <line x1={OX}      y1={dimBotY - DIM_TICK} x2={OX}      y2={dimBotY + DIM_TICK} stroke={labelColor} strokeWidth={1.5} />
      <line x1={OX + OS} y1={dimBotY - DIM_TICK} x2={OX + OS} y2={dimBotY + DIM_TICK} stroke={labelColor} strokeWidth={1.5} />
      <text
        x={CX} y={dimBotY + 16}
        textAnchor="middle"
        fontSize={14}
        fontFamily="sans-serif"
        fontWeight={labelWeight}
        fill={labelColor}
      >
        12 cm
      </text>

      {/* ── Dimension: right side (12 cm) ── */}
      <line
        x1={dimRightX} y1={OY}
        x2={dimRightX} y2={OY + OS}
        stroke={labelColor} strokeWidth={1.5}
      />
      <line x1={dimRightX - DIM_TICK} y1={OY}      x2={dimRightX + DIM_TICK} y2={OY}      stroke={labelColor} strokeWidth={1.5} />
      <line x1={dimRightX - DIM_TICK} y1={OY + OS} x2={dimRightX + DIM_TICK} y2={OY + OS} stroke={labelColor} strokeWidth={1.5} />
      <text
        x={dimRightX + 16} y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontFamily="sans-serif"
        fontWeight={labelWeight}
        fill={labelColor}
        transform={`rotate(-90 ${dimRightX + 16} ${CY})`}
      >
        12 cm
      </text>
    </svg>
  )
}

/** SEAMO-X 2023 Paper A Q5 stem illustration. Default export consumed by registry. */
export default function ShadedSquareX23A5Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 12 cm by 12 cm outer square. A diamond (rotated square) is inscribed with its ' +
        'four vertices at the midpoints of the outer square’s sides. Inside the diamond, ' +
        'a shaded axis-aligned square has its vertices at the midpoints of the diamond’s sides. ' +
        'Find the area of the shaded square.'
      }
    >
      <ShadedSquareX23A5 />
    </div>
  )
}
