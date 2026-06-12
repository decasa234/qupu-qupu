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
// Canonical mechanics (confirmed with the reviewer): the paint has SPILLED on
// the floor and the block stands in the puddle — so its BOTTOM faces are
// soaked and its LEFT sides are painted too; the TOP and RIGHT sides are dry.
// The block starts at the VERY LEFT (column 1 of both rows): the SINGLE cube
// in the numbered front row (1/3/4/5), the 2-cube STACK behind it in square
// 2's row (the farther row). Numbered squares: front cols 3 ("1"), 4 ("3"),
// 5 ("4"), 7 ("5"); back col 5 ("2"):
//   FRONT single cube (standing f1):
//     roll 1 → f2, dry RIGHT  → no paint
//     roll 2 → f3, dry TOP — it lands right ON "1" → "1" stays clean!
//     roll 3 → f4, wet LEFT   → stamps "3"!
//     roll 4 → f5, soaked BOTTOM → stamps "4"!
//   BACK 2-cube stack (standing b1):
//     roll 1 → lies b2–b3, dry RIGHT faces → no paint
//     roll 2 → stands b4, dry TOP          → nothing
//     roll 3 → lies b5–b6, wet LEFT faces  → stamps "2" (b5) + b6
//     roll 4 → stands b7, soaked BOTTOM    → stamps an empty square
// Every painted side is now used; "5" (f7) is never reached.
// Painted squares: 2, 3, 4 → answer "234". 1 and 5 stay clean.

export const PAINT_ANSWER = '234'

// ---- in-card figure geometry (oblique projection, depth up-LEFT) ----------

const CELL_W = 48 // cell width along x; cubes share this edge length
const CUBE = 48
const DEPTH_X = -20 // one row "into" the page shifts left…
const DEPTH_Y = -22 // …and up
const COLS = 8
const ORIGIN_X = 48 // front-left corner of the front row, column 1
const ORIGIN_Y = 240

export const PAINT_VIEW_W = 446
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

// Numbered floor squares, in their canonical figure positions (matching the
// printed paper): the block stands on column 1; "1", "3", "4" run adjacent on
// front columns 3–5 and "5" is out on column 7; "2" is back column 5.
const CELL_LABELS: Array<{ label: string; col: number; row: number }> = [
  { label: '1', col: 3, row: 0 },
  { label: '2', col: 5, row: 1 },
  { label: '3', col: 4, row: 0 },
  { label: '4', col: 5, row: 0 },
  { label: '5', col: 7, row: 0 },
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
 * "1"), 'b5' = back row column 5 (square "2"), … The block starts on
 * column 1 of both rows.
 */
