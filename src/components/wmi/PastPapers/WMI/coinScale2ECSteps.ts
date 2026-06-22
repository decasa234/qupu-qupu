import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC-23-EC-Q2 — "The 2 kangaroo coins with the question mark on them have
// the same value. 20 + 10 + 10 + ? + ? + 1 = 51. What is this value?"
//
// Answer: C (5)
//
// Strategy: add the known coins (20+10+10+1 = 41), find the gap (51−41 = 10),
// halve the gap (10 ÷ 2 = 5).
//
// Beats:
//   0 — Intro: show all 6 coins, equation neutral (no spotlight)
//   1 — Sum known coins: spotlight the four known coins, show 20+10+10+1 = 41
//   2 — Find gap: show 51 − 41 = 10 (the two unknown coins together)
//   3 — Halve: each ? = 10 ÷ 2 = 5
//   4 — Result: answer C = 5

export const KNOWN_SUM = 41   // 20+10+10+1
export const TOTAL = 51
export const UNKNOWN_SUM = 10  // 51−41
export const ANSWER = 5        // 10÷2

export interface CoinScale2ECStep {
  /** Which coin indices (0-based) to spotlight; empty = all neutral. */
  spotlight: number[]
  /** Equation or result text shown as a badge ('' = hidden). */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface CoinScale2ECStoryboard {
  steps: CoinScale2ECStep[]
  finalIndex: number
}

export function buildCoinScale2ECSteps(lang: Lang): CoinScale2ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinScale2ECStep[] = [
    // Beat 0 — Intro
    {
      spotlight: [],
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'Six coins in a row equal 51. Two coins show a question mark — find their value.',
        'Enam koin berjajar sama dengan 51. Dua koin bertanda tanya — temukan nilainya.',
      ),
    },
    // Beat 1 — Sum known coins
    {
      spotlight: [0, 1, 2, 5],  // indices of 20, 10, 10, 1
      equation: t('20 + 10 + 10 + 1 = 41', '20 + 10 + 10 + 1 = 41'),
      hold: 2400,
      result: false,
      caption: t(
        'Add the four known coins: 20 + 10 + 10 + 1 = 41.',
        'Jumlahkan empat koin yang diketahui: 20 + 10 + 10 + 1 = 41.',
      ),
    },
    // Beat 2 — Find gap
    {
      spotlight: [3, 4],  // the two ? coins
      equation: t('51 − 41 = 10', '51 − 41 = 10'),
      hold: 2400,
      result: false,
      caption: t(
        'The two unknown coins together must make up 51 − 41 = 10.',
        'Dua koin yang tidak diketahui bersama-sama harus berjumlah 51 − 41 = 10.',
      ),
    },
    // Beat 3 — Halve
    {
      spotlight: [3, 4],
      equation: t('10 ÷ 2 = 5', '10 ÷ 2 = 5'),
      hold: 2400,
      result: false,
      caption: t(
        'Both unknown coins are equal — so each one is 10 ÷ 2 = 5.',
        'Kedua koin yang tidak diketahui sama — jadi masing-masing bernilai 10 ÷ 2 = 5.',
      ),
    },
    // Beat 4 — Result
    {
      spotlight: [3, 4],
      equation: t('? = 5 ✓', '? = 5 ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Each question-mark coin is worth 5. Answer: C.',
        'Setiap koin tanda tanya bernilai 5. Jawaban: C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
