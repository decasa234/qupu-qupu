/**
 * WMI-19P2A-Q25 (2019 Grade 2 Semifinal, Paper A) — "on which piece is the dot?"
 *
 * Redrawn from db/seed/wmi/figures/2019-semifinal-g2-a-q25.jpg (NOT embedded):
 * a 5×5 board of gray/white squares with a small white square poking out on the
 * LEFT of the middle row, and a black dot sitting on one of the inner squares.
 * The whole board is assembled from four numbered pieces that may only be
 * ROTATED (never flipped); the question asks which piece carries the dot.
 *
 * The four piece-shapes themselves are not in the seed (the original options were
 * images, now placeholders "Figure A"…"Figure D"), so the static figure shows
 * ONLY the assembled board + dot — the problem. The explainer marks the answer
 * cell and names the correct option letter (C).
 *
 * Grid transcribed cell-by-cell from the scan (row 0 = top, col 0 = left):
 *   G W G W G
 *   W G W G W
 *   G W G G G   ← the dot sits on (row 2, col 3); a white square sticks out left
 *   W G W G W
 *   G W G W G
 *
 * Co-exports GRID, DOT, PROTRUSION and a BoardFigure primitive (optionally marks
 * the dot cell) so the explainer renders the very same board.
 *
 * Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.
 */

import type { ReactNode } from 'react'

// true = gray, false = white. Read straight off the scan.
export const GRID: boolean[][] = [
  [true, false, true, false, true],
  [false, true, false, true, false],
  [true, false, true, true, true],
  [false, true, false, true, false],
  [true, false, true, false, true],
]

export const N = GRID.length // 5

// The dot's cell (row, col) — verified against the scan.
export const DOT = { row: 2, col: 3 } as const

// A single white square attached on the left of the middle row (sticks out).
export const PROTRUSION = { row: 2 } as const

// The keyed answer: the dot is on piece C.
export const ANSWER_LETTER = 'C'

// ─── geometry ─────────────────────────────────────────────────────────────
const CELL = 48
const PAD = 14
const PROT_W = CELL // protruding square is one cell wide, on the left

export const VIEW_W = PAD * 2 + PROT_W + N * CELL
export const VIEW_H = PAD * 2 + N * CELL

// origin of the 5×5 grid (shifted right to leave room for the protrusion)
const GX = PAD + PROT_W
const GY = PAD

// ─── colour tokens ──────────────────────────────────────────────────────────
const GRAY = '#9CA3AF'
const WHITE = '#FFFFFF'
const LINE = '#2B2118'
const DOT_FILL = '#1F2937'
const MARK_EDGE = '#30598A'
const MARK_GLOW = '#FF8A3D'

interface BoardFigureProps {
  /** Outline + glow the dot's cell (used by the explainer to point at the answer). */
  markDot?: boolean
  /** Faintly highlight the dot's cell without the full mark (an intermediate beat). */
  hintDot?: boolean
}

export function BoardFigure({ markDot = false, hintDot = false }: BoardFigureProps) {
  const cells: ReactNode[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      cells.push(
        <rect
          key={`c${r}-${c}`}
          x={GX + c * CELL}
          y={GY + r * CELL}
          width={CELL}
          height={CELL}
          fill={GRID[r][c] ? GRAY : WHITE}
          stroke={LINE}
          strokeWidth={1.8}
        />,
      )
    }
  }

  const dotX = GX + DOT.col * CELL + CELL / 2
  const dotY = GY + DOT.row * CELL + CELL / 2

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 380 }}
      aria-hidden="true"
    >
      {/* protruding white square on the left of the middle row */}
      <rect
        x={GX - PROT_W}
        y={GY + PROTRUSION.row * CELL}
        width={PROT_W}
        height={CELL}
        fill={WHITE}
        stroke={LINE}
        strokeWidth={1.8}
      />

      {cells}

      {/* faint hint ring */}
      {hintDot && !markDot && (
        <rect
          x={GX + DOT.col * CELL + 3}
          y={GY + DOT.row * CELL + 3}
          width={CELL - 6}
          height={CELL - 6}
          fill="none"
          stroke={MARK_GLOW}
          strokeWidth={3}
          opacity={0.6}
        />
      )}

      {/* the black dot */}
      <circle cx={dotX} cy={dotY} r={12} fill={DOT_FILL} />

      {/* answer mark: orange glow + blue ring on the dot's cell */}
      {markDot && (
        <>
          <rect
            x={GX + DOT.col * CELL}
            y={GY + DOT.row * CELL}
            width={CELL}
            height={CELL}
            fill={MARK_GLOW}
            opacity={0.28}
          />
          <rect
            x={GX + DOT.col * CELL + 2}
            y={GY + DOT.row * CELL + 2}
            width={CELL - 4}
            height={CELL - 4}
            fill="none"
            stroke={MARK_EDGE}
            strokeWidth={3.4}
          />
        </>
      )}
    </svg>
  )
}

export default function P19G2Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A five by five board of gray and white squares with a small white square poking out on the left of the middle row. A black dot sits on a square near the centre. The board is built from four pieces that may only be rotated."
    >
      <BoardFigure />
    </div>
  )
}
