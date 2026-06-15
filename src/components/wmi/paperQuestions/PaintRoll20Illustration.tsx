// Paint-roll puzzle for WMI-20F1A-Q22.
//
// Source figure: wmiPastPaper/2020 WMI Final G01 Paper B/images/
// a62064df5cec65db58cdce7251de21c59b5e144198a369cde42c21d1dfae271f.jpg —
// an L-shaped solid of 3 wet-purple cubes stands flush at the VERY LEFT of a
// 2-row strip of floor squares (column 1 of both rows): a SINGLE cube in the
// FRONT row (the row of squares 1/3/4/5) plus a 2-cube tall stack BEHIND it
// in the back row (the row of square 2). A dripping paint bucket hangs above;
// a red dashed curved arrow shows the block rolling right, one quarter-turn
// (one side) at a time.
//
// Figure layout (editor-confirmed, "0" = blank square; back row on top):
//   back :  0 0 0 0 2 0 0 0 0   → "2" at back column 5
//   front:  0 0 0 1 0 3 4 0 5   → "1" col 4, "3" col 6, "4" col 7, "5" col 9
//
// Mechanics: the paint has SPILLED and the block stands in the puddle, so its
// BOTTOM faces are soaked and its LEFT sides are painted too; the TOP and
// RIGHT sides are dry. The wet block tumbles to the RIGHT. As it tumbles the
// tall BACK stack lays a long wet trail along its whole row, while the little
// FRONT cube only stamps a few squares. The cumulative wet cells per beat
// (editor-confirmed, "1" = wet; back row on top) are:
//   beat 1   back 1 1 0 0 0 0 0 0 0    front 1 0 0 0 0 0 0 0 0
//   beat 2   back 1 1 1 1 0 0 0 0 0    front 1 0 0 0 0 0 0 0 0
//   beat 3   back 1 1 1 1 1 1 0 0 0    front 1 0 0 0 0 1 0 0 0
//   beat 4   back 1 1 1 1 1 1 1 0 0    front 1 0 0 0 0 1 1 0 0
//   beat 5   back 1 1 1 1 1 1 1 1 1    front 1 0 0 0 0 1 1 1 0
// Back col 5 ("2"), front col 6 ("3"), front col 7 ("4") all end up wet, while
// front col 4 ("1", a dry side lands there) and front col 9 ("5", the front
// paint stops before it) stay clean.
// Painted squares: 2, 3, 4 → answer "234". 1 and 5 stay clean.

export const PAINT_ANSWER = '234'

// ---- in-card figure geometry (oblique projection, depth up-LEFT) ----------

const CELL_W = 48 // cell width along x; cubes share this edge length
const CUBE = 48
const DEPTH_X = -20 // one row "into" the page shifts left…
const DEPTH_Y = -22 // …and up
const COLS = 9
const ORIGIN_X = 48 // front-left corner of the front row, column 1
const ORIGIN_Y = 240

export const PAINT_VIEW_W = 500
export const PAINT_VIEW_H = 262

const PURPLE_FRONT = '#8B7CC8'
const PURPLE_TOP = '#6D5BA8'
const PURPLE_LEFT = '#5A4A8F'
const OUTLINE = '#1F2937'
const FLOOR_STROKE = '#475569'
const ARROW_RED = '#DC2626'

/** Front-left corner of floor cell (col 1..7, row 0 = front, 1 = back). */
function cellOrigin(col: number, row: number) {
  return {
    x: ORIGIN_X + (col - 1) * CELL_W + row * DEPTH_X,
    y: ORIGIN_Y + row * DEPTH_Y,
  }
}

function cellPoints(col: number, row: number): string {
  const { x, y } = cellOrigin(col, row)
  return [
    `${x},${y}`,
    `${x + CELL_W},${y}`,
    `${x + CELL_W + DEPTH_X},${y + DEPTH_Y}`,
    `${x + DEPTH_X},${y + DEPTH_Y}`,
  ].join(' ')
}

function cellCenter(col: number, row: number) {
  const { x, y } = cellOrigin(col, row)
  return { x: x + CELL_W / 2 + DEPTH_X / 2, y: y + DEPTH_Y / 2 }
}

// Numbered floor squares, in their canonical figure positions (editor-confirmed
// against the printed paper): the block stands on column 1; "1" is front col 4,
// "2" is back col 5, "3" front col 6, "4" front col 7, and "5" is out on front
// col 9.
const CELL_LABELS: Array<{ label: string; col: number; row: number }> = [
  { label: '1', col: 4, row: 0 },
  { label: '2', col: 5, row: 1 },
  { label: '3', col: 6, row: 0 },
  { label: '4', col: 7, row: 0 },
  { label: '5', col: 9, row: 0 },
]

