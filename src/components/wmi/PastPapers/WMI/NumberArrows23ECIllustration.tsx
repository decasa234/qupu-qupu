// IKMC-21-EC-Q23 — "Number squares connected by order arrows"
//
// Elena wants to write the numbers 1–9 in a 3×3 grid. Arrows always point
// from a smaller number to a larger one. 5 and 7 are pre-filled. Find ?.
//
// Reconstructed faithfully from docs/reference/ocr-res/ikmc/contest/ecolier/2021.imgs/067.jpg:
//
// Grid (row 0 = top, col 0 = left):
//   (0,0)  →  (0,1)  ←  (0,2) = ?
//     ↑           ↑           ↑
//   (1,0)=7  ←  (1,1)  ←  (1,2)
//     ↑           ↓           ↓
//   (2,0)=5  ←  (2,1)  ←  (2,2)
//
// Edges (from→to = smaller→larger):
//   (2,0)→(1,0): 5→7 upward
//   (1,0)→(0,0): 7→(0,0) upward
//   (0,0)→(0,1): rightward
//   (0,2)→(0,1): leftward (? < (0,1))
//   (1,1)→(1,0): leftward toward 7
//   (1,2)→(1,1): leftward
//   (1,1)→(0,1): upward
//   (1,2)→(0,2): upward toward ?
//   (1,1)→(2,1): downward
//   (1,2)→(2,2): downward
//   (2,2)→(2,1): leftward
//   (2,1)→(2,0): leftward toward 5 (values there < 5)
//
// Answer: D = 6. Verified solution: (0,0)=8,(0,1)=9,(0,2)=6,(1,0)=7,(1,1)=2or3,
//   (1,2)=1,(2,0)=5,(2,1)=4,(2,2)=2or3.
//
// SSR-safe: no Math.random, no Date.now, no DOM. Pure render.

// ── Layout constants (exported for explainer reuse) ───────────────────────────

export const NA_CELL = 64           // square side in SVG units
export const NA_PAD  = 20           // outer padding
export const NA_GAP  = 20           // gap between adjacent cells (for arrow channel)

// Derived grid geometry
export const NA_STEP = NA_CELL + NA_GAP   // cell stride
export const NA_N    = 3                  // 3×3

export const NA_VIEW_W = NA_PAD * 2 + NA_N * NA_CELL + (NA_N - 1) * NA_GAP
export const NA_VIEW_H = NA_VIEW_W  // square viewport

/** Top-left x of cell column `col`. */
export const naX = (col: number) => NA_PAD + col * NA_STEP
/** Top-left y of cell row `row`. */
export const naY = (row: number) => NA_PAD + row * NA_STEP
/** Centre x of cell (row, col). */
export const naCX = (col: number) => naX(col) + NA_CELL / 2
/** Centre y of cell (row, col). */
export const naCY = (row: number) => naY(row) + NA_CELL / 2

// ── Colour palette ────────────────────────────────────────────────────────────

export const NA_COLOR = {
  INK:      '#1F2937',
  CELL_BG:  '#FFFFFF',
  CELL_STR: '#374151',
  GIVEN_BG: '#EEF2FF',
  GIVEN_STR: '#4338CA',
  GIVEN_NUM: '#1E1B4B',
  QUEST_BG:  '#FEF9C3',
  QUEST_STR: '#92400E',
  QUEST_NUM: '#92400E',
  ARROW:    '#374151',
  ARROW_HI: '#10B981',   // active/solved arrows in explainer
  SOLVED_BG: '#D1FAE5',
  SOLVED_STR: '#10B981',
  SOLVED_NUM: '#065F46',
} as const

// ── Pre-filled values for the static figure ───────────────────────────────────

/** Cells with a fixed given value in the puzzle (row-col → value). */
export const NA_GIVEN: Record<string, number> = {
  '1-0': 7,
  '2-0': 5,
}

/** The question-mark cell. */
export const NA_QUEST = '0-2'

// ── Directed edges ────────────────────────────────────────────────────────────

/** Each edge: [from_row, from_col, to_row, to_col]. Arrow goes from→to (smaller→larger). */
export const NA_EDGES: ReadonlyArray<[number, number, number, number]> = [
  // col 0 vertical chain: 5→7→(0,0)
  [2, 0, 1, 0],
  [1, 0, 0, 0],
  // row 0 horizontals: (0,0)→(0,1) and (0,2)→(0,1)
  [0, 0, 0, 1],
  [0, 2, 0, 1],
  // row 1 horizontals: (1,2)→(1,1)→(1,0)
  [1, 2, 1, 1],
  [1, 1, 1, 0],
  // col 1 vertical: (1,1)→(0,1) and (1,1)→(2,1)
  [1, 1, 0, 1],
  [1, 1, 2, 1],
  // col 2 verticals: (1,2)→(0,2) and (1,2)→(2,2)
  [1, 2, 0, 2],
  [1, 2, 2, 2],
  // row 2 horizontals: (2,2)→(2,1)→(2,0)
  [2, 2, 2, 1],
  [2, 1, 2, 0],
]

// ── Arrow drawing helper ───────────────────────────────────────────────────────

const AH_SIZE = 7    // arrowhead half-length
const AH_HALF = 4   // arrowhead half-width

/**
 * Renders a directed line arrow from cell (fr, fc) centre to cell (tr, tc) centre,
 * clipped so it starts/ends at the cell border (not at the text).
 */
