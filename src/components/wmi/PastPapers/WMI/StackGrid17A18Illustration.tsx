// SEAMO-18-A-Q17 — "What do we get if all the figures are stacked on top of each other?"
//
// Three 4×4 grids each have two yellow highlighted cells.  Stacking (union) produces
// a combined grid whose highlighted cells match option B.
//
// Stem figures (0-indexed row, col in a 4×4 grid):
//   Fig 1: (1,2) and (3,0)
//   Fig 2: (1,1) and (2,3)
//   Fig 3: (0,1) and (2,2)
// Union → {(0,1),(1,1),(1,2),(2,2),(2,3),(3,0)}  = option B (correct answer)
//
// Answer options A–D are drawn as grids; E is "None of the above" (text only).
// This file exports:
//   default export  — StackGrid17A18Illustration (stem: 3 source grids)
//   named export    — StackGrid17A18Option        (one choice grid for CHOICE_RENDERERS)
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── grid constants ────────────────────────────────────────────────────────────

const ROWS = 4
const COLS = 4
const CELL = 36            // px per cell in the stem grids
const OPT_CELL = 32        // px per cell in the option grids
const YELLOW = '#FCD34D'   // amber-300 — matches the paper's golden-yellow fill

// ── stem figure cell sets (row, col 0-indexed) ────────────────────────────────

type RC = [number, number]

const FIG1: RC[] = [[1, 2], [3, 0]]
const FIG2: RC[] = [[1, 1], [2, 3]]
const FIG3: RC[] = [[0, 1], [2, 2]]

// Union of all three → answer B
const UNION: RC[] = [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 0]]

// Option A: wrong union (has (0,2) in place of (1,1))
const OPT_A: RC[] = [[0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [3, 0]]

// Option B: correct union
const OPT_B: RC[] = UNION

// Option C: wrong — shifts (2,3) to (3,3)
const OPT_C: RC[] = [[0, 1], [1, 1], [1, 2], [2, 2], [3, 0], [3, 3]]

// Option D: wrong — shifts (0,1) to (0,0), (2,3) to (2,1)
const OPT_D: RC[] = [[0, 0], [1, 1], [1, 2], [2, 1], [2, 2], [3, 0]]

// ── helper: make fill function from a cell list ───────────────────────────────

function makeFill(cells: RC[]) {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  return (r: number, c: number): string | undefined =>
    set.has(`${r},${c}`) ? YELLOW : '#FFFFFF'
}

// ── SmallGrid — one grid rendered as SVG ──────────────────────────────────────

interface SmallGridProps {
  cells: RC[]
  cellSize: number
  ariaLabel: string
}

function SmallGrid({ cells, cellSize, ariaLabel }: SmallGridProps) {
  const vb = gridBoardViewBox(ROWS, COLS, cellSize)
  const svgSize = ROWS * cellSize
  return (
    <svg
      viewBox={vb}
      width={svgSize}
      height={svgSize}
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={cellSize}
        fill={makeFill(cells)}
        gridStroke="#6B7280"
      />
    </svg>
  )
}

// ── Stem illustration — three source grids side by side ──────────────────────

/**
 * StackGrid17A18Illustration — shows the three source figures that the student
 * must mentally stack to find the union.  Does NOT reveal the answer.
 */
export default function StackGrid17A18Illustration() {
  const figs: Array<{ cells: RC[]; aria: string }> = [
    {
      cells: FIG1,
      aria: 'Figure 1: 4×4 grid with yellow cells at row 2 col 3 and row 4 col 1.',
    },
    {
      cells: FIG2,
      aria: 'Figure 2: 4×4 grid with yellow cells at row 2 col 2 and row 3 col 4.',
    },
    {
      cells: FIG3,
      aria: 'Figure 3: 4×4 grid with yellow cells at row 1 col 2 and row 3 col 3.',
    },
  ]
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Three 4×4 grids each with two yellow-highlighted cells. Stack all three to find the union."
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        {figs.map((fig, i) => (
          <SmallGrid
            key={i}
            cells={fig.cells}
            cellSize={CELL}
            ariaLabel={fig.aria}
          />
        ))}
      </div>
    </div>
  )
}

// ── Option renderer — one choice grid ────────────────────────────────────────

const OPTION_CELLS: Record<string, RC[]> = {
  A: OPT_A,
  B: OPT_B,
  C: OPT_C,
  D: OPT_D,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: result grid with 6 yellow cells — incorrect union.',
    id: 'Pilihan A: grid hasil dengan 6 sel kuning — gabungan salah.',
  },
  B: {
    en: 'Option B: result grid with 6 yellow cells — correct union of all three figures.',
    id: 'Pilihan B: grid hasil dengan 6 sel kuning — gabungan benar dari ketiga gambar.',
  },
  C: {
    en: 'Option C: result grid with 6 yellow cells — incorrect union.',
    id: 'Pilihan C: grid hasil dengan 6 sel kuning — gabungan salah.',
  },
  D: {
    en: 'Option D: result grid with 6 yellow cells — incorrect union.',
    id: 'Pilihan D: grid hasil dengan 6 sel kuning — gabungan salah.',
  },
}

/**
 * StackGrid17A18Option — renders one A/B/C/D/E choice as a 4×4 grid.
 * Option E ("None of the above") falls through to plain text.
 * Registered in CHOICE_RENDERERS for SEAMO-18-A-Q17.
 */
export function StackGrid17A18Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const cells = OPTION_CELLS[k]
  const aria = OPTION_ARIA[k]

  if (!cells) {
    // Option E — text only
    return <span>{choice.text}</span>
  }

  const svgSize = ROWS * OPT_CELL
  const vb = gridBoardViewBox(ROWS, COLS, OPT_CELL)

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={vb}
        width={svgSize}
        height={svgSize}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={OPT_CELL}
          fill={makeFill(cells)}
          gridStroke="#6B7280"
        />
      </svg>
    </span>
  )
}