/** One pseudo-3D wet-painted cube standing on floor cell (col, row), stack level k. */
function PaintedCube({ col, row, level = 0 }: { col: number; row: number; level?: number }) {
  const { x, y } = cellOrigin(col, row)
  const by = y - level * CUBE // bottom-front edge of this cube
  const ty = by - CUBE // top-front edge
  const front = `${x},${by} ${x + CELL_W},${by} ${x + CELL_W},${ty} ${x},${ty}`
  const top = `${x},${ty} ${x + CELL_W},${ty} ${x + CELL_W + DEPTH_X},${ty + DEPTH_Y} ${x + DEPTH_X},${ty + DEPTH_Y}`
  const left = `${x},${by} ${x + DEPTH_X},${by + DEPTH_Y} ${x + DEPTH_X},${ty + DEPTH_Y} ${x},${ty}`
  return (
    <g>
      <polygon points={left} fill={PURPLE_LEFT} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={top} fill={PURPLE_TOP} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={front} fill={PURPLE_FRONT} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
    </g>
  )
}

/** Small dripping paint-bucket glyph (white pot, purple paint, brush handle, puddles). */
function PaintBucket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* brush handle poking out of the pot */}
      <rect x={8} y={-26} width={7} height={26} rx={2} fill="#B45309" stroke={OUTLINE} strokeWidth={1.5} transform="rotate(12 11 -13)" />
      {/* pot body */}
      <path d="M -18 0 L -14 38 Q 0 46 14 38 L 18 0 Z" fill="#FFFFFF" stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
      {/* paint surface + drips down the rim */}
      <ellipse cx={0} cy={0} rx={18} ry={6} fill={PURPLE_FRONT} stroke={OUTLINE} strokeWidth={2} />
      <path d="M -15 3 q 2 9 5 0 M 5 4 q 2 11 6 1 M -5 5 q 1 6 4 1" fill="none" stroke={PURPLE_TOP} strokeWidth={3} strokeLinecap="round" />
      {/* spilt puddles beside the pot */}
      <ellipse cx={37} cy={40} rx={14} ry={4.5} fill={PURPLE_FRONT} stroke={OUTLINE} strokeWidth={1.5} />
      <ellipse cx={-29} cy={38} rx={5} ry={2.5} fill={PURPLE_FRONT} stroke={OUTLINE} strokeWidth={1.5} />
    </g>
  )
}

/** Faithful reproduction of the scan: L-block flush-left on column 1, strip, bucket, roll arrow. */
export default function PaintRoll20Illustration() {
  const cells: Array<{ col: number; row: number }> = []
  for (const row of [1, 0]) {
    for (let col = 1; col <= COLS; col++) cells.push({ col, row })
  }

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="An L-shaped block of 3 purple cubes stands at the very left end of a 2-row strip of floor squares: a single cube on the front row plus a 2-cube tall stack behind it on the farther row. The paint has spilled into a puddle the block stands in, so its bottoms and left sides are wet while the tops and right sides are dry. A red dashed arrow shows the block rolling to the right, one quarter-turn at a time, toward the numbered squares 1, 2, 3, 4 and 5. A dripping paint bucket sits above the strip."
    >
      <svg
        viewBox={`0 0 ${PAINT_VIEW_W} ${PAINT_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 470, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* floor strip: back row first, then front row */}
        {cells.map(({ col, row }) => (
          <polygon key={`c${col}-${row}`} points={cellPoints(col, row)} fill="#FFFFFF" stroke={FLOOR_STROKE} strokeWidth={1.5} />
        ))}

        {/* italic square numbers in their canonical cells */}
        {CELL_LABELS.map((c) => {
          const { x, y } = cellCenter(c.col, c.row)
          return (
            <text
              key={`n${c.label}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={21}
              fontWeight={800}
              fontStyle="italic"
              fill={OUTLINE}
            >
              {c.label}
            </text>
          )
        })}

        {/* spilled-paint puddle the block stands in (the base gets soaked) */}
        <ellipse
          cx={ORIGIN_X + CELL_W * 0.5 + DEPTH_X * 0.5}
          cy={ORIGIN_Y + DEPTH_Y * 0.4}
          rx={CELL_W * 0.9}
          ry={11}
          fill={PURPLE_FRONT}
          opacity={0.55}
          stroke={OUTLINE}
          strokeWidth={1.5}
        />

        {/* the L-block at the very left, standing on column 1 of both rows:
            the 2-cube stack on the back row first (the farther row, square
            2's), then the single cube on the numbered front row */}
        <PaintedCube col={1} row={1} level={0} />
        <PaintedCube col={1} row={1} level={1} />
        <PaintedCube col={1} row={0} level={0} />

        {/* red dashed quarter-turn arrow: the block tips over to the right */}
        <path
          d="M 112 100 Q 174 82 196 152"
          fill="none"
          stroke={ARROW_RED}
          strokeWidth={4}
          strokeDasharray="9 7"
          strokeLinecap="round"
        />
        <polygon points="201,170 188,150 208,148" fill={ARROW_RED} />

        <PaintBucket x={290} y={52} />
      </svg>
    </div>
  )
}

// ---- top-down diagram for the step-by-step explainer -----------------------

/**
 * Cell keys for the top-down 2×8 grid: 'f3' = front row column 3 (square
 * "1"), 'b4' = back row column 4 (square "2"), … The block starts on
 * column 1 of both rows.
 */
