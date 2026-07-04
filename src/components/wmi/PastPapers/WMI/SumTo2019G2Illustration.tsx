// "Stacked addition, maximize the 4-digit number" figure for WMI-19F2A-Q23.
//
// A right-aligned column addition adding to 2019:
//   a 2-digit number on top, a 3-digit number in the middle (with a + sign),
//   and a 4-digit number on the bottom, ruled off above the total 2019.
//   Pick nine of the ten digits 0-9 (each at most once; 0 must be used) so the
//   sum is 2019 and the 4-digit number is as large as possible.
//
// A valid maximal arrangement:  82 + 340 + 1597 = 2019.
//   2-digit = 82, 3-digit = 340, 4-digit = 1597.
//   Used digits {8,2,3,4,0,1,5,9,7} are all different; the unused digit is 6; 0 is used.
//   The largest possible 4-digit number is 1597 (the tens column totals 21 and
//   carries 2 into the hundreds: 3 + 5 + 2 = 10).

/** The maximal 4-digit number (the answer). */
export const MAX_FOUR = 1597
/** The worked arrangement, right-aligned in a 4-column grid (units last). */
export const TOP_NUM = 82 //   2-digit
export const MID_NUM = 340 //  3-digit
export const BOT_NUM = 1597 // 4-digit
export const TOTAL = 2019

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'
const GRAY = '#9CA3AF'
const BOX_FILL = '#FFFFFF'
const GREEN_FILL = 'rgba(16,185,129,0.15)'

// Four right-aligned columns: index 0 = thousands ... index 3 = units.
// length = how many of the rightmost columns the number occupies.
function digitCells(value: number, length: number): (string | null)[] {
  const s = String(value).padStart(4, '0').split('') // ['0','0','8','2'] etc.
  return s.map((ch, i) => {
    const colsFromRight = 4 - i
    return colsFromRight <= length ? ch : null
  })
}

export const TOP_CELLS = digitCells(TOP_NUM, 2) // [null, null, '8', '2']
export const MID_CELLS = digitCells(MID_NUM, 3) // [null, '3', '4', '0']
export const BOT_CELLS = digitCells(BOT_NUM, 4) // ['1','5','9','7']
export const TOTAL_CELLS = String(TOTAL).split('') // ['2','0','1','9']

export const SUM_VIEW_W = 280
export const SUM_VIEW_H = 270

const COL_W = 50
const COL_GAP = 6
const GRID_W = COL_W * 4 + COL_GAP * 3
const GRID_X0 = (SUM_VIEW_W - GRID_W) - 18 // right-aligned grid, leaving room for + sign
const BOX_H = 44

const ROW_Y = [18, 70, 122] // top (2-digit), middle (3-digit), bottom (4-digit)
const RULE_Y = 122 + BOX_H + 12 // below the bottom row
const TOTAL_Y = RULE_Y + 14

const colX = (col: number) => GRID_X0 + col * (COL_W + COL_GAP)

const AMBER = '#D97706'

