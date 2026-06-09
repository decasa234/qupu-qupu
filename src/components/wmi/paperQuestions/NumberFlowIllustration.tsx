// "Number-flow boxes" figure for WMI-19F1-Q22 (answer 20).
// Reproduces the real paper figure:
//   14 splits (two down arrows) into a blank box and a box "9".
//   23 splits (two down arrows) into a box "8" and a blank box.
//   Only the two OUTER (blank) boxes flow down into the apple.
// So left blank = 14 - 9 = 5, right blank = 23 - 8 = 15, apple = 5 + 15 = 20.

export const NF_TOP_LEFT = 14
export const NF_TOP_RIGHT = 23
export const NF_INNER_LEFT = 9 // printed box under 14
export const NF_INNER_RIGHT = 8 // printed box under 23
export const NF_OUTER_LEFT = NF_TOP_LEFT - NF_INNER_LEFT // 5 (blank, computed)
export const NF_OUTER_RIGHT = NF_TOP_RIGHT - NF_INNER_RIGHT // 15 (blank, computed)
export const NF_APPLE = NF_OUTER_LEFT + NF_OUTER_RIGHT // 20

export const NF_VIEW_W = 360
export const NF_VIEW_H = 240

const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.18)'
const INK = '#1F2937'
const APPLE_RED = '#DC2626'

// Box geometry: four boxes across the middle, two top numbers, one apple at the bottom.
const BOX = 46
const ROW_Y = 110 // y of the four-box row (top edge)
const BOX_XS = [22, 100, 186, 264] // left x of each of the four boxes: [outerL, innerL(9), innerR(8), outerR]
const TOP_Y = 26 // y of the top numbers (14, 23)
const TOP_LEFT_X = (BOX_XS[0] + BOX_XS[1]) / 2 + BOX / 2 // centred above its two children (boxes 0 & 1)
const TOP_RIGHT_X = (BOX_XS[2] + BOX_XS[3]) / 2 + BOX / 2 // centred above its two children (boxes 2 & 3)
const APPLE_X = NF_VIEW_W / 2 - BOX / 2
const APPLE_Y = 184

const boxCx = (i: number) => BOX_XS[i] + BOX / 2
const boxTopY = ROW_Y
const boxBottomY = ROW_Y + BOX

/** Index of the four middle boxes: 0 outer-left, 1 inner-left(9), 2 inner-right(8), 3 outer-right. */
export type NfBox = 0 | 1 | 2 | 3

interface ArrowProps {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

function Arrow({ x1, y1, x2, y2, color }: ArrowProps) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const head = 8
  const hx = x2 - head * Math.cos(ang)
  const hy = y2 - head * Math.sin(ang)
  const wing = 0.4
  const p1x = x2 - head * Math.cos(ang - wing)
  const p1y = y2 - head * Math.sin(ang - wing)
  const p2x = x2 - head * Math.cos(ang + wing)
  const p2y = y2 - head * Math.sin(ang + wing)
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
    </g>
  )
}

function AppleGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx - r * 0.32} cy={cy + r * 0.12} r={r * 0.62} fill={APPLE_RED} />
      <circle cx={cx + r * 0.32} cy={cy + r * 0.12} r={r * 0.62} fill={APPLE_RED} />
      <rect x={cx - 1.4} y={cy - r * 0.9} width={2.8} height={r * 0.5} rx={1.2} fill="#7C4A1E" />
      <ellipse cx={cx + r * 0.34} cy={cy - r * 0.62} rx={r * 0.3} ry={r * 0.16} fill="#16A34A" transform={`rotate(35 ${cx + r * 0.34} ${cy - r * 0.62})`} />
    </g>
  )
}

export interface NumberFlowFigureProps {
  /** Boxes whose value is "lit" (computed). Outer boxes light when solved; inner are always known. */
  lit?: Set<NfBox>
  /** When true, light the apple and show 20 in it. */
  litApple?: boolean
  /** Hide the apple glyph and show the apple's numeric value instead. */
  showAppleValue?: boolean
}

