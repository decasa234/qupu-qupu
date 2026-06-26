// OSN-25-SD-PROV-Q6 — symbol grid illustration (stem only, no answer).
//
// Shows the 4×4 symbol table with row sums and column sums as seen in the
// original paper (image 2025.imgs/005.jpg).
//
// Primitive used: GridBoard (from ./primitives/GridBoard) for the grid
// structure, row sums, and column sums. Colored symbol glyphs are
// overlaid as SVG <text> elements.
//
// Grid layout:
//   Row 0: ♥ ♦ ♥ ♦  → 24
//   Row 1: ★ ★ ◎ ★  → 26
//   Row 2: ★ ★ ♥ ★  → 23
//   Row 3: ◎ ♥ ♥ ◎  → 26
//   Col:   ?  24 23 27

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── grid data ─────────────────────────────────────────────────────────────────

type Sym = 'H' | 'D' | 'S' | 'R'

const GRID: Sym[][] = [
  ['H', 'D', 'H', 'D'],
  ['S', 'S', 'R', 'S'],
  ['S', 'S', 'H', 'S'],
  ['R', 'H', 'H', 'R'],
]

const SYMBOL_CHAR: Record<Sym, string> = {
  H: '♥', // ♥
  D: '♦', // ♦
  S: '★', // ★
  R: '◎', // ◎
}

const SYMBOL_COLOR: Record<Sym, string> = {
  H: '#A855F7', // purple-500
  D: '#F59E0B', // amber-500
  S: '#EF4444', // red-500
  R: '#22C55E', // green-500
}

// ── layout ────────────────────────────────────────────────────────────────────

const ROWS = 4
const COLS = 4
const CELL = 58
const ROW_SUMS = ['24', '26', '23', '26']
const COL_SUMS = ['?', '24', '23', '27']

// ── component ─────────────────────────────────────────────────────────────────

export interface IllustrationProps {
  lang: 'en' | 'id'
}

export default function SymbolGridOSN25PQ6Illustration(_props: IllustrationProps) {
  const vb = gridBoardViewBox(ROWS, COLS, CELL, ROW_SUMS, COL_SUMS)
  const fontSize = Math.round(CELL * 0.48)

  return (
    <svg viewBox={vb} width="100%" aria-hidden="true">
      {/* grid structure: borders, fill, row/col sum labels */}
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={CELL}
        fill={() => '#FDF4FF'}
        rowSums={ROW_SUMS}
        colSums={COL_SUMS}
        gridStroke="#9CA3AF"
      />

      {/* colored symbol overlays */}
      {GRID.map((row, r) =>
        row.map((sym, c) => (
          <text
            key={`sym-${r}-${c}`}
            x={c * CELL + CELL / 2}
            y={r * CELL + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fill={SYMBOL_COLOR[sym]}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {SYMBOL_CHAR[sym]}
          </text>
        )),
      )}

      {/* "?" col-sum label override — bold orange so it reads as the unknown */}
      <text
        x={0 * CELL + CELL / 2}
        y={ROWS * CELL + Math.round(CELL * 0.6 * 0.9)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.round(CELL * 0.4)}
        fontWeight={900}
        fill="#F97316"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ?
      </text>
    </svg>
  )
}

// ── re-exported layout constants for the Explainer ────────────────────────────

export { GRID, SYMBOL_CHAR, SYMBOL_COLOR, ROW_SUMS, COL_SUMS, ROWS, COLS, CELL }
