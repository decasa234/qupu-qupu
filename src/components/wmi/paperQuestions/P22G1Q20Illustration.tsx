// WMI-22P1A-Q20 (2022 Semifinal Grade 1, Paper A) — chain of overlapping circles.
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g1-a-q20.jpg: five circles in
// an "Olympic-rings" layout — three on top, two below — that overlap in lens
// regions. Each number sits in one region:
//
//   TOP-LEFT circle  : sole = 13 ,  ∩ bottom-left  = 17
//   BOTTOM-LEFT      : sole = 6  ,  ∩ top-left = 17 , ∩ top-middle = 7
//   TOP-MIDDLE       : sole = 12 ,  ∩ bottom-left = 7 , ∩ bottom-right = ★
//   BOTTOM-RIGHT     : sole = ♦  ,  ∩ top-middle = ★ , ∩ top-right = 5
//   TOP-RIGHT circle : sole = 25 ,  ∩ bottom-right = 5
//
// PATTERN (figure must NOT reveal it): every circle's regions add to the SAME
// total. The complete left circle (13 + 17) = 30 and the bottom-left circle
// (17 + 7 + 6) = 30, so the constant is 30.
//   top-middle : 12 + 7 + ★ = 30 → ★ = 11
//   bottom-right: ★ + 5 + ♦ = 30 → ♦ = 14
// Answer D: star = 11, diamond = 14.
//
// The static figure shows the numbers and the two unknown glyphs (★ ♦) only —
// never their values. Pure render: no Math.random / Date / window — SSR-safe.

export const CIRCLE_TOTAL = 30
export const STAR_VALUE = 11
export const DIAMOND_VALUE = 14
export const ANSWER_LETTER = 'D'

const INK = '#2B2B2B'
const FILL = '#FBE5C8' // pale cream circle fill (matches the scan)
const STROKE = '#3A3A3A'
const RED = '#E0383B' // star / diamond glyph colour (matches the scan)

// ---- geometry (viewBox units) ---------------------------------------------
export const Q20_VIEW_W = 520
export const Q20_VIEW_H = 300

const R = 92 // circle radius
const TOP_Y = 110 // centre-y of the three top circles
const BOT_Y = 178 // centre-y of the two bottom circles
// Top circle centres: spaced so neighbours overlap in a lens.
const TX = [128, 260, 392]
// Bottom circle centres sit between the top ones.
const BX = [194, 326]

/** A red five-point star centred at (cx, cy). */
function StarGlyph({ cx, cy, r = 15 }: { cx: number; cy: number; r?: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={RED} />
}

/** A red diamond (rotated square) centred at (cx, cy). */
function DiamondGlyph({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill={RED} />
}

/** One labelled region: either a number, the star, the diamond, or a value badge. */
function RegionLabel({
  x,
  y,
  kind,
  reveal,
}: {
  x: number
  y: number
  kind: number | 'star' | 'diamond'
  /** When the unknown's solved value should be shown beside its glyph. */
  reveal?: number
}) {
  if (kind === 'star') {
    return (
      <g>
        <StarGlyph cx={x} cy={y} />
        {reveal !== undefined && <ValueBadge x={x} y={y + 26} value={reveal} />}
      </g>
    )
  }
  if (kind === 'diamond') {
    return (
      <g>
        <DiamondGlyph cx={x} cy={y} />
        {reveal !== undefined && <ValueBadge x={x} y={y + 26} value={reveal} />}
      </g>
    )
  }
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK}>
      {kind}
    </text>
  )
}

/** Small green value chip used by the explainer to reveal a solved unknown. */
function ValueBadge({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <g>
      <rect x={x - 16} y={y - 13} width={32} height={26} rx={8} fill="#D1FAE5" stroke="#10B981" strokeWidth={2} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#065F46">
        {`=${value}`}
      </text>
    </g>
  )
}

export type CircleKey = 'topL' | 'topM' | 'topR' | 'botL' | 'botR'

export interface CircleChainProps {
  /** Outline these whole circles in orange (the explainer's focus circle). */
  highlightCircles?: CircleKey[]
  /** Reveal the star's solved value beside its glyph. */
  revealStar?: number
  /** Reveal the diamond's solved value beside its glyph. */
  revealDiamond?: number
  /** Show a "= 30" constant-total badge under the figure. */
  showConstant?: boolean
}

/**
 * Reusable primitive: the five overlapping circles with all region numbers and
 * the two unknown glyphs (★ ♦). `highlightCircles` rings whole circles; the
 * reveal props show a solved value chip beside a glyph; `showConstant` prints
 * the shared total. With all defaults it is the plain problem figure.
 */
export function CircleChain({
  highlightCircles = [],
  revealStar,
  revealDiamond,
  showConstant = false,
}: CircleChainProps) {
  const hi = new Set(highlightCircles)
  const circles: Array<{ key: CircleKey; cx: number; cy: number }> = [
    { key: 'topL', cx: TX[0], cy: TOP_Y },
    { key: 'topM', cx: TX[1], cy: TOP_Y },
    { key: 'topR', cx: TX[2], cy: TOP_Y },
    { key: 'botL', cx: BX[0], cy: BOT_Y },
    { key: 'botR', cx: BX[1], cy: BOT_Y },
  ]
  return (
    <svg
      viewBox={`0 0 ${Q20_VIEW_W} ${Q20_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* circle fills + outlines */}
      {circles.map(({ key, cx, cy }) => (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={R}
          fill={FILL}
          fillOpacity={0.55}
          stroke={hi.has(key) ? '#F59E0B' : STROKE}
          strokeWidth={hi.has(key) ? 5 : 2.5}
        />
      ))}

      {/* sole-region numbers (high in each top circle, low in each bottom circle) */}
      <RegionLabel x={TX[0]} y={TOP_Y - 20} kind={13} />
      <RegionLabel x={TX[1]} y={TOP_Y - 20} kind={12} />
      <RegionLabel x={TX[2]} y={TOP_Y - 20} kind={25} />
      <RegionLabel x={BX[0]} y={BOT_Y + 30} kind={6} />
      <RegionLabel x={BX[1]} y={BOT_Y + 36} kind={'diamond'} reveal={revealDiamond} />

      {/* lens (overlap) numbers, sitting in each top∩bottom intersection */}
      <RegionLabel x={(TX[0] + BX[0]) / 2 - 2} y={(TOP_Y + BOT_Y) / 2} kind={17} />
      <RegionLabel x={(TX[1] + BX[0]) / 2 + 2} y={(TOP_Y + BOT_Y) / 2} kind={7} />
      <RegionLabel x={(TX[1] + BX[1]) / 2 - 2} y={(TOP_Y + BOT_Y) / 2} kind={'star'} reveal={revealStar} />
      <RegionLabel x={(TX[2] + BX[1]) / 2 + 2} y={(TOP_Y + BOT_Y) / 2} kind={5} />

      {/* explainer-only: the constant circle total */}
      {showConstant && (
        <g>
          <rect x={Q20_VIEW_W / 2 - 70} y={Q20_VIEW_H - 34} width={140} height={26} rx={13} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
          <text x={Q20_VIEW_W / 2} y={Q20_VIEW_H - 21} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#B45309">
            {`each circle = ${CIRCLE_TOTAL}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P22G1Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A chain of five overlapping circles. The three top circles show 13, 12 and 25; the overlaps show 17, 7, a red star, and 5; the bottom-left circle shows 6 and the bottom-right circle shows a red diamond. Find the star and the diamond."
    >
      <CircleChain />
    </div>
  )
}
