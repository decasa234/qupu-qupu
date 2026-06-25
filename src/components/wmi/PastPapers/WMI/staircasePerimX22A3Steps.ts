// SEAMOX-22-A-Q3 — "Find the perimeter of the staircase-shaped figure"
// Width = 10 m, Height = 8 m. Answer = 36 m.
// Key insight: staircase perimeter = 2 × (W + H) = 2 × (10 + 8) = 36 m.
//
// Beats:
//   0. problem    — staircase with 10 m / 8 m labels; perimeter unknown
//   1. horizontal — all H-edges highlighted blue; "10 + 10 = 20 m"
//   2. vertical   — all V-edges highlighted orange; "8 + 8 = 16 m"
//   3. result     — full outline green; "20 + 16 = 36 m"
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PerimPhase = 'problem' | 'horizontal' | 'vertical' | 'result'

export interface PerimBeat {
  phase: PerimPhase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface PerimStoryboard {
  steps: PerimBeat[]
  finalIndex: number
}

export function buildStaircasePerimX22A3Steps(lang: Lang): PerimStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PerimBeat[] = [
    // Beat 0 — show the problem
    {
      phase: 'problem',
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A staircase shape with overall width 10 m and overall height 8 m. What is its perimeter?',
        'Bangun tangga dengan lebar keseluruhan 10 m dan tinggi keseluruhan 8 m. Berapa kelilingnya?',
      ),
    },

    // Beat 1 — reveal horizontal segments
    {
      phase: 'horizontal',
      equation: t('10 + 10 = 20 m (horizontal)', '10 + 10 = 20 m (horizontal)'),
      hold: 2400,
      result: false,
      caption: t(
        'The bottom edge is 10 m. The step treads going left also add up to exactly 10 m. Horizontal total = 10 + 10 = 20 m.',
        'Sisi bawah sepanjang 10 m. Anak-anak tangga ke kiri juga berjumlah tepat 10 m. Total horizontal = 10 + 10 = 20 m.',
      ),
    },

    // Beat 2 — reveal vertical segments
    {
      phase: 'vertical',
      equation: t('8 + 8 = 16 m (vertical)', '8 + 8 = 16 m (vertikal)'),
      hold: 2400,
      result: false,
      caption: t(
        'The right edge is 8 m. The step risers going down also add up to exactly 8 m. Vertical total = 8 + 8 = 16 m.',
        'Sisi kanan sepanjang 8 m. Riser tangga ke bawah juga berjumlah tepat 8 m. Total vertikal = 8 + 8 = 16 m.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      equation: t('20 + 16 = 36 m', '20 + 16 = 36 m'),
      hold: 0,
      result: true,
      caption: t(
        'Perimeter = 20 + 16 = 36 m. A staircase perimeter always equals the bounding-rectangle perimeter: 2 × (10 + 8) = 36 m.',
        'Keliling = 20 + 16 = 36 m. Keliling tangga selalu sama dengan keliling persegi panjang pembatasnya: 2 × (10 + 8) = 36 m.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
