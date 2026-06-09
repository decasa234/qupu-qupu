// Two balance scales for WMI-19F2A-Q20 — "find the weight of one white ball."
//
// Scale 1: 3 black + 2 dotted + 3 white balls weigh 180 g.
// Scale 2: 3 black + 2 dotted + 1 white ball weigh 120 g.
// Both scales share the SAME 3 black + 2 dotted balls; only the white count differs
// (3 vs 1 → 2 extra white). So 180 − 120 = 60 g is exactly 2 white balls, and one
// white ball weighs 60 ÷ 2 = 30 g.
//
// Ball glyphs: black = filled disc, dotted = white disc with small dots, white = outline only.

export type BallKind = 'black' | 'dotted' | 'white'

/** Each scale's ball row + total, in figure order (black, dotted, white). */
export interface ScaleDef {
  /** Balls left-to-right on the tray. */
  balls: BallKind[]
  /** Gram reading shown on the base. */
  grams: number
}

export const SCALE1: ScaleDef = {
  balls: ['black', 'black', 'black', 'dotted', 'dotted', 'white', 'white', 'white'],
  grams: 180,
}
export const SCALE2: ScaleDef = {
  balls: ['black', 'black', 'black', 'dotted', 'dotted', 'white'],
  grams: 120,
}

export const WHITE_BALL_G = 30 // (180 − 120) ÷ 2

// ---- geometry (one scale drawn inside a 300×190 cell) ----
export const CELL_W = 300
export const CELL_H = 190

const TRAY_Y = 70
const TRAY_LEFT = 26
const TRAY_RIGHT = CELL_W - 26
const BALL_R = 13
const BALL_GAP = 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = '#D1FAE5'

/** Centre x of each ball so the row is centred on the tray. */
function ballCenters(n: number): number[] {
  const step = BALL_R * 2 + BALL_GAP
  const totalW = n * step - BALL_GAP
  const startX = CELL_W / 2 - totalW / 2 + BALL_R
  return Array.from({ length: n }, (_, i) => startX + i * step)
}

/** One ball glyph at (cx, cy). Deterministic dot positions for the 'dotted' kind. */
function Ball({ kind, cx, cy, highlight }: { kind: BallKind; cx: number; cy: number; highlight?: boolean }) {
  if (kind === 'black') {
    return <circle cx={cx} cy={cy} r={BALL_R} fill={highlight ? '#7C2D12' : INK} stroke={INK} strokeWidth={1.5} />
  }
  const ringStroke = highlight ? GREEN : INK
  const ringWidth = highlight ? 3 : 2
  if (kind === 'white') {
    return <circle cx={cx} cy={cy} r={BALL_R} fill={highlight ? GREEN_FILL : '#FFFFFF'} stroke={ringStroke} strokeWidth={ringWidth} />
  }
  // dotted: white disc + 5 deterministic dots
  const dots: Array<[number, number]> = [
    [0, 0],
    [-6, -4],
    [6, -4],
    [-6, 4],
    [6, 4],
  ]
  return (
    <g>
      <circle cx={cx} cy={cy} r={BALL_R} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={cy + dy} r={1.7} fill={INK} />
      ))}
    </g>
  )
}

export interface ScaleFigureProps {
  def: ScaleDef
  /** Highlight balls of this kind (e.g. 'white' to point out the differing balls). */
  highlightKind?: BallKind | null
  /** Show the grams reading in green (solved/emphasis). */
  emphasizeTotal?: boolean
}

/** A single scale: flat tray, trapezoid base, gram reading, and the ball row. */
export function ScaleFigure({ def, highlightKind = null, emphasizeTotal = false }: ScaleFigureProps) {
  const centers = ballCenters(def.balls.length)
  const totalFill = emphasizeTotal ? GREEN_FILL : '#FFFFFF'
  const totalStroke = emphasizeTotal ? GREEN : INK
  const totalText = emphasizeTotal ? '#065F46' : INK

  return (
    <svg
      viewBox={`0 0 ${CELL_W} ${CELL_H}`}
      width="100%"
      style={{ maxWidth: CELL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Balls sit on the tray */}
      {def.balls.map((kind, i) => (
        <Ball key={i} kind={kind} cx={centers[i]} cy={TRAY_Y - BALL_R - 2} highlight={highlightKind === kind} />
      ))}

      {/* Flat tray (a thin parallelogram bar) */}
      <polygon
        points={`${TRAY_LEFT},${TRAY_Y} ${TRAY_RIGHT},${TRAY_Y} ${TRAY_RIGHT - 12},${TRAY_Y + 12} ${TRAY_LEFT + 12},${TRAY_Y + 12}`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* Trapezoid base */}
      <polygon
        points={`${CELL_W / 2 - 30},${TRAY_Y + 12} ${CELL_W / 2 + 30},${TRAY_Y + 12} ${CELL_W / 2 + 80},${CELL_H - 18} ${CELL_W / 2 - 80},${CELL_H - 18}`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.5}
      />
      {/* Ground line */}
      <line x1={CELL_W / 2 - 92} y1={CELL_H - 18} x2={CELL_W / 2 + 92} y2={CELL_H - 18} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />

      {/* Gram reading pill on the base */}
      <rect x={CELL_W / 2 - 48} y={CELL_H - 64} width={96} height={34} rx={17} fill={totalFill} stroke={totalStroke} strokeWidth={2.5} />
      <text x={CELL_W / 2} y={CELL_H - 47} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={totalText}>
        {def.grams}g
      </text>
    </svg>
  )
}

export default function BalanceTwoScalesG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two balance scales. The first holds 3 black, 2 dotted and 3 white balls weighing 180 grams; the second holds 3 black, 2 dotted and 1 white ball weighing 120 grams."
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
        <ScaleFigure def={SCALE1} />
        <ScaleFigure def={SCALE2} />
      </div>
    </div>
  )
}
