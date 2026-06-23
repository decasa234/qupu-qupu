// AppleFamily16B20Illustration.tsx
//
// Stem illustration for SEAMO-16-B-Q20:
//   "Mr Wang bought a basket of apples for the family.
//    If each family member eats 4 apples, 10 are left over.
//    If each family member eats 6 apples, they are short by 6.
//    How many apples did Mr Wang buy?"
//
// Shows two labelled scenario panels side by side:
//   Panel A: Each person gets 4 → "+10" surplus tag (green)
//   Panel B: Each person gets 6 → "−6"  deficit tag  (red)
// A question mark basket sits between them.
//
// Co-exports: Apple, BasketGlyph, SVG_W, SVG_H,
//   SCENARIO_A, SCENARIO_B (constants bound to seed quantities).
//
// Pure render — no Math.random, no Date, no browser globals. SSR-safe.
//
// Primitive reuse: Apple shape adapted from AppleBags23PEIllustration (inline).

// ── Shared quantities (bound to seed breakdown.quantities) ─────────────────

/** Each-person share in scenario A. */
export const SHARE_A = 4
/** Leftover apples in scenario A. */
export const SURPLUS_A = 10

/** Each-person share in scenario B. */
export const SHARE_B = 6
/** Shortfall in scenario B. */
export const DEFICIT_B = 6

/** Number of family members (the unknown, revealed by explainer). */
export const FAMILY_N = 8

/** Total apples (the answer). */
export const TOTAL_T = 42

// ── SVG canvas ─────────────────────────────────────────────────────────────

export const SVG_W = 400
export const SVG_H = 210

// ── Colour tokens ────────────────────────────────────────────────────────────

export const C = {
  // apple
  APPLE_RED:   '#E63946',
  APPLE_DARK:  '#B32430',
  LEAF:        '#4CA14E',
  STEM:        '#6B4226',

  // basket
  BASKET_BODY: '#C47A3A',
  BASKET_LIGHT:'#F5DEB3',
  BASKET_RIM:  '#8B4513',

  // scenario panels
  PANEL_A_BG:   '#F0FFF4', // green-50
  PANEL_A_BOR:  '#22C55E', // green-500
  PANEL_A_LABEL:'#166534', // green-800
  SURPLUS_BG:   '#DCFCE7', // green-100
  SURPLUS_TXT:  '#166534',

  PANEL_B_BG:   '#FFF5F5', // red-50
  PANEL_B_BOR:  '#EF4444', // red-500
  PANEL_B_LABEL:'#991B1B', // red-800
  DEFICIT_BG:   '#FEE2E2', // red-100
  DEFICIT_TXT:  '#991B1B',

  // person glyphs
  PERSON:      '#60A5FA', // blue-400
  PERSON_DARK: '#1D4ED8', // blue-700

  // text
  TEXT_DARK:   '#1F2937',
  TEXT_MED:    '#374151',
  BANNER_BG:   '#FEF9C3',
  BANNER_TXT:  '#92400E',
} as const

// ── Apple primitive (adapted from AppleBags23PEIllustration) ─────────────────

export interface AppleProps {
  cx: number
  cy: number
  r?: number
  dim?: boolean
}

export function Apple({ cx, cy, r = 9, dim = false }: AppleProps) {
  const opacity = dim ? 0.3 : 1
  return (
    <g opacity={opacity}>
      <circle cx={cx - r * 0.42} cy={cy} r={r} fill={C.APPLE_RED} />
      <circle cx={cx + r * 0.42} cy={cy} r={r} fill={C.APPLE_RED} />
      <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 1.05} ry={r * 0.92} fill={C.APPLE_RED} />
      <ellipse
        cx={cx - r * 0.4}
        cy={cy - r * 0.4}
        rx={r * 0.22}
        ry={r * 0.3}
        fill="#FFFFFF"
        opacity={0.55}
      />
      <path
        d={`M ${cx - r} ${cy + r * 0.3} Q ${cx} ${cy + r * 1.25} ${cx + r} ${cy + r * 0.3}`}
        fill="none"
        stroke={C.APPLE_DARK}
        strokeWidth={1}
        opacity={0.4}
      />
      <rect x={cx - 1} y={cy - r * 1.25} width={2} height={r * 0.55} rx={1} fill={C.STEM} />
      <ellipse
        cx={cx + r * 0.45}
        cy={cy - r * 1.05}
        rx={r * 0.4}
        ry={r * 0.18}
        fill={C.LEAF}
        transform={`rotate(-28 ${cx + r * 0.45} ${cy - r * 1.05})`}
      />
    </g>
  )
}

