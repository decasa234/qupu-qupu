// IKMC-20-PE-Q17 — "Tom has 9 cards: dots (1,2,3), triangles (1,2,3), squares (1,2,3).
// He places them in a 3×3 board so every row and column has all three shapes and all
// three counts (a 2-attribute Latin square). Given three placed cards, what goes in
// the grey cell (row 2, col 1)?" Answer: D — one square.
//
// Board state:
//   [0,0]: 1 dot     [0,1]: —         [0,2]: —
//   [1,0]: —         [1,1]: 2 dots    [1,2]: —
//   [2,0]: 2 tri     [2,1]: GREY ←    [2,2]: —
//
// Deduction: col 1 has dots (shape) → needs tri + sq; row 2 has tri (shape) → needs dot + sq.
// Intersection: sq is in BOTH missing sets → grey cell = square.
// Count: col 1 has count 2 → needs 1 and 3; row 2 has count 2 → needs 1 and 3.
// But row 2 col 2 must fill the remaining count, and col 1 row 0 handles the other.
// From the board: remaining counts in row 2 are 1 and 3; same for col 1.
// Reading the breakdown: the square at the intersection of {row2 needs 1 or 3} ∩ {col1 needs 1 or 3}
// must be count 1 (because col 1 row 0 supplies count 3, as checked in the full solve).
// → Answer = 1 square = choice D.
//
// Co-exports:
//   CardsGrid17PE     — shared primitive (3×3 board with placed cards)
//   CARD_SHAPES       — shape type identifier
//   CARD_PLACEMENTS   — the 3 pre-placed cards
//   VIEW_W, VIEW_H    — viewBox dimensions for the board
//   CardsGrid17PEOption — choice renderer (A–E)
//
// Pure render, SSR-safe, deterministic — no random / Date / side-effects.

import type { WmiChoice } from '../../../../types/wmi'

// ── palette ───────────────────────────────────────────────────────────────────
const CARD_FILL        = '#FFFFFF'
const CARD_STROKE      = '#374151'
const BOARD_CELL_FILL  = '#F3F4F6'
const GREY_CELL_FILL   = '#9CA3AF'
const SHAPE_FILL       = '#1F2937'
const ANSWER_HIGHLIGHT = '#10B981'

// ── card geometry ─────────────────────────────────────────────────────────────
const CELL_SIZE = 54   // each grid cell (also the outer card dimensions)
const CELL_GAP  = 6
const BOARD_PAD = 12
const CARD_RX   = 4

// Derived board size
const GRID_COLS = 3
const GRID_ROWS = 3
const BOARD_W   = BOARD_PAD * 2 + CELL_SIZE * GRID_COLS + CELL_GAP * (GRID_COLS - 1)
const BOARD_H   = BOARD_PAD * 2 + CELL_SIZE * GRID_ROWS + CELL_GAP * (GRID_ROWS - 1)
export const VIEW_W = BOARD_W   // 210
export const VIEW_H = BOARD_H   // 210

// ── shape types ───────────────────────────────────────────────────────────────
export type CardShape = 'dot' | 'tri' | 'sq'

// eslint-disable-next-line react-refresh/only-export-components
export const CARD_SHAPES: CardShape[] = ['dot', 'tri', 'sq']

// ── pre-placed cards ──────────────────────────────────────────────────────────
export interface CardPlacement {
  row: number
  col: number
  shape: CardShape
  count: 1 | 2 | 3
}

// eslint-disable-next-line react-refresh/only-export-components
export const CARD_PLACEMENTS: CardPlacement[] = [
  { row: 0, col: 0, shape: 'dot', count: 1 },
  { row: 1, col: 1, shape: 'dot', count: 2 },
  { row: 2, col: 0, shape: 'tri', count: 2 },
]

// Grey target cell
const GREY_CELL: [number, number] = [2, 1]

// ── shape renderers ───────────────────────────────────────────────────────────

function renderDot(cx: number, cy: number, r = 7) {
  return <circle cx={cx} cy={cy} r={r} fill={SHAPE_FILL} />
}

function renderTriangle(cx: number, cy: number, size = 11) {
  // Equilateral triangle pointing up; centroid at (cx, cy)
  const h = size * (Math.sqrt(3) / 2)
  const pts = [
    `${cx},${cy - h * 0.667}`,
    `${cx - size * 0.5},${cy + h * 0.333}`,
    `${cx + size * 0.5},${cy + h * 0.333}`,
  ].join(' ')
  return <polygon points={pts} fill={SHAPE_FILL} />
}

