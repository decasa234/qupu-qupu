// Beat-by-beat storyboard for IKMC-22-PE-Q24.
//
// Initial arrangement: [3, 4, 1, 5, 2]
// Target:              [1, 2, 3, 4, 5]  (increasing order)
//
// Optimal swap sequence (3 swaps — answer C):
//   Swap 1: positions 0 ↔ 2  →  [1, 4, 3, 5, 2]
//   Swap 2: positions 1 ↔ 4  →  [1, 2, 3, 5, 4]
//   Swap 3: positions 3 ↔ 4  →  [1, 2, 3, 4, 5]  ✓

import type { CardState } from './NumCards24PEIllustration'

export type SwapPhase =
  | 'show'        // initial arrangement, no highlights
  | 'check1'      // try 1 swap — not enough
  | 'check2'      // try 2 swaps — not enough
  | 'swap1'       // highlight 3 and 1, show arc
  | 'after1'      // after swap 1 → [1,4,3,5,2]
  | 'swap2'       // highlight 4 and 2, show arc
  | 'after2'      // after swap 2 → [1,2,3,5,4]
  | 'swap3'       // highlight 5 and 4, show arc
  | 'result'      // sorted → [1,2,3,4,5]

export interface SwapBeat {
  phase: SwapPhase
  /** Current card digits at each position (0-indexed). */
  digits: readonly number[]
  /** Visual state per position. */
  states: readonly CardState[]
  /** Arc from position i to position j (if defined). */
  swapArrow?: [number, number]
  caption: { en: string; id: string }
  hold: number
  result: boolean
}

export interface SwapStoryboard {
  steps: SwapBeat[]
  finalIndex: number
  answer: string
}

export function buildNumCards24PESteps(): SwapStoryboard {
  const normal5: CardState[] = ['normal', 'normal', 'normal', 'normal', 'normal']
  const done5: CardState[] = ['done', 'done', 'done', 'done', 'done']

  const steps: SwapBeat[] = [
    // ── Beat 0: show the problem ──────────────────────────────────────────────
    {
      phase: 'show',
      digits: [3, 4, 1, 5, 2],
      states: normal5,
      caption: {
        en: 'The cards show: 3  4  1  5  2. We want 1  2  3  4  5. How many swaps?',
        id: 'Kartu menunjukkan: 3  4  1  5  2. Kita ingin 1  2  3  4  5. Berapa pertukaran?',
      },
      hold: 2600,
      result: false,
    },

    // ── Beat 1: can 1 swap do it? ─────────────────────────────────────────────
    {
      phase: 'check1',
      digits: [3, 4, 1, 5, 2],
      states: normal5,
      caption: {
        en: '1 swap? One swap can only fix one mis-placed pair at a time. Not enough here. ✗',
        id: '1 pertukaran? Satu pertukaran hanya bisa memperbaiki satu pasang yang salah posisi. Tidak cukup. ✗',
      },
      hold: 2400,
      result: false,
    },

    // ── Beat 2: can 2 swaps do it? ───────────────────────────────────────────
    {
      phase: 'check2',
      digits: [3, 4, 1, 5, 2],
      states: normal5,
      caption: {
        en: '2 swaps? Still not enough — 3 cards are out of place forming a chain. ✗',
        id: '2 pertukaran? Masih kurang — 3 kartu salah posisi membentuk rantai. ✗',
      },
      hold: 2400,
      result: false,
    },

    // ── Beat 3: swap 1 — highlight cards to be swapped ───────────────────────
    {
      phase: 'swap1',
      digits: [3, 4, 1, 5, 2],
      states: ['highlighted', 'normal', 'highlighted', 'normal', 'normal'],
      swapArrow: [0, 2],
      caption: {
        en: 'Swap 1: swap the 3 (pos 1) and the 1 (pos 3). The 1 goes to its right place.',
        id: 'Tukar 1: tukar 3 (pos 1) dan 1 (pos 3). Angka 1 menuju tempatnya yang benar.',
      },
      hold: 2200,
      result: false,
    },

    // ── Beat 4: after swap 1 ──────────────────────────────────────────────────
    {
      phase: 'after1',
      digits: [1, 4, 3, 5, 2],
      states: ['done', 'normal', 'normal', 'normal', 'normal'],
      caption: {
        en: 'After swap 1: [1  4  3  5  2]. Card 1 is now in its correct place. (1 swap done)',
        id: 'Setelah tukar 1: [1  4  3  5  2]. Kartu 1 sudah di tempat yang benar. (1 pertukaran selesai)',
      },
      hold: 2000,
      result: false,
    },

    // ── Beat 5: swap 2 — highlight cards to be swapped ───────────────────────
    {
      phase: 'swap2',
      digits: [1, 4, 3, 5, 2],
      states: ['done', 'highlighted', 'normal', 'normal', 'highlighted'],
      swapArrow: [1, 4],
      caption: {
        en: 'Swap 2: swap the 4 (pos 2) and the 2 (pos 5). The 2 goes to its right place.',
        id: 'Tukar 2: tukar 4 (pos 2) dan 2 (pos 5). Angka 2 menuju tempatnya yang benar.',
      },
      hold: 2200,
      result: false,
    },

    // ── Beat 6: after swap 2 ──────────────────────────────────────────────────
    {
      phase: 'after2',
      digits: [1, 2, 3, 5, 4],
      states: ['done', 'done', 'done', 'normal', 'normal'],
      caption: {
        en: 'After swap 2: [1  2  3  5  4]. Cards 1, 2, 3 are now in place. (2 swaps done)',
        id: 'Setelah tukar 2: [1  2  3  5  4]. Kartu 1, 2, 3 sudah di tempat. (2 pertukaran selesai)',
      },
      hold: 2000,
      result: false,
    },

    // ── Beat 7: swap 3 — highlight cards to be swapped ───────────────────────
    {
      phase: 'swap3',
      digits: [1, 2, 3, 5, 4],
      states: ['done', 'done', 'done', 'highlighted', 'highlighted'],
      swapArrow: [3, 4],
      caption: {
        en: 'Swap 3: swap the 5 (pos 4) and the 4 (pos 5). The last two fall into place!',
        id: 'Tukar 3: tukar 5 (pos 4) dan 4 (pos 5). Dua kartu terakhir pada tempatnya!',
      },
      hold: 2200,
      result: false,
    },

    // ── Beat 8: result ────────────────────────────────────────────────────────
    {
      phase: 'result',
      digits: [1, 2, 3, 4, 5],
      states: done5,
      caption: {
        en: '3  4  1  5  2 is now sorted into 1  2  3  4  5 in just 3 swaps. Answer: C',
        id: '3  4  1  5  2 sudah tersusun menjadi 1  2  3  4  5 hanya dengan 3 pertukaran. Jawaban: C',
      },
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'C' }
}
