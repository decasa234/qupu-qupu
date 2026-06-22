// IKMC-22-EC-Q6 — Anna's number jigsaw puzzle (IKMC 2022 Ecolier, question 6)
//
// Source scans:
//   stem  = docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/010.jpg
//   opt A = 011.jpg  opt B = 012.jpg  opt C = 013.jpg
//   opt D = 014.jpg  opt E = 015.jpg
//
// A 6×6 grid of numbered squares with an L-shaped hole (1 cell wide + 3 cells wide).
// Rule: squares that share an edge must NOT contain the same number.
// The hole is at (row 2, col 2) [top of L] and (row 3, cols 2–4) [bottom of L].
//
// Each option piece is the same L-shape:
//   ┌───┐
//   │top│
//   ├───┼───┬───┐
//   │ L │ M │ R │
//   └───┴───┴───┘
// where `top` sits in (r2,c2) and L/M/R sit in (r3,c2), (r3,c3), (r3,c4).
//
// Verified answer: D (top=2, L=3, M=1, R=4).
// All five pieces, read from source images:
//   A: top=4, L=1, M=2, R=3
//   B: top=1, L=3, M=4, R=2
//   C: top=2, L=4, M=1, R=3
//   D: top=2, L=3, M=1, R=4  ← answer
//   E: top=3, L=2, M=1, R=4
//
// Adjacency verification for D (borders read from the fixed grid):
//   (r2,c2)=2: left=5✓ right=5✓ above=3✓
//   (r3,c2)=3: below=4✓ left=1✓  above=2✓
//   (r3,c3)=1: below=2✓ above=5✓ left=3✓ right=4✓
//   (r3,c4)=4: below=5✓ above=2✓ left=1✓ right=3✓ — all different → D is correct.
//
// Co-exports:
//   JigsawBoard  — the board with hole, for animator drop-in
//   JIGSAW_PIECES — piece data bound to the answer
//   Jigsaw6ECOption — per-choice SVG renderer for CHOICE_RENDERERS

import type { JSX } from 'react'
import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Verified piece data
// ---------------------------------------------------------------------------

export interface JigsawPiece {
  top: number   // number in the single top cell (r2,c2)
  L: number     // left   bottom cell (r3,c2)
  M: number     // middle bottom cell (r3,c3)
  R: number     // right  bottom cell (r3,c4)
}

/** All five option pieces, read from source scans. */
export const JIGSAW_PIECES: Record<string, JigsawPiece> = {
  A: { top: 4, L: 1, M: 2, R: 3 },
  B: { top: 1, L: 3, M: 4, R: 2 },
  C: { top: 2, L: 4, M: 1, R: 3 },
  D: { top: 2, L: 3, M: 1, R: 4 },
  E: { top: 3, L: 2, M: 1, R: 4 },
}

/** The solver-verified correct answer. */
export const JIGSAW_ANSWER = 'D'

// ---------------------------------------------------------------------------
// Fixed 6×6 grid — null marks the L-shaped hole
// ---------------------------------------------------------------------------

/** The fixed grid. Row 0 = top. null = empty (hole). */
export const GRID: (number | null)[][] = [
  [3, 2, 5, 4, 2, 1],
  [1, 4, 3, 1, 3, 4],
  [2, 5, null, 5, 2, 1],
  [4, 1, null, null, null, 3],
  [3, 2, 4, 2, 5, 2],
  [4, 1, 3, 1, 3, 4],
]

// ---------------------------------------------------------------------------
// Palette (qupu-adjacent; problem numbers are semantics, not decoration)
// ---------------------------------------------------------------------------

const CELL_FILL = '#EDF5FB'    // light blue — matches original scan's cell colour
const HOLE_FILL = '#FFFFFF'    // white (empty)
const INK       = '#1F2430'    // near-black outline + text
const GRID_LINE = '#9BB8D0'    // subtle grid line
const BORDER    = '#2C6EA6'    // outer grid border

// ---------------------------------------------------------------------------
// Grid cell size & padding
// ---------------------------------------------------------------------------

const CS = 36           // cell size in px
const PAD = 8           // outer padding
const GRID_W = CS * 6
const GRID_H = CS * 6
const SVG_W = GRID_W + PAD * 2
const SVG_H = GRID_H + PAD * 2

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cellX(col: number) { return PAD + col * CS }
function cellY(row: number) { return PAD + row * CS }

function isHole(r: number, c: number): boolean {
  return (r === 2 && c === 2) || (r === 3 && c >= 2 && c <= 4)
}

// ---------------------------------------------------------------------------
// JigsawBoard primitive — exported so the animator can drop a piece in
// ---------------------------------------------------------------------------

interface JigsawBoardProps {
  /** When given, fill the L-shaped hole with these numbers. */
  filled?: JigsawPiece | null
  /** Highlight colour for the dropped piece. */
  highlight?: string
}

/**
 * JigsawBoard — draws the 6×6 grid with optional hole fill.
 * Pure SVG. SSR-safe, no hooks, no random, no Date.
 */
