// Apple make-a-ten figure for WMI-19P1A-Q8 (2019 semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2019-semifinal-g1-a-q8.jpg: two framed boxes
// of apples — the left box holds 9 apples (a row of 5 over a row of 4), the right
// box holds 8 apples (a row of 5 over a row of 3) — joined by "+", with a third
// box holding "?" after "=". The question is 9 + 8 = ? (answer 17 via make-a-ten:
// 9 + 1 = 10, then 10 + 7 = 17).
//
// The static figure shows ONLY the problem (two apple groups and the ? box). The
// explainer slides one apple across to make a ten, then counts on.
//
// Single-codepoint apple glyph drawn as a clean SVG apple (no emoji rendering
// dependency). SSR-safe and deterministic (no params, no window/document, no
// Math.random/Date.now).

export const LEFT_COUNT = 9
export const RIGHT_COUNT = 8
export const TOTAL = LEFT_COUNT + RIGHT_COUNT // 17
export const COMPLETE_TEN = 10 - LEFT_COUNT // 1 apple bridges 9 → 10
export const LEFTOVER = RIGHT_COUNT - COMPLETE_TEN // 7 apples remain after the ten

const APPLE = '#E63946'
const APPLE_DARK = '#B32430'
const LEAF = '#4CA14E'
const STEM = '#6B4226'

/** A single apple, body centred on (cx, cy). */
export function Apple({ cx, cy, r = 12, dim = false }: { cx: number; cy: number; r?: number; dim?: boolean }) {
  const opacity = dim ? 0.28 : 1
  return (
    <g opacity={opacity}>
      {/* two lobes for the classic apple silhouette */}
      <circle cx={cx - r * 0.42} cy={cy} r={r} fill={APPLE} />
      <circle cx={cx + r * 0.42} cy={cy} r={r} fill={APPLE} />
      <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 1.05} ry={r * 0.92} fill={APPLE} />
      {/* shine */}
      <ellipse cx={cx - r * 0.4} cy={cy - r * 0.4} rx={r * 0.22} ry={r * 0.3} fill="#FFFFFF" opacity={0.55} />
      {/* base shading */}
      <path
        d={`M ${cx - r} ${cy + r * 0.3} Q ${cx} ${cy + r * 1.25} ${cx + r} ${cy + r * 0.3}`}
        fill="none"
        stroke={APPLE_DARK}
        strokeWidth={1.4}
        opacity={0.5}
      />
      {/* stem + leaf */}
      <rect x={cx - 1.2} y={cy - r * 1.25} width={2.4} height={r * 0.55} rx={1.2} fill={STEM} />
      <ellipse cx={cx + r * 0.45} cy={cy - r * 1.05} rx={r * 0.4} ry={r * 0.2} fill={LEAF} transform={`rotate(-28 ${cx + r * 0.45} ${cy - r * 1.05})`} />
    </g>
  )
}

export const APPLE_VIEW_W = 460
export const APPLE_VIEW_H = 190

// Box geometry. Each group is drawn as two short rows (5 over the rest).
const BOX_W = 150
const BOX_H = 96
const BOX_Y = 36
const LEFT_BOX_X = 18
const RIGHT_BOX_X = 196
const QBOX_X = 376
const QBOX_W = 66

const ROW1_DY = 32
const ROW2_DY = 66
const APPLE_GAP = 27
const APPLE_R = 11

/** Centres for `count` apples inside a box at boxX (5 in row 1, the rest in row 2). */
function groupCenters(boxX: number, count: number): Array<{ x: number; y: number }> {
  const row1 = Math.min(5, count)
  const row2 = count - row1
  const centers: Array<{ x: number; y: number }> = []
  const startX = (n: number) => boxX + BOX_W / 2 - ((n - 1) * APPLE_GAP) / 2
  for (let i = 0; i < row1; i++) centers.push({ x: startX(row1) + i * APPLE_GAP, y: BOX_Y + ROW1_DY })
  for (let i = 0; i < row2; i++) centers.push({ x: startX(row2) + i * APPLE_GAP, y: BOX_Y + ROW2_DY })
  return centers
}

