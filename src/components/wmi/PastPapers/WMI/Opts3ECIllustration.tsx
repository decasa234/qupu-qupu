// IKMC-20-EC-Q3 — "Tysger shades all squares where the result is 20."
//
// The stem is a text+table (body_en/id in the seed), so there is NO separate
// stem illustration.  The five A–E choices ARE pictures of 2×3 shading grids,
// each showing a different subset of shaded squares.
//
// Shading key (from the PDF scans 012–016.jpg):
//   A: top row fully shaded (3) + bottom-left shaded  → 4 shaded  (CORRECT)
//   B: [0,0], [0,2], [1,1], [1,2]  → diagonally scattered
//   C: [0,0], [0,1], [0,2], [1,1]  → top-row + bottom-middle
//   D: all 6 except [1,1]           → 5 shaded (bottom-middle empty)
//   E: [0,1], [0,2], [1,0], [1,2]  → top-right two + bottom-left + bottom-right
//
// The seed's breakdown confirms: 16+4=20✓, 19+1=20✓, 28−8=20✓, 2×10=20✓,
// 16−4=12✗, 7×3=21✗  →  cells (row,col): [0,0][0,1][0,2][1,0] shaded = shape A.
//
// This file exports:
//   Opts3ECOption   — renders ONE A–E choice as an SVG 2×3 shading grid
//   (no default export / no stem illustration — options-only question)
//
// Pure render: no Math.random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── Style tokens ──────────────────────────────────────────────────────────────

const SHADE_FILL = '#6B7280'   // grey shaded cell (matches scan)
const EMPTY_FILL = '#FFFFFF'   // unshaded cell
const STROKE     = '#374151'   // cell border
const SW         = 1.5         // stroke-width

// ── Grid dimensions for the option renderer ───────────────────────────────────

const COLS   = 3
const ROWS   = 2
const CELL_W = 28
const CELL_H = 28
const PAD    = 3
const OPT_W  = COLS * CELL_W + 2 * PAD   // 90
const OPT_H  = ROWS * CELL_H + 2 * PAD   // 62

// ── Shading patterns for each option (row-major, true = shaded) ──────────────
//
// Read from scan crops 012–016.jpg:
//   A (012): row0 = [T T T], row1 = [T F F]
//   B (013): row0 = [T F T], row1 = [F T T]
//   C (014): row0 = [T T T], row1 = [F T F]
//   D (015): row0 = [T T T], row1 = [T F T]  — wait, scan shows 5 shaded, missing [1,1]
//   E (016): row0 = [F T T], row1 = [T F T]

type Grid = boolean[][]  // [row][col]

const OPTION_GRIDS: Record<string, Grid> = {
  A: [
    [true,  true,  true ],
    [true,  false, false],
  ],
  B: [
    [true,  false, true ],
    [false, true,  true ],
  ],
  C: [
    [true,  true,  true ],
    [false, true,  false],
  ],
  D: [
    [true,  true,  true ],
    [true,  false, true ],
  ],
  E: [
    [false, true,  true ],
    [true,  false, true ],
  ],
}

// ── Aria descriptions ─────────────────────────────────────────────────────────

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: all three top cells shaded, bottom-left shaded, bottom-middle and bottom-right empty.',
    id: 'Pilihan A: tiga sel atas semuanya diarsir, kiri bawah diarsir, tengah bawah dan kanan bawah kosong.',
  },
  B: {
    en: 'Option B: top-left and top-right shaded, top-middle empty; bottom-middle and bottom-right shaded, bottom-left empty.',
    id: 'Pilihan B: kiri atas dan kanan atas diarsir, tengah atas kosong; tengah bawah dan kanan bawah diarsir, kiri bawah kosong.',
  },
  C: {
    en: 'Option C: all three top cells shaded, only bottom-middle shaded, bottom-left and bottom-right empty.',
    id: 'Pilihan C: tiga sel atas semuanya diarsir, hanya tengah bawah diarsir, kiri bawah dan kanan bawah kosong.',
  },
  D: {
    en: 'Option D: all three top cells shaded, bottom-left and bottom-right shaded, bottom-middle empty.',
    id: 'Pilihan D: tiga sel atas semuanya diarsir, kiri bawah dan kanan bawah diarsir, tengah bawah kosong.',
  },
  E: {
    en: 'Option E: top-middle and top-right shaded, top-left empty; bottom-left and bottom-right shaded, bottom-middle empty.',
    id: 'Pilihan E: tengah atas dan kanan atas diarsir, kiri atas kosong; kiri bawah dan kanan bawah diarsir, tengah bawah kosong.',
  },
}

// ── Primitive: a single 2×3 shading-grid ─────────────────────────────────────

/**
 * ShadeGrid — draws a 2-row × 3-column grid where each cell is either
 * shaded (grey) or empty (white), with an optional highlight ring on a
 * specific cell.  Used both by Opts3ECOption and Opts3ECExplainer.
 *
 * @param grid   2D boolean array [row][col]; true = shaded
 * @param highlightCell  [row, col] to draw an accent ring around; null to skip
 * @param accentColor    colour for the ring (default green)
 */
export function ShadeGrid({
  grid,
  highlightCell = null,
  accentColor = '#10B981',
  width = OPT_W,
}: {
  grid: Grid
  highlightCell?: [number, number] | null
  accentColor?: string
  width?: number
}) {
  const aspect = OPT_H / OPT_W
  const height = Math.round(width * aspect)

  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {grid.map((rowCells, r) =>
        rowCells.map((shaded, c) => {
          const x = PAD + c * CELL_W
          const y = PAD + r * CELL_H
          const isHighlit =
            highlightCell !== null &&
            highlightCell[0] === r &&
            highlightCell[1] === c
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                fill={shaded ? SHADE_FILL : EMPTY_FILL}
                stroke={STROKE}
                strokeWidth={SW}
              />
              {isHighlit && (
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={CELL_W - 4}
                  height={CELL_H - 4}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={3}
                  rx={3}
                />
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

// Export the grids so the explainer can import them without re-declaring
export { OPTION_GRIDS, OPTION_ARIA, OPT_W, OPT_H }

// ── Option renderer — renders ONE A–E choice ───────────────────────────────────

/**
 * Opts3ECOption — renders a single A/B/C/D/E choice as a 2×3 shading-grid SVG.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q3.
 */
export function Opts3ECOption({ choice }: { choice: WmiChoice }) {
  const k = (choice.label ?? '').trim().toUpperCase()
  const grid = OPTION_GRIDS[k]
  const aria = OPTION_ARIA[k]
  if (!grid) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <ShadeGrid grid={grid} width={84} />
    </span>
  )
}
