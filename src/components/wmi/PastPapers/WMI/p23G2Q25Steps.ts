import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { Cell, Icon } from './P23G2Q25Illustration'
import { PIECES, SOLUTION_OFFSETS, CENTER_CELLS } from './P23G2Q25Illustration'

// WMI-23P2A-Q25 (2023 Semifinal Grade 2 Paper A) — fit the 4 pieces (no rotation)
// into the 4×4 grid; what does the shaded centre 2×2 look like?  Seed answer: A.
//
// METHOD: the pieces translate only, and a brute-force exact cover finds exactly
// ONE way they fill the 16 cells:
//   D . B D
//   D D . B
//   B . C C
//   . C D .
// The animation drops the four pieces in, one beat each (corner-anchored P1 first,
// then the rest fall into place), then rings the centre 2×2 and reads it:
//   top-left 🐉, top-right blank, bottom-left blank, bottom-right 🧰 → option A.

const gridKey = (r: number, c: number) => `${r},${c}`

/** Absolute cell→icon map for a placed piece. */
function placedCells(label: string): Record<string, Icon> {
  const piece = PIECES.find((p) => p.label === label)!
  const [or, oc] = SOLUTION_OFFSETS[label]
  const out: Record<string, Icon> = {}
  for (const { rc: [r, c], icon } of piece.cells) {
    out[gridKey(r + or, c + oc)] = icon
  }
  return out
}

export interface PuzzleStep {
  caption: string
  /** Assembled-so-far fills (cell key → icon). */
  filled: Record<string, Icon>
  /** Cells to ring (the centre while reading it). */
  ring: Cell[]
  /** True only on the final answer beat. */
  result: boolean
  hold: number
}

export interface PuzzleStoryboard {
  answerLetter: string
  steps: PuzzleStep[]
  finalIndex: number
}

export function buildP23G2Q25Steps(lang: Lang, answerLetter: string): PuzzleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Placement order: corner piece first, then the forced rest.
  const order: Array<{ label: string; caption: [string, string] }> = [
    {
      label: 'P1',
      caption: [
        'Pieces cannot turn. The 🐉🐉/🐉 piece only fits in the top-left corner.',
        'Keping tak boleh diputar. Keping 🐉🐉/🐉 hanya muat di pojok kiri atas.',
      ],
    },
    {
      label: 'P3',
      caption: [
        'The 💣🐉 piece slots along the top edge beside it.',
        'Keping 💣🐉 masuk di tepi atas di sebelahnya.',
      ],
    },
    {
      label: 'P2',
      caption: [
        'The tall 💣/🧰 piece drops down the right-hand column.',
        'Keping tinggi 💣/🧰 turun di kolom kanan.',
      ],
    },
    {
      label: 'P4',
      caption: [
        'The last piece fills the bottom — the grid is now complete.',
        'Keping terakhir mengisi bagian bawah — kisi kini penuh.',
      ],
    },
  ]

  const steps: PuzzleStep[] = []
  let acc: Record<string, Icon> = {}

  for (let i = 0; i < order.length; i++) {
    acc = { ...acc, ...placedCells(order[i].label) }
    steps.push({
      caption: t(order[i].caption[0], order[i].caption[1]),
      filled: { ...acc },
      ring: [],
      result: false,
      hold: 2100,
    })
  }

  // Ring + read the centre.
  steps.push({
    caption: t(
      'Now read the shaded centre 2×2: 🐉 and a blank on top, a blank and 🧰 below.',
      'Sekarang baca tengah 2×2 yang diarsir: 🐉 dan kosong di atas, kosong dan 🧰 di bawah.',
    ),
    filled: { ...acc },
    ring: CENTER_CELLS as Cell[],
    result: false,
    hold: 2400,
  })

  // Final beat — the matching option.
  steps.push({
    caption: t(
      `That centre pattern is option ${answerLetter}.`,
      `Pola tengah itu adalah pilihan ${answerLetter}.`,
    ),
    filled: { ...acc },
    ring: CENTER_CELLS as Cell[],
    result: true,
    hold: 0,
  })

  return { answerLetter, steps, finalIndex: steps.length - 1 }
}
