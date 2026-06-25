// bullRabbitChain20A2Steps.ts — SEAMO 2020 Paper A, Q2
//
// "How many rabbits are equivalent to a bull?"
// Chain: 1 bull = 4 goats, 1 goat = 2 rabbits → 4 × 2 = 8 rabbits.
// Answer: D (8)
//
// Animation beats:
//   0. intro    — show all three rows; state the goal.
//   1. row1     — spotlight row 1 (1 bull = 4 goats).
//   2. row2     — spotlight row 2 (1 goat = 2 rabbits).
//   3. chain    — show the multiplication.
//   4. result   — reveal answer 8 in row 3.

export type Lang = 'en' | 'id'

export type BRPhase = 'intro' | 'row1' | 'row2' | 'chain' | 'result'

export interface BRStep {
  phase: BRPhase
  /** Which rows to dim (0-indexed). Empty = show all. */
  dimRows: number[]
  /** Show answer in row 3. */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BRStoryboard {
  steps: BRStep[]
  finalIndex: number
}

export function buildBullRabbitChain20A2Steps(lang: Lang): BRStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BRStep[] = [
    {
      phase: 'intro',
      dimRows: [],
      revealAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Three rows show animal equalities. We need to find how many rabbits equal one bull.',
        'Tiga baris menunjukkan kesetaraan hewan. Kita perlu mencari berapa kelinci yang sama dengan satu banteng.',
      ),
    },
    {
      phase: 'row1',
      dimRows: [1, 2],
      revealAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Row 1: 1 bull = 4 goats. Remember this!',
        'Baris 1: 1 banteng = 4 kambing. Ingat ini!',
      ),
    },
    {
      phase: 'row2',
      dimRows: [0, 2],
      revealAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Row 2: 1 goat = 2 rabbits. Now we can chain the two facts.',
        'Baris 2: 1 kambing = 2 kelinci. Sekarang kita bisa rangkaikan dua fakta ini.',
      ),
    },
    {
      phase: 'chain',
      dimRows: [2],
      revealAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        '1 bull = 4 goats, and each goat = 2 rabbits → 4 × 2 = 8 rabbits.',
        '1 banteng = 4 kambing, dan setiap kambing = 2 kelinci → 4 × 2 = 8 kelinci.',
      ),
    },
    {
      phase: 'result',
      dimRows: [],
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        '1 bull = 8 rabbits. Answer: D.',
        '1 banteng = 8 kelinci. Jawaban: D.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
