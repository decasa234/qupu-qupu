// "Each arrow counts the distinct numbers seen along it" figure for WMI-19F2A-Q25.
// Reproduced faithfully from db/seed/wmi/figures/2019-final-g2-a-q25.jpg: a 3x3 layout
// of block arrows, each printed with a number. This is the WORKED EXAMPLE the question
// gives ("following the example, find ABCD") — every arrow already shows its count:
//   Row 0:  →2        ←1          ←2
//   Row 1:  →1        ↕2 (two-way) ←2
//   Row 2:  ↑2        ↑2          ←1
// Each number = how many DIFFERENT numbers are seen looking the arrow's way (a two-way
// arrow counts both directions combined).
//
// The four corner cells are marked A, B, C, D. Per the official answer the corners read
//   A=(0,0)=2, B=(0,2)=2, C=(2,0)=1, D=(2,2)=1  ->  ABCD = 2211.
export type Dir = 'right' | 'left' | 'up' | 'down' | 'updown'

export const AGG2_N = 3
export const AGG2_VIEW = 360
const AGG2_PAD = 10
export const AGG2_CELL = (AGG2_VIEW - AGG2_PAD * 2) / AGG2_N

const px = (col: number) => AGG2_PAD + col * AGG2_CELL
const py = (row: number) => AGG2_PAD + row * AGG2_CELL
const ccx = (col: number) => px(col) + AGG2_CELL / 2
const ccy = (row: number) => py(row) + AGG2_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_STROKE = '#10B981'
const SHOWN = '#1F2937'
const MARK = '#9CA3AF'

interface Cell {
  row: number
  col: number
  dir: Dir
  /** Corner marker label (A/B/C/D) for answer cells. */
  label?: string
  /** The arrow's printed count, shown in the worked-example figure. */
  shown: number
}

// The 3x3 arrows exactly as drawn in the scan, each with its printed count.
export const CELLS: ReadonlyArray<Cell> = [
  { row: 0, col: 0, dir: 'right', shown: 2, label: 'A' },
  { row: 0, col: 1, dir: 'left', shown: 1 },
  { row: 0, col: 2, dir: 'left', shown: 2, label: 'B' },
  { row: 1, col: 0, dir: 'right', shown: 1 },
  { row: 1, col: 1, dir: 'updown', shown: 2 },
  { row: 1, col: 2, dir: 'left', shown: 2 },
  { row: 2, col: 0, dir: 'up', shown: 2, label: 'C' },
  { row: 2, col: 1, dir: 'up', shown: 2 },
  { row: 2, col: 2, dir: 'left', shown: 1, label: 'D' },
]

/** The four corner answer cells in ABCD order with their solved value (official answer 2211). */
export const AGG2_ANSWER_CELLS: ReadonlyArray<{ label: string; value: number; row: number; col: number }> = [
  { label: 'A', value: 2, row: 0, col: 0 },
  { label: 'B', value: 2, row: 0, col: 2 },
  { label: 'C', value: 1, row: 2, col: 0 },
  { label: 'D', value: 1, row: 2, col: 2 },
]

export const AGG2_ANSWER = AGG2_ANSWER_CELLS.map((a) => a.value).join('') // "2211"

/** Outline path of a single-direction block arrow inside a cell, pointing `dir`. */
function arrowPoints(row: number, col: number, dir: Dir): string {
  const x = ccx(col)
  const y = ccy(row)
  const s = AGG2_CELL * 0.34 // half-length along pointing axis
  const w = AGG2_CELL * 0.16 // half-width of the shaft
  const h = AGG2_CELL * 0.27 // half-width of the head
  // Build a rightward arrow, then rotate by mapping coordinates per direction.
  const base: Array<[number, number]> = [
    [-s, -w],
    [s * 0.25, -w],
    [s * 0.25, -h],
    [s, 0],
    [s * 0.25, h],
    [s * 0.25, w],
    [-s, w],
  ]
  const rot = (p: [number, number]): [number, number] => {
    const [ax, ay] = p
    switch (dir) {
      case 'right':
        return [ax, ay]
      case 'left':
        return [-ax, ay]
      case 'down':
        return [ay, ax]
      case 'up':
        return [ay, -ax]
      default:
        return [ax, ay]
    }
  }
  return base.map((p) => rot(p)).map(([ax, ay]) => `${x + ax},${y + ay}`).join(' ')
}

