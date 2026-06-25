// HKIMO-20-P3H-Q4 — "According to the pattern shown below, what is the number in the blank?"
//
// Three labeled triangles. Each has a number at the top vertex and two numbers at the bottom
// corners. The rule (hidden in the stem) is top = left × right − 3.
//   Triangle 1: top=9,  BL=3, BR=4
//   Triangle 2: top=17, BL=5, BR=4
//   Triangle 3: top=?,  BL=6, BR=3   (? shown in yellow highlight — answer 15 NOT revealed)
//
// Fresh SVG — no primitive covers "triangle with numbers at vertices".
// SSR-safe: pure render, no hooks, no Math.random, no Date.

// ── Layout constants (shared with explainer) ──────────────────────────────────

export const SVG_W = 420
export const SVG_H = 185

/** Half-width of a triangle base (pixels). */
export const TRI_HW = 52
/** Apex Y coordinate. */
export const APEX_Y = 36
/** Base Y coordinate. */
export const BASE_Y = 138
/** Triangle centre X for each of the 3 triangles. */
export const TRI_CX = [72, 210, 348] as const

export const COLOR = {
  TRI_FILL:   '#FFFBF0',   // warm cream
  TRI_STROKE: '#1F2937',   // near-black
  LABEL:      '#1F2937',
  BADGE_FILL: '#FDE68A',   // amber for "?"
  BADGE_RING: '#B45309',
  ORDINAL:    '#6B7280',
  HL_FILL:    '#DBEEFF',   // light-blue highlight for active triangle in explainer
  HL_STROKE:  '#2563EB',
} as const

// ── Shared triangle component ─────────────────────────────────────────────────

export interface TrianglePanelProps {
  /** Horizontal centre of the triangle. */
  cx: number
  /** Number shown at the top vertex (string so "?" is supported). */
  top: string
  /** Number shown at the bottom-left vertex. */
  left: string
  /** Number shown at the bottom-right vertex. */
  right: string
  /** When true the top label is drawn inside a yellow badge instead of plain text. */
  topBadge?: boolean
  /** When true the triangle background is highlighted blue (explainer only). */
  highlight?: boolean
}

export function TrianglePanel({
  cx,
  top,
  left,
  right,
  topBadge = false,
  highlight = false,
}: TrianglePanelProps) {
  const fill   = highlight ? COLOR.HL_FILL   : COLOR.TRI_FILL
  const stroke = highlight ? COLOR.HL_STROKE : COLOR.TRI_STROKE
  const pts    = `${cx},${APEX_Y} ${cx - TRI_HW},${BASE_Y} ${cx + TRI_HW},${BASE_Y}`

  return (
    <g>
      {/* Triangle outline */}
      <polygon
        points={pts}
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Top vertex label / badge */}
      {topBadge ? (
        <g>
          <rect
            x={cx - 14}
            y={APEX_Y - 26}
            width={28}
            height={22}
            rx={5}
            fill={COLOR.BADGE_FILL}
            stroke={COLOR.BADGE_RING}
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={APEX_Y - 10}
            textAnchor="middle"
            fontSize={13}
            fontWeight="700"
            fill={COLOR.BADGE_RING}
          >
            {top}
          </text>
        </g>
      ) : (
        <text
          x={cx}
          y={APEX_Y - 10}
          textAnchor="middle"
          fontSize={14}
          fontWeight="700"
          fill={COLOR.LABEL}
        >
          {top}
        </text>
      )}

      {/* Bottom-left label */}
      <text
        x={cx - TRI_HW - 10}
        y={BASE_Y + 4}
        textAnchor="end"
        fontSize={14}
        fontWeight="700"
        fill={COLOR.LABEL}
      >
        {left}
      </text>

      {/* Bottom-right label */}
      <text
        x={cx + TRI_HW + 10}
        y={BASE_Y + 4}
        textAnchor="start"
        fontSize={14}
        fontWeight="700"
        fill={COLOR.LABEL}
      >
        {right}
      </text>
    </g>
  )
}

// ── Shared diagram (re-exported for explainer) ────────────────────────────────

export interface NumTriHK20P3Q4DiagramProps {
  /** Index 0/1/2 of which triangle is highlighted (−1 = none). */
  highlightIdx?: number
  /** When true the third triangle shows the answer (15) instead of "?". */
  revealAnswer?: boolean
}

export function NumTriHK20P3Q4Diagram({
  highlightIdx = -1,
  revealAnswer = false,
}: NumTriHK20P3Q4DiagramProps) {
  const TRIANGLES: Omit<TrianglePanelProps, 'cx'>[] = [
    { top: '9',  left: '3', right: '4' },
    { top: '17', left: '5', right: '4' },
    { top: revealAnswer ? '15' : '?', left: '6', right: '3', topBadge: !revealAnswer },
  ]

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      role="img"
      aria-label="Three number triangles; find the missing top value"
    >
      {TRI_CX.map((cx, i) => (
        <TrianglePanel
          key={i}
          cx={cx}
          top={TRIANGLES[i].top}
          left={TRIANGLES[i].left}
          right={TRIANGLES[i].right}
          topBadge={TRIANGLES[i].topBadge}
          highlight={highlightIdx === i}
        />
      ))}

      {/* Ordinal labels */}
      {TRI_CX.map((cx, i) => (
        <text
          key={`lbl-${i}`}
          x={cx}
          y={SVG_H - 6}
          textAnchor="middle"
          fontSize={11}
          fill={COLOR.ORDINAL}
          fontStyle="italic"
        >
          {`Triangle ${i + 1}`}
        </text>
      ))}
    </svg>
  )
}

// ── Default export — stem illustration (problem only, answer hidden) ──────────

export default function NumTriHK20P3Q4Illustration() {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <NumTriHK20P3Q4Diagram />
    </div>
  )
}
