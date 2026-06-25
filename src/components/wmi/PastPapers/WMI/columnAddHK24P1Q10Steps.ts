import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ColumnAddPhase = 'show' | 'expand' | 'sum' | 'system' | 'result'

export interface ColumnAddStep {
  phase: ColumnAddPhase
  showAnswer: boolean
  highlightSum: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ColumnAddStoryboard {
  steps: ColumnAddStep[]
  finalIndex: number
}

// Bound to seed quantities
export const ANSWER_B = 6
export const ANSWER_A = 5
export const SUM_TOTAL = 121
export const FACTOR = 11   // 11(A+B) = 121

export function buildColumnAddHK24P1Q10Steps(lang: Lang): ColumnAddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColumnAddStep[] = [
    {
      phase: 'show',
      showAnswer: false,
      highlightSum: false,
      caption: t(
        'Column addition: BA + AB = 121, and B − A = 1.',
        'Penjumlahan kolom: BA + AB = 121, dan B − A = 1.',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'expand',
      showAnswer: false,
      highlightSum: false,
      caption: t(
        'BA = 10B + A and AB = 10A + B, so sum = 11A + 11B = 11(A + B).',
        'BA = 10B + A dan AB = 10A + B, sehingga jumlah = 11A + 11B = 11(A + B).',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'sum',
      showAnswer: false,
      highlightSum: true,
      caption: t(
        '11(A + B) = 121 → A + B = 121 ÷ 11 = 11.',
        '11(A + B) = 121 → A + B = 121 ÷ 11 = 11.',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'system',
      showAnswer: false,
      highlightSum: false,
      caption: t(
        'System: A + B = 11 and B − A = 1 → 2B = 12 → B = 6, A = 5.',
        'Sistem: A + B = 11 dan B − A = 1 → 2B = 12 → B = 6, A = 5.',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'result',
      showAnswer: true,
      highlightSum: false,
      caption: t(
        'B = 6 (A = 5): 65 + 56 = 121 ✓',
        'B = 6 (A = 5): 65 + 56 = 121 ✓',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