export type PaintCellKey = `${'f' | 'b'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

const KEY_LABEL: Partial<Record<PaintCellKey, string>> = {
  f4: '1',
  b5: '2',
  f6: '3',
  f7: '4',
  f9: '5',
}

const D_CELL_W = 44
const D_CELL_H = 42
const D_LEFT = 14
const D_TOP = 26
const D_COLS = 9
const DIAGRAM_W = D_LEFT * 2 + D_CELL_W * D_COLS
const DIAGRAM_H = D_TOP + D_CELL_H * 2 + 16

const WET_AMBER = '#D97706'
const DRY_GRAY = '#6B7280'

function keyRect(key: PaintCellKey) {
  const row = key[0] === 'b' ? 0 : 1 // back row drawn on top
  const col = Number(key.slice(1))
  return { x: D_LEFT + (col - 1) * D_CELL_W, y: D_TOP + row * D_CELL_H }
}

export interface PaintRollDiagramProps {
  /** Cumulative wet (purple) cell keys so far, e.g. ['b1', 'b2', 'f1']. */
  stamped?: string[]
  /** Cell keys newly wet on THIS beat — drawn with a bright ring to show motion. */
  fresh?: string[]
  /** Numbered squares a dry side reached, so they stay clean (gray dashed ring + badge). */
  cleanCells?: string[]
  /** Localized badge text for the clean squares (default "clean"). */
  cleanLabel?: string
}

/** Top-down 2×8 strip: grows the cumulative purple paint trail the editor specified, beat by beat. */
export function PaintRollDiagram({
  stamped = [],
  fresh = [],
  cleanCells = [],
  cleanLabel = 'clean',
}: PaintRollDiagramProps) {
  const stampedSet = new Set(stamped)
  const freshSet = new Set(fresh)
  const cleanSet = new Set(cleanCells)

  const allKeys: PaintCellKey[] = []
  for (const r of ['b', 'f'] as const) {
    for (let c = 1; c <= D_COLS; c++) allKeys.push(`${r}${c}` as PaintCellKey)
  }

  return (
    <svg
      viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}
      width="100%"
      style={{ maxWidth: 470, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* roll direction arrow above the strip */}
      <line x1={D_LEFT + 4} y1={13} x2={D_LEFT + D_COLS * D_CELL_W - 16} y2={13} stroke={ARROW_RED} strokeWidth={3} strokeDasharray="8 6" strokeLinecap="round" />
      <polygon
        points={`${D_LEFT + D_COLS * D_CELL_W - 2},13 ${D_LEFT + D_COLS * D_CELL_W - 18},6 ${D_LEFT + D_COLS * D_CELL_W - 18},20`}
        fill={ARROW_RED}
      />

      {/* grid cells: cumulative purple paint; cells wet this beat get an amber ring */}
      {allKeys.map((key) => {
        const { x, y } = keyRect(key)
        const isStamped = stampedSet.has(key)
        const isFresh = freshSet.has(key)
        const label = KEY_LABEL[key]
        return (
          <g key={key}>
            <rect
              x={x}
              y={y}
              width={D_CELL_W}
              height={D_CELL_H}
              fill={isStamped ? PURPLE_FRONT : '#FFFFFF'}
              opacity={isStamped ? 0.92 : 1}
              stroke={FLOOR_STROKE}
              strokeWidth={1.5}
            />
            {isFresh && (
              <rect
                x={x + 2}
                y={y + 2}
                width={D_CELL_W - 4}
                height={D_CELL_H - 4}
                rx={5}
                fill="none"
                stroke={WET_AMBER}
                strokeWidth={3.5}
              />
            )}
            {label && (
              <text
                x={x + D_CELL_W / 2}
                y={y + D_CELL_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={19}
                fontWeight={800}
                fontStyle="italic"
                fill={isStamped ? '#FFFFFF' : OUTLINE}
              >
                {label}
              </text>
            )}
          </g>
        )
      })}

      {/* gray "stays clean" badges on the numbered squares a dry side reached */}
      {allKeys
        .filter((key) => cleanSet.has(key))
        .map((key) => {
          const { x, y } = keyRect(key)
          const badgeW = 14 + cleanLabel.length * 5
          return (
            <g key={`clean-${key}`}>
              <rect
                x={x + 4}
                y={y + 4}
                width={D_CELL_W - 8}
                height={D_CELL_H - 8}
                rx={7}
                fill="none"
                stroke={DRY_GRAY}
                strokeWidth={2.5}
                strokeDasharray="4 3"
              />
              <rect x={x + D_CELL_W / 2 - badgeW / 2} y={y + D_CELL_H - 9} width={badgeW} height={14} rx={7} fill={DRY_GRAY} />
              <text
                x={x + D_CELL_W / 2}
                y={y + D_CELL_H - 2}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={800}
                fill="#FFFFFF"
              >
                {cleanLabel}
              </text>
            </g>
          )
        })}
    </svg>
  )
}
