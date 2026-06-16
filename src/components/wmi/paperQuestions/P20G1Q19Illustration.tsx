// Quartered-circle number pattern for WMI-20P1A-Q19 (2020 Grade 1 Semifinal).
//
// Source figure (db/seed/wmi/figures/2020-semifinal-g1-a-q19.jpg shows the first
// circle) + the stem text, which lists all four circles:
//   circle 1:  TL 4 | TR 20 over BL 5 | BR 11
//   circle 2:  TL 30 | TR 49 over BL 12 | BR 7
//   circle 3:  TL 12 | TR  ? over BL  8 | BR 3   (the star)
//   circle 4:  TL 5 | TR 18 over BL 7 | BR 6
// Rule: top-right = top-left + bottom-left + bottom-right.
//   circle 1: 4 + 5 + 11 = 20 ✓   circle 2: 30 + 12 + 7 = 49 ✓
//   circle 4: 5 + 7 + 6 = 18 ✓     circle 3: 12 + 8 + 3 = 23  → answer C.
//
// The static figure shows ONLY the problem: the star stays hidden as "?".

const INK = '#1F2937'
const RULE = '#94A3B8'

export interface QuarterCircle {
  tl: number | string
  tr: number | string
  bl: number | string
  br: number | string
}

/** The four circles exactly as posed; circle 3's top-right is the unknown star. */
export const Q19_CIRCLES: QuarterCircle[] = [
  { tl: 4, tr: 20, bl: 5, br: 11 },
  { tl: 30, tr: 49, bl: 12, br: 7 },
  { tl: 12, tr: '?', bl: 8, br: 3 },
  { tl: 5, tr: 18, bl: 7, br: 6 },
]

/** Index of the circle that carries the star (the unknown). */
export const Q19_STAR_CIRCLE = 2
export const Q19_STAR_VALUE = 23 // answer C

const R = 52 // circle radius

/**
 * One quartered circle centred at (cx, cy): a circle split by a vertical and a
 * horizontal diameter, with a number in each quarter. Pass `highlight` to tint a
 * named quarter, or a value override for the top-right (used by the explainer to
 * reveal the answer).
 */
export function QuarteredCircle({
  cx,
  cy,
  data,
  highlight = 'none',
  trOverride,
}: {
  cx: number
  cy: number
  data: QuarterCircle
  highlight?: 'none' | 'tl' | 'bl' | 'br' | 'tr'
  trOverride?: number | string
}) {
  const off = R * 0.5 // quarter-text offset from centre
  const tint = (q: 'tl' | 'bl' | 'br' | 'tr') => (highlight === q ? '#2f6df0' : INK)
  const tr = trOverride ?? data.tr
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={RULE} strokeWidth={2} />
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={RULE} strokeWidth={2} />
      <text x={cx - off} y={cy - off} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={tint('tl')}>
        {data.tl}
      </text>
      <text x={cx + off} y={cy - off} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={tint('tr')}>
        {tr}
      </text>
      <text x={cx - off} y={cy + off} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={tint('bl')}>
        {data.bl}
      </text>
      <text x={cx + off} y={cy + off} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={tint('br')}>
        {data.br}
      </text>
    </g>
  )
}

export const Q19_VIEW_W = 460
export const Q19_VIEW_H = 160

const CIRCLE_Y = 80
const FIRST_X = 70
const GAP_X = 110

export interface Q19DiagramProps {
  /** Which circle's quarters to tint (none = plain). */
  highlightCircle?: number
  /** Quarter to tint in the highlighted circle. */
  highlightQuarter?: 'none' | 'tl' | 'bl' | 'br' | 'tr'
  /** Reveal the star value in the star circle's top-right. */
  revealStar?: boolean
}

export function Q19Diagram({ highlightCircle = -1, highlightQuarter = 'none', revealStar = false }: Q19DiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${Q19_VIEW_W} ${Q19_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Q19_CIRCLES.map((data, i) => {
        const isStar = i === Q19_STAR_CIRCLE
        return (
          <g key={i}>
            <QuarteredCircle
              cx={FIRST_X + i * GAP_X}
              cy={CIRCLE_Y}
              data={data}
              highlight={i === highlightCircle ? highlightQuarter : 'none'}
              trOverride={isStar && revealStar ? Q19_STAR_VALUE : undefined}
            />
            {/* star glyph marking the unknown quarter, hidden once revealed */}
            {isStar && !revealStar && (
              <text
                x={FIRST_X + i * GAP_X + R * 0.5}
                y={CIRCLE_Y - R * 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fill="#F59E0B"
              >
                {'★'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four circles, each split into quarters with a number in each quarter. The third circle's top-right quarter holds a star to be found."
    >
      <Q19Diagram />
    </div>
  )
}
