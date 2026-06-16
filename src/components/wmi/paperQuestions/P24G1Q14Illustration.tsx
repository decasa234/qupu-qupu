// WMI-24P1A-Q14 (2024 Semifinal Grade 1, Paper A) — three pencils between two
// dashed lines.
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q14.jpg. A left and a right
// vertical dashed line bound a fixed gap. Three horizontal pencils sit in that gap;
// a labelled measuring gap marks the EMPTY space between a pencil end and a dashed
// line:
//   • top (yellow):  10 cm empty gap on the LEFT, tip touches the right line.
//   • middle (blue): eraser touches the left line, 5 cm empty gap on the RIGHT.
//   • bottom (green):12 cm empty gap on the LEFT, tip touches the right line.
//
// The middle pencil reaches furthest (only 5 cm of gap), so it is the longest = 15 cm.
// Hence the full gap = 15 + 5 = 20 cm. Then:
//   yellow = 20 − 10 = 10,  blue = 20 − 5 = 15,  green = 20 − 12 = 8.
// Shortest = green = 8 cm  (answer E).
//
// The static figure shows ONLY the pencils + the three labelled empty gaps — never
// the computed full width (20) or any pencil's own length.

const GAP_INK = '#222' // measuring-line / label colour
const DASH = '#444'
const TIP_WOOD = '#F4C58A'
const TIP_LEAD = '#222'
const ERASER = '#F3B6C2'
const FERRULE = '#C9CDD2'
const BODY_STROKE = '#1A1A1A'

export const FULL_GAP_CM = 20 // derived: longest pencil 15 + its 5 cm right gap
export const PENCILS = {
  yellow: { color: '#F7D745', leftGap: 10, rightGap: 0, length: FULL_GAP_CM - 10 }, // 10
  blue: { color: '#7FCBF0', leftGap: 0, rightGap: 5, length: FULL_GAP_CM - 5 }, // 15
  green: { color: '#A8D24A', leftGap: 12, rightGap: 0, length: FULL_GAP_CM - 12 }, // 8
} as const
export const SHORTEST_CM = Math.min(...Object.values(PENCILS).map((p) => p.length)) // 8

export const VIEW_W = 520
export const VIEW_H = 300
const LEFT_X = 36 // left dashed line
const RIGHT_X = 484 // right dashed line
const CM = (RIGHT_X - LEFT_X) / FULL_GAP_CM // px per cm

/**
 * One horizontal pencil drawn from x0 (eraser end) to x1 (sharpened tip).
 * Eraser + ferrule on the left, wooden cone + lead on the right.
 */
export function Pencil({ x0, x1, yc, color, h = 22 }: { x0: number; x1: number; yc: number; color: string; h?: number }) {
  const top = yc - h / 2
  const bot = yc + h / 2
  const tipLen = Math.min(h * 1.2, (x1 - x0) * 0.28)
  const coneStart = x1 - tipLen
  const eraserW = h * 0.55
  const ferruleW = h * 0.35
  const bodyStart = x0 + eraserW + ferruleW
  return (
    <g>
      {/* eraser */}
      <rect x={x0} y={top} width={eraserW} height={h} rx={4} fill={ERASER} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* ferrule */}
      <rect x={x0 + eraserW} y={top} width={ferruleW} height={h} fill={FERRULE} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* painted body */}
      <rect x={bodyStart} y={top} width={coneStart - bodyStart} height={h} fill={color} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* body grain lines */}
      <line x1={bodyStart} y1={yc - h * 0.18} x2={coneStart} y2={yc - h * 0.18} stroke={BODY_STROKE} strokeWidth={0.8} opacity={0.4} />
      <line x1={bodyStart} y1={yc + h * 0.18} x2={coneStart} y2={yc + h * 0.18} stroke={BODY_STROKE} strokeWidth={0.8} opacity={0.4} />
      {/* wooden cone */}
      <path d={`M ${coneStart} ${top} L ${x1 - tipLen * 0.28} ${yc} L ${coneStart} ${bot} Z`} fill={TIP_WOOD} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* lead point */}
      <path d={`M ${x1 - tipLen * 0.28} ${yc} L ${x1} ${yc} L ${x1 - tipLen * 0.28} ${yc} Z`} fill="none" />
      <path d={`M ${x1 - tipLen * 0.4} ${yc - h * 0.18} L ${x1} ${yc} L ${x1 - tipLen * 0.4} ${yc + h * 0.18} Z`} fill={TIP_LEAD} />
    </g>
  )
}

