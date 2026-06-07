// "Each arrow counts the distinct numbers seen along it" figure for WMI-19F1-Q25.
// Reconstructed from the real figure: a 3x3 layout of block arrows. Each arrow's
// number = how many DIFFERENT numbers lie in the cells it points at (a two-way
// arrow counts both directions together). One arrow is pre-filled with 2.
// The marked arrows A, B, C, D give the 4-digit answer ABCD = 2211.
//
// Layout (row 0 = top, col 0 = left), with each arrow's pointing direction:
//   Row 0:  A →(right)   ←(left)      ↓(down)
//   Row 1:  ↑(up)        →(right)     D ↕(up+down, two-way)
//   Row 2:  B ↑(up)      C ↑(up)      2 ←(left)
export type Dir = 'right' | 'left' | 'up' | 'down' | 'updown'

export const AG_N = 3
export const AG_VIEW = 360
const AG_PAD = 10
export const AG_CELL = (AG_VIEW - AG_PAD * 2) / AG_N

const px = (col: number) => AG_PAD + col * AG_CELL
const py = (row: number) => AG_PAD + row * AG_CELL
const ccx = (col: number) => px(col) + AG_CELL / 2
const ccy = (row: number) => py(row) + AG_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_STROKE = '#10B981'
const GIVEN = '#6B7280'
const MARK = '#9CA3AF'

interface Cell {
  row: number
  col: number
  dir: Dir
  /** Marker label (A/B/C/D) for answer arrows. */
  label?: string
  /** Pre-filled given value shown in the figure. */
  given?: number
}

export const CELLS: ReadonlyArray<Cell> = [
  { row: 0, col: 0, dir: 'right', label: 'A' },
  { row: 0, col: 1, dir: 'left' },
  { row: 0, col: 2, dir: 'down' },
  { row: 1, col: 0, dir: 'up' },
  { row: 1, col: 1, dir: 'right' },
  { row: 1, col: 2, dir: 'updown', label: 'D' },
  { row: 2, col: 0, dir: 'up', label: 'B' },
  { row: 2, col: 1, dir: 'up', label: 'C' },
  { row: 2, col: 2, dir: 'left', given: 2 },
]

/** The four answer arrows in ABCD order with their solved value. */
export const ANSWER_ARROWS: ReadonlyArray<{ label: string; value: number; row: number; col: number }> = [
  { label: 'A', value: 2, row: 0, col: 0 },
  { label: 'B', value: 2, row: 2, col: 0 },
  { label: 'C', value: 1, row: 2, col: 1 },
  { label: 'D', value: 1, row: 1, col: 2 },
]

export const AG_ANSWER = ANSWER_ARROWS.map((a) => a.value).join('') // "2211"

/** Outline path of a single-direction block arrow inside a cell, pointing `dir`. */
function arrowPoints(row: number, col: number, dir: Dir): string {
  const x = ccx(col)
  const y = ccy(row)
  const s = AG_CELL * 0.34 // half-length along pointing axis
  const w = AG_CELL * 0.16 // half-width of the shaft
  const h = AG_CELL * 0.27 // half-width of the head
  // Build a rightward arrow, then rotate by mapping coordinates per direction.
  // Rightward arrow points (relative to centre):
  //   tail-top, head-base-top, head-top, tip, head-bottom, head-base-bottom, tail-bottom
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
  const s = AG_CELL * 0.36
  const w = AG_CELL * 0.13
  const h = AG_CELL * 0.24
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

export interface ArrowGridFigureProps {
  /** How many of the ABCD answer arrows are filled (0..4), in ABCD order. */
  filled?: number
  /** Index (0..3) of the answer arrow being lit while it is filled. */
  active?: number | null
}

export function ArrowGridFigure({ filled = 0, active = null }: ArrowGridFigureProps) {
  const litLabels = new Set(ANSWER_ARROWS.slice(0, Math.max(0, Math.min(filled, 4))).map((a) => a.label))
  const answerIndex = (label?: string) => ANSWER_ARROWS.findIndex((a) => a.label === label)

  return (
    <svg
      viewBox={`0 0 ${AG_VIEW} ${AG_VIEW}`}
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

        // Centre text: the filled value, else the faint A/B/C/D marker, else a given number.
        let centre: string | null = null
        let centreColor = INK
        let italic = false
        if (cell.given !== undefined) {
          centre = String(cell.given)
        } else if (isLit) {
          centre = String(ANSWER_ARROWS[idx].value)
          centreColor = isActive ? GREEN : INK
        } else if (isAnswer) {
          centre = cell.label ?? null
          centreColor = MARK
          italic = true
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
            {centre && (
              <text
                x={ccx(cell.col)}
                y={ccy(cell.row)}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={AG_CELL * (cell.given !== undefined || isLit ? 0.34 : 0.26)}
                fontWeight={cell.given !== undefined || isLit ? 900 : 700}
                fontStyle={italic ? 'italic' : 'normal'}
                fill={cell.given !== undefined ? GIVEN : centreColor}
              >
                {centre}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ArrowGridIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        `A 3 by 3 layout of block arrows. Each arrow's number equals how many different numbers appear in the cells it points to; ` +
        `a two-way arrow counts both directions together. One arrow already shows 2. ` +
        `The marked arrows A, B, C, D give the 4-digit answer ABCD = ${AG_ANSWER}.`
      }
    >
      <ArrowGridFigure />
    </div>
  )
}