// ── Basket primitive ──────────────────────────────────────────────────────────

export interface BasketGlyphProps {
  cx: number
  baseY: number
  /** Width of the basket. @default 54 */
  w?: number
  /** Height of the basket body. @default 36 */
  h?: number
}

/**
 * A simple weave basket (front-facing).
 * Drawn as a trapezoid body + curved rim + handle arc.
 * Emits a `<g>` — place inside a parent `<svg>`.
 */
export function BasketGlyph({ cx, baseY, w = 54, h = 36 }: BasketGlyphProps) {
  const tw = w          // top width
  const bw = w * 0.78  // bottom width (tapers in)
  const tx = cx - tw / 2
  const bx = cx - bw / 2

  // Trapezoid body
  const bodyPath = [
    `M ${tx} ${baseY - h}`,
    `L ${tx + tw} ${baseY - h}`,
    `L ${bx + bw} ${baseY}`,
    `L ${bx} ${baseY}`,
    'Z',
  ].join(' ')

  // Horizontal weave lines
  const weaveLines: Array<[number, number, number, number]> = []
  const steps = 4
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1)
    const y = (baseY - h) + t * h
    const lx = tx + (bx - tx) * t
    const rx = tx + tw + (bx + bw - tx - tw) * t
    weaveLines.push([lx, y, rx, y])
  }

  return (
    <g>
      {/* body */}
      <path d={bodyPath} fill={C.BASKET_LIGHT} stroke={C.BASKET_BODY} strokeWidth={2} />

      {/* weave lines */}
      {weaveLines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.BASKET_BODY} strokeWidth={1} opacity={0.55} />
      ))}

      {/* rim */}
      <rect
        x={tx - 2}
        y={baseY - h - 5}
        width={tw + 4}
        height={6}
        rx={3}
        fill={C.BASKET_RIM}
        stroke={C.BASKET_BODY}
        strokeWidth={1}
      />

      {/* handle arc */}
      <path
        d={`M ${cx - tw * 0.28} ${baseY - h - 2} Q ${cx} ${baseY - h - 22} ${cx + tw * 0.28} ${baseY - h - 2}`}
        fill="none"
        stroke={C.BASKET_RIM}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Person glyph (stick figure) ───────────────────────────────────────────────

export function PersonGlyph({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const r = size * 0.22
  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={cy - size * 0.55} r={r} fill={C.PERSON} stroke={C.PERSON_DARK} strokeWidth={1} />
      {/* body */}
      <line x1={cx} y1={cy - size * 0.33} x2={cx} y2={cy + size * 0.1} stroke={C.PERSON_DARK} strokeWidth={1.5} />
      {/* arms */}
      <line x1={cx - size * 0.3} y1={cy - size * 0.18} x2={cx + size * 0.3} y2={cy - size * 0.18} stroke={C.PERSON_DARK} strokeWidth={1.5} />
      {/* legs */}
      <line x1={cx} y1={cy + size * 0.1} x2={cx - size * 0.22} y2={cy + size * 0.55} stroke={C.PERSON_DARK} strokeWidth={1.5} />
      <line x1={cx} y1={cy + size * 0.1} x2={cx + size * 0.22} y2={cy + size * 0.55} stroke={C.PERSON_DARK} strokeWidth={1.5} />
    </g>
  )
}

// ── ScenarioPanel ─────────────────────────────────────────────────────────────

interface ScenarioPanelProps {
  /** Left edge of panel. */
  x: number
  /** Top edge of panel. */
  y: number
  width: number
  height: number
  /** "each gets N apples" */
  share: number
  /** Tag value (positive = surplus, negative = deficit). */
  tagValue: number
  isSurplus: boolean
  label: string      // e.g. "Scenario A"
  labelColor: string
  panelFill: string
  panelStroke: string
  tagBg: string
  tagText: string
}