export interface AppleDiagramProps {
  /** Apples currently in the left (first) group — grows to 10 after the bridge. */
  leftCount?: number
  /** Apples currently in the right (second) group — shrinks to 7 after the bridge. */
  rightCount?: number
  /** Draw the slide arrow showing one apple moving left to complete the ten. */
  showBridge?: boolean
  /** Show "= 17" instead of "?" in the answer box. */
  showAnswer?: boolean
  /** Group sum label under the left box (e.g. "10"); null = the original count. */
  leftLabel?: string | null
  /** Group sum label under the right box; null = the original count. */
  rightLabel?: string | null
}

export function AppleDiagram({
  leftCount = LEFT_COUNT,
  rightCount = RIGHT_COUNT,
  showBridge = false,
  showAnswer = false,
  leftLabel = null,
  rightLabel = null,
}: AppleDiagramProps) {
  const left = groupCenters(LEFT_BOX_X, leftCount)
  const right = groupCenters(RIGHT_BOX_X, rightCount)

  const INK = '#1F2937'
  const BLUE = '#30598A'
  const labelY = BOX_Y + BOX_H + 22

  return (
    <svg
      viewBox={`0 0 ${APPLE_VIEW_W} ${APPLE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: APPLE_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* left box */}
      <rect x={LEFT_BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      {left.map((c, i) => (
        <Apple key={`l${i}`} cx={c.x} cy={c.y} r={APPLE_R} />
      ))}

      {/* plus */}
      <text x={(LEFT_BOX_X + BOX_W + RIGHT_BOX_X) / 2} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={INK}>
        +
      </text>

      {/* right box */}
      <rect x={RIGHT_BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      {right.map((c, i) => (
        <Apple key={`r${i}`} cx={c.x} cy={c.y} r={APPLE_R} />
      ))}

      {/* bridge arrow: one apple crosses from the right group to fill the ten */}
      {showBridge && (
        <g stroke={LEAF} strokeWidth={2.5} fill="none">
          <path d={`M ${RIGHT_BOX_X + 8} ${BOX_Y + 16} Q ${(LEFT_BOX_X + BOX_W + RIGHT_BOX_X) / 2} ${BOX_Y - 10} ${LEFT_BOX_X + BOX_W - 18} ${BOX_Y + 16}`} />
          <path
            d={`M ${LEFT_BOX_X + BOX_W - 28} ${BOX_Y + 8} L ${LEFT_BOX_X + BOX_W - 18} ${BOX_Y + 16} L ${LEFT_BOX_X + BOX_W - 26} ${BOX_Y + 22}`}
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* equals */}
      <text x={(RIGHT_BOX_X + BOX_W + QBOX_X) / 2} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={INK}>
        =
      </text>

      {/* answer box: ? until revealed */}
      <rect x={QBOX_X} y={BOX_Y} width={QBOX_W} height={BOX_H} rx={8} fill={showAnswer ? '#D1FAE5' : '#FFFFFF'} stroke={showAnswer ? '#10B981' : INK} strokeWidth={2} />
      <text
        x={QBOX_X + QBOX_W / 2}
        y={BOX_Y + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={showAnswer ? 30 : 36}
        fontWeight={900}
        fill={showAnswer ? '#065F46' : INK}
      >
        {showAnswer ? TOTAL : '?'}
      </text>

      {/* group-count labels */}
      <text x={LEFT_BOX_X + BOX_W / 2} y={labelY} textAnchor="middle" fontSize={18} fontWeight={900} fill={BLUE}>
        {leftLabel ?? String(leftCount)}
      </text>
      <text x={RIGHT_BOX_X + BOX_W / 2} y={labelY} textAnchor="middle" fontSize={18} fontWeight={900} fill={BLUE}>
        {rightLabel ?? String(rightCount)}
      </text>
    </svg>
  )
}

export default function AppleAdd19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A box of 9 apples plus a box of 8 apples equals a box with a question mark."
    >
      <AppleDiagram />
    </div>
  )
}