function renderSquareShape(cx: number, cy: number, size = 11) {
  // Small square (distinct from the card border)
  const half = size / 2
  return (
    <rect
      x={cx - half}
      y={cy - half}
      width={size}
      height={size}
      fill={SHAPE_FILL}
    />
  )
}

// ── shape placement within a card ─────────────────────────────────────────────
// Positions for 1, 2, or 3 shapes within a cardW×cardH cell.
// The drawing area is the central 32×32 zone of the card.

function renderShapes(
  shape: CardShape,
  count: 1 | 2 | 3,
  x: number,   // card top-left x
  y: number,   // card top-left y
  cardW: number,
  cardH: number,
): JSX.Element {
  const cx = x + cardW / 2
  const cy = y + cardH / 2

  const render = (sx: number, sy: number, key: string | number) => {
    const el =
      shape === 'dot'
        ? renderDot(sx, sy)
        : shape === 'tri'
          ? renderTriangle(sx, sy)
          : renderSquareShape(sx, sy)
    return <g key={key}>{el}</g>
  }

  if (count === 1) {
    return render(cx, cy, '1')
  }

  if (count === 2) {
    // Diagonal: top-left and bottom-right areas
    const off = 9
    return (
      <>
        {render(cx - off, cy - off, 'a')}
        {render(cx + off, cy + off, 'b')}
      </>
    )
  }

  // count === 3: top-center, bottom-left, bottom-right
  const offX = 9
  const offY = 8
  return (
    <>
      {render(cx, cy - offY, 'a')}
      {render(cx - offX, cy + offY, 'b')}
      {render(cx + offX, cy + offY, 'c')}
    </>
  )
}

// ── board cell helper ─────────────────────────────────────────────────────────

function cellTopLeft(row: number, col: number): [number, number] {
  const x = BOARD_PAD + col * (CELL_SIZE + CELL_GAP)
  const y = BOARD_PAD + row * (CELL_SIZE + CELL_GAP)
  return [x, y]
}

// ── CardsGrid17PE primitive ───────────────────────────────────────────────────

export interface CardsGrid17PEProps {
  /** Cells to show as correct (green border), array of [row, col] */
  highlightCorrect?: Array<[number, number]>
  /** Fill the grey cell with this answer card */
  extraCard?: { row: number; col: number; shape: CardShape; count: 1 | 2 | 3 } | null
  /** Highlight a full row (0/1/2) */
  highlightRow?: number | null
  /** Highlight a full column (0/1/2) */
  highlightCol?: number | null
}

export function CardsGrid17PE({
  highlightCorrect = [],
  extraCard = null,
  highlightRow = null,
  highlightCol = null,
}: CardsGrid17PEProps = {}) {
  // Build map of extra/placed cards: key = "row,col"
  const placedMap = new Map<string, CardPlacement>()
  for (const p of CARD_PLACEMENTS) {
    placedMap.set(`${p.row},${p.col}`, p)
  }
  if (extraCard) {
    placedMap.set(`${extraCard.row},${extraCard.col}`, extraCard)
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={VIEW_W}
      aria-hidden="true"
    >
      {/* board cells */}
      {Array.from({ length: GRID_ROWS }, (_, row) =>
        Array.from({ length: GRID_COLS }, (_, col) => {
          const [x, y] = cellTopLeft(row, col)
          const key = `${row},${col}`
          const placed = placedMap.get(key)
          const isGrey =
            row === GREY_CELL[0] && col === GREY_CELL[1] && !placed
          const isHighlightedCell = highlightCorrect.some(
            ([r, c]) => r === row && c === col,
          )
          const inHighlightRow = highlightRow === row
          const inHighlightCol = highlightCol === col

          // Cell background: row/col highlight overlay
          let cellFill = placed ? CARD_FILL : isGrey ? GREY_CELL_FILL : BOARD_CELL_FILL
          // Row/col tint: amber wash
          if ((inHighlightRow || inHighlightCol) && !isGrey) {
            cellFill = placed ? '#FFFBEB' : '#FEF9C3'
          }

          const borderColor = isHighlightedCell
            ? ANSWER_HIGHLIGHT
            : placed
              ? CARD_STROKE
              : inHighlightRow || inHighlightCol
                ? '#D97706'
                : '#D1D5DB'
          const borderWidth = isHighlightedCell ? 2.5 : placed ? 2 : 1.5

          return (
            <g key={key}>
              <rect
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={CARD_RX}
                fill={cellFill}
                stroke={borderColor}
                strokeWidth={borderWidth}
              />
              {placed && renderShapes(placed.shape, placed.count, x, y, CELL_SIZE, CELL_SIZE)}
            </g>
          )
        }),
      )}
    </svg>
  )
}

