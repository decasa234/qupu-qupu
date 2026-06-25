// HKIMO-24-P3H-Q4 — "According to the pattern, what is the missing number?"
// Triangles: T1(top=60,left=7,right=9), T2(top=29,left=8,right=4), T3(top=?,left=5,right=9)
// Rule: top = (left × right) − 3   Answer: 42
//
// METHOD:
//   1. Discover rule from T1: 7 × 9 = 63; 63 − 3 = 60 ✓
//   2. Verify with T2:        8 × 4 = 32; 32 − 3 = 29 ✓
//   3. Apply to T3:           5 × 9 = 45; 45 − 3 = 42 ✓

export type Lang = 'en' | 'id'

export interface TriangleStep {
  activeIndex: number | null   // which triangle to highlight (0,1,2 or null)
  showAnswer: boolean          // reveal "42" at T3 top
  equation: string             // arithmetic line shown below figure
  caption: string
  hold: number
}

export interface TriangleStoryboard {
  steps: TriangleStep[]
  finalIndex: number
}

export function buildTriangleNumHK24P3Q4Steps(lang: Lang): TriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleStep[] = [
    // Beat 0 — intro
    {
      activeIndex: null,
      showAnswer: false,
      equation: '',
      hold: 2200,
      caption: t(
        'Three triangles share the same rule. Can you spot it?',
        'Tiga segitiga berbagi aturan yang sama. Bisakah kamu menemukannya?',
      ),
    },
    // Beat 1 — discover rule from T1
    {
      activeIndex: 0,
      showAnswer: false,
      equation: '7 × 9 = 63 → 63 − 3 = 60 ✓',
      hold: 2800,
      caption: t(
        'Triangle 1: bottom-left × bottom-right − 3 = top.  7 × 9 − 3 = 60 ✓',
        'Segitiga 1: kiri-bawah × kanan-bawah − 3 = atas.  7 × 9 − 3 = 60 ✓',
      ),
    },
    // Beat 2 — verify with T2
    {
      activeIndex: 1,
      showAnswer: false,
      equation: '8 × 4 = 32 → 32 − 3 = 29 ✓',
      hold: 2600,
      caption: t(
        'Triangle 2 confirms the rule: 8 × 4 − 3 = 29 ✓',
        'Segitiga 2 mengonfirmasi aturan: 8 × 4 − 3 = 29 ✓',
      ),
    },
    // Beat 3 — apply to T3 (reveal answer)
    {
      activeIndex: 2,
      showAnswer: true,
      equation: '5 × 9 = 45 → 45 − 3 = 42',
      hold: 3000,
      caption: t(
        'Triangle 3: 5 × 9 − 3 = 45 − 3 = 42. The missing number is 42.',
        'Segitiga 3: 5 × 9 − 3 = 45 − 3 = 42. Angka yang hilang adalah 42.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
