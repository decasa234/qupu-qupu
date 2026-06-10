import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-19F2A-Q18 — two flocks compared. White = 54. After 8 black leave, black is
// 28 MORE than white (54 + 28 = 82). The 8 that ran away were black too, so the
// original black count is 82 + 8 = 90.
export const WHITE = 54
export const MORE = 28
export const RAN_AWAY = 8
export const BLACK_AFTER = 82 // 54 + 28
export const BLACK_FIRST = 90 // 82 + 8

export interface GoatStep {
  /** Black bar (same-as-white base + the 28 "more than white" part) is shown. */
  showBlack: boolean
  /** The +8 "ran away" part is added back onto the black bar. */
  showRunaway: boolean
  /** Running black count to show at the end of the black bar (0 = none yet). */
  blackTotal: number
  highlightAnswer: boolean
  caption: string
  hold: number
  result: boolean
}
export interface GoatStoryboard {
  steps: GoatStep[]
  finalIndex: number
}

export function buildGoatCountG2Steps(lang: Lang): GoatStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: GoatStep[] = [
    {
      showBlack: false,
      showRunaway: false,
      blackTotal: 0,
      highlightAnswer: false,
      hold: 1700,
      result: false,
      caption: t('There are 54 white goats.', 'Ada 54 kambing putih.'),
    },
    {
      showBlack: true,
      showRunaway: false,
      blackTotal: BLACK_AFTER,
      highlightAnswer: false,
      hold: 2300,
      result: false,
      caption: t('After 8 black leave, black is 28 MORE than white: 54 + 28 = 82.', 'Setelah 8 hitam pergi, hitam 28 LEBIH dari putih: 54 + 28 = 82.'),
    },
    {
      showBlack: true,
      showRunaway: true,
      blackTotal: BLACK_FIRST,
      highlightAnswer: false,
      hold: 2100,
      result: false,
      caption: t('The 8 that ran away were black too — add them back: 82 + 8 = 90.', '8 yang lari juga hitam — tambahkan kembali: 82 + 8 = 90.'),
    },
    {
      showBlack: true,
      showRunaway: true,
      blackTotal: BLACK_FIRST,
      highlightAnswer: true,
      hold: 0,
      result: true,
      caption: t('So there were 90 black goats at the start.', 'Jadi mula-mula ada 90 kambing hitam.'),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
