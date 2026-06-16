import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { APPLE_TOTAL } from './P23G2Q2Illustration'

// WMI-23P2A-Q2 — "Into how many people can the 30 apples NOT be divided equally?"
// Test each choice in turn; only 4 leaves a remainder, so the answer is C (4).
export type Q2Phase = 'show' | 'count' | 'try6' | 'try5' | 'try3' | 'try4' | 'result'

export interface Q2Step {
  phase: Q2Phase
  /** Apples ringed so far (used to show the full count before grouping). */
  ringedCount: number
  /** Partition all 30 apples into equal groups of this size (0 = no grouping). */
  groupBy: number
  /** Box colour for full groups in this beat. */
  groupColor: string
  caption: string
  hold: number
  result: boolean
}

export interface Q2Storyboard {
  total: number
  answer: string
  steps: Q2Step[]
  finalIndex: number
}

const GREEN = '#10B981'
const RED = '#DC2626'

export function buildP23G2Q2Steps(lang: Lang): Q2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const T = APPLE_TOTAL // 30

  const steps: Q2Step[] = [
    {
      phase: 'show',
      ringedCount: 0,
      groupBy: 0,
      groupColor: GREEN,
      hold: 1600,
      result: false,
      caption: t('First, count the apples.', 'Pertama, hitung apelnya.'),
    },
    {
      phase: 'count',
      ringedCount: T,
      groupBy: 0,
      groupColor: GREEN,
      hold: 2000,
      result: false,
      caption: t(`3 rows of 10 = ${T} apples.`, `3 baris berisi 10 = ${T} apel.`),
    },
    {
      phase: 'try6',
      ringedCount: 0,
      groupBy: 6,
      groupColor: GREEN,
      hold: 2000,
      result: false,
      caption: t(`6 people:  ${T} ÷ 6 = 5 each. Fair ✓`, `6 orang:  ${T} ÷ 6 = 5 tiap orang. Adil ✓`),
    },
    {
      phase: 'try5',
      ringedCount: 0,
      groupBy: 5,
      groupColor: GREEN,
      hold: 2000,
      result: false,
      caption: t(`5 people:  ${T} ÷ 5 = 6 each. Fair ✓`, `5 orang:  ${T} ÷ 5 = 6 tiap orang. Adil ✓`),
    },
    {
      phase: 'try3',
      ringedCount: 0,
      groupBy: 3,
      groupColor: GREEN,
      hold: 2000,
      result: false,
      caption: t(`3 people:  ${T} ÷ 3 = 10 each. Fair ✓`, `3 orang:  ${T} ÷ 3 = 10 tiap orang. Adil ✓`),
    },
    {
      phase: 'try4',
      ringedCount: 0,
      groupBy: 4,
      groupColor: GREEN,
      hold: 2200,
      result: false,
      caption: t(
        `4 people:  ${T} ÷ 4 = 7, and 2 apples are left over. NOT fair ✗`,
        `4 orang:  ${T} ÷ 4 = 7, dan 2 apel tersisa. TIDAK adil ✗`,
      ),
    },
    {
      phase: 'result',
      ringedCount: 0,
      groupBy: 4,
      groupColor: RED,
      hold: 0,
      result: true,
      caption: t(
        `Only 4 cannot share ${T} evenly — answer C.`,
        `Hanya 4 yang tidak bisa membagi ${T} dengan rata — jawaban C.`,
      ),
    },
  ]

  return { total: T, answer: 'C', steps, finalIndex: steps.length - 1 }
}
