// Number pyramid for WMI-20F1A-Q21.
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q21.jpg: a 5-row pyramid
// of blocks where each block is the sum of the two directly below it. Givens:
//   bottom row: 1, 2, _, 3, _      (the two blanks are asked-about cells)
//   row above:  3, _, _, _
//   middle row: 7, _, 10
//   top:        the star
// Canonical values (breakdown.quantities in db/seed/wmi/papers/2020-final-g1.json):
//   bottom 1 2 2 3 2 → 3 4 5 5 → 7 9 10 → 16 19 → star = 35.
//
// Cell keys are "row-index" with ROW 0 = THE BOTTOM ROW and index 0 = the
// leftmost block of that row (so the star block is "4-0").

export const STAR_ANSWER = 35

/** Givens printed in the figure, keyed "row-index" (row 0 = bottom). */
export const GIVENS: Record<string, number> = {
  '0-0': 1,
  '0-1': 2,
  '0-3': 3,
  '1-0': 3,
  '2-0': 7,
  '2-2': 10,
}

/** Full solved pyramid, keyed "row-index" (row 0 = bottom). */
export const FULL_SOLUTION: Record<string, number> = {
  '0-0': 1,
  '0-1': 2,
  '0-2': 2,
  '0-3': 3,
  '0-4': 2,
  '1-0': 3,
  '1-1': 4,
  '1-2': 5,
  '1-3': 5,
  '2-0': 7,
  '2-1': 9,
  '2-2': 10,
  '3-0': 16,
  '3-1': 19,
  '4-0': 35,
}

/** The bottom-row blanks that the figure marks with '?'. */
const QUESTION_KEYS = new Set(['0-2', '0-4'])

const STAR_KEY = '4-0'
const ROWS = 5

export const PYR_VIEW_W = 360
export const PYR_VIEW_H = 258

const BLOCK_W = 60
const BLOCK_H = 40
const GAP = 6
const BOTTOM_PAD = 12

const INK = '#1F2937'
const BLOCK_FILL = '#F8FAFC'
const BLOCK_STROKE = '#64748B'
const ACTIVE_FILL = '#D1FAE5'
const ACTIVE_STROKE = '#10B981'
const STAR_COLOR = '#F59E0B'

/** Centre of block `index` in `row` (row 0 = bottom). */
function blockPos(row: number, index: number) {
  const count = ROWS - row
  const rowW = count * BLOCK_W + (count - 1) * GAP
  const x = (PYR_VIEW_W - rowW) / 2 + index * (BLOCK_W + GAP) + BLOCK_W / 2
  const y = PYR_VIEW_H - BOTTOM_PAD - row * (BLOCK_H + GAP) - BLOCK_H / 2
  return { x, y }
}

function StarGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={STAR_COLOR} stroke="#B45309" strokeWidth={1.5} strokeLinejoin="round" />
}

export interface PyramidDiagramProps {
  /** Values to display in blocks, keyed "row-index" (row 0 = bottom). Merged over the givens. */
  solved?: Record<string, number>
  /** Block keys to tint green (the cells the current step is reasoning about). */
  activeKeys?: string[]
  /** Replace the top star with its value (35) in green. */
  showStar?: boolean
}

export function PyramidDiagram({ solved = {}, activeKeys = [], showStar = false }: PyramidDiagramProps) {
  const active = new Set(activeKeys)
  return (
    <svg
      viewBox={`0 0 ${PYR_VIEW_W} ${PYR_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: ROWS - row }, (_, index) => {
          const key = `${row}-${index}`
          const { x, y } = blockPos(row, index)
          const isActive = active.has(key)
          const isStar = key === STAR_KEY
          const value = solved[key] ?? GIVENS[key]
          return (
            <g key={key}>
              <rect
                x={x - BLOCK_W / 2}
                y={y - BLOCK_H / 2}
                width={BLOCK_W}
                height={BLOCK_H}
                rx={7}
                fill={isActive ? ACTIVE_FILL : BLOCK_FILL}
                stroke={isActive ? ACTIVE_STROKE : BLOCK_STROKE}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isStar ? (
                showStar ? (
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill="#10B981">
                    {STAR_ANSWER}
                  </text>
                ) : (
                  <StarGlyph cx={x} cy={y} r={15} />
                )
              ) : value !== undefined ? (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={19}
                  fontWeight={900}
                  fill={GIVENS[key] !== undefined ? INK : '#047857'}
                >
                  {value}
                </text>
              ) : QUESTION_KEYS.has(key) ? (
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={900} fill="#94A3B8">
                  ?
                </text>
              ) : null}
            </g>
          )
        }),
      )}
    </svg>
  )
}

export default function Pyramid20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 5-row number pyramid where each block is the sum of the two blocks below it. Bottom row: 1, 2, blank, 3, blank. Next row starts with 3. Middle row shows 7 and 10. The top block is a star — find its value."
    >
      <PyramidDiagram />
    </div>
  )
}
