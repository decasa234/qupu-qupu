// Storyboard for TIMO-22-P4H-Q19 — post-answer explainer.
// "How many cubes are there in the 10th group?" — answer: 29.
//
// The animation reveals groups 1→2→3 one at a time (highlighting the 3 new
// cubes in gold each step), then surfaces the formula G(n) = 3n − 1 and
// applies it to n = 10.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TIMO22P4Q19Phase = 'group1' | 'group2' | 'group3' | 'formula' | 'result'

export interface TIMO22P4Q19Step {
  phase: TIMO22P4Q19Phase
  /** Which group's cubes to display (1–3). */
  groupShown: 1 | 2 | 3
  /** Whether to overlay the G(n) = 3n−1 formula. */
  showFormula: boolean
  /** Whether to show the final G(10) = 29 callout. */
  showResult: boolean
  caption: string
  hold: number
  result: boolean
}

export interface TIMO22P4Q19Storyboard {
  steps: TIMO22P4Q19Step[]
  finalIndex: number
  answer: number
}

export function buildGrowingCubesTIMO22P4Q19Steps(lang: Lang): TIMO22P4Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TIMO22P4Q19Step[] = [
    {
      phase: 'group1',
      groupShown: 1,
      showFormula: false,
      showResult: false,
      hold: 1800,
      result: false,
      caption: t(
        'Group 1: 2 cubes — a short horizontal row.',
        'Kelompok 1: 2 kubus — baris horizontal pendek.',
      ),
    },
    {
      phase: 'group2',
      groupShown: 2,
      showFormula: false,
      showResult: false,
      hold: 2200,
      result: false,
      caption: t(
        'Group 2: 2 + 3 = 5 cubes. Three new cubes are added (highlighted).',
        'Kelompok 2: 2 + 3 = 5 kubus. Tiga kubus baru ditambahkan (warna emas).',
      ),
    },
    {
      phase: 'group3',
      groupShown: 3,
      showFormula: false,
      showResult: false,
      hold: 2200,
      result: false,
      caption: t(
        'Group 3: 5 + 3 = 8 cubes. Another 3 cubes added each time.',
        'Kelompok 3: 5 + 3 = 8 kubus. Selalu tambah 3 kubus setiap kelompok.',
      ),
    },
    {
      phase: 'formula',
      groupShown: 3,
      showFormula: true,
      showResult: false,
      hold: 2600,
      result: false,
      caption: t(
        'Pattern: G(n) = 3n − 1. Start at 2, add 3 each step.',
        'Pola: G(n) = 3n − 1. Dimulai dari 2, bertambah 3 setiap langkah.',
      ),
    },
    {
      phase: 'result',
      groupShown: 3,
      showFormula: true,
      showResult: true,
      hold: 0,
      result: true,
      caption: t(
        'G(10) = 3 × 10 − 1 = 30 − 1 = 29 cubes.',
        'G(10) = 3 × 10 − 1 = 30 − 1 = 29 kubus.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 29 }
}
