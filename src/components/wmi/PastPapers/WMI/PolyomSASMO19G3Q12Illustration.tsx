// SASMO-19-G3-Q12 — "All the figures below are made up of identical squares.
// The area of the figure with the largest area is 48 cm². What is the
// perimeter of the figure with the largest perimeter?"
//
// Four polyomino figures; answer choices are numerical values (A=46cm … D=48cm).
// Answer: D (48 cm).
//
//  A: staircase      — 10 cells, 16-unit perimeter
//  B: large cross    — 12 cells, 16-unit perimeter  ← largest AREA
//  C: H-shape        — 11 cells, 24-unit perimeter  ← largest PERIMETER
//  D: Z-staircase    — 12 cells, 16-unit perimeter
//
// Primitive: Polyomino (IMPORT-FIRST)
// Reference: CubeShapes14Illustration (Option co-export pattern)

import type { WmiChoice } from '../../../../types/wmi'
import { Polyomino } from './primitives/Polyomino'

// ─── Shape cell data [row, col] ───────────────────────────────────────────────

type Cells = [number, number][]

// Figure A (017.jpg): triangular staircase, 10 cells, perimeter 16 units
const CELLS_A: Cells = [
  [0,0],[0,1],[0,2],[0,3],
  [1,0],[1,1],[1,2],
  [2,0],[2,1],
  [3,0],
]

// Figure B (018.jpg): large cross (4×4 minus corners), 12 cells, perimeter 16 units
const CELLS_B: Cells = [
  [0,1],[0,2],
  [1,0],[1,1],[1,2],[1,3],
  [2,0],[2,1],[2,2],[2,3],
  [3,1],[3,2],
]

// Figure C (019.jpg): H-shape, 11 cells, perimeter 24 units — LARGEST PERIMETER
// Two vertical bars (col 0 and col 2) joined by a horizontal bar at row 2.
const CELLS_C: Cells = [
  [0,0],[0,2],
  [1,0],[1,2],
  [2,0],[2,1],[2,2],
  [3,0],[3,2],
  [4,0],[4,2],
]

// Figure D (020.jpg): Z-staircase (two 3×2 blocks offset by 1 col), 12 cells, perimeter 16 units
const CELLS_D: Cells = [
  [0,0],[0,1],[0,2],
  [1,0],[1,1],[1,2],
  [2,1],[2,2],[2,3],
  [3,1],[3,2],[3,3],
]

export const FIGURE_CELLS: Record<string, Cells> = {
  A: CELLS_A,
  B: CELLS_B,
  C: CELLS_C,
  D: CELLS_D,
}

const FIGURE_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Figure A: staircase shape, 10 identical squares.',
    id: 'Bangun A: bentuk tangga, 10 kotak identik.',
  },
  B: {
    en: 'Figure B: large cross shape, 12 identical squares — largest area.',
    id: 'Bangun B: bentuk silang besar, 12 kotak identik — luas terbesar.',
  },
  C: {
    en: 'Figure C: H-shape, 11 identical squares — largest perimeter (48 cm).',
    id: 'Bangun C: bentuk huruf H, 11 kotak identik — keliling terbesar (48 cm).',
  },
  D: {
    en: 'Figure D: Z-staircase shape, 12 identical squares.',
    id: 'Bangun D: bentuk tangga-Z, 12 kotak identik.',
  },
}

// ─── Option renderer — one figure by choice label ────────────────────────────

/**
 * PolyomSASMO19G3Q12Option — renders one of the four polyomino figures (A/B/C/D).
 * Registered in CHOICE_RENDERERS for SASMO-19-G3-Q12.
 */
export function PolyomSASMO19G3Q12Option({ choice }: { choice: WmiChoice }) {
  const cells = FIGURE_CELLS[choice.label]
  const aria = FIGURE_ARIA[choice.label]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Polyomino
        cells={cells}
        cellSize={22}
        fill="#FFFFFF"
        stroke="#1F2937"
        strokeWidth={1.5}
        pad={4}
      />
    </span>
  )
}

// ─── Stem illustration — all four figures in a 2×2 grid ─────────────────────

const LABELS = ['A', 'B', 'C', 'D'] as const

/**
 * PolyomSASMO19G3Q12Illustration — shows all four polyomino figures as the
 * problem stem. Does NOT reveal which has the largest perimeter.
 */
export default function PolyomSASMO19G3Q12Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Four figures made of identical squares — which has the largest perimeter?"
    >
      <div className="grid grid-cols-2 gap-6" aria-hidden="true">
        {LABELS.map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Polyomino
              cells={FIGURE_CELLS[label]}
              cellSize={24}
              fill="#FFFFFF"
              stroke="#1F2937"
              strokeWidth={1.5}
              pad={4}
            />
            <span className="text-xs font-bold" style={{ color: '#1F2937' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
