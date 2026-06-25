import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type QuadCircle20B8Phase =
  | 'intro'
  | 'verify1'
  | 'verify2'
  | 'apply'
  | 'result'

export interface QuadCircle20B8Step {
  phase: QuadCircle20B8Phase
  revealAnswer: boolean
  caption: string
  hold: number
}

export interface QuadCircle20B8Storyboard {
  steps: QuadCircle20B8Step[]
  finalIndex: number
}

export function buildQuadCircle20B8Steps(lang: Lang): QuadCircle20B8Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: QuadCircle20B8Step[] = [
    {
      phase: 'intro',
      revealAnswer: false,
      hold: 1600,
      caption: t(
        'Three circles, each split into four quadrants: TL, TR, BL, BR. Find the rule linking the numbers!',
        'Tiga lingkaran, masing-masing dibagi menjadi empat bagian: KA (kiri atas), KAn (kanan atas), KB (kiri bawah), KB kanan. Temukan aturannya!',
      ),
    },
    {
      phase: 'verify1',
      revealAnswer: false,
      hold: 2000,
      caption: t(
        'Circle 1: TL=2, TR=3, BL=5, BR=21. Try (TL + BL) × TR = (2 + 5) × 3 = 21 ✓',
        'Lingkaran 1: KA=2, KAn=3, KB=5, KBn=21. Coba (KA + KB) × KAn = (2 + 5) × 3 = 21 ✓',
      ),
    },
    {
      phase: 'verify2',
      revealAnswer: false,
      hold: 2000,
      caption: t(
        'Circle 2: TL=5, TR=4, BL=9, BR=56. Check (5 + 9) × 4 = 14 × 4 = 56 ✓',
        'Lingkaran 2: KA=5, KAn=4, KB=9, KBn=56. Cek (5 + 9) × 4 = 14 × 4 = 56 ✓',
      ),
    },
    {
      phase: 'apply',
      revealAnswer: false,
      hold: 1800,
      caption: t(
        'Rule confirmed: BR = (TL + BL) × TR. Apply to circle 3: TL=10, TR=6, BL=2 → (10 + 2) × 6 = ?',
        'Aturan terkonfirmasi: KBn = (KA + KB) × KAn. Terapkan ke lingkaran 3: KA=10, KAn=6, KB=2 → (10 + 2) × 6 = ?',
      ),
    },
    {
      phase: 'result',
      revealAnswer: true,
      hold: 0,
      caption: t(
        '(10 + 2) × 6 = 12 × 6 = 72. So B = 72 — answer A.',
        '(10 + 2) × 6 = 12 × 6 = 72. Maka B = 72 — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