function CellArrow({
  fr, fc, tr, tc,
  color = NA_COLOR.ARROW,
  strokeWidth = 2,
}: {
  fr: number; fc: number; tr: number; tc: number
  color?: string
  strokeWidth?: number
}) {
  const x1 = naCX(fc)
  const y1 = naCY(fr)
  const x2 = naCX(tc)
  const y2 = naCY(tr)

  // direction unit vector
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return null
  const ux = dx / len
  const uy = dy / len

  // clip so line starts/ends at the cell square edge
  const half = NA_CELL / 2 + 2   // slight inset past the cell border
  const sx = x1 + ux * half
  const sy = y1 + uy * half
  const ex = x2 - ux * half
  const ey = y2 - uy * half

  // arrowhead at (ex, ey)
  const px = -uy   // perpendicular
  const py =  ux
  const tip: [number, number] = [ex, ey]
  const base: [number, number] = [ex - ux * AH_SIZE + px * AH_HALF, ey - uy * AH_SIZE + py * AH_HALF]
  const base2: [number, number] = [ex - ux * AH_SIZE - px * AH_HALF, ey - uy * AH_SIZE - py * AH_HALF]

  return (
    <g>
      <line
        x1={sx} y1={sy}
        x2={ex - ux * AH_SIZE} y2={ey - uy * AH_SIZE}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <polygon
        points={`${tip[0]},${tip[1]} ${base[0]},${base[1]} ${base2[0]},${base2[1]}`}
        fill={color}
      />
    </g>
  )
}

// ── Primitive: NumberArrowsFigure (shared with explainer) ─────────────────────

export interface NumberArrowsFigureProps {
  /**
   * Known cell values so far: "row-col" → number.
   * Given values (5, 7) are always shown from NA_GIVEN.
   * Explainer adds solved cells here incrementally.
   */
  solved?: Record<string, number>
  /** Cell keys currently being revealed (green). */
  activeKeys?: string[]
  /** Edge indices currently highlighted (green arrowhead). */
  activeEdges?: number[]
}

export function NumberArrowsFigure({
  solved = {},
  activeKeys = [],
  activeEdges = [],
}: NumberArrowsFigureProps) {
  const activeKeySet  = new Set(activeKeys)
  const activeEdgeSet = new Set(activeEdges)

  return (
    <svg
      viewBox={`0 0 ${NA_VIEW_W} ${NA_VIEW_H}`}
      width="100%"
      style={{ maxWidth: NA_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Arrows (drawn first so cells render on top) ── */}
      {NA_EDGES.map(([fr, fc, tr, tc], i) => {
        const hi = activeEdgeSet.has(i)
        return (
          <CellArrow
            key={`e${i}`}
            fr={fr} fc={fc} tr={tr} tc={tc}
            color={hi ? NA_COLOR.ARROW_HI : NA_COLOR.ARROW}
            strokeWidth={hi ? 2.5 : 2}
          />
        )
      })}

      {/* ── Cells ── */}
      {Array.from({ length: NA_N * NA_N }, (_, idx) => {
        const row = Math.floor(idx / NA_N)
        const col = idx % NA_N
        const key = `${row}-${col}`
        const isQuest  = key === NA_QUEST
        const isGiven  = key in NA_GIVEN
        const isActive = activeKeySet.has(key)
        const solvedVal = solved[key] ?? (isGiven ? NA_GIVEN[key] : undefined)
        const isSolved  = solvedVal !== undefined

        let bg: string  = NA_COLOR.CELL_BG
        let str: string = NA_COLOR.CELL_STR
        let labelColor: string = NA_COLOR.INK
        let labelText: string | null = null
        let labelSize = NA_CELL * 0.42

        if (isActive && isSolved) {
          // freshly revealed in explainer
          bg  = NA_COLOR.SOLVED_BG
          str = NA_COLOR.SOLVED_STR
          labelColor = NA_COLOR.SOLVED_NUM
          labelText = String(solvedVal)
          labelSize = NA_CELL * 0.46
        } else if (isSolved && isGiven) {
          // pre-filled given value
          bg  = NA_COLOR.GIVEN_BG
          str = NA_COLOR.GIVEN_STR
          labelColor = NA_COLOR.GIVEN_NUM
          labelText = String(solvedVal)
          labelSize = NA_CELL * 0.46
        } else if (isSolved) {
          // explainer filled in (not active)
          bg  = NA_COLOR.SOLVED_BG
          str = NA_COLOR.SOLVED_STR
          labelColor = NA_COLOR.SOLVED_NUM
          labelText = String(solvedVal)
        } else if (isQuest) {
          // question mark cell
          bg  = NA_COLOR.QUEST_BG
          str = NA_COLOR.QUEST_STR
          labelColor = NA_COLOR.QUEST_NUM
          labelText = '?'
          labelSize = NA_CELL * 0.44
        }

        return (
          <g key={key}>
            <rect
              x={naX(col)}
              y={naY(row)}
              width={NA_CELL}
              height={NA_CELL}
              rx={6}
              fill={bg}
              stroke={str}
              strokeWidth={isActive || isGiven || isQuest ? 2.5 : 1.5}
            />
            {labelText && (
              <text
                x={naCX(col)}
                y={naCY(row)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={labelSize}
                fontWeight={900}
                fill={labelColor}
                fontFamily="Nunito, ui-sans-serif, system-ui, sans-serif"
              >
                {labelText}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export: static problem figure ────────────────────────────────────

export default function NumberArrows23ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 3-by-3 grid of squares. Each arrow points from a smaller number to a larger one. ' +
        '7 is placed in the middle-left square, 5 in the bottom-left square, ' +
        'and a question mark is in the top-right square. ' +
        'Find the number that replaces the question mark.'
      }
    >
      <NumberArrowsFigure />
    </div>
  )
}