function ScenarioPanel({
  x, y, width, height,
  share, tagValue, isSurplus,
  label, labelColor,
  panelFill, panelStroke,
  tagBg, tagText,
}: ScenarioPanelProps) {
  const cx = x + width / 2
  // Person row: show 3 representative people at the top of each panel
  const personCount = 3
  const personSpacing = 36
  const personStartX = cx - ((personCount - 1) * personSpacing) / 2
  const personY = y + 30

  // Apples per person: show `share` small apples in a tight row below each person
  const appleR = 5
  const appleSpacing = appleR * 2.4

  // Tag string
  const tagStr = isSurplus ? `+${tagValue} left` : `−${tagValue} short`

  return (
    <g>
      {/* panel background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={panelFill}
        stroke={panelStroke}
        strokeWidth={2}
      />

      {/* panel label */}
      <text
        x={cx}
        y={y + 12}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={labelColor}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>

      {/* "each gets N" label */}
      <text
        x={cx}
        y={y + 24}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fill={C.TEXT_MED}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`each gets ${share}`}
      </text>

      {/* Three representative people */}
      {Array.from({ length: personCount }, (_, i) => (
        <PersonGlyph
          key={i}
          cx={personStartX + i * personSpacing}
          cy={personY}
          size={16}
        />
      ))}

      {/* Apples beneath each person */}
      {Array.from({ length: personCount }, (_, pi) => {
        const px = personStartX + pi * personSpacing
        const appleRowStart = px - ((share - 1) * appleSpacing) / 2
        const appleY = personY + 20
        return Array.from({ length: share }, (_, ai) => (
          <Apple
            key={`${pi}-${ai}`}
            cx={appleRowStart + ai * appleSpacing}
            cy={appleY}
            r={appleR}
          />
        ))
      })}

      {/* Surplus / deficit tag pill */}
      <rect
        x={cx - 30}
        y={y + height - 22}
        width={60}
        height={18}
        rx={9}
        fill={tagBg}
        stroke={panelStroke}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={y + height - 13}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={800}
        fill={tagText}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {tagStr}
      </text>
    </g>
  )
}

// ── Main diagram ──────────────────────────────────────────────────────────────

export interface AppleFamilyDiagramProps {
  /** Show the solved answer (used by explainer). */
  showAnswer?: boolean
}

export function AppleFamilyDiagram({ showAnswer = false }: AppleFamilyDiagramProps) {
  const panelW = 158
  const panelH = 148
  const gap = 18
  const totalW = panelW * 2 + gap
  const startX = (SVG_W - totalW) / 2
  const panelY = 30

  const basketCX = SVG_W / 2
  const basketBaseY = panelY - 4

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* "? apples" question basket centred at top */}
      <BasketGlyph cx={basketCX} baseY={basketBaseY} w={46} h={30} />
      <text
        x={basketCX}
        y={panelY - 36}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={showAnswer ? 13 : 11}
        fontWeight={800}
        fill={showAnswer ? C.PANEL_A_LABEL : C.TEXT_DARK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {showAnswer ? `${TOTAL_T} apples` : '? apples'}
      </text>

      {/* Scenario A — 4 per person, +10 surplus */}
      <ScenarioPanel
        x={startX}
        y={panelY + 10}
        width={panelW}
        height={panelH}
        share={SHARE_A}
        tagValue={SURPLUS_A}
        isSurplus={true}
        label={`4 each → +${SURPLUS_A} left`}
        labelColor={C.PANEL_A_LABEL}
        panelFill={C.PANEL_A_BG}
        panelStroke={C.PANEL_A_BOR}
        tagBg={C.SURPLUS_BG}
        tagText={C.SURPLUS_TXT}
      />

      {/* Scenario B — 6 per person, −6 short */}
      <ScenarioPanel
        x={startX + panelW + gap}
        y={panelY + 10}
        width={panelW}
        height={panelH}
        share={SHARE_B}
        tagValue={DEFICIT_B}
        isSurplus={false}
        label={`6 each → −${DEFICIT_B} short`}
        labelColor={C.PANEL_B_LABEL}
        panelFill={C.PANEL_B_BG}
        panelStroke={C.PANEL_B_BOR}
        tagBg={C.DEFICIT_BG}
        tagText={C.DEFICIT_TXT}
      />
    </svg>
  )
}

// ── Default export (stem illustration) ───────────────────────────────────────

export default function AppleFamily16B20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Two scenarios side by side. Left panel (green): each person eats 4 apples, 10 left over. ' +
        'Right panel (red): each person eats 6 apples, short by 6. A basket with question mark sits above.'
      }
    >
      <AppleFamilyDiagram />
    </div>
  )
}
