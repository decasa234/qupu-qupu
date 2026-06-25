// SEAMO-22-B-Q14 — storyboard for the shaded arc animation.
//
// Quarter-circle radius 7 cm, π = 22/7.
// Shaded region = quarter-circle area − triangle area.
//
// Key steps:
//   Step 1 — highlight the full quarter-circle; compute its area.
//             (1/4) × (22/7) × 7² = (1/4) × 22 × 7 = 38.5 cm²
//   Step 2 — highlight the white triangle; compute its area.
//             (1/2) × 7 × 7 = 24.5 cm²
//   Step 3 — subtract; arrive at shaded area = 14 cm².
//
// Beats:
//   0. intro    — show figure with shaded region; state the task.
//   1. quarter  — highlight the full quarter-circle; show area formula.
//   2. triangle — highlight the white triangle; show area formula.
//   3. subtract — highlight shaded; show 38.5 − 24.5.
//   4. result   — announce 14 cm² (answer E).
//
// Pure builder: (lang) → storyboard. SSR-safe.

import type { HighlightRegion22B14 } from './ShadedArc22B14Illustration'

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'quarter' | 'triangle' | 'subtract' | 'result'

export interface ShadedArcBeat {
  phase: PhaseId
  highlight: HighlightRegion22B14
  areaLabel: string | null
  isResult: boolean
  equation: string
  caption: string
  hold: number
}

export interface ShadedArcStoryboard {
  steps: ShadedArcBeat[]
  finalIndex: number
}

export function buildShadedArc22B14Steps(lang: Lang): ShadedArcStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShadedArcBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 'shaded',
      areaLabel: '?',
      isResult: false,
      equation: '',
      hold: 2200,
      caption: t(
        'Quarter-circle, radius 7 cm, π = 22/7. Find the shaded area (between the arc and the diagonal).',
        'Seperempat lingkaran, jari-jari 7 cm, π = 22/7. Temukan luas daerah yang diarsir (antara busur dan diagonal).',
      ),
    },

    // Beat 1 — full quarter-circle area
    {
      phase: 'quarter',
      highlight: 'quarter',
      areaLabel: '38.5 cm²',
      isResult: false,
      equation: t('¼ × (22/7) × 7² = 38.5 cm²', '¼ × (22/7) × 7² = 38,5 cm²'),
      hold: 2600,
      caption: t(
        'The full quarter-circle has area = ¼ × π × r² = ¼ × (22/7) × 49 = ¼ × 154 = 38.5 cm².',
        'Luas seperempat lingkaran penuh = ¼ × π × r² = ¼ × (22/7) × 49 = ¼ × 154 = 38,5 cm².',
      ),
    },

    // Beat 2 — white triangle area
    {
      phase: 'triangle',
      highlight: 'triangle',
      areaLabel: '24.5 cm²',
      isResult: false,
      equation: t('½ × 7 × 7 = 24.5 cm²', '½ × 7 × 7 = 24,5 cm²'),
      hold: 2600,
      caption: t(
        'The white right triangle has two legs of 7 cm each. Its area = ½ × 7 × 7 = 24.5 cm².',
        'Segitiga siku-siku putih memiliki dua kaki masing-masing 7 cm. Luasnya = ½ × 7 × 7 = 24,5 cm².',
      ),
    },

    // Beat 3 — subtract
    {
      phase: 'subtract',
      highlight: 'shaded',
      areaLabel: '14 cm²',
      isResult: false,
      equation: t('38.5 − 24.5 = 14 cm²', '38,5 − 24,5 = 14 cm²'),
      hold: 2600,
      caption: t(
        'Shaded area = quarter-circle − triangle = 38.5 − 24.5 = 14 cm².',
        'Luas arsiran = seperempat lingkaran − segitiga = 38,5 − 24,5 = 14 cm².',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: 'shaded',
      areaLabel: '14 cm²',
      isResult: true,
      equation: t('Answer: E (14 cm²)', 'Jawaban: E (14 cm²)'),
      hold: 0,
      caption: t(
        'The area of the shaded region is 14 cm². Answer: E.',
        'Luas daerah yang diarsir adalah 14 cm². Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
