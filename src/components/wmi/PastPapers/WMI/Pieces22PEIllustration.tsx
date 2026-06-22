// IKMC-23-PE-Q22 — "Malik places one of the five pieces on the grid…"
// This question has NO separate stem figure — the A–E choices ARE the figures.
// Exports:
//   • GridBoard        — reusable 3×3 number grid primitive (also used by explainer)
//   • PieceShape       — renders one polyomino piece as SVG squares (also reused)
//   • Pieces22PEOption — named choice renderer (A–E); registered in CHOICE_RENDERERS
//
// Piece shapes (read from source images; no rotation or flip allowed):
//   A — Γ-pentomino  (5 cells): col 2 rows 0-1, full row 2
//   B — staircase pentomino (5 cells): anti-diagonal staircase
//   C — plus-pentomino (5 cells): cross with arms N/S/E/W
//   D — Z-tetromino  (4 cells): top [col 0,1] / bottom [col 1,2]
//   E — 5-cell irregular (top [col 1,2] / mid [col 0,1] / bottom [col 0])
//       Official answer: E  (IKMC 2023 answer key)
//
// Pure SVG, no random, no dates, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'
import { ALL_PIECES, GRID, type Cell } from './pieces22PESteps'

// ── Design tokens ─────────────────────────────────────────────────────────────

const PIECE_FILL   = '#B8B0D4'  // soft lavender matching source images
const PIECE_STROKE = '#6B62A8'
const GRID_BG      = '#F8F8F8'
const GRID_LINE    = '#CBD5E1'
const NUM_COLOR    = '#1F2937'
const HIGHLIGHT_FILL   = '#FDE68A'   // amber — covered cells
const HIGHLIGHT_STROKE = '#D97706'
const CORRECT_FILL     = '#BBF7D0'   // green — answer beat
const CORRECT_STROKE   = '#059669'

// ── GridBoard primitive ───────────────────────────────────────────────────────

const CELL   = 36   // cell size in px
const PAD    = 4    // padding around grid
const COLS   = 3
const ROWS   = 3
const GRID_W = COLS * CELL + PAD * 2
const GRID_H = ROWS * CELL + PAD * 2

interface GridBoardProps {
  /** Cells to highlight (amber / covered by piece). */
  covered?: Cell[]
  /** Use green instead of amber (answer / result beat). */
  answerColor?: boolean
  /** Optional sum badge text to overlay top-right. */
  sumLabel?: string
}

/**
 * GridBoard — draws the 3×3 number grid with optional cell highlights.
 * Exported for reuse in the explainer.
 */
export function GridBoard({ covered = [], answerColor = false, sumLabel }: GridBoardProps) {
  const covSet = new Set(covered.map(([r, c]) => `${r},${c}`))

  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={GRID_W}
      height={GRID_H}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={GRID_W} height={GRID_H} fill={GRID_BG} rx={4} />

      {/* cells */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const key   = `${r},${c}`
          const isCov = covSet.has(key)
          const fill   = isCov ? (answerColor ? CORRECT_FILL  : HIGHLIGHT_FILL)   : '#FFFFFF'
          const stroke = isCov ? (answerColor ? CORRECT_STROKE : HIGHLIGHT_STROKE) : GRID_LINE
          const x = PAD + c * CELL
          const y = PAD + r * CELL
          return (
            <g key={key}>
              <rect
                x={x} y={y} width={CELL} height={CELL}
                fill={fill} stroke={stroke} strokeWidth={1.5}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fontWeight={isCov ? 'bold' : 'normal'}
                fontFamily="Georgia, serif"
                fill={isCov ? (answerColor ? CORRECT_STROKE : '#92400E') : NUM_COLOR}
              >
                {GRID[r][c]}
              </text>
            </g>
          )
        })
      )}

      {/* sum badge */}
      {sumLabel && (
        <g>
          <rect
            x={GRID_W - 38} y={0} width={38} height={18}
            fill={answerColor ? CORRECT_STROKE : HIGHLIGHT_STROKE}
            rx={4}
          />
          <text
            x={GRID_W - 19} y={9}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight="bold"
            fontFamily="Georgia, serif"
            fill="#FFFFFF"
          >
            {sumLabel}
          </text>
        </g>
      )}
    </svg>
  )
}

// ── PieceShape primitive ──────────────────────────────────────────────────────

interface PieceShapeProps {
  cells: Cell[]
  /** SVG cell size in px. Default 28. */
  cell?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

/**
 * PieceShape — renders a polyomino piece as filled, auto-fitted squares.
 * The SVG viewBox expands to fit the piece's bounding box exactly.
 * Exported for reuse in the explainer.
 */
export function PieceShape({
  cells,
  cell = 28,
  fill = PIECE_FILL,
  stroke = PIECE_STROKE,
  strokeWidth = 1.5,
}: PieceShapeProps) {
  if (!cells.length) return null

  const rowVals = cells.map(([r]) => r)
  const colVals = cells.map(([, c]) => c)
  const minR    = Math.min(...rowVals)
  const minC    = Math.min(...colVals)
  const maxR    = Math.max(...rowVals)
  const maxC    = Math.max(...colVals)
  const spanR   = maxR - minR + 1
  const spanC   = maxC - minC + 1
  const pad     = 2
  const vbW     = spanC * cell + pad * 2
  const vbH     = spanR * cell + pad * 2

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={vbW}
      height={vbH}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={pad + (c - minC) * cell}
          y={pad + (r - minR) * cell}
          width={cell}
          height={cell}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx={2}
        />
      ))}
    </svg>
  )
}

// ── Aria descriptions ─────────────────────────────────────────────────────────

const PIECE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Piece A: 5-cell Γ-shape — bottom row of three cells plus two cells stacked above the right end.',
    id: 'Potongan A: bentuk Γ 5 kotak — baris bawah tiga kotak ditambah dua kotak di atas ujung kanan.',
  },
  B: {
    en: 'Piece B: 5-cell staircase — three-step anti-diagonal, from top-right down to bottom-left.',
    id: 'Potongan B: 5 kotak tangga — tiga langkah anti-diagonal, dari kanan-atas ke kiri-bawah.',
  },
  C: {
    en: 'Piece C: 5-cell plus/cross — one centre cell with one arm in each of the four directions.',
    id: 'Potongan C: plus/silang 5 kotak — satu kotak pusat dengan satu lengan di setiap empat arah.',
  },
  D: {
    en: 'Piece D: 4-cell Z-tetromino — two cells on top-left, two on bottom-right, joined at one corner.',
    id: 'Potongan D: Z-tetromino 4 kotak — dua kotak di kiri-atas, dua di kanan-bawah, bertemu di satu sudut.',
  },
  E: {
    en: 'Piece E: 5-cell irregular — top-right pair, middle-left pair, and one cell below the leftmost. This is the answer.',
    id: 'Potongan E: 5 kotak tidak beraturan — pasang kanan-atas, pasang kiri-tengah, dan satu kotak di bawah yang paling kiri. Ini adalah jawabannya.',
  },
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Pieces22PEOption — renders ONE choice (A–E) as its polyomino picture.
 * Registered as CHOICE_RENDERERS['IKMC-23-PE-Q22'].
 */
export function Pieces22PEOption({ choice }: { choice: WmiChoice }) {
  const k     = (choice.label ?? '').trim().toUpperCase()
  const cells = ALL_PIECES[k]
  const aria  = PIECE_ARIA[k]

  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <PieceShape cells={cells} cell={28} />
    </span>
  )
}
