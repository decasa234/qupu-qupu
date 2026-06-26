// OSN 2025 SD Nasional SemiFinal Q1 — explainer storyboard
//
// Teaching walk (4 beats):
//   0. intro   — show the figure; state the unit area fact
//   1. count   — count petaks inside triangle ABC: 10
//   2. bound   — bounding L-shape = 36 + 16 = 52 petaks; sub-regions = 42; ABC = 10
//   3. result  — 10 × ½ = 5 cm²
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'count' | 'bound' | 'result'

export interface GridCompositeBeat {
  phase: PhaseId
  /** Show the single-petak highlight (beat 0). */
  showUnit: boolean
  /** Show the 10-petak count label inside triangle. */
  showCount: boolean
  /** Show the bounding-rectangle decomposition overlay. */
  showBound: boolean
  /** Show the final answer badge. */
  showResult: boolean
  /** Equation / maths line displayed below the figure; '' to hide. */
  equation: string
  /** Caption text shown to the student. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
}

export interface GridCompositeStoryboard {
  steps: GridCompositeBeat[]
  finalIndex: number
}

export function buildGridCompositeOSN25NSFQ1Steps(lang: Lang): GridCompositeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridCompositeBeat[] = [
    // Beat 0 — intro: static figure, state the unit-area fact
    {
      phase: 'intro',
      showUnit: true,
      showCount: false,
      showBound: false,
      showResult: false,
      equation: '',
      hold: 2200,
      caption: t(
        'Each small square on the grid has area ½ cm².',
        'Setiap petak kecil di grid memiliki luas ½ cm².',
      ),
    },

    // Beat 1 — count petaks inside triangle
    {
      phase: 'count',
      showUnit: false,
      showCount: true,
      showBound: false,
      showResult: false,
      equation: '',
      hold: 2400,
      caption: t(
        'Count the small squares (and half-squares) inside triangle ABC. There are 10.',
        'Hitung petak kecil (dan setengah petak) di dalam segitiga ABC. Jumlahnya ada 10 petak.',
      ),
    },

    // Beat 2 — bounding approach (L-shape decomposition)
    {
      phase: 'bound',
      showUnit: false,
      showCount: false,
      showBound: true,
      showResult: false,
      equation: t(
        '(36 + 16) − 18 − 9 − 3 − 4 − 8 = 10 squares',
        '(36 + 16) − 18 − 9 − 3 − 4 − 8 = 10 petak',
      ),
      hold: 2800,
      caption: t(
        'Alternatively: bounding L-shape (52 squares) minus the 5 outer triangles (42) = 10 squares inside ABC.',
        'Cara lain: luas L-shape (52 petak) dikurangi 5 segitiga luar (42) = 10 petak di dalam ABC.',
      ),
    },

    // Beat 3 — final answer
    {
      phase: 'result',
      showUnit: false,
      showCount: false,
      showBound: false,
      showResult: true,
      equation: t('10 × ½ = 5 cm²', '10 × ½ = 5 cm²'),
      hold: 0,
      caption: t(
        'Area of triangle ABC = 10 × ½ cm² = 5 cm².',
        'Luas segitiga ABC = 10 × ½ cm² = 5 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
