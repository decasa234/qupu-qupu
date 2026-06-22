// IKMC-21-EC-Q20 — "Mia throws darts at balloons worth 3, 9, 13, 14 and 18 points.
// She scores 30 points in total. Which balloon does Mia definitely hit?"
//
// PROBLEM ONLY — shows the 5 balloons each labelled with their point value.
// Does NOT reveal which subsets sum to 30 or which balloon is the answer.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
//
// Shared layout constants re-exported so the explainer can overlay in the same coords.

/** Total SVG width. */
export const SVG_W = 300
/** Total SVG height. */
export const SVG_H = 180

/** The 5 balloon point values in display order (left → right). */
export const BALLOON_VALUES = [3, 9, 13, 14, 18] as const

/** Balloon centre positions [cx, cy] in SVG coords. */
export const BALLOON_CX = [34, 86, 150, 214, 266] as const
export const BALLOON_CY = 72 as const

/** Balloon body radius (ellipse rx, ry). */
export const B_RX = 26
export const B_RY = 30

/** String drop from balloon body bottom to knot. */
export const STRING_LEN = 38

/** Colour palette — 5 distinct colours matching the scan (blue, blue, blue, blue, blue tones
 *  from the OCR image; we use a cheerful palette to distinguish them). */
export const BALLOON_COLORS = [
  '#4A90D9', // 3  — sky blue
  '#4A90D9', // 9  — sky blue
  '#4A90D9', // 13 — sky blue
  '#4A90D9', // 14 — sky blue
  '#4A90D9', // 18 — sky blue
] as const

/** Highlight fills when a balloon is marked. */
export const HIGHLIGHT_COLORS = [
  '#2563EB', // darker blue tint
  '#2563EB',
  '#2563EB',
  '#2563EB',
  '#2563EB',
] as const

// ── Balloon primitive ────────────────────────────────────────────────────────────────────────────

/**
 * A single balloon: oval body + string + knot + centred label.
 * `highlight` shows a glow ring around the body for the explainer.
 */
export function BalloonShape({
  cx,
  cy,
  value,
  fill = '#4A90D9',
  textFill = '#fff',
  highlight = false,
  highlightColor = '#F59E0B',
  opacity = 1,
}: {
  cx: number
  cy: number
  value: number
  fill?: string
  textFill?: string
  highlight?: boolean
  highlightColor?: string
  opacity?: number
}) {
  const knotY = cy + B_RY + 6   // knot dot centre
  const strEnd = knotY + STRING_LEN

  return (
    <g opacity={opacity}>
      {/* highlight ring */}
      {highlight && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={B_RX + 5}
          ry={B_RY + 5}
          fill="none"
          stroke={highlightColor}
          strokeWidth={3}
          opacity={0.85}
        />
      )}
      {/* balloon body */}
      <ellipse cx={cx} cy={cy} rx={B_RX} ry={B_RY} fill={fill} />
      {/* sheen (top-left highlight) */}
      <ellipse
        cx={cx - B_RX * 0.28}
        cy={cy - B_RY * 0.3}
        rx={B_RX * 0.35}
        ry={B_RY * 0.25}
        fill="rgba(255,255,255,0.35)"
      />
      {/* knot dot */}
      <circle cx={cx} cy={knotY} r={4} fill={fill} />
      {/* string */}
      <line
        x1={cx}
        y1={knotY + 4}
        x2={cx}
        y2={strEnd}
        stroke="#6B7280"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* value label */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={value >= 10 ? 15 : 17}
        fontWeight={900}
        fill={textFill}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {value}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────────────────────

/**
 * Balloons20ECIllustration
 *
 * Static, problem-only figure for IKMC-21-EC-Q20.
 * Shows five blue balloons labelled 3, 9, 13, 14, 18.
 * Does NOT reveal which combination sums to 30 or which balloon is the answer.
 */
export default function Balloons20ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Five balloons labelled 3, 9, 13, 14, and 18 points hang in a row. Mia's darts score 30 in total — which balloon is definitely hit?"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ceiling rail (the balloons hang from a bar) */}
        <line x1={8} y1={18} x2={SVG_W - 8} y2={18} stroke="#D1D5DB" strokeWidth={3} strokeLinecap="round" />

        {/* strings from rail to balloon top */}
        {BALLOON_CX.map((cx, i) => (
          <line
            key={i}
            x1={cx}
            y1={18}
            x2={cx}
            y2={BALLOON_CY - B_RY}
            stroke="#9CA3AF"
            strokeWidth={1}
          />
        ))}

        {/* balloons */}
        {BALLOON_VALUES.map((val, i) => (
          <BalloonShape
            key={i}
            cx={BALLOON_CX[i]}
            cy={BALLOON_CY}
            value={val}
            fill={BALLOON_COLORS[i]}
          />
        ))}

        {/* "= 30" label at bottom centre */}
        <text
          x={SVG_W / 2}
          y={SVG_H - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Total = 30
        </text>
      </svg>
    </div>
  )
}
