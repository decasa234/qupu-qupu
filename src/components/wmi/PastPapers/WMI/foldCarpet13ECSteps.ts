// Beat-by-beat steps for IKMC-22-EC-Q13 (Aladdin's folded carpet).
//
// Strategy: count dots per line from the visible sides, deduce 2 rows × 4 dots
// = 8 per side, multiply by 4 sides = 32. The fold hides some top-left dots
// but the RULE (same count along each side) lets us ignore what's hidden.
//
// Beats:
//   0  Intro — "a square carpet, dots in 2 rows along each side"
//   1  Highlight one visible side — count 4 dots in each row → 8 per side
//   2  Note the fold — it hides some dots but the count per side stays the same
//   3  Compute 4 sides × 8 dots
//   4  Final answer — 32 (choice E)

export type Lang = 'en' | 'id'

export interface CarpetStep {
  /** Which region to highlight: null = whole carpet, 'top'|'right'|'bottom'|'left'|'all' */
  highlight: 'none' | 'right' | 'bottom' | 'fold' | 'all'
  /** Running dot count displayed in the caption area */
  runningCount: number | null
  caption: string
  hold: number
  result: boolean
}

export interface CarpetStoryboard {
  steps: CarpetStep[]
  finalIndex: number
}

export function buildFoldCarpet13ECSteps(lang: Lang): CarpetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CarpetStep[] = [
    // Beat 0 — intro
    {
      highlight: 'none',
      runningCount: null,
      caption: t(
        'Aladdin\'s square carpet has dots in 2 rows along EACH side. One corner is folded — but the rule still holds!',
        'Karpet persegi Aladdin memiliki titik dalam 2 baris di SETIAP sisi. Satu sudut terlipat — tapi aturannya tetap berlaku!',
      ),
      hold: 2800,
      result: false,
    },
    // Beat 1 — read one visible side
    {
      highlight: 'right',
      runningCount: null,
      caption: t(
        'Look at one clear side (e.g., the right): 2 rows × 4 dots = 8 dots per side.',
        'Lihat satu sisi yang jelas (misalnya kanan): 2 baris × 4 titik = 8 titik per sisi.',
      ),
      hold: 2600,
      result: false,
    },
    // Beat 2 — acknowledge the fold
    {
      highlight: 'fold',
      runningCount: null,
      caption: t(
        'The folded corner hides some dots — but the carpet is a SQUARE, so every side has exactly 8 dots.',
        'Sudut yang terlipat menyembunyikan beberapa titik — tapi karpetnya PERSEGI, jadi setiap sisi punya tepat 8 titik.',
      ),
      hold: 2600,
      result: false,
    },
    // Beat 3 — multiply
    {
      highlight: 'all',
      runningCount: 32,
      caption: t(
        '4 sides × 8 dots per side = 32 dots in total.',
        '4 sisi × 8 titik per sisi = 32 titik total.',
      ),
      hold: 2200,
      result: false,
    },
    // Beat 4 — answer
    {
      highlight: 'all',
      runningCount: 32,
      caption: t(
        'Answer: 32 dots (E). Don\'t let the fold trick you — trust the square\'s symmetry!',
        'Jawaban: 32 titik (E). Jangan tertipu lipatan — percayai simetri persegi!',
      ),
      hold: 0,
      result: true,
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
