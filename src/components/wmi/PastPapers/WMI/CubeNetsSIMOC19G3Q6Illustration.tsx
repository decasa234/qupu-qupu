// SIMOC-19-G3-Q6 — "Which figure CANNOT be folded into a cube?"
//
// The four hexomino nets A–D ARE the choices — there is no separate stem figure.
// Co-exports CubeNetsSIMOC19G3Q6Option for CHOICE_RENDERERS.
//
// Net cells [row, col] — reconstructed faithfully from OCR crops:
//   A  [[0,1],[1,0],[1,1],[2,0],[2,1],[3,1]]          S/zigzag    — valid
//   B  [[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]]           cross/plus  — valid
//   C  [[0,1],[1,0],[1,1],[1,2],[2,2],[3,2]]           T+right×2   — INVALID
//   D  [[0,2],[1,1],[1,2],[2,0],[2,1],[3,0]]           staircase   — valid
//
// Why C is invalid: top square (0,1) and the chain (1,2)→(2,2)→(3,2) both
// fold onto the TOP face of the cube — two faces overlap.
//
// Pure SVG via Polyomino primitive. SSR-safe (no hooks, no framer-motion).

import type { WmiChoice } from '../../../../types/wmi'
import { Polyomino } from './primitives/Polyomino'

// ---------------------------------------------------------------------------
// Net cell data (Polyomino coordinate system: [row, col], row 0 = top)
// ---------------------------------------------------------------------------

const NET_CELLS: Record<string, [number, number][]> = {
  A: [[0,1],[1,0],[1,1],[2,0],[2,1],[3,1]],
  B: [[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]],
  C: [[0,1],[1,0],[1,1],[1,2],[2,2],[3,2]],
  D: [[0,2],[1,1],[1,2],[2,0],[2,1],[3,0]],
}

const NET_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Net A: S-shape hexomino — valid cube net.',
    id: 'Jaring A: heksomino bentuk S — jaring kubus valid.',
  },
  B: {
    en: 'Net B: cross/plus hexomino — valid cube net.',
    id: 'Jaring B: heksomino bentuk salib — jaring kubus valid.',
  },
  C: {
    en: 'Net C: T-shape with two squares extending right — CANNOT fold into a cube; two faces overlap.',
    id: 'Jaring C: bentuk T dengan dua kotak memanjang ke kanan — TIDAK BISA dilipat menjadi kubus; dua sisi tumpang tindih.',
  },
  D: {
    en: 'Net D: staircase hexomino — valid cube net.',
    id: 'Jaring D: heksomino bentuk tangga — jaring kubus valid.',
  },
}

// ---------------------------------------------------------------------------
// CubeNetsSIMOC19G3Q6Option — renders one A/B/C/D choice as a hexomino net.
// Registered in CHOICE_RENDERERS for SIMOC-19-G3-Q6.
// ---------------------------------------------------------------------------

export function CubeNetsSIMOC19G3Q6Option({ choice }: { choice: WmiChoice }) {
  const cells = NET_CELLS[choice.label]
  const aria = NET_ARIA[choice.label]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <Polyomino
        cells={cells}
        cellSize={28}
        fill="#D6EBF7"
        stroke="#30598A"
        strokeWidth={2}
        showGrid
      />
    </span>
  )
}
