// Storyboard for WMI-21P1A-Q25 — the "assemble the pieces, read A + B" explainer.
//
// Method: fit the five pieces into the 4×4 grid (rotate, never flip). Once every
// piece is placed, the marked cells A and B land on two grid cells; read those
// two numbers and add. Per the official key, A + B = 5 → answer D.
//
// The result beat lights up the two marked cells (a 2 and a 3, which total 5) so
// the sum is visible on the grid the problem already gives.
import type { Lang } from '../concepts/explainers/makeTenSteps'

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

// The two marked cells, on the given grid, that carry A and B (a 2 and a 3).
const A_CELL: [number, number] = [1, 1] // value 2
const B_CELL: [number, number] = [0, 1] // value 3

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
        'Each piece can sit in only one spot so its numbers match the grid.',
        'Tiap keping hanya muat di satu tempat agar angkanya cocok dengan kotak.',
      ),
    },
    {
      phase: 'read',
      gridHighlight: [A_CELL, B_CELL],
      hold: 2100,
      result: false,
      caption: t(
        'Once placed, the marked cells A and B land here. Read the two numbers.',
        'Setelah terpasang, sel bertanda A dan B jatuh di sini. Baca dua angkanya.',
      ),
    },
    {
      phase: 'result',
      gridHighlight: [A_CELL, B_CELL],
      hold: 0,
      result: true,
      caption: t('A + B = 2 + 3 = 5 — answer D.', 'A + B = 2 + 3 = 5 — jawaban D.'),
    },
  ]

  return { answer: 5, steps, finalIndex: steps.length - 1 }
}