export function JigsawBoard({ filled, highlight }: JigsawBoardProps): JSX.Element {
  // Build number overlay for hole cells when filled
  const holeNumbers: Map<string, number> = new Map()
  if (filled) {
    holeNumbers.set('2,2', filled.top)
    holeNumbers.set('3,2', filled.L)
    holeNumbers.set('3,3', filled.M)
    holeNumbers.set('3,4', filled.R)
  }

  const hlFill = highlight ?? CELL_FILL

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Draw all cells */}
      {GRID.map((row, r) =>
        row.map((val, c) => {
          const key = `${r},${c}`
          const hole = isHole(r, c)
          const droppedNum = holeNumbers.get(key)

          return (
            <g key={key}>
              <rect
                x={cellX(c)}
                y={cellY(r)}
                width={CS}
                height={CS}
                fill={hole ? (droppedNum != null ? hlFill : HOLE_FILL) : CELL_FILL}
                stroke={GRID_LINE}
                strokeWidth={0.8}
              />
              {/* Fixed grid number */}
              {val != null && !hole && (
                <text
                  x={cellX(c) + CS / 2}
                  y={cellY(r) + CS / 2 + 6}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight="700"
                  fill={INK}
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              )}
              {/* Dropped piece number */}
              {droppedNum != null && (
                <text
                  x={cellX(c) + CS / 2}
                  y={cellY(r) + CS / 2 + 6}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight="700"
                  fill={INK}
                  fontFamily="sans-serif"
                >
                  {droppedNum}
                </text>
              )}
            </g>
          )
        })
      )}

      {/* Outer border */}
      <rect
        x={PAD}
        y={PAD}
        width={GRID_W}
        height={GRID_H}
        fill="none"
        stroke={BORDER}
        strokeWidth={2.2}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// L-piece primitive — draws one option piece (1 top + 3 bottom cells)
// ---------------------------------------------------------------------------

const PIECE_CS = 32   // cell size for option pieces
const PIECE_PAD = 4
// SVG: top cell spans 1 col, bottom row spans 3 cols
const PIECE_W = PIECE_CS * 3 + PIECE_PAD * 2
const PIECE_H = PIECE_CS * 2 + PIECE_PAD * 2

interface LPieceProps {
  piece: JigsawPiece
  fill?: string
}

/** Draws the L-shaped piece as an SVG. SSR-safe. */
export function LPieceSvg({ piece, fill }: LPieceProps): JSX.Element {
  const cf = fill ?? CELL_FILL
  return (
    <svg
      viewBox={`0 0 ${PIECE_W} ${PIECE_H}`}
      width={PIECE_W}
      height={PIECE_H}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Top cell — only spans col 0 */}
      <rect
        x={PIECE_PAD}
        y={PIECE_PAD}
        width={PIECE_CS}
        height={PIECE_CS}
        fill={cf}
        stroke={INK}
        strokeWidth={1.2}
      />
      <text
        x={PIECE_PAD + PIECE_CS / 2}
        y={PIECE_PAD + PIECE_CS / 2 + 5}
        textAnchor="middle"
        fontSize={13}
        fontWeight="700"
        fill={INK}
        fontFamily="sans-serif"
      >
        {piece.top}
      </text>

      {/* Bottom row — 3 cells */}
      {[piece.L, piece.M, piece.R].map((num, i) => (
        <g key={i}>
          <rect
            x={PIECE_PAD + i * PIECE_CS}
            y={PIECE_PAD + PIECE_CS}
            width={PIECE_CS}
            height={PIECE_CS}
            fill={cf}
            stroke={INK}
            strokeWidth={1.2}
          />
          <text
            x={PIECE_PAD + i * PIECE_CS + PIECE_CS / 2}
            y={PIECE_PAD + PIECE_CS + PIECE_CS / 2 + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight="700"
            fill={INK}
            fontFamily="sans-serif"
          >
            {num}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration (default export) — board only (no answer), + 5 options
// ---------------------------------------------------------------------------

/**
 * Jigsaw6ECIllustration — shows the incomplete jigsaw grid.
 *
 * Pure function — SSR-safe, no hooks, no random, no Date.
 * The five option pieces are NOT shown here (they appear via CHOICE_RENDERERS).
 */
export default function Jigsaw6ECIllustration(): JSX.Element {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label={
        'A 6-by-6 number grid with an L-shaped hole: one empty square in row 3 column 3, ' +
        'and three empty squares in row 4 columns 3-5. The rule: two squares sharing an edge ' +
        'must not contain the same number. Choose the piece (A–E) that completes the grid.'
      }
    >
      <JigsawBoard />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE choice piece for CHOICE_RENDERERS
// ---------------------------------------------------------------------------

const ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Piece A: top cell is 4, bottom row left-to-right is 1, 2, 3.',
    id: 'Potongan A: kotak atas bernilai 4, baris bawah dari kiri ke kanan: 1, 2, 3.',
  },
  B: {
    en: 'Piece B: top cell is 1, bottom row left-to-right is 3, 4, 2.',
    id: 'Potongan B: kotak atas bernilai 1, baris bawah dari kiri ke kanan: 3, 4, 2.',
  },
  C: {
    en: 'Piece C: top cell is 2, bottom row left-to-right is 4, 1, 3.',
    id: 'Potongan C: kotak atas bernilai 2, baris bawah dari kiri ke kanan: 4, 1, 3.',
  },
  D: {
    en: 'Piece D: top cell is 2, bottom row left-to-right is 3, 1, 4.',
    id: 'Potongan D: kotak atas bernilai 2, baris bawah dari kiri ke kanan: 3, 1, 4.',
  },
  E: {
    en: 'Piece E: top cell is 3, bottom row left-to-right is 2, 1, 4.',
    id: 'Potongan E: kotak atas bernilai 3, baris bawah dari kiri ke kanan: 2, 1, 4.',
  },
}

/**
 * Jigsaw6ECOption — renders one A/B/C/D/E choice as the L-shaped puzzle piece.
 * Registered in CHOICE_RENDERERS for IKMC-22-EC-Q6.
 */
export function Jigsaw6ECOption({ choice }: { choice: WmiChoice }): JSX.Element {
  const piece = JIGSAW_PIECES[choice.label]
  const aria = ARIA[choice.label]
  if (!piece) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <LPieceSvg piece={piece} />
    </span>
  )
}