function DigitBox({
  col,
  y,
  ch,
  filled,
  trial,
}: {
  col: number
  y: number
  ch: string | null
  filled: boolean
  /** A candidate digit being tried (not fixed) — drawn translucent amber. */
  trial?: string | null
}) {
  // Fixed digits are GREEN (deduced, certain); trial digits are translucent
  // amber (just simulating); everything else is a gray dashed '?'.
  const fixed = filled && ch !== null
  const isTrial = !fixed && trial != null
  return (
    <g opacity={isTrial ? 0.55 : 1}>
      <rect
        x={colX(col)}
        y={y}
        width={COL_W}
        height={BOX_H}
        rx={7}
        fill={fixed ? GREEN_FILL : BOX_FILL}
        stroke={fixed ? GREEN : isTrial ? AMBER : GRAY}
        strokeWidth={fixed ? 3 : isTrial ? 2.5 : 1.5}
        strokeDasharray={fixed ? undefined : isTrial ? '6 4' : '4 4'}
      />
      <text
        x={colX(col) + COL_W / 2}
        y={y + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={26}
        fontWeight={900}
        fill={fixed ? '#065F46' : isTrial ? '#92400E' : GRAY}
      >
        {fixed ? ch : isTrial ? trial : '?'}
      </text>
    </g>
  )
}

export interface TrialDigit {
  row: 'top' | 'middle' | 'bottom'
  /** Grid column (0 = thousands … 3 = units). */
  col: number
  ch: string
}

export interface SumTo2019G2FigureProps {
  /** How many digits of the top 2-digit number are revealed, from the left (0–2). */
  topMask?: number
  /** How many digits of the middle 3-digit number are revealed, from the left (0–3). */
  midMask?: number
  /** How many digits of the bottom 4-digit number are revealed, from the left (0–4). */
  botMask?: number
  /** Candidate digits being tried (translucent, not fixed). */
  trial?: TrialDigit[]
  /** Highlight a row: 'top' | 'middle' | 'bottom' | 'total' | null. */
  highlightRow?: 'top' | 'middle' | 'bottom' | 'total' | null
  /** Highlight a place-value column: 0 = thousands … 3 = units, or null. */
  highlightCol?: number | null
  /** Tint the total green (solved). */
  solved?: boolean
}

export function SumTo2019G2Figure({
  topMask = 0,
  midMask = 0,
  botMask = 0,
  trial = [],
  highlightRow = null,
  highlightCol = null,
  solved = false,
}: SumTo2019G2FigureProps) {
  const trialMap = new Map(trial.map((tr) => [`${tr.row}-${tr.col}`, tr.ch]))
  const rows: {
    key: 'top' | 'middle' | 'bottom'
    y: number
    cells: (string | null)[]
    mask: number
  }[] = [
    { key: 'top', y: ROW_Y[0], cells: TOP_CELLS, mask: topMask },
    { key: 'middle', y: ROW_Y[1], cells: MID_CELLS, mask: midMask },
    { key: 'bottom', y: ROW_Y[2], cells: BOT_CELLS, mask: botMask },
  ]

  return (
    <svg
      viewBox={`0 0 ${SUM_VIEW_W} ${SUM_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Place-value column band (the column currently being reasoned about). */}
      {highlightCol !== null && (
        <rect
          x={colX(highlightCol) - 4}
          y={ROW_Y[0] - 7}
          width={COL_W + 8}
          height={TOTAL_Y + BOX_H - ROW_Y[0] + 8}
          rx={10}
          fill="rgba(245,158,11,0.10)"
          stroke="#D97706"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}

      {/* The "+" sign, left of the middle (3-digit) row. */}
      <text
        x={GRID_X0 - 16}
        y={ROW_Y[2] + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={30}
        fontWeight={900}
        fill={INK}
      >
        +
      </text>

      {rows.map((row) => {
        let seen = 0
        return row.cells.map((ch, col) => {
          if (ch === null) return null
          const order = seen++
          return (
            <DigitBox
              key={`${row.key}-${col}`}
              col={col}
              y={row.y}
              ch={ch}
              filled={order < row.mask}
              trial={trialMap.get(`${row.key}-${col}`) ?? null}
            />
          )
        })
      })}

      {/* Rule line under the addends. */}
      <line
        x1={GRID_X0 - 26}
        y1={RULE_Y}
        x2={GRID_X0 + GRID_W}
        y2={RULE_Y}
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* The total: 2 0 1 9 (always shown — it is given). */}
      {TOTAL_CELLS.map((ch, col) => {
        const hot = highlightRow === 'total'
        const color = solved || hot ? '#065F46' : BLUE
        return (
          <text
            key={`total-${col}`}
            x={colX(col) + COL_W / 2}
            y={TOTAL_Y + BOX_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={28}
            fontWeight={900}
            fill={color}
          >
            {ch}
          </text>
        )
      })}
    </svg>
  )
}

export default function SumTo2019G2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A stacked addition: a 2-digit number plus a 3-digit number plus a 4-digit number adds to 2019. Use nine of the digits 0 to 9 (0 must be used, none repeated) to make the 4-digit number as large as possible."
    >
      <SumTo2019G2Figure />
    </div>
  )
}