/** A labelled measuring gap: a thin double-arrow line with a "<n> cm" label above. */
export function GapLabel({ x0, x1, y, label, highlight = false }: { x0: number; x1: number; y: number; label: string; highlight?: boolean }) {
  const col = highlight ? '#2f6df0' : GAP_INK
  const mid = (x0 + x1) / 2
  return (
    <g stroke={col} fill={col}>
      <line x1={x0} y1={y} x2={x1} y2={y} strokeWidth={highlight ? 2.4 : 1.6} />
      {/* arrowheads */}
      <path d={`M ${x0} ${y} l 7 -4 v 8 z`} stroke="none" />
      <path d={`M ${x1} ${y} l -7 -4 v 8 z`} stroke="none" />
      <text x={mid} y={y - 7} textAnchor="middle" fontSize={17} fontWeight={700} fontStyle="italic" fontFamily="Georgia, serif" stroke="none">
        {label}
      </text>
    </g>
  )
}

export interface PencilFigureProps {
  /** Reveal the derived full gap (20 cm) bracket across the top. */
  showFullGap?: boolean
  /** Which pencil to highlight + show its computed length: 'yellow'|'blue'|'green'|null. */
  measure?: 'yellow' | 'blue' | 'green' | null
  /** Show the computed length label on the highlighted pencil. */
  showLength?: boolean
}

const ROWS = { yellow: 70, blue: 150, green: 230 } as const

export function PencilFigure({ showFullGap = false, measure = null, showLength = false }: PencilFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* dashed boundary lines */}
      <line x1={LEFT_X} y1={14} x2={LEFT_X} y2={VIEW_H - 14} stroke={DASH} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={RIGHT_X} y1={14} x2={RIGHT_X} y2={VIEW_H - 14} stroke={DASH} strokeWidth={2} strokeDasharray="6 6" />

      {/* optional derived full-width bracket */}
      {showFullGap && <GapLabel x0={LEFT_X} x1={RIGHT_X} y={26} label={`${FULL_GAP_CM} cm`} highlight />}

      {/* YELLOW: 10 cm empty gap on left, tip at right line */}
      {(() => {
        const x0 = LEFT_X + PENCILS.yellow.leftGap * CM
        const x1 = RIGHT_X
        const y = ROWS.yellow
        return (
          <g opacity={measure && measure !== 'yellow' ? 0.3 : 1}>
            <GapLabel x0={LEFT_X} x1={x0} y={y - 22} label="10 cm" highlight={measure === 'yellow'} />
            <Pencil x0={x0} x1={x1} yc={y} color={PENCILS.yellow.color} />
            {showLength && measure === 'yellow' && <LengthTag x0={x0} x1={x1} y={y + 26} cm={PENCILS.yellow.length} />}
          </g>
        )
      })()}

      {/* BLUE: eraser at left line, 5 cm empty gap on right */}
      {(() => {
        const x0 = LEFT_X
        const x1 = RIGHT_X - PENCILS.blue.rightGap * CM
        const y = ROWS.blue
        return (
          <g opacity={measure && measure !== 'blue' ? 0.3 : 1}>
            <Pencil x0={x0} x1={x1} yc={y} color={PENCILS.blue.color} />
            <GapLabel x0={x1} x1={RIGHT_X} y={y - 22} label="5 cm" highlight={measure === 'blue'} />
            {showLength && measure === 'blue' && <LengthTag x0={x0} x1={x1} y={y + 26} cm={PENCILS.blue.length} />}
          </g>
        )
      })()}

      {/* GREEN: 12 cm empty gap on left, tip at right line */}
      {(() => {
        const x0 = LEFT_X + PENCILS.green.leftGap * CM
        const x1 = RIGHT_X
        const y = ROWS.green
        return (
          <g opacity={measure && measure !== 'green' ? 0.3 : 1}>
            <GapLabel x0={LEFT_X} x1={x0} y={y - 22} label="12 cm" highlight={measure === 'green'} />
            <Pencil x0={x0} x1={x1} yc={y} color={PENCILS.green.color} />
            {showLength && measure === 'green' && <LengthTag x0={x0} x1={x1} y={y + 26} cm={PENCILS.green.length} />}
          </g>
        )
      })()}
    </svg>
  )
}

/** A green computed-length tag drawn under a pencil. */
function LengthTag({ x0, x1, y, cm }: { x0: number; x1: number; y: number; cm: number }) {
  const mid = (x0 + x1) / 2
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="#10B981" strokeWidth={2.4} />
      <path d={`M ${x0} ${y} l 7 -4 v 8 z`} fill="#10B981" />
      <path d={`M ${x1} ${y} l -7 -4 v 8 z`} fill="#10B981" />
      <text x={mid} y={y + 16} textAnchor="middle" fontSize={16} fontWeight={800} fill="#065F46">
        {`= ${cm} cm`}
      </text>
    </g>
  )
}

export default function P24G1Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three horizontal pencils between two vertical dashed lines. The top pencil has a 10 cm gap on the left, the middle pencil has a 5 cm gap on the right, and the bottom pencil has a 12 cm gap on the left."
    >
      <PencilFigure />
    </div>
  )
}