export type PaintCellKey = `${'f' | 'b'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

const KEY_LABEL: Partial<Record<PaintCellKey, string>> = {
  f3: '1',
  b5: '2',
  f4: '3',
  f5: '4',
  f7: '5',
}

// Footprint of each rolling piece after n quarter-turns (top-down cell keys).
// Front single cube:  f1 → f2 → f3 → f4 → f5.
// Back 2-cube stack:  stands b1 → lies b2–b3 → stands b4 → lies b5–b6 → stands b7.
const FRONT_FOOTPRINT: PaintCellKey[][] = [['f1'], ['f2'], ['f3'], ['f4'], ['f5']]
const BACK_FOOTPRINT: PaintCellKey[][] = [['b1'], ['b2', 'b3'], ['b4'], ['b5', 'b6'], ['b7']]

// Which face lands on the floor after each roll. The block stands in the
// spilled paint, so its LEFT sides and BOTTOMS are wet; the RIGHT sides
// (roll 1) and TOPS (roll 2) are dry, then rolls 3 (lefts) and 4 (bottoms)
// stamp.
const LANDING_WET: Array<boolean | null> = [null, false, false, true, true]

const D_CELL_W = 48
const D_CELL_H = 42
const D_LEFT = 14
const D_TOP = 26
const D_COLS = 8
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
  /** Quarter-turns completed (0 = both pieces still standing on column 1). */
  rollsDone?: 0 | 1 | 2 | 3 | 4
  /** Cell keys already stamped purple by a wet face, e.g. ['f2', 'b2']. */
  stamped?: string[]
  /** Cell keys of numbered squares a DRY face landed on (gray ring + badge), e.g. ['f1']. */
  dryCells?: string[]
  /** Localized badge text for dry squares (default "dry"). */
  dryLabel?: string
  /** Localized chip text for a wet landing face (default "wet"). */
  wetLabel?: string
}

/** Top-down 2×7 strip: stamped cells, both pieces' current footprints, face-state chip, dry badges. */
export function PaintRollDiagram({
  rollsDone = 0,
  stamped = [],
  dryCells = [],
  dryLabel = 'dry',
  wetLabel = 'wet',
}: PaintRollDiagramProps) {
  const stampedSet = new Set(stamped)
  const drySet = new Set(dryCells)

  const allKeys: PaintCellKey[] = []
  for (const r of ['b', 'f'] as const) {
    for (let c = 1; c <= D_COLS; c++) allKeys.push(`${r}${c}` as PaintCellKey)
  }

  const frontFeet = FRONT_FOOTPRINT[rollsDone]
  const backFeet = BACK_FOOTPRINT[rollsDone]
  const landingWet = LANDING_WET[rollsDone]
  const pieceStroke = landingWet === null ? PURPLE_LEFT : landingWet ? WET_AMBER : DRY_GRAY

  const footprintOutline = (keys: PaintCellKey[], tag: string) => {
    if (keys.length === 0) return null
    const first = keyRect(keys[0])
    const w = D_CELL_W * keys.length
    return (
      <g key={tag}>
        <rect
          x={first.x + 2.5}
          y={first.y + 2.5}
          width={w - 5}
          height={D_CELL_H - 5}
          rx={6}
          fill={PURPLE_FRONT}
          opacity={0.28}
        />
        <rect
          x={first.x + 2.5}
          y={first.y + 2.5}
          width={w - 5}
          height={D_CELL_H - 5}
          rx={6}
          fill="none"
          stroke={pieceStroke}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      </g>
    )
  }

  // Face-state chip on the front piece: is the face it just landed on wet or dry?
  const chip = (() => {
    if (landingWet === null || frontFeet.length === 0) return null
    // A dry badge on the footprint already says "dry" — don't double up.
    if (!landingWet && frontFeet.some((k) => drySet.has(k))) return null
    const first = keyRect(frontFeet[0])
    const text = landingWet ? wetLabel : dryLabel
    const w = 16 + text.length * 6.2
    const cx = first.x + (D_CELL_W * frontFeet.length) / 2
    const cy = first.y + D_CELL_H + 2
    return (
      <g>
        <rect
          x={cx - w / 2}
          y={cy - 8}
          width={w}
          height={16}
          rx={8}
          fill={landingWet ? WET_AMBER : DRY_GRAY}
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={800} fill="#FFFFFF">
          {text}
        </text>
      </g>
    )
  })()

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

      {/* grid cells */}
      {allKeys.map((key) => {
        const { x, y } = keyRect(key)
        const isStamped = stampedSet.has(key)
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

      {/* the pieces' current resting footprints (amber outline = wet face down, gray = dry) */}
      {footprintOutline(backFeet, 'back')}
      {footprintOutline(frontFeet, 'front')}
      {chip}

      {/* gray "stays clean" badges on the squares a dry face landed on */}
      {allKeys
        .filter((key) => drySet.has(key))
        .map((key) => {
          const { x, y } = keyRect(key)
          const badgeW = 14 + dryLabel.length * 5
          return (
            <g key={`dry-${key}`}>
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
                {dryLabel}
              </text>
            </g>
          )
        })}
    </svg>
  )
}
