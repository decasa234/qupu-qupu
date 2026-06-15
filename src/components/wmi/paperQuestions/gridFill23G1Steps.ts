import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-23F1A-Q21 (2023 Grade 1 Final) — "Fill 5, 6, 7, 8 into the four empty
// squares so every row increases left->right and every column increases
// top->bottom. How many different ways?"  Answer: 6 (fill-in).
//
// METHOD (deduce, don't assert):
//   Grid givens:   1 3 []      The four blanks are r0c2, r1c2 (right column)
//                  2 4 []      and r2c0, r2c1 (bottom row).
//                  [] [] 9
//   Every value in {5,6,7,8} is bigger than 4 (so > all of 1,2,3,4) and smaller
//   than 9, so the ONLY live constraints are:
//     - right column must increase DOWN:  r0c2 < r1c2
//     - bottom row must increase RIGHT:   r2c0 < r2c1
//   These two pairs are independent. Once you pick which 2 of {5,6,7,8} go in
//   the right column (smaller on top), the other 2 go in the bottom row (smaller
//   on left) and the order of each pair is forced. So the answer is exactly the
//   number of ways to choose 2 of the 4 values for the column: C(4,2) = 6.
//
// The storyboard highlights the two constrained pairs, then walks all 6 column
// choices as a running tally, filling a concrete valid grid for each so the kid
// sees a real arrangement behind every tick. The winner beat ("6 ways") is last.

export interface GridFill23G1Step {
  caption: string
  /** Cells to outline this beat (the constrained pair under discussion). */
  highlight: ReadonlyArray<string>
  /** Concrete numbers to drop in, keyed "r0c2" etc., or null. */
  fill: Record<string, number> | null
  /** The chosen column pair on a tally beat, for the small chip display. */
  columnPair: [number, number] | null
  /** Running count of choices found so far (0 before tallying starts). */
  running: number
  /** True only on the final answer beat. */
  result: boolean
  /** Hold time in ms; the winner lingers at 0 (no advance), tally beats pause. */
  hold: number
}

export interface GridFill23G1Storyboard {
  answer: number
  steps: GridFill23G1Step[]
  finalIndex: number
}

const VALUES = [5, 6, 7, 8] as const

const RIGHT_COL = ['r0c2', 'r1c2'] as const // increases DOWN: r0c2 < r1c2
const BOTTOM_ROW = ['r2c0', 'r2c1'] as const // increases RIGHT: r2c0 < r2c1

/** All C(4,2) = 6 ways to pick the right-column pair, smaller value first. */
function columnChoices(): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < VALUES.length; i++) {
    for (let j = i + 1; j < VALUES.length; j++) {
      out.push([VALUES[i], VALUES[j]])
    }
  }
  return out // {5,6},{5,7},{5,8},{6,7},{6,8},{7,8}
}

/** Build the forced full filling for a given column pair. */
function fillFor(colPair: [number, number]): Record<string, number> {
  const [top, bottom] = colPair // smaller on top
  const rest = VALUES.filter((v) => v !== top && v !== bottom).sort((a, b) => a - b)
  const [left, right] = rest // smaller on left
  return {
    r0c2: top,
    r1c2: bottom,
    r2c0: left,
    r2c1: right,
  }
}

export function buildGridFill23G1Steps(lang: Lang): GridFill23G1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const choices = columnChoices()
  const answer = choices.length // 6

  const steps: GridFill23G1Step[] = []

  // Beat 0 — the goal.
  steps.push({
    caption: t(
      'Place 5, 6, 7, 8. Every row goes up →, every column goes up ↓.',
      'Isi 5, 6, 7, 8. Tiap baris naik →, tiap kolom naik ↓.',
    ),
    highlight: [],
    fill: null,
    columnPair: null,
    running: 0,
    result: false,
    hold: 2100,
  })

  // Beat 1 — the right column pair must increase downward.
  steps.push({
    caption: t(
      'Right column: the two blanks must go up ↓ (top < bottom).',
      'Kolom kanan: dua kotak kosong harus naik ↓ (atas < bawah).',
    ),
    highlight: [...RIGHT_COL],
    fill: null,
    columnPair: null,
    running: 0,
    result: false,
    hold: 2100,
  })

  // Beat 2 — the bottom row pair must increase rightward.
  steps.push({
    caption: t(
      'Bottom row: the two blanks must go up → (left < right).',
      'Baris bawah: dua kotak kosong harus naik → (kiri < kanan).',
    ),
    highlight: [...BOTTOM_ROW],
    fill: null,
    columnPair: null,
    running: 0,
    result: false,
    hold: 2100,
  })

  // Beat 3 — the key insight: all of 5..8 beat every neighbour, so the ONLY
  // free choice is which 2 go in the right column.
  steps.push({
    caption: t(
      '5, 6, 7, 8 all beat 4 and lose to 9. So just pick which 2 go in the column!',
      '5, 6, 7, 8 semua lebih dari 4 dan kurang dari 9. Jadi tinggal pilih 2 untuk kolom!',
    ),
    highlight: [...RIGHT_COL],
    fill: null,
    columnPair: null,
    running: 0,
    result: false,
    hold: 2400,
  })

  // Beats 4..9 — the six column choices as a running tally. Each fills a real,
  // forced valid grid so the tick is backed by an actual arrangement.
  choices.forEach((pair, i) => {
    const running = i + 1
    const [top, bottom] = pair
    steps.push({
      caption: t(
        `Column ${top},${bottom} → the rest fills itself. That is way #${running}.`,
        `Kolom ${top},${bottom} → sisanya terisi sendiri. Itu cara ke-${running}.`,
      ),
      highlight: [...RIGHT_COL],
      fill: fillFor(pair),
      columnPair: pair,
      running,
      result: false,
      hold: 1900,
    })
  })

  // Final beat — the count. (last beat, hold 0).
  steps.push({
    caption: t(
      `Choose 2 of 4 for the column = ${answer} ways.`,
      `Pilih 2 dari 4 untuk kolom = ${answer} cara.`,
    ),
    highlight: [],
    fill: fillFor(choices[choices.length - 1]),
    columnPair: null,
    running: answer,
    result: true,
    hold: 0,
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
