// HKIMO-23-P1SF-Q19 — storyboard for the counting-squares animation.
//
// Strategy: count by size.
//   Beat 0 — intro: show the figure, state the task.
//   Beat 1 — highlight all 9 unit (1×1) squares one pass: count = 9.
//   Beat 2 — highlight the 3 composite (2×2) squares: count = 3.
//   Beat 3 — add up: 9 + 3 = 12 → answer.

export type Lang = 'en' | 'id'

export type CountSquaresHK23P1SFQ19PhaseId =
  | 'intro'
  | 'unit'
  | 'two-by-two'
  | 'answer'

export interface CountSquaresHK23P1SFQ19Beat {
  phase: CountSquaresHK23P1SFQ19PhaseId
  /** which 1×1 cells to highlight [row, col] */
  highlightCells: [number, number][]
  /** which 2×2 block top-left corners to highlight [row, col] */
  highlightBlocks: [number, number][]
  /** running count to display */
  count: number | null
  caption: Record<Lang, string>
}

export interface CountSquaresHK23P1SFQ19Story {
  beats: CountSquaresHK23P1SFQ19Beat[]
  finalIndex: number
}

export function buildCountSquaresHK23P1SFQ19Steps(
  lang: Lang,
): CountSquaresHK23P1SFQ19Story {
  const beats: CountSquaresHK23P1SFQ19Beat[] = [
    {
      phase: 'intro',
      highlightCells: [],
      highlightBlocks: [],
      count: null,
      caption: {
        en: 'Count ALL squares of every size in the figure.',
        id: 'Hitung SEMUA persegi dari setiap ukuran dalam gambar.',
      },
    },
    {
      phase: 'unit',
      highlightCells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1], [1, 2], [1, 3],
                [2, 1], [2, 2], [2, 3],
      ],
      highlightBlocks: [],
      count: 9,
      caption: {
        en: '1×1 squares: there are 9 unit squares.',
        id: 'Persegi 1×1: ada 9 persegi satuan.',
      },
    },
    {
      phase: 'two-by-two',
      highlightCells: [],
      highlightBlocks: [
        [0, 0],  // top-left 2×2: rows 0-1, cols 0-1
        [1, 1],  // middle 2×2:  rows 1-2, cols 1-2
        [1, 2],  // right 2×2:   rows 1-2, cols 2-3
      ],
      count: 3,
      caption: {
        en: '2×2 squares: find 3 larger squares that fit.',
        id: 'Persegi 2×2: temukan 3 persegi yang lebih besar.',
      },
    },
    {
      phase: 'answer',
      highlightCells: [],
      highlightBlocks: [],
      count: 12,
      caption: {
        en: 'Total: 9 + 3 = 12 squares.',
        id: 'Total: 9 + 3 = 12 persegi.',
      },
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
