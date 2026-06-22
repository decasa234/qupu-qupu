// IKMC-20-EC-Q20 — storyboard for the "covered numbers" animation.
//
// Problem: numbers 1–8 on a board, covered by 4 triangles (sum=10),
// 3 squares (sum=20), and 1 circle. Find the number under the circle.
//
// Strategy: total of 1–8 = 36; circle = 36 − 10 − 20 = 6.
//
// Animation beats:
//   0. intro   — show the static board; state the three facts.
//   1. total   — 1+2+3+4+5+6+7+8 = 36.
//   2. minus-T — subtract triangle sum: 36 − 10 = 26.
//   3. minus-S — subtract square sum:   26 − 20 = 6.
//   4. result  — circle = 6, answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CoveredPhase = 'intro' | 'total' | 'minus-tri' | 'minus-sq' | 'result'

export interface CoveredBeat {
  phase: CoveredPhase
  /** Equation / maths line to show below the figure; '' = hidden. */
  equation: string
  /** Explanation text for the caption box. */
  caption: string
  /** Whether to show the revealed circle (answer beat). */
  revealCircle: boolean
  /** Auto-hold ms (0 = final). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CoveredStoryboard {
  steps: CoveredBeat[]
  finalIndex: number
}

export function buildCovered20ECSteps(lang: Lang): CoveredStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoveredBeat[] = [
    // Beat 0 — intro: show the board, state the facts
    {
      phase: 'intro',
      equation: '',
      revealCircle: false,
      hold: 2400,
      result: false,
      caption: t(
        'The 8 numbers are hidden. Triangles cover 4 numbers summing to 10. Squares cover 3 numbers summing to 20. We must find the number under the circle.',
        'Delapan angka tersembunyi. Segitiga menutupi 4 angka dengan jumlah 10. Persegi menutupi 3 angka dengan jumlah 20. Kita harus menemukan angka di bawah lingkaran.',
      ),
    },

    // Beat 1 — total of 1 to 8
    {
      phase: 'total',
      equation: '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 = 36',
      revealCircle: false,
      hold: 2400,
      result: false,
      caption: t(
        'Key idea: every number from 1 to 8 is hidden by exactly one shape. So their total is 1+2+3+4+5+6+7+8 = 36.',
        'Ide kunci: setiap angka dari 1 sampai 8 ditutupi tepat satu bentuk. Jadi totalnya 1+2+3+4+5+6+7+8 = 36.',
      ),
    },

    // Beat 2 — subtract triangle sum
    {
      phase: 'minus-tri',
      equation: '36 − 10 = 26',
      revealCircle: false,
      hold: 2200,
      result: false,
      caption: t(
        'The triangles hide numbers summing to 10. Take them away: 36 − 10 = 26 left for the squares and circle.',
        'Segitiga menyembunyikan angka-angka yang berjumlah 10. Kurangkan: 36 − 10 = 26 tersisa untuk persegi dan lingkaran.',
      ),
    },

    // Beat 3 — subtract square sum
    {
      phase: 'minus-sq',
      equation: '26 − 20 = 6',
      revealCircle: false,
      hold: 2200,
      result: false,
      caption: t(
        'The squares hide numbers summing to 20. Take them away too: 26 − 20 = 6 is what is left for the circle.',
        'Persegi menyembunyikan angka-angka yang berjumlah 20. Kurangkan juga: 26 − 20 = 6 yang tersisa untuk lingkaran.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      equation: '36 − 10 − 20 = 6',
      revealCircle: true,
      hold: 0,
      result: true,
      caption: t(
        'The circle hides the number 6 — answer D.',
        'Lingkaran menyembunyikan angka 6 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
