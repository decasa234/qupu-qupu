// IKMC-19-EC-Q14 — storyboard for the sum-boxes animation.
//
// Problem: place digits 2, 0, 1, 9 into □ □ □ + ? to get the largest sum.
// Answer: ? can be 0 or 1 — both give 921 (choice A).
//
// Teaching walk, one idea per beat:
//   0. intro    — show the blank sum layout; state the constraint.
//   1. hundreds — 9 goes in hundreds (largest digit → biggest contribution).
//   2. tens     — 2 goes in tens (next largest).
//   3. try-1    — try ? = 1 → 920 + 1 = 921.
//   4. try-0    — try ? = 0 → 921 + 0 = 921 (same!).
//   5. result   — both 0 and 1 give 921 → answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SumPhase = 'intro' | 'hundreds' | 'tens' | 'try-1' | 'try-0' | 'result'

export interface SumBeat {
  /** Which animation phase. */
  phase: SumPhase
  /** Three-box digits [hundreds, tens, units], null = empty box. */
  digits: [string | null, string | null, string | null]
  /** Single-digit box value, null = show '?'. */
  single: string | null
  /** Which box is highlighted (0=hundreds, 1=tens, 2=units, 3=single), or null. */
  highlightIndex: number | null
  /** Show the result (green) on the single box. */
  resultSingle: boolean
  /** Show result green on all boxes. */
  resultAll: boolean
  /** Equation string to display below the figure ('' to hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface SumStoryboard {
  steps: SumBeat[]
  finalIndex: number
}

export function buildSumBoxes14ECSteps(lang: Lang): SumStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SumBeat[] = [
    // Beat 0 — intro: blank layout, state the task
    {
      phase: 'intro',
      digits: [null, null, null],
      single: null,
      highlightIndex: null,
      resultSingle: false,
      resultAll: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Place 2, 0, 1 and 9 — each once — into □□□ + ? to get the LARGEST sum.',
        'Tempatkan 2, 0, 1, dan 9 — masing-masing sekali — ke □□□ + ? agar jumlahnya TERBESAR.',
      ),
    },

    // Beat 1 — 9 in hundreds: biggest digit gives biggest hundreds contribution
    {
      phase: 'hundreds',
      digits: ['9', null, null],
      single: null,
      highlightIndex: 0,
      resultSingle: false,
      resultAll: false,
      equation: '9__ + ?',
      hold: 2200,
      result: false,
      caption: t(
        '9 is the largest digit — put it in the hundreds place for the biggest gain.',
        '9 adalah angka terbesar — letakkan di ratusan agar keuntungannya paling besar.',
      ),
    },

    // Beat 2 — 2 in tens: next largest goes to tens
    {
      phase: 'tens',
      digits: ['9', '2', null],
      single: null,
      highlightIndex: 1,
      resultSingle: false,
      resultAll: false,
      equation: '92_ + ?',
      hold: 2200,
      result: false,
      caption: t(
        '2 is the next largest — put it in the tens place.',
        '2 adalah angka terbesar berikutnya — letakkan di puluhan.',
      ),
    },

    // Beat 3 — try ? = 1: 920 + 1 = 921
    {
      phase: 'try-1',
      digits: ['9', '2', '0'],
      single: '1',
      highlightIndex: 3,
      resultSingle: false,
      resultAll: false,
      equation: '920 + 1 = 921',
      hold: 2200,
      result: false,
      caption: t(
        'Try ? = 1: the remaining digits 0 and 1 fill units and ?. 920 + 1 = 921.',
        'Coba ? = 1: sisa angka 0 dan 1 mengisi satuan dan ?. 920 + 1 = 921.',
      ),
    },

    // Beat 4 — try ? = 0: 921 + 0 = 921 (same max)
    {
      phase: 'try-0',
      digits: ['9', '2', '1'],
      single: '0',
      highlightIndex: 3,
      resultSingle: false,
      resultAll: false,
      equation: '921 + 0 = 921',
      hold: 2200,
      result: false,
      caption: t(
        'Try ? = 0: swap units and ?. 921 + 0 = 921. Same maximum!',
        'Coba ? = 0: tukar satuan dan ?. 921 + 0 = 921. Maksimum yang sama!',
      ),
    },

    // Beat 5 — result: both 0 and 1 give 921 → answer A
    {
      phase: 'result',
      digits: ['9', '2', null],
      single: '0/1',
      highlightIndex: null,
      resultSingle: true,
      resultAll: false,
      equation: '921 → A',
      hold: 0,
      result: true,
      caption: t(
        'Both 0 and 1 give the maximum 921 — answer A (Either 0 or 1).',
        '0 dan 1 sama-sama menghasilkan maksimum 921 — jawaban A (0 atau 1).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
