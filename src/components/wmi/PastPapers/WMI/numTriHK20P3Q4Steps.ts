import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Bound to seed quantities for HKIMO-20-P3H-Q4
// Pattern: top = left × right − 3
// T1: 3×4−3=9 ✓   T2: 5×4−3=17 ✓   T3: 6×3−3=15

export interface NumTriHK20P3Q4Step {
  highlightIdx: number   // −1 = none, 0/1/2 = triangle index
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface NumTriHK20P3Q4Storyboard {
  steps: NumTriHK20P3Q4Step[]
  finalIndex: number
}

export function buildNumTriHK20P3Q4Steps(lang: Lang): NumTriHK20P3Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumTriHK20P3Q4Step[] = [
    {
      highlightIdx: -1,
      revealAnswer: false,
      caption: t(
        'Three triangles — each has two bottom numbers and a top number. Find the rule!',
        'Tiga segitiga — masing-masing punya dua angka bawah dan satu angka atas. Temukan polanya!',
      ),
      hold: 2200,
      result: false,
    },
    {
      highlightIdx: 0,
      revealAnswer: false,
      caption: t(
        'Triangle 1: bottom 3 and 4. Top = 9. Try: 3 × 4 = 12 → 12 − 3 = 9 ✓',
        'Segitiga 1: bawah 3 dan 4. Atas = 9. Coba: 3 × 4 = 12 → 12 − 3 = 9 ✓',
      ),
      hold: 2800,
      result: false,
    },
    {
      highlightIdx: 1,
      revealAnswer: false,
      caption: t(
        'Triangle 2: bottom 5 and 4. Top = 17. Check: 5 × 4 = 20 → 20 − 3 = 17 ✓',
        'Segitiga 2: bawah 5 dan 4. Atas = 17. Cek: 5 × 4 = 20 → 20 − 3 = 17 ✓',
      ),
      hold: 2800,
      result: false,
    },
    {
      highlightIdx: -1,
      revealAnswer: false,
      caption: t(
        'Rule confirmed: top = left × right − 3',
        'Pola terkonfirmasi: atas = kiri × kanan − 3',
      ),
      hold: 2200,
      result: false,
    },
    {
      highlightIdx: 2,
      revealAnswer: false,
      caption: t(
        'Triangle 3: bottom 6 and 3. Apply rule: 6 × 3 = 18 → 18 − 3 = ?',
        'Segitiga 3: bawah 6 dan 3. Terapkan pola: 6 × 3 = 18 → 18 − 3 = ?',
      ),
      hold: 2500,
      result: false,
    },
    {
      highlightIdx: 2,
      revealAnswer: true,
      caption: t(
        '18 − 3 = 15. The missing number is 15!',
        '18 − 3 = 15. Bilangan yang hilang adalah 15!',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