// ── option renderer ───────────────────────────────────────────────────────────

// Choices: A = 2 squares, B = 1 triangle, C = 2 dots, D = 1 square, E = 3 dots
const OPTION_CARDS: Record<string, { shape: CardShape; count: 1 | 2 | 3 }> = {
  A: { shape: 'sq',  count: 2 },
  B: { shape: 'tri', count: 1 },
  C: { shape: 'dot', count: 2 },
  D: { shape: 'sq',  count: 1 },  // ← correct answer
  E: { shape: 'dot', count: 3 },
}

const OPT_W = 54
const OPT_H = 54

/**
 * Renders ONE answer option (A–E) for IKMC-20-PE-Q17.
 * Each option shows a single card with the appropriate shape and count.
 */
export function CardsGrid17PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const card = OPTION_CARDS[key]
  if (!card) return <span>{choice.text}</span>

  const PAD = 8
  const VW = OPT_W + PAD * 2
  const VH = OPT_H + PAD * 2

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 80, display: 'block' }}
      role="img"
      aria-label={`Option ${key}`}
    >
      <rect
        x={PAD}
        y={PAD}
        width={OPT_W}
        height={OPT_H}
        rx={CARD_RX}
        fill={CARD_FILL}
        stroke={CARD_STROKE}
        strokeWidth={2}
      />
      {renderShapes(card.shape, card.count, PAD, PAD, OPT_W, OPT_H)}
    </svg>
  )
}

// ── pool of 9 cards ───────────────────────────────────────────────────────────
// All 9 possible cards: {dot,tri,sq} × {1,2,3}

const POOL_CARDS: Array<{ shape: CardShape; count: 1 | 2 | 3 }> = [
  { shape: 'dot', count: 1 },
  { shape: 'dot', count: 2 },
  { shape: 'dot', count: 3 },
  { shape: 'tri', count: 1 },
  { shape: 'tri', count: 2 },
  { shape: 'tri', count: 3 },
  { shape: 'sq',  count: 1 },
  { shape: 'sq',  count: 2 },
  { shape: 'sq',  count: 3 },
]

const POOL_PAD   = 8
const POOL_CELL  = 44
const POOL_GAP   = 5
const POOL_COLS  = 3
const POOL_ROWS  = 3
const POOL_VW    = POOL_PAD * 2 + POOL_CELL * POOL_COLS + POOL_GAP * (POOL_COLS - 1)
const POOL_VH    = POOL_PAD * 2 + POOL_CELL * POOL_ROWS + POOL_GAP * (POOL_ROWS - 1)

// ── default export: stem illustration ─────────────────────────────────────────
// Shows the problem: pool of 9 cards (above) and the 3×3 board (below).

export default function CardsGrid17PEIllustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={
        'Tom has 9 cards arranged in a 3×3 board. Three are already placed: ' +
        '1 dot at row 1 col 1, 2 dots at row 2 col 2, 2 triangles at row 3 col 1. ' +
        'What card goes in the grey cell at row 3 col 2?'
      }
    >
      {/* Pool: 3×3 grid of the 9 cards */}
      <svg
        viewBox={`0 0 ${POOL_VW} ${POOL_VH}`}
        width={POOL_VW}
        aria-hidden="true"
      >
        {POOL_CARDS.map(({ shape, count }, idx) => {
          const row = Math.floor(idx / POOL_COLS)
          const col = idx % POOL_COLS
          const px = POOL_PAD + col * (POOL_CELL + POOL_GAP)
          const py = POOL_PAD + row * (POOL_CELL + POOL_GAP)
          return (
            <g key={`${shape}-${count}`}>
              <rect
                x={px}
                y={py}
                width={POOL_CELL}
                height={POOL_CELL}
                rx={CARD_RX}
                fill={CARD_FILL}
                stroke={CARD_STROKE}
                strokeWidth={1.5}
              />
              {renderShapes(shape, count, px, py, POOL_CELL, POOL_CELL)}
            </g>
          )
        })}
      </svg>

      {/* Board with 3 placed cards + grey target cell */}
      <CardsGrid17PE />
    </div>
  )
}

