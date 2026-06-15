// Overlapping-circles balance figure for WMI-22P2A-Q19 (2022 Grade 2 Semifinal).
//
// Redrawn from db/seed/wmi/figures/2022-semifinal-g2-a-q19.jpg: five tan circles.
//   Top row (left→right):    13, 12, 25  (exclusive region of each top circle)
//   Bottom row (two circles): 6  (left),  ◆ (right)
//   Lens overlaps:  17 (top-left ∩ bottom-left), 7 (top-mid ∩ bottom-left),
//                   ★ (top-mid ∩ bottom-right),  5 (top-right ∩ bottom-right)
//
// Every circle's regions add to the SAME total (= 30):
//   top-left  13 + 17 = 30      top-right 25 + 5 = 30
//   bottom-left 6 + 17 + 7 = 30  → confirms the shared total 30.
// Then top-mid 12 + 7 + ★ = 30 ⇒ ★ = 11; bottom-right ◆ + ★ + 5 = 30 ⇒ ◆ = 14.
// So ★ = 11, ◆ = 14 → answer D. The static figure shows ★ and ◆ as UNKNOWNS only.

const CIRCLE_FILL = '#FBE7C6'
const CIRCLE_STROKE = '#3F3F46'
const INK = '#1F2937'
const MARK = '#E23B4E' // red for the ★ / ◆ unknown markers

// Geometry (viewBox 0 0 540 280). Top circles on a row, bottom two nestle below.
const R = 78
export const TOP_CY = 96
export const BOT_CY = 168
// Top circle x-centres
export const TL_X = 96
export const TM_X = 270
export const TR_X = 444
// Bottom circle x-centres (sit between the top circles)
export const BL_X = 183
export const BR_X = 357

// Region label anchor points (tuned to fall inside the correct sub-region).
const POS = {
  tl: { x: 78, y: 88 }, // 13 — exclusive top-left
  tm: { x: 270, y: 80 }, // 12 — exclusive top-mid
  tr: { x: 444, y: 88 }, // 25 — exclusive top-right
  bl: { x: 183, y: 178 }, // 6 — exclusive bottom-left
  lens17: { x: 140, y: 132 }, // top-left ∩ bottom-left
  lens7: { x: 222, y: 132 }, // top-mid ∩ bottom-left
  star: { x: 314, y: 126 }, // top-mid ∩ bottom-right  → ★
  lens5: { x: 400, y: 132 }, // top-right ∩ bottom-right
  diamond: { x: 357, y: 168 }, // exclusive bottom-right → ◆
} as const

function StarGlyph({ x, y, r = 13 }: { x: number; y: number; r?: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(x + rr * Math.cos(rad)).toFixed(2)},${(y + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={MARK} />
}

function DiamondGlyph({ x, y, r = 13 }: { x: number; y: number; r?: number }) {
  return <polygon points={`${x},${y - r} ${x + r * 0.8},${y} ${x},${y + r} ${x - r * 0.8},${y}`} fill={MARK} />
}

export interface CirclesDiagramProps {
  /** Reveal ★ = 11 in place of the star marker. */
  showStar?: boolean
  /** Reveal ◆ = 14 in place of the diamond marker. */
  showDiamond?: boolean
  /** Circle keys to tint highlight (subset of 'tl'|'tm'|'tr'|'bl'|'br'). */
  highlight?: Array<'tl' | 'tm' | 'tr' | 'bl' | 'br'>
  /** Show the shared total "= 30" badge under each highlighted, fully-known circle. */
  showTotal?: boolean
}

const CIRCLES: Array<{ key: 'tl' | 'tm' | 'tr' | 'bl' | 'br'; cx: number; cy: number }> = [
  { key: 'bl', cx: BL_X, cy: BOT_CY },
  { key: 'br', cx: BR_X, cy: BOT_CY },
  { key: 'tl', cx: TL_X, cy: TOP_CY },
  { key: 'tm', cx: TM_X, cy: TOP_CY },
  { key: 'tr', cx: TR_X, cy: TOP_CY },
]

export function CirclesDiagram({ showStar = false, showDiamond = false, highlight = [], showTotal = false }: CirclesDiagramProps) {
  return (
    <svg viewBox="0 0 540 280" width="100%" style={{ maxWidth: 520, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* circles (bottom drawn first so top overlaps sit above) */}
      {CIRCLES.map((c) => (
        <circle
          key={c.key}
          cx={c.cx}
          cy={c.cy}
          r={R}
          fill={highlight.includes(c.key) ? '#FCEFB4' : CIRCLE_FILL}
          stroke={highlight.includes(c.key) ? '#B45309' : CIRCLE_STROKE}
          strokeWidth={highlight.includes(c.key) ? 3 : 2}
          fillOpacity={0.55}
        />
      ))}

      {/* exclusive numbers */}
      <text x={POS.tl.x} y={POS.tl.y} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={INK}>13</text>
      <text x={POS.tm.x} y={POS.tm.y} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={INK}>12</text>
      <text x={POS.tr.x} y={POS.tr.y} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={INK}>25</text>
      <text x={POS.bl.x} y={POS.bl.y} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={INK}>6</text>

      {/* lens overlap numbers */}
      <text x={POS.lens17.x} y={POS.lens17.y} textAnchor="middle" dominantBaseline="central" fontSize={22} fill={INK}>17</text>
      <text x={POS.lens7.x} y={POS.lens7.y} textAnchor="middle" dominantBaseline="central" fontSize={22} fill={INK}>7</text>
      <text x={POS.lens5.x} y={POS.lens5.y} textAnchor="middle" dominantBaseline="central" fontSize={22} fill={INK}>5</text>

      {/* ★ marker / value */}
      {showStar ? (
        <text x={POS.star.x} y={POS.star.y} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={MARK}>11</text>
      ) : (
        <StarGlyph x={POS.star.x} y={POS.star.y} />
      )}

      {/* ◆ marker / value */}
      {showDiamond ? (
        <text x={POS.diamond.x} y={POS.diamond.y} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={MARK}>14</text>
      ) : (
        <DiamondGlyph x={POS.diamond.x} y={POS.diamond.y} />
      )}

      {/* shared-total badges under fully-known highlighted circles */}
      {showTotal &&
        CIRCLES.filter((c) => highlight.includes(c.key) && (c.key === 'tl' || c.key === 'tr' || c.key === 'bl')).map((c) => (
          <g key={`tot${c.key}`}>
            <rect x={c.cx - 26} y={c.cy + R - 8} width={52} height={22} rx={11} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.5} />
            <text x={c.cx} y={c.cy + R + 3} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#B45309">
              = 30
            </text>
          </g>
        ))}
    </svg>
  )
}

export default function P22G2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Five overlapping circles. Top circles hold 13, 12 and 25. The lower-left circle holds 6. Overlap regions hold 17, 7, a star, and 5; the lower-right circle holds a diamond. Find the star and the diamond."
    >
      <CirclesDiagram />
    </div>
  )
}
