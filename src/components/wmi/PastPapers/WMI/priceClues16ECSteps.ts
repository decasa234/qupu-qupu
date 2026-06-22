// IKMC-19-EC-Q16 — storyboard for the price-clue / system-of-equations animation.
//
// The question: three pairs of fruits have known combined prices:
//   apple + pear   = 5 cents        (a + p = 5)
//   banana + apple = 7 cents        (b + a = 7)
//   pear + banana  = 10 cents       (p + b = 10)
//
// How much do banana + pear + apple cost together?
//
// Key insight: add all three equations:
//   (a+p) + (b+a) + (p+b) = 5 + 7 + 10 = 22
//   2(a + p + b) = 22
//   a + p + b = 11  →  Answer D (11 cents).
//
// Teaching walk, one idea per beat:
//   0. setup   — show all three clues; state we need a+p+b.
//   1. sum     — add all three rows: 5+7+10 = 22.
//   2. halve   — each fruit appears exactly twice → total is counted twice → ÷2.
//   3. result  — a+p+b = 22÷2 = 11 cents → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PricePhase = 'setup' | 'sum' | 'halve' | 'result'

export interface PriceBeat {
  /** Which animation phase this beat belongs to. */
  phase: PricePhase
  /** 0-based row index to highlight on the figure (null = none, -1 = all). */
  litRow: number | null
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface PriceStoryboard {
  steps: PriceBeat[]
  finalIndex: number
  /** The correct answer value (11 cents). */
  answer: number
}

export function buildPriceClues16ECSteps(lang: Lang): PriceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PriceBeat[] = [
    // Beat 0 — setup: state the goal
    {
      phase: 'setup',
      litRow: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Three clues show combined prices. We need to find all three fruits together.',
        'Tiga petunjuk menunjukkan harga gabungan. Kita perlu menemukan harga ketiga buah bersama-sama.',
      ),
    },

    // Beat 1 — highlight row 1 (apple + pear = 5)
    {
      phase: 'sum',
      litRow: 0,
      equation: 'apple + pear = 5',
      hold: 1800,
      result: false,
      caption: t(
        'Clue 1: apple + pear = 5 cents.',
        'Petunjuk 1: apel + pir = 5 sen.',
      ),
    },

    // Beat 2 — highlight row 2 (banana + apple = 7)
    {
      phase: 'sum',
      litRow: 1,
      equation: 'banana + apple = 7',
      hold: 1800,
      result: false,
      caption: t(
        'Clue 2: banana + apple = 7 cents.',
        'Petunjuk 2: pisang + apel = 7 sen.',
      ),
    },

    // Beat 3 — highlight row 3 (pear + banana = 10)
    {
      phase: 'sum',
      litRow: 2,
      equation: 'pear + banana = 10',
      hold: 1800,
      result: false,
      caption: t(
        'Clue 3: pear + banana = 10 cents.',
        'Petunjuk 3: pir + pisang = 10 sen.',
      ),
    },

    // Beat 4 — add all three rows together
    {
      phase: 'sum',
      litRow: null,
      equation: '5 + 7 + 10 = 22',
      hold: 2200,
      result: false,
      caption: t(
        'Add all three clues together: 5 + 7 + 10 = 22.',
        'Jumlahkan ketiga petunjuk: 5 + 7 + 10 = 22.',
      ),
    },

    // Beat 5 — each fruit appears twice
    {
      phase: 'halve',
      litRow: null,
      equation: '2 × (a + p + b) = 22',
      hold: 2400,
      result: false,
      caption: t(
        'Each fruit appears exactly TWICE in the three clues → the total is 2 × (apple+pear+banana).',
        'Setiap buah muncul tepat DUA KALI dalam tiga petunjuk → total = 2 × (apel+pir+pisang).',
      ),
    },

    // Beat 6 — divide by 2
    {
      phase: 'halve',
      litRow: 3,
      equation: 'a + p + b = 22 ÷ 2 = 11',
      hold: 2200,
      result: false,
      caption: t(
        'Divide by 2: apple + pear + banana = 22 ÷ 2 = 11 cents.',
        'Bagi dengan 2: apel + pir + pisang = 22 ÷ 2 = 11 sen.',
      ),
    },

    // Beat 7 — result
    {
      phase: 'result',
      litRow: 3,
      equation: '11 cents → D',
      hold: 0,
      result: true,
      caption: t(
        'All three fruits together cost 11 cents — answer D.',
        'Ketiga buah bersama-sama harganya 11 sen — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 11 }
}
