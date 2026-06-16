// Kite-pattern matrix for WMI-21P1A-Q22 (2021 Semifinal Grade 1 Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g1-a-q22.jpg — a 3×3 grid of
// kites. The top-left cell is blank; the centre-left cell holds the "?".
//
//   row 0:  (blank)        red · diamond     yellow · long-kite
//   row 1:  ?              yellow · diamond  white · diamond
//   row 2:  yellow · diamond  white · long-kite  red · long-kite
//
// Two intrinsic attributes drive the pattern:
//   COLOUR  ∈ {red, yellow, white} — each filled ROW and each COLUMN carries the
//           three colours once (a Latin-square). Row 1 already has yellow + white,
//           so "?" is RED. (Columns 1 & 2 each already show all three.)
//   SHAPE   ∈ {diamond (compact, top≈bottom), long-kite (tall, pointed tail)} —
//           each COLUMN holds exactly ONE diamond, and that diamond walks DOWN
//           the diagonal: col1 → row0, col2 → row1, so col0 → row2. The col-0
//           diamond is the row-2 yellow one, so "?" (row1,col0) is a LONG-KITE.
//
// ⇒ "?" is a RED LONG-KITE — option C.
//
// The static figure shows only the eight given kites and the "?"; it never draws
// the answer kite.

export type KiteColor = 'red' | 'yellow' | 'white'
export type KiteShape = 'diamond' | 'long'

const FILL: Record<KiteColor, string> = {
  red: '#E23B2E',
  yellow: '#F2B705',
  white: '#FFFFFF',
}
const OUTLINE = '#1A1A1A'

/**
 * One kite centred at (cx, cy), drawn into a ~110×110 box. A "diamond" is a
 * compact rhombus (top ≈ bottom); a "long" kite is the classic taller shape with
 * a longer lower point. Both carry the crossed spars and a wavy tail.
 */
export function Kite({
  cx,
  cy,
  color,
  shape,
  scale = 1,
}: {
  cx: number
  cy: number
  color: KiteColor
  shape: KiteShape
  scale?: number
}) {
  // half-widths / heights (before scale)
  const hw = shape === 'long' ? 28 : 24
  const topH = shape === 'long' ? 26 : 24
  const botH = shape === 'long' ? 44 : 26
  const s = scale
  const top: [number, number] = [cx, cy - topH * s]
  const bot: [number, number] = [cx, cy + botH * s]
  const left: [number, number] = [cx - hw * s, cy - (shape === 'long' ? 4 : 0) * s]
  const right: [number, number] = [cx + hw * s, cy - (shape === 'long' ? 4 : 0) * s]
  const pts = `${top[0]},${top[1]} ${right[0]},${right[1]} ${bot[0]},${bot[1]} ${left[0]},${left[1]}`

  // wavy tail from the bottom point, curling to the lower-right
  const tx = bot[0]
  const ty = bot[1]
  const tail = `M ${tx} ${ty} q ${10 * s} ${8 * s} ${4 * s} ${16 * s} q ${-6 * s} ${8 * s} ${6 * s} ${14 * s}`

  return (
    <g>
      <path d={tail} fill="none" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      <polygon points={pts} fill={FILL[color]} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      {/* crossed spars: vertical (top→bottom) and horizontal (left→right) */}
      <line x1={top[0]} y1={top[1]} x2={bot[0]} y2={bot[1]} stroke={OUTLINE} strokeWidth={2} />
      <line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={OUTLINE} strokeWidth={2} />
    </g>
  )
}

export const P21G1Q22_VIEW = 360
const N = 3
const CELL = 116
const PAD = 6

function center(i: number) {
  return PAD + i * CELL + CELL / 2
}

interface CellSpec {
  color: KiteColor
  shape: KiteShape
}

// The eight given kites (null = blank cell, 'q' = the "?" cell).
const GRID: (CellSpec | 'q' | null)[][] = [
  [null, { color: 'red', shape: 'diamond' }, { color: 'yellow', shape: 'long' }],
  ['q', { color: 'yellow', shape: 'diamond' }, { color: 'white', shape: 'diamond' }],
  [{ color: 'yellow', shape: 'diamond' }, { color: 'white', shape: 'long' }, { color: 'red', shape: 'long' }],
]

// The verified answer kite (NOT drawn in the static figure).
export const P21G1Q22_ANSWER: CellSpec = { color: 'red', shape: 'long' }
export const P21G1Q22_ANSWER_LETTER = 'C'

export interface P21G1Q22GridProps {
  /** Reveal the solved kite in the "?" cell (red long-kite). */
  revealAnswer?: boolean
  /** Ring the cells of a row/column the explainer is reasoning about. */
  highlightRow?: number | null
  highlightCol?: number | null
}

export function P21G1Q22Grid({ revealAnswer = false, highlightRow = null, highlightCol = null }: P21G1Q22GridProps) {
  return (
    <svg
      viewBox={`0 0 ${P21G1Q22_VIEW} ${P21G1Q22_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* grid frame */}
      {Array.from({ length: N + 1 }, (_, i) => (
        <line key={`v${i}`} x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + N * CELL} stroke="#111827" strokeWidth={3} />
      ))}
      {Array.from({ length: N + 1 }, (_, i) => (
        <line key={`h${i}`} x1={PAD} y1={PAD + i * CELL} x2={PAD + N * CELL} y2={PAD + i * CELL} stroke="#111827" strokeWidth={3} />
      ))}

      {/* highlight ring */}
      {highlightRow != null &&
        Array.from({ length: N }, (_, c) => (
          <rect
            key={`hr${c}`}
            x={PAD + c * CELL + 3}
            y={PAD + highlightRow * CELL + 3}
            width={CELL - 6}
            height={CELL - 6}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={4}
            rx={6}
          />
        ))}
      {highlightCol != null &&
        Array.from({ length: N }, (_, r) => (
          <rect
            key={`hc${r}`}
            x={PAD + highlightCol * CELL + 3}
            y={PAD + r * CELL + 3}
            width={CELL - 6}
            height={CELL - 6}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={4}
            rx={6}
          />
        ))}

      {/* kites */}
      {GRID.map((row, r) =>
        row.map((cell, c) => {
          const cx = center(c)
          const cy = center(r)
          if (cell === null) return null
          if (cell === 'q') {
            if (revealAnswer) {
              return <Kite key={`k${r}${c}`} cx={cx} cy={cy} color={P21G1Q22_ANSWER.color} shape={P21G1Q22_ANSWER.shape} />
            }
            return (
              <text
                key={`q${r}${c}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={46}
                fontWeight={900}
                fill="#111827"
              >
                ?
              </text>
            )
          }
          return <Kite key={`k${r}${c}`} cx={cx} cy={cy} color={cell.color} shape={cell.shape} />
        }),
      )}
    </svg>
  )
}

export default function P21G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A three by three grid of kites. The centre-left cell holds a question mark; the top-left cell is empty. Each row and column carries red, yellow and white kites."
    >
      <P21G1Q22Grid />
    </div>
  )
}
