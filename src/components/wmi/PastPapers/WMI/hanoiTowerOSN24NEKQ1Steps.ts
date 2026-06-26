// Storyboard for OSN-24-SD-NAS-EKSPERIMEN-Q1 — post-answer explainer.
// "Move 4 cubes from peg I to peg III using minimum moves.
//  Peg I can be unsorted; pegs II and III must stay sorted (heavy→light)."
//
// Optimal 8-move solution:
//   Move 1: rank 2 → peg II
//   Move 2: rank 4 → peg II (on top of rank 2)
//   Move 3: rank 1 → peg III (empty)
//   Move 4: rank 4 → peg I (free buffer)
//   Move 5: rank 2 → peg III (on rank 1)
//   Move 6: rank 4 → peg II (empty)
//   Move 7: rank 3 → peg III (on rank 2)
//   Move 8: rank 4 → peg III (on rank 3) → DONE
//
// Key insight: peg I's free-order rule allows us to use it as a buffer,
// enabling a shorter path than the standard 4-disc Tower of Hanoi (15 moves).

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { TowerState } from './HanoiTowerOSN24NEKQ1Illustration'

export type HanoiPhase =
  | 'initial'
  | 'clear_top'
  | 'place1'
  | 'buffer'
  | 'place23'
  | 'done'

export interface HanoiStep {
  phase: HanoiPhase
  state: TowerState
  caption: string
  hold: number
  result: boolean
}

export interface HanoiStoryboard {
  steps: HanoiStep[]
  finalIndex: number
}

export function buildHanoiTowerOSN24NEKQ1Steps(lang: Lang): HanoiStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: HanoiStep[] = []

  steps.push({
    phase: 'initial',
    state: { pegI: [3, 1, 4, 2], pegII: [], pegIII: [] },
    hold: 2400,
    result: false,
    caption: t(
      'Start: peg I holds 4 cubes unsorted (rank 3→1→4→2, bottom to top). Pegs II and III must always stay sorted.',
      'Awal: Tiang I memiliki 4 kubus tidak berurutan (urutan 3→1→4→2, bawah ke atas). Tiang II dan III harus selalu terurut.',
    ),
  })

  steps.push({
    phase: 'clear_top',
    state: { pegI: [3, 1], pegII: [2, 4], pegIII: [] },
    hold: 2400,
    result: false,
    caption: t(
      'Moves 1–2: Move rank 2 then rank 4 onto peg II (sorted: rank 2 bottom, rank 4 top). This exposes rank 1.',
      'Langkah 1–2: Pindahkan urutan 2 lalu urutan 4 ke Tiang II (terurut: urutan 2 di bawah, urutan 4 di atas). Urutan 1 kini terekspos.',
    ),
  })

  steps.push({
    phase: 'place1',
    state: { pegI: [3], pegII: [2, 4], pegIII: [1] },
    hold: 2400,
    result: false,
    caption: t(
      'Move 3: Move rank 1 (heaviest) to the empty peg III. Rank 1 must be placed first — nothing heavier can support it.',
      'Langkah 3: Pindahkan urutan 1 (terberat) ke Tiang III yang kosong. Urutan 1 harus ditempatkan pertama — tidak ada yang lebih berat untuk menopangnya.',
    ),
  })

  steps.push({
    phase: 'buffer',
    state: { pegI: [3, 4], pegII: [2], pegIII: [1, 2] },
    hold: 2400,
    result: false,
    caption: t(
      'Moves 4–5: Move rank 4 to peg I (free buffer!), then move rank 2 to peg III. Peg I\'s free-order rule is the key advantage.',
      'Langkah 4–5: Pindahkan urutan 4 ke Tiang I (buffer bebas!), lalu pindahkan urutan 2 ke Tiang III. Aturan bebas Tiang I adalah keuntungan utama.',
    ),
  })

  steps.push({
    phase: 'place23',
    state: { pegI: [], pegII: [4], pegIII: [1, 2, 3] },
    hold: 2400,
    result: false,
    caption: t(
      'Moves 6–7: Move rank 4 to peg II, then move rank 3 (now on top of peg I) to peg III.',
      'Langkah 6–7: Pindahkan urutan 4 ke Tiang II, lalu pindahkan urutan 3 (kini di atas Tiang I) ke Tiang III.',
    ),
  })

  steps.push({
    phase: 'done',
    state: { pegI: [], pegII: [], pegIII: [1, 2, 3, 4] },
    hold: 0,
    result: true,
    caption: t(
      'Move 8: Place rank 4 on peg III. Done — all 4 cubes sorted on peg III in just 8 moves!',
      'Langkah 8: Letakkan urutan 4 ke Tiang III. Selesai — 4 kubus tersusun di Tiang III hanya dalam 8 langkah!',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