export function NumberFlowFigure({ lit, litApple = false, showAppleValue = false }: NumberFlowFigureProps) {
  const known: Record<NfBox, number | null> = {
    0: NF_OUTER_LEFT,
    1: NF_INNER_LEFT,
    2: NF_INNER_RIGHT,
    3: NF_OUTER_RIGHT,
  }
  // Inner boxes (1,2) are printed in the paper; outer boxes (0,3) are blank until "lit".
  const isPrinted = (i: NfBox) => i === 1 || i === 2
  const isVisible = (i: NfBox) => isPrinted(i) || (lit?.has(i) ?? false)
  const isHighlighted = (i: NfBox) => lit?.has(i) ?? false

  return (
    <svg
      viewBox={`0 0 ${NF_VIEW_W} ${NF_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Top numbers 14 and 23. */}
      {([[TOP_LEFT_X, NF_TOP_LEFT], [TOP_RIGHT_X, NF_TOP_RIGHT]] as const).map(([x, v]) => (
        <text
          key={`top-${v}`}
          x={x}
          y={TOP_Y}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={26}
          fontWeight={900}
          fill={INK}
        >
          {v}
        </text>
      ))}

      {/* Splitting arrows from each top number to its two boxes. */}
      <Arrow x1={TOP_LEFT_X - 8} y1={TOP_Y + 16} x2={boxCx(0)} y2={boxTopY - 4} color={INK} />
      <Arrow x1={TOP_LEFT_X + 8} y1={TOP_Y + 16} x2={boxCx(1)} y2={boxTopY - 4} color={INK} />
      <Arrow x1={TOP_RIGHT_X - 8} y1={TOP_Y + 16} x2={boxCx(2)} y2={boxTopY - 4} color={INK} />
      <Arrow x1={TOP_RIGHT_X + 8} y1={TOP_Y + 16} x2={boxCx(3)} y2={boxTopY - 4} color={INK} />

      {/* The four middle boxes. */}
      {([0, 1, 2, 3] as NfBox[]).map((i) => {
        const hot = isHighlighted(i)
        return (
          <g key={`box-${i}`}>
            <rect
              x={BOX_XS[i]}
              y={ROW_Y}
              width={BOX}
              height={BOX}
              rx={4}
              fill={hot ? GREEN_FILL : '#FFFFFF'}
              stroke={hot ? GREEN : INK}
              strokeWidth={hot ? 3 : 2}
            />
            {isVisible(i) && (
              <text
                x={boxCx(i)}
                y={ROW_Y + BOX / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={22}
                fontWeight={900}
                fill={hot ? '#065F46' : INK}
              >
                {known[i]}
              </text>
            )}
          </g>
        )
      })}

      {/* Arrows from the two OUTER boxes down into the apple. */}
      <Arrow x1={boxCx(0)} y1={boxBottomY + 2} x2={APPLE_X - 4} y2={APPLE_Y + BOX / 2} color={litApple ? GREEN : INK} />
      <Arrow x1={boxCx(3)} y1={boxBottomY + 2} x2={APPLE_X + BOX + 4} y2={APPLE_Y + BOX / 2} color={litApple ? GREEN : INK} />

      {/* Apple box. */}
      <rect
        x={APPLE_X}
        y={APPLE_Y}
        width={BOX}
        height={BOX}
        rx={4}
        fill={litApple ? GREEN_FILL : '#FFFFFF'}
        stroke={litApple ? GREEN : INK}
        strokeWidth={litApple ? 3 : 2}
      />
      {showAppleValue ? (
        <text
          x={APPLE_X + BOX / 2}
          y={APPLE_Y + BOX / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={22}
          fontWeight={900}
          fill={litApple ? '#065F46' : INK}
        >
          {NF_APPLE}
        </text>
      ) : (
        <AppleGlyph cx={APPLE_X + BOX / 2} cy={APPLE_Y + BOX / 2} r={14} />
      )}
    </svg>
  )
}

export default function NumberFlowIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Number-flow boxes: ${NF_TOP_LEFT} splits into a blank box and ${NF_INNER_LEFT}; ${NF_TOP_RIGHT} splits into ${NF_INNER_RIGHT} and a blank box. The two blank boxes (${NF_OUTER_LEFT} and ${NF_OUTER_RIGHT}) flow into the apple, which equals ${NF_APPLE}.`}
    >
      <NumberFlowFigure />
    </div>
  )
}
