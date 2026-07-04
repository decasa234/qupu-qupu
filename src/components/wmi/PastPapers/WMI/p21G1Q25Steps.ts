// Storyboard for WMI-21P1A-Q25 — the "assemble the pieces, read A + B" explainer.
//
// Method: fit the five pieces into the 4×4 grid (rotate, never flip) so every
// printed number lands on the same number in the grid. Brute-force verified:
// there is exactly ONE legal tiling —
//   P4 fills the top-left corner (B on the top row's second cell, a 1),
//   P1 runs down the right edge (A on the second row's right cell, a 1),
//   P2 sits at row 1 cols 1–2, P5 bottom-left, P3 the rest.
// So A = 1 and B = 1, giving A + B = 2 → answer A.
//
// The result beat lights up the two marked cells (two 1s, which total 2) so the
// sum is visible on the grid the problem already gives.
import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Q25Phase = 'show' | 'rotate' | 'place' | 'read' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** Grid cells [col,row] to highlight (where A and B land). */
  gridHighlight: Array<[number, number]> | null
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  answer: number
  steps: Q25Step[]
  finalIndex: number
}

// The two marked cells, on the given grid, that carry A and B (two 1s).
const A_CELL: [number, number] = [3, 1] // value 1 (right edge, second row)
const B_CELL: [number, number] = [1, 0] // value 1 (top row, second cell)

export function buildP21G1Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q25Step[] = [
    {
      phase: 'show',
      gridHighlight: null,
      hold: 1700,
      result: false,
      caption: t(
        'Five flat pieces must fill the 4×4 grid below the arrow.',
        'Lima keping datar harus mengisi kotak 4×4 di bawah panah.',
      ),
    },
    {
      phase: 'rotate',
      gridHighlight: null,
      hold: 1900,
      result: false,
      caption: t(
        'You may turn a piece, but never flip it over.',
        'Keping boleh diputar, tetapi tidak boleh dibalik.',
      ),
    },
    {
      phase: 'place',
      gridHighlight: null,
      hold: 2000,
      result: false,
      caption: t(
        'Every printed number must land on the same number — that forces each piece into one spot.',
        'Setiap angka tercetak harus jatuh di angka yang sama — itu memaksa tiap keping ke satu tempat.',
      ),
    },
    {
      phase: 'read',
      gridHighlight: [A_CELL, B_CELL],
      hold: 2100,
      result: false,
      caption: t(
        'Once placed, the marked cells A and B land here. Both cells show a 1.',
        'Setelah terpasang, sel bertanda A dan B jatuh di sini. Kedua sel berangka 1.',
      ),
    },
    {
      phase: 'result',
      gridHighlight: [A_CELL, B_CELL],
      hold: 0,
      result: true,
      caption: t('A + B = 1 + 1 = 2 — answer A.', 'A + B = 1 + 1 = 2 — jawaban A.'),
    },
  ]

  return { answer: 2, steps, finalIndex: steps.length - 1 }
}
