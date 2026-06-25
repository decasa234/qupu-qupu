// SEAMOX-22-A-Q1 — "Study the number pattern carefully. Find the value of A."
//
// Stem figure: three satellite-bubble diagrams. Each diagram has a large
// center circle tangent to three small corner circles at top / bottom-left /
// bottom-right (equilateral-triangle layout). Problem values:
//   Fig 1: top=1, BL=2, BR=3, center=9
//   Fig 2: top=2, BL=3, BR=4, center=20
//   Fig 3: top=3, BL=B, BR=C, center=A  (B, C, A are unknowns)
//
// No existing primitive covers this layout → fresh SVG.
// Shared BubblePatternDiagram co-exported so the explainer can re-use and add highlights.
// Pattern adapted from AgeAlice19B7Illustration (co-export + highlight-prop approach).

const INK = '#1F2937'
const FILL_CENTER = '#EFF6FF'   // light blue — known center circles
const FILL_CORNER = '#FEF9C3'   // light yellow — known corner circles
const FILL_UNKNOWN = '#FCE7F3'  // pink — unknown placeholders (A, B, C)
const FILL_REVEAL = '#D1FAE5'   // green tint — revealed values
const STROKE = '#374151'
const ACCENT = '#2563EB'
const AMBER = '#F59E0B'
const GREEN = '#059669'

const W = 510
const H = 200
const R = 46    // large circle radius
const r = 20    // small satellite radius
const D = R + r // center-to-center distance (tangent): 66

// Satellite offsets from panel center (equilateral triangle, vertex at top)
const COS30 = Math.sqrt(3) / 2  // ≈ 0.866
const SIN30 = 0.5

const OFF = {
  top: { dx: 0,          dy: -D },
  bl:  { dx: -D * COS30, dy: D * SIN30 },
  br:  { dx:  D * COS30, dy: D * SIN30 },
}

const PANELS = [
  { cx: 85,  cy: 108 },
  { cx: 255, cy: 108 },
  { cx: 425, cy: 108 },
]

interface FigData {
  figLabel_en: string
  figLabel_id: string
  top: string
  bl: string
  br: string
  center: string
  centerFill: string
  blFill: string
  brFill: string
}

const FIGS: FigData[] = [
  {
    figLabel_en: 'Fig 1', figLabel_id: 'Gambar 1',
    top: '1', bl: '2', br: '3', center: '9',
    centerFill: FILL_CENTER, blFill: FILL_CORNER, brFill: FILL_CORNER,
  },
  {
    figLabel_en: 'Fig 2', figLabel_id: 'Gambar 2',
    top: '2', bl: '3', br: '4', center: '20',
    centerFill: FILL_CENTER, blFill: FILL_CORNER, brFill: FILL_CORNER,
  },
  {
    figLabel_en: 'Fig 3', figLabel_id: 'Gambar 3',
    top: '3', bl: 'B', br: 'C', center: 'A',
    centerFill: FILL_UNKNOWN, blFill: FILL_UNKNOWN, brFill: FILL_UNKNOWN,
  },
]

export interface BubblePatternDiagramProps {
  /** Ring top/bl/br corners across all figures to show the +1 pattern. */
  ringCorners?: boolean
  /** Reveal B=4, C=5 in figure 3. */
  revealFig3?: boolean
  /** Ring center circles across all figures. */
  ringCenters?: boolean
  /** Show final answer A=35 in figure 3. */
  showAnswer?: boolean
  lang?: 'en' | 'id'
}

interface SatProps { x: number; y: number; label: string; fill: string; ring?: boolean }

function Sat({ x, y, label, fill, ring }: SatProps) {
  return (
    <g>
      {ring && <circle cx={x} cy={y} r={r + 5} fill="none" stroke={AMBER} strokeWidth={2.5} />}
      <circle cx={x} cy={y} r={r} fill={fill} stroke={STROKE} strokeWidth={1.8} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={800} fill={INK}>{label}</text>
    </g>
  )
}

function Panel({
  cx, cy, fig, index,
  ringCorners, revealFig3, ringCenters, showAnswer, lang,
}: {
  cx: number; cy: number; fig: FigData; index: number
  ringCorners: boolean; revealFig3: boolean; ringCenters: boolean; showAnswer: boolean
  lang: 'en' | 'id'
}) {
  const topX = cx + OFF.top.dx, topY = cy + OFF.top.dy
  const blX  = cx + OFF.bl.dx,  blY  = cy + OFF.bl.dy
  const brX  = cx + OFF.br.dx,  brY  = cy + OFF.br.dy

  const isFig3 = index === 2
  const blLabel    = isFig3 && (revealFig3 || showAnswer) ? '4' : fig.bl
  const brLabel    = isFig3 && (revealFig3 || showAnswer) ? '5' : fig.br
  const centerLabel = isFig3 && showAnswer ? '35' : fig.center

  const blFill   = isFig3 && (revealFig3 || showAnswer) ? FILL_REVEAL : fig.blFill
  const brFill   = isFig3 && (revealFig3 || showAnswer) ? FILL_REVEAL : fig.brFill
  const cFill    = isFig3 && showAnswer ? FILL_REVEAL : fig.centerFill
  const ringC    = ringCenters || (isFig3 && showAnswer)
  const figLabel = lang === 'id' ? fig.figLabel_id : fig.figLabel_en
  const ringBL   = ringCorners || (isFig3 && revealFig3)
  const ringBR   = ringCorners || (isFig3 && revealFig3)

  return (
    <g>
      {ringC && (
        <circle cx={cx} cy={cy} r={R + 6} fill="none"
          stroke={showAnswer ? GREEN : AMBER} strokeWidth={2.5} />
      )}
      <circle cx={cx} cy={cy} r={R} fill={cFill} stroke={STROKE} strokeWidth={1.8} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={22} fontWeight={900}
        fill={isFig3 && showAnswer ? GREEN : ringCenters ? ACCENT : INK}>
        {centerLabel}
      </text>

      <Sat x={topX} y={topY} label={fig.top} fill={FILL_CORNER} ring={ringCorners} />
      <Sat x={blX}  y={blY}  label={blLabel}  fill={blFill}      ring={ringBL} />
      <Sat x={brX}  y={brY}  label={brLabel}  fill={brFill}      ring={ringBR} />

      <text x={cx} y={cy + R + 22} textAnchor="middle"
        fontSize={10} fontWeight={600} fill="#6B7280">{figLabel}</text>
    </g>
  )
}

/** Shared satellite-bubble diagram — used by both the stem illustration and the explainer. */
export function BubblePatternDiagram({
  ringCorners = false,
  revealFig3 = false,
  ringCenters = false,
  showAnswer = false,
  lang = 'en',
}: BubblePatternDiagramProps) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true">
      {PANELS.map((p, i) => (
        <Panel
          key={i} cx={p.cx} cy={p.cy} fig={FIGS[i]} index={i}
          ringCorners={ringCorners}
          revealFig3={revealFig3}
          ringCenters={ringCenters}
          showAnswer={showAnswer}
          lang={lang}
        />
      ))}
    </svg>
  )
}

/** SEAMOX-22-A-Q1 stem illustration — shows the problem only; A, B, C remain hidden. */
export default function BubblePatternX22A1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Three bubble diagrams. Figure 1: top=1, BL=2, BR=3, center=9. ' +
        'Figure 2: top=2, BL=3, BR=4, center=20. ' +
        'Figure 3: top=3, BL=B, BR=C, center=A — find A.'
      }
    >
      <BubblePatternDiagram />
    </div>
  )
}
