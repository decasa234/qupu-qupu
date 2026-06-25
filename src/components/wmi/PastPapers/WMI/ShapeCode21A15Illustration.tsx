/**
 * SEAMO-21-A-Q15 — "Find the missing number."
 *
 * Each panel shows an outer shape containing an inner shape.
 * The rule: assign each shape a code digit —
 *   Square = 4, Circle = 2, Diamond = 1, Triangle = 3
 * The two-digit number = (outer_digit × 10) + inner_digit.
 *
 * Source images (2021.imgs/019-023.jpg):
 *   019: Square outer + Diamond inner → 41
 *   020: Circle outer  + Triangle inner → 23
 *   021: Diamond outer + Triangle inner → 13
 *   022: Square outer  + Circle inner  (part of question pair, value not labelled)
 *   023: Circle outer  + Square inner  → ? = 24  (answer D)
 *
 * Four panels are shown: first three are given examples, the last has "?".
 *
 * Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.
 */

// ── Palette ────────────────────────────────────────────────────────────────────
const BG       = '#FFFBF0'
const STROKE   = '#1F2937'
const FILL_OUT = '#FEF3C7'   // outer shape fill
const FILL_IN  = '#DBEAFE'   // inner shape fill
const AMBER    = '#F59E0B'
const GREEN    = '#10B981'

// ── Panel geometry ─────────────────────────────────────────────────────────────
const PANEL_W   = 90
const PANEL_H   = 90
const GAP       = 14
const COLS      = 4
const TOTAL_W   = COLS * PANEL_W + (COLS - 1) * GAP + 32
const TOTAL_H   = PANEL_H + 72   // panel + label row + number row

// ── Shape drawing helpers (each emits <g> elements for SVG) ───────────────────

type ShapeType = 'square' | 'circle' | 'diamond' | 'triangle'

/** Draws an outer container shape centred at (cx, cy). */
function OuterShape({ type, cx, cy, highlight }: {
  type: ShapeType
  cx: number
  cy: number
  highlight?: boolean
}) {
  const r      = 36
  const stroke = highlight ? AMBER   : STROKE
  const sw     = highlight ? 3       : 2
  const fill   = FILL_OUT

  if (type === 'square') {
    return (
      <rect
        x={cx - r} y={cy - r} width={r * 2} height={r * 2}
        fill={fill} stroke={stroke} strokeWidth={sw} rx={2}
      />
    )
  }
  if (type === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
  if (type === 'diamond') {
    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
  // triangle
  const h = r * 1.6
  const pts = `${cx},${cy - r} ${cx + r * 1.1},${cy + h * 0.5} ${cx - r * 1.1},${cy + h * 0.5}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
}

/** Draws a smaller inner shape centred at (cx, cy). */
function InnerShape({ type, cx, cy, highlight }: {
  type: ShapeType
  cx: number
  cy: number
  highlight?: boolean
}) {
  const r      = 16
  const stroke = highlight ? GREEN  : STROKE
  const sw     = highlight ? 2.5    : 1.5
  const fill   = FILL_IN

  if (type === 'square') {
    return (
      <rect
        x={cx - r} y={cy - r} width={r * 2} height={r * 2}
        fill={fill} stroke={stroke} strokeWidth={sw} rx={1}
      />
    )
  }
  if (type === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
  if (type === 'diamond') {
    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
  // triangle
  const h = r * 1.4
  const pts = `${cx},${cy - r} ${cx + r * 1.1},${cy + h * 0.5} ${cx - r * 1.1},${cy + h * 0.5}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
}

// ── Data ───────────────────────────────────────────────────────────────────────

export interface ShapePanel {
  outer:  ShapeType
  inner:  ShapeType
  value:  number | null   // null = the "?" panel
}

export const PANELS: ShapePanel[] = [
  { outer: 'square',   inner: 'diamond',  value: 41 },
  { outer: 'circle',   inner: 'triangle', value: 23 },
  { outer: 'diamond',  inner: 'triangle', value: 13 },
  { outer: 'circle',   inner: 'square',   value: null },
]

// ── Shared SVG ─────────────────────────────────────────────────────────────────

export interface ShapeCode21A15SVGProps {
  /** Index of highlighted panel (outer amber, inner green). */
  highlightPanel?: number | null
  /** Show the answer (24) for the last panel. */
  revealAnswer?: boolean
}

export function ShapeCode21A15SVG({
  highlightPanel = null,
  revealAnswer   = false,
}: ShapeCode21A15SVGProps) {
  const PAD_L = 16
  const PAD_T = 10
  const NUM_Y = PANEL_H + 36   // y of the number label below each panel

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width="100%"
      style={{ maxWidth: TOTAL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={TOTAL_W} height={TOTAL_H} fill={BG} rx={8} />

      {PANELS.map((p, i) => {
        const panelX  = PAD_L + i * (PANEL_W + GAP)
        const cx      = panelX + PANEL_W / 2
        const cy      = PAD_T  + PANEL_H / 2
        const isHL    = highlightPanel === i

        // The number below the panel
        const displayVal = p.value !== null
          ? String(p.value)
          : revealAnswer ? '24' : '?'
        const numColor = p.value !== null
          ? STROKE
          : revealAnswer ? GREEN : AMBER

        return (
          <g key={i}>
            {/* Panel background */}
            <rect
              x={panelX} y={PAD_T}
              width={PANEL_W} height={PANEL_H}
              fill="#FFFFFF"
              stroke={isHL ? AMBER : '#E5E7EB'}
              strokeWidth={isHL ? 2 : 1}
              rx={6}
            />

            {/* Outer shape */}
            <OuterShape type={p.outer} cx={cx} cy={cy} highlight={isHL} />

            {/* Inner shape */}
            <InnerShape type={p.inner} cx={cx} cy={cy} highlight={isHL} />

            {/* Value label */}
            <text
              x={cx}
              y={NUM_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fontWeight={800}
              fill={numColor}
              fontFamily="system-ui, sans-serif"
            >
              {displayVal}
            </text>
          </g>
        )
      })}

      {/* "Rule" arrow indicator — small arrow between panels 2 and 3 */}
      {/* (just horizontal divider after the 3 examples) */}
      <line
        x1={PAD_L + 3 * (PANEL_W + GAP) - GAP / 2}
        y1={PAD_T + PANEL_H / 2}
        x2={PAD_L + 3 * (PANEL_W + GAP) - GAP / 2 + 2}
        y2={PAD_T + PANEL_H / 2}
        stroke="#D1D5DB"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
    </svg>
  )
}

// ── Default export — static stem illustration ──────────────────────────────────

export default function ShapeCode21A15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Four panels: Square+Diamond→41, Circle+Triangle→23, Diamond+Triangle→13, Circle+Square→?'
      }
    >
      <ShapeCode21A15SVG />
    </div>
  )
}
