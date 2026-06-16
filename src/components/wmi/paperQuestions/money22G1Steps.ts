import type { Lang } from '../concepts/explainers/makeTenSteps'

export const MONEY_ANSWER = '94'

/** Which group of money tiles the board rings on this beat. */
export type MoneyHighlight = 'tens' | 'fives' | 'ones' | 'all'

export interface MoneyStep {
  /** Group of tiles to ring this beat (undefined = ring nothing). */
  highlight?: MoneyHighlight
  /** Running total to show after this beat's group is added (0 = none yet). */
  total: number
  caption: string
  hold: number
  result: boolean
}

export interface MoneyStoryboard {
  answer: string
  steps: MoneyStep[]
  finalIndex: number
}

/**
 * Count the money by groups, keeping a concrete running total.
 *
 * Tiles on the board: 50, 10, 10, 5, 5, 5 plus nine 1-coins.
 *   tens  = 50 + 10 + 10 = 70
 *   fives = 5 + 5 + 5     = 15  -> 70 + 15 = 85
 *   ones  = nine 1s = 9        -> 85 +  9 = 94
 *
 * The animation rings one group at a time, names the concrete sum, and carries
 * the running total forward (70 -> 85 -> 94) before landing on 94.
 */
export function buildMoney22G1Steps(lang: Lang): MoneyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MoneyStep[] = [
    {
      highlight: undefined,
      total: 0,
      hold: 2600,
      result: false,
      caption: t(
        "Let us count ALL the money. Big numbers are hard to add at once, so we add it in GROUPS and keep a running total.",
        'Ayo hitung SEMUA uangnya. Angka besar sulit dijumlah sekaligus, jadi kita jumlah per KELOMPOK dan catat totalnya.',
      ),
    },
    {
      highlight: 'tens',
      total: 70,
      hold: 2300,
      result: false,
      caption: t(
        'First the big tiles: 50 + 10 + 10 = 70. Total so far: 70.',
        'Pertama tegel besar: 50 + 10 + 10 = 70. Total sejauh ini: 70.',
      ),
    },
    {
      highlight: 'fives',
      total: 85,
      hold: 2300,
      result: false,
      caption: t(
        'Next the three 5s: 5 + 5 + 5 = 15. So 70 + 15 = 85.',
        'Lalu tiga angka 5: 5 + 5 + 5 = 15. Jadi 70 + 15 = 85.',
      ),
    },
    {
      highlight: 'ones',
      total: 94,
      hold: 2300,
      result: false,
      caption: t(
        'Last the nine 1-coins: that is 9. So 85 + 9 = 94.',
        'Terakhir sembilan koin 1: itu 9. Jadi 85 + 9 = 94.',
      ),
    },
    {
      highlight: 'all',
      total: 94,
      hold: 0,
      result: true,
      caption: t(
        `All the money together makes ${MONEY_ANSWER}.`,
        `Semua uang digabung jadi ${MONEY_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: MONEY_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
