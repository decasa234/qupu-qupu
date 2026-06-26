// SIMOC-21-G1-Q12 — "How will the following figure look like when looking from the top?"
//
// Shows a 3D isometric cube arrangement (9 unit cubes in a cross-like pattern)
// as the problem stem figure. Co-exports TopViewSIMOC21G1Q12Option for CHOICE_RENDERERS.
//
// 3D layout (x=right, y=forward/depth, z=up, all at z=0):
//   y=0: x=1,2          (back pair)
//   y=1: x=0,1,2,3      (wide middle row)
//   y=2: x=1,2          (front pair)
//   y=3: x=1            (front extension)
//
// Top-down footprint (matches option E — the correct answer):
//   . X X .
//   X X X X
//   . X X .
//   . X . .
//
// Pure SVG, SSR-safe (no hooks, no framer-motion, no random, no window/document).

import { IsoCubes } from './primitives/IsoCubes'
import { Polyomino } from './primitives/Polyomino'
import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// 3D cube voxels for the stem illustration
// ---------------------------------------------------------------------------

const STEM_CUBES: { x: number; y: number; z: number }[] = [
  // back pair
  { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
  // wide middle row
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  // front pair
  { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },
  // front extension
  { x: 1, y: 3, z: 0 },
]

// ---------------------------------------------------------------------------
// 2D polyomino cells for each answer choice — [row, col] pairs
// ---------------------------------------------------------------------------

type Cell = [number, number]

// Option A: 3-cell top-right arm + 4-wide row + 2-cell stem
const CELLS_A: Cell[] = [
  [0, 1], [0, 2], [0, 3],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 1],
  [3, 1],
]

// Option B: 1 top-left cell + 4-wide row + 2-cell center + stem
const CELLS_B: Cell[] = [
  [0, 0],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2],
  [3, 1],
]

// Option C: 1 top-right cell + 4-wide row + 2-cell center + stem
const CELLS_C: Cell[] = [
  [0, 2],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2],
  [3, 1],
]

// Option D: 5-wide top + 3-wide middle + narrow stem
const CELLS_D: Cell[] = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 1], [1, 2], [1, 3],
  [2, 2],
  [3, 2],
]

// Option E (CORRECT): 2 adjacent top + 4-wide row + 2 adjacent below + stem
// This is the exact top-down footprint of STEM_CUBES
const CELLS_E: Cell[] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2],
  [3, 1],
]

const OPTION_CELLS: Record<string, Cell[]> = {
  A: CELLS_A,
  B: CELLS_B,
  C: CELLS_C,
  D: CELLS_D,
  E: CELLS_E,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: 3-cell arm at top-right, 4-cell middle row, 2-cell stem below.',
    id: 'Pilihan A: lengan 3 sel di kanan atas, baris tengah 4 sel, batang 2 sel di bawah.',
  },
  B: {
    en: 'Option B: 1 cell top-left, 4-cell middle row, 2-cell center, 1-cell stem.',
    id: 'Pilihan B: 1 sel kiri atas, baris tengah 4 sel, 2 sel tengah, batang 1 sel.',
  },
  C: {
    en: 'Option C: 1 cell at top-center-right, 4-cell middle row, 2-cell center, 1-cell stem.',
    id: 'Pilihan C: 1 sel tengah kanan atas, baris tengah 4 sel, 2 sel tengah, batang 1 sel.',
  },
  D: {
    en: 'Option D: 5-cell wide top row, 3-cell middle, 1-cell narrow stem.',
    id: 'Pilihan D: baris atas 5 sel (lebar), tengah 3 sel, batang 1 sel sempit.',
  },
  E: {
    en: 'Option E: 2 adjacent cells at top, 4-cell wide row, 2 adjacent cells below, 1-cell stem — the correct top view.',
    id: 'Pilihan E: 2 sel berdampingan di atas, baris 4 sel (lebar), 2 sel berdampingan di bawah, batang 1 sel — tampilan atas yang benar.',
  },
}

// ---------------------------------------------------------------------------
// Stem illustration (default export)
// ---------------------------------------------------------------------------

/**
 * TopViewSIMOC21G1Q12Illustration — shows the 9-cube 3D arrangement as the problem figure.
 * Does NOT reveal the answer.
 */
export default function TopViewSIMOC21G1Q12Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Susunan 9 kubus membentuk pola silang simetris dalam tampilan isometrik tiga dimensi."
    >
      <IsoCubes
        cubes={STEM_CUBES}
        size={28}
        viewPadding={10}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer (named export) — renders ONE choice as its 2D top-view grid
// ---------------------------------------------------------------------------

/**
 * TopViewSIMOC21G1Q12Option — renders one A/B/C/D/E choice as a 2D polyomino grid.
 * Registered in CHOICE_RENDERERS for SIMOC-21-G1-Q12.
 */
export function TopViewSIMOC21G1Q12Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const cells = OPTION_CELLS[k]
  const aria = OPTION_ARIA[k]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Polyomino
        cells={cells}
        cellSize={22}
        pad={4}
        fill="#FFFFFF"
        stroke="#1F2937"
        strokeWidth={2}
        showGrid
      />
    </span>
  )
}
