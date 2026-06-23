// SnakeSeq18A25Illustration.tsx
//
// Stem illustration for SEAMO-2018-Paper-A Q25:
//   "97 numbers are arranged in the sequence as shown below.
//    What number does M represent?"
//
// Source image: docs/reference/ocr-res/seamo/contest/paper-a/2018.imgs/033.jpg
// Classification: stem
//
// Layout (from image):
//   • 8 cells wide, 13 rows tall (12 rows × 8 + 1 cell = 97 numbers)
//   • Row 0  (top,    rtl ←): shows cells labelled 3, 2, 1 at the RIGHT end.
//             Arrow (←) at top-right.
//   • Row 7  (middle, ltr →): right-most cell is position 64, labelled 'M'.
//   • Row 12 (bottom, rtl ←): only 1 cell (position 97) at col 0 (left).
//             Rows 11 (ltr) shows 96, 95 at right-most cols.
//             Arrow (←) at bottom-left.
//   • Answer (not shown): M = 64.
//
// Primitives used: GridBoard from ./primitives/GridBoard
//
// Pure SVG, SSR-safe: no hooks, no framer-motion, no Math.random, no Date.
//
// Exports:
//   default  — static stem illustration
//   VISUALS  — record keyed 'SEAMO-18-A-Q25' for the registry

import type { JSX } from 'react'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── Constants ─────────────────────────────────────────────────────────────────
const COLS = 8
const ROWS = 13   // rows 0–12; row 12 has only 1 cell (position 97)
const CELL = 32   // cell size px — keep compact for 8-wide grid

// ── Colours ───────────────────────────────────────────────────────────────────
const C_BG      = '#F9FAFB'
const C_BLUE    = '#DBEAFE'   // labelled number cells
const C_YELLOW  = '#FEF9C3'   // M cell highlight
const C_INK     = '#1F2937'
const C_ARROW   = '#374151'

// ── Sequence helpers ──────────────────────────────────────────────────────────

/** Row direction: even rows travel right-to-left (←), odd rows left-to-right (→). */
function rowDir(r: number): 'rtl' | 'ltr' {
  return r % 2 === 0 ? 'rtl' : 'ltr'
}

/** Sequence position (1-indexed) of cell (r, c) in the snake arrangement. */
function pos(r: number, c: number): number {
  const base = r * COLS
  return rowDir(r) === 'rtl'
    ? base + (COLS - 1 - c) + 1
    : base + c + 1
}

// ── Cell content ──────────────────────────────────────────────────────────────

function cellLabel(r: number, c: number): string {
  const p = pos(r, c)
  // Top row (row 0, rtl): show 1, 2, 3 at right end (cols 7, 6, 5)
  if (r === 0 && (p === 1 || p === 2 || p === 3)) return String(p)
  // Row 7 (ltr, positions 57–64): col 7 = position 64 → M
  if (r === 7 && c === COLS - 1) return 'M'
  // Row 12 (rtl, only position 97 at col 0): show 97
  if (r === 12 && p === 97) return '97'
  // Row 11 (ltr, positions 89–96): cols 6,7 = positions 95,96
  if (r === 11 && (p === 95 || p === 96)) return String(p)
  return ''
}

function cellFill(r: number, c: number): string {
  if (r === 7 && c === COLS - 1) return C_YELLOW
  const lbl = cellLabel(r, c)
  if (lbl !== '') return C_BLUE
  return C_BG
}

// ── Inline arrow glyphs ───────────────────────────────────────────────────────

/** Left-pointing arrow (←) rendered at (cx, cy). */
function ArrowLeft({ cx, cy }: { cx: number; cy: number }): JSX.Element {
  const len = 18
  return (
    <g>
      <line
        x1={cx + len / 2} y1={cy}
        x2={cx - len / 2} y2={cy}
        stroke={C_ARROW} strokeWidth={1.8}
      />
      <polygon
        points={`${cx - len / 2},${cy} ${cx - len / 2 + 7},${cy - 4} ${cx - len / 2 + 7},${cy + 4}`}
        fill={C_ARROW}
      />
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * SnakeSeq18A25Illustration
 *
 * Renders the snake-sequence grid for SEAMO 2018 Paper A Q25.
 * 13 rows × 8 columns; boustrophedon layout starting right-to-left at top.
 * Labels shown: 1, 2, 3 (top-right); M (row 7 right end); 97, 96, 95 (bottom-left area).
 * Direction arrows at top-right and bottom-left.
 */
export default function SnakeSeq18A25Illustration(): JSX.Element {
  const vbStr = gridBoardViewBox(ROWS, COLS, CELL)
  const [, , gridW, gridH] = vbStr.split(' ').map(Number)

  // Padding to accommodate arrow indicators
  const PL = 28   // left pad (arrow for ltr rows + bottom arrow)
  const PR = 28   // right pad (arrow for rtl rows / top arrow)
  const PT = 6
  const PB = 6

  const svgW = gridW + PL + PR
  const svgH = gridH + PT + PB

  // Arrow centres (absolute SVG coords)
  // Top arrow (←): sits to the right of row 0, vertically centred
  const topArrowCx  = PL + gridW + PR / 2
  const topArrowCy  = PT + CELL / 2
  // Bottom arrow (←): sits to the left of row 12, vertically centred
  const botArrowCx  = PL / 2
  const botArrowCy  = PT + 12 * CELL + CELL / 2

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={
        '97 numbers in a snake sequence. Top row (right-to-left): …3, 2, 1. ' +
        'Middle section ends with M at position 64. ' +
        'Bottom row (right-to-left) starts with 97, 96, 95.'
      }
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Canvas background */}
        <rect width={svgW} height={svgH} fill={C_BG} rx={4} />

        {/* GridBoard */}
        <g transform={`translate(${PL},${PT})`}>
          <GridBoard
            rows={ROWS}
            cols={COLS}
            cellSize={CELL}
            fill={(r, c) => cellFill(r, c)}
            label={(r, c) => cellLabel(r, c)}
          />
        </g>

        {/* Top-right arrow (←): row 0 is right-to-left */}
        <ArrowLeft cx={topArrowCx} cy={topArrowCy} />

        {/* Bottom-left arrow (←): row 12 is right-to-left */}
        <ArrowLeft cx={botArrowCx} cy={botArrowCy} />
      </svg>
    </div>
  )
}

// ── VISUALS export ────────────────────────────────────────────────────────────

/**
 * Registry loaders for SEAMO-2018-A-Q25.
 *
 * Add to registry.ts:
 *   'SEAMO-18-A-Q25': {
 *     type: 'stem',
 *     illustration: () => import('./SnakeSeq18A25Illustration'),
 *   },
 */
export const VISUALS: Record<string, {
  type: 'stem'
  illustration: () => Promise<{ default: () => JSX.Element }>
}> = {
  'SEAMO-18-A-Q25': {
    type: 'stem',
    illustration: () =>
      import('./SnakeSeq18A25Illustration').then((m) => ({ default: m.default })),
  },
}
