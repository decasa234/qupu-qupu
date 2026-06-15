// Jigsaw-assembly picture for WMI-23P1A-Q25 (2023 Grade 1 Semifinal, Paper A).
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g1-a-q25.jpg) survives only
// as a tiny, heavily-cropped thumbnail (104×107 px) showing one corner of the
// completed picture — a single decorated tile (a dragon) sitting in one cell of
// the grid, with two blank cells below-left. The four puzzle pieces, the full
// target picture, and the four image-only answer options (A–D) are NOT
// recoverable from that crop.
//
// So per the paper-conversion rule for image-only options, this stem illustrates
// the SETUP only: four jigsaw pieces on the left are to be slotted (without
// rotation) into the 4×4 board on the right; one 2×2 corner of the board is
// shaded — the question asks what that shaded 2×2 region looks like once filled.
// The static figure never shows the assembled picture (the answer); the
// explainer reasons the method and lands on the seed's answer, option A.

import { Fragment } from 'react'

const INK = '#3A332E'
const PIECE_FILL = '#FFD3B1' // qupu-peach
const BOARD_FILL = '#FFFFFF'
const SHADE_FILL = '#A8DBF0' // soft blue for the asked-about 2×2 region
const SHADE_STROKE = '#2F86C2'

export const Q25_VIEW_W = 460
export const Q25_VIEW_H = 240

const CELL = 40
const BOARD_N = 4
const BOARD_X = 232
const BOARD_Y = 36

/** The shaded 2×2 region the question asks about: the bottom-left corner of the
 * board (rows 2–3, cols 0–1 in 0-based board coordinates). */
export const SHADED_CELLS = new Set<string>(['2,0', '2,1', '3,0', '3,1'])

/**
 * A jigsaw tab/blank along one edge — a small bump (out) or notch (in). Drawn as
 * a half-circle bulge on the given side of a cell, so the four left-hand tokens
 * read clearly as interlocking puzzle pieces rather than plain squares.
 */
function piecePath(x: number, y: number, s: number): string {
  // A 2-cell-tall L-ish puzzle token with a tab on the right edge.
  const r = s * 0.22
  const midY = y + s
  return (
    `M ${x} ${y} ` +
    `H ${x + s} ` +
    `V ${midY - r} ` +
    `a ${r} ${r} 0 0 1 0 ${2 * r} ` + // right-edge tab (bulge out)
    `V ${y + 2 * s} ` +
    `H ${x} ` +
    `Z`
  )
}

/** One puzzle piece token at (x, y); width = CELL, height = 2·CELL. */
export function PuzzlePiece({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <path d={piecePath(x, y, CELL)} fill={PIECE_FILL} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <text x={x + CELL / 2} y={y + CELL} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK} fontFamily="system-ui, sans-serif">
        {label}
      </text>
    </g>
  )
}

export interface Q25BoardProps {
  /** When true, draw the shaded 2×2 region as solved (a soft check tint). */
  solved?: boolean
  /** Ring the shaded 2×2 region to draw the eye to the asked-about corner. */
  spotlight?: boolean
}

/** The 4×4 board with the shaded 2×2 corner. */
export function Q25Setup({ solved = false, spotlight = false }: Q25BoardProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW_W} ${Q25_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Four puzzle pieces stacked on the left, each 1×2 cells. */}
      <PuzzlePiece x={40} y={28} label="1" />
      <PuzzlePiece x={110} y={28} label="2" />
      <PuzzlePiece x={40} y={132} label="3" />
      <PuzzlePiece x={110} y={132} label="4" />

      {/* Arrow: pieces -> board */}
      <g stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={180} y1={120} x2={214} y2={120} />
        <polyline points={`206,112 216,120 206,128`} />
      </g>

      {/* The 4×4 board. */}
      {Array.from({ length: BOARD_N }).map((_, r) =>
        Array.from({ length: BOARD_N }).map((_, c) => {
          const key = `${r},${c}`
          const shaded = SHADED_CELLS.has(key)
          const x = BOARD_X + c * CELL
          const y = BOARD_Y + r * CELL
          return (
            <Fragment key={key}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={shaded ? (solved ? '#CDEBD7' : SHADE_FILL) : BOARD_FILL}
                stroke={INK}
                strokeWidth={2}
              />
              {shaded && solved && (
                <text x={x + CELL / 2} y={y + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#0F7A3D" fontFamily="system-ui, sans-serif">
                  ✓
                </text>
              )}
            </Fragment>
          )
        }),
      )}

      {/* Outer frame. */}
      <rect x={BOARD_X} y={BOARD_Y} width={BOARD_N * CELL} height={BOARD_N * CELL} fill="none" stroke={INK} strokeWidth={2.8} />

      {/* Spotlight ring on the asked-about 2×2 corner. */}
      {spotlight && (
        <rect x={BOARD_X - 3} y={BOARD_Y + 2 * CELL - 3} width={2 * CELL + 6} height={2 * CELL + 6} fill="none" stroke={SHADE_STROKE} strokeWidth={3.5} strokeDasharray="6 5" />
      )}
    </svg>
  )
}

export default function P23G1Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four puzzle pieces on the left are to be slotted into a four-by-four board on the right. A two-by-two region in one corner of the board is shaded — the question asks what that region looks like once the picture is complete."
    >
      <Q25Setup spotlight />
    </div>
  )
}
