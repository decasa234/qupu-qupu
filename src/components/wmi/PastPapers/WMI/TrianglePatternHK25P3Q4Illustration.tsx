// HKIMO-25-P3H-Q4 — "According to the pattern shown below, what is the missing number?"
//
// Three triangles; each has a number at the top vertex and two numbers at the
// bottom-left and bottom-right vertices.  Rule: top = (left + right) × 2.
//
//   Triangle 1: top=14, left=2,  right=5
//   Triangle 2: top=20, left=3,  right=7
//   Triangle 3: top=?,  left=11, right=5   ← stem shows "?" — answer NOT revealed
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer) ──────────────────

export const SVG_W = 340
export const SVG_H = 130

/** How wide each triangle panel is. */
export const PANEL_W = 100

/** Left x of panel i (0-indexed). */
export const panelX = (i: number) => 12 + i * (PANEL_W + 8)

/** Triangle geometry within a panel (local coords, panel origin = panelX(i)). */
export const TRI = {
  topX: PANEL_W / 2,
  topY: 14,
  botY: 104,
  leftX: 8,
  rightX: PANEL_W - 8,
} as const

export const COLOR = {
  stroke: '#374151',
  fill: '#EFF6FF',
  label: '#1F2937',
  question: '#DC2626',
  shadow: '#BFDBFE',
} as const

// ── Triangle sub-component ────────────────────────────────────────────────────

interface TriProps {
  ox: number          // panel left-x in SVG coords
  top: string         // label at apex (may be "?")
  left: string        // label at bottom-left
  right: string       // label at bottom-right
  topColor?: string   // override apex label colour
}

export function TriPanel({ ox, top, left, right, topColor }: TriProps) {
  const { topX, topY, botY, leftX, rightX } = TRI
  const pts = `${ox + topX},${topY} ${ox + leftX},${botY} ${ox + rightX},${botY}`
  const labelColor = topColor ?? COLOR.label

  return (
    <g>
      {/* triangle fill */}
      <polygon points={pts} fill={COLOR.fill} stroke={COLOR.stroke} strokeWidth={1.8} />

      {/* apex label */}
      <text
        x={ox + topX}
        y={topY - 5}
        textAnchor="middle"
        fontSize={13}
        fontWeight="700"
        fill={labelColor}
        fontFamily="sans-serif"
      >
        {top}
      </text>

      {/* bottom-left label */}
      <text
        x={ox + leftX - 3}
        y={botY + 13}
        textAnchor="middle"
        fontSize={13}
        fontWeight="600"
        fill={COLOR.label}
        fontFamily="sans-serif"
      >
        {left}
      </text>

      {/* bottom-right label */}
      <text
        x={ox + rightX + 3}
        y={botY + 13}
        textAnchor="middle"
        fontSize={13}
        fontWeight="600"
        fill={COLOR.label}
        fontFamily="sans-serif"
      >
        {right}
      </text>
    </g>
  )
}

// ── Main illustration component ───────────────────────────────────────────────

export default function TrianglePatternHK25P3Q4Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Three triangles; the third triangle has a missing top number"
    >
      {/* Triangle 1: top=14, left=2, right=5 */}
      <TriPanel ox={panelX(0)} top="14" left="2" right="5" />

      {/* Triangle 2: top=20, left=3, right=7 */}
      <TriPanel ox={panelX(1)} top="20" left="3" right="7" />

      {/* Triangle 3: top=?, left=11, right=5 */}
      <TriPanel ox={panelX(2)} top="?" left="11" right="5" topColor={COLOR.question} />
    </svg>
  )
}