/** Outline path of a two-way (up+down) block arrow. */
function twoWayPoints(row: number, col: number): string {
  const x = ccx(col)
  const y = ccy(row)
  const s = AGG2_CELL * 0.36
  const w = AGG2_CELL * 0.13
  const h = AGG2_CELL * 0.24
  const pts: Array<[number, number]> = [
    [-w, -s + h * 0.0],
    [-h, -s + h],
    [0, -s],
    [h, -s + h],
    [w, -s + h * 0.0],
    [w, s - h * 0.0],
    [h, s - h],
    [0, s],
    [-h, s - h],
    [-w, s - h * 0.0],
  ]
  return pts.map(([ax, ay]) => `${x + ax},${y + ay}`).join(' ')
}

export interface ArrowGridG2FigureProps {
  /** How many of the ABCD corner answers are revealed (0..4), in ABCD order. */
  filled?: number
  /** Index (0..3) of the corner being lit while it is revealed. */
  active?: number | null
}

export function ArrowGridG2Figure({ filled = 0, active = null }: ArrowGridG2FigureProps) {
  const litLabels = new Set(AGG2_ANSWER_CELLS.slice(0, Math.max(0, Math.min(filled, 4))).map((a) => a.label))
  const answerIndex = (label?: string) => AGG2_ANSWER_CELLS.findIndex((a) => a.label === label)

  return (
    <svg
      viewBox={`0 0 ${AGG2_VIEW} ${AGG2_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {CELLS.map((cell, i) => {
        const isAnswer = !!cell.label
        const idx = answerIndex(cell.label)
        const isLit = isAnswer && cell.label !== undefined && litLabels.has(cell.label)
        const isActive = active !== null && idx === active
        const stroke = isLit ? GREEN_STROKE : INK
        const fill = isLit ? 'rgba(16,185,129,0.16)' : 'white'
        const points = cell.dir === 'updown' ? twoWayPoints(cell.row, cell.col) : arrowPoints(cell.row, cell.col, cell.dir)

        // Centre text: the revealed corner value once lit, else the arrow's printed count.
        let centre: string
        let centreColor = SHOWN
        let italic = false
        let big = false
        if (isLit) {
          centre = String(AGG2_ANSWER_CELLS[idx].value)
          centreColor = isActive ? GREEN : INK
          big = true
        } else if (isAnswer) {
          // Corner not yet revealed: show its faint A/B/C/D marker.
          centre = cell.label ?? ''
          centreColor = MARK
          italic = true
        } else {
          centre = String(cell.shown)
        }

        return (
          <g key={`cell-${i}`}>
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive ? 3.5 : 2.5}
              strokeLinejoin="round"
            />
            <text
              x={ccx(cell.col)}
              y={ccy(cell.row)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={AGG2_CELL * (big || !isAnswer ? 0.34 : 0.26)}
              fontWeight={big || !isAnswer ? 900 : 700}
              fontStyle={italic ? 'italic' : 'normal'}
              fill={centreColor}
            >
              {centre}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ArrowGridG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 3 by 3 layout of block arrows, each printed with a number. Each arrow's number equals how many different numbers appear in the cells it points to; ` +
        `a two-way arrow counts both directions together. This is the worked example. ` +
        `The marked corner cells A, B, C, D give the 4-digit answer ABCD = ${AGG2_ANSWER}.`
      }
    >
      <ArrowGridG2Figure />
    </div>
  )
}
