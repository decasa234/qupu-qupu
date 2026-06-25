// crossPatternHK19P2Q5Steps.ts — HKIMO-19-P2H-Q5
// Storyboard for the growing plus/cross pattern.
// Groups 1–4 have 1, 5, 9, 13 ⊗ symbols (arithmetic, d=4).
// Formula: 4n − 3. Group 12: 4×12−3 = 45.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CrossPatternPhase = 'show' | 'count' | 'diffs' | 'formula' | 'apply' | 'result'

export interface CrossPatternStep {
  phase: CrossPatternPhase
  showCounts: boolean
  showDiffs: boolean
  showFormula: boolean
  showTarget: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CrossPatternStoryboard {
  steps: CrossPatternStep[]
  finalIndex: number
}

// Quantities bound to seed (answer = 45)
export const COUNTS_BY_N = [1, 5, 9, 13] as const
export const TARGET_N = 12
export const TARGET_COUNT = 45

export function buildCrossPatternHK19P2Q5Steps(lang: Lang): CrossPatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CrossPatternStep[] = [
    {
      phase: 'show',
      showCounts: false,
      showDiffs: false,
      showFormula: false,
      showTarget: false,
      hold: 1600,
      result: false,
      caption: t(
        'Each group forms a + (plus) shape. Count the ⊗ symbols in groups 1 to 4.',
        'Setiap kelompok membentuk bentuk + (plus). Hitung simbol ⊗ pada kelompok 1 hingga 4.',
      ),
    },
    {
      phase: 'count',
      showCounts: true,
      showDiffs: false,
      showFormula: false,
      showTarget: false,
      hold: 1800,
      result: false,
      caption: t(
        'Group 1 = 1, Group 2 = 5, Group 3 = 9, Group 4 = 13.',
        'Kelompok 1 = 1, Kelompok 2 = 5, Kelompok 3 = 9, Kelompok 4 = 13.',
      ),
    },
    {
      phase: 'diffs',
      showCounts: true,
      showDiffs: true,
      showFormula: false,
      showTarget: false,
      hold: 1800,
      result: false,
      caption: t(
        'The count increases by +4 each time — arithmetic sequence with common difference 4.',
        'Jumlah bertambah +4 setiap kali — barisan aritmatika dengan beda 4.',
      ),
    },
    {
      phase: 'formula',
      showCounts: true,
      showDiffs: false,
      showFormula: true,
      showTarget: false,
      hold: 2000,
      result: false,
      caption: t(
        'First term = 1, common difference = 4 → group n = 1 + 4(n − 1) = 4n − 3.',
        'Suku pertama = 1, beda = 4 → kelompok ke-n = 1 + 4(n − 1) = 4n − 3.',
      ),
    },
    {
      phase: 'apply',
      showCounts: false,
      showDiffs: false,
      showFormula: true,
      showTarget: true,
      hold: 2000,
      result: false,
      caption: t(
        'Substitute n = 12: 4 × 12 − 3 = 48 − 3 = 45.',
        'Substitusikan n = 12: 4 × 12 − 3 = 48 − 3 = 45.',
      ),
    },
    {
      phase: 'result',
      showCounts: false,
      showDiffs: false,
      showFormula: true,
      showTarget: true,
      hold: 2400,
      result: true,
      caption: t(
        'The 12th group has 45 ⊗ symbols.',
        'Kelompok ke-12 memiliki 45 simbol ⊗.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
