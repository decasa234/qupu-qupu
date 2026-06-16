import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Pyramid values for WMI-24P1A-Q13.
export const TOP = 20
export const MID_LEFT = 13
export const RIGHT_MID = TOP - MID_LEFT // 7
export const THREE = 3
export const APPLE = RIGHT_MID - THREE // 4

export interface PyramidStep {
  showRightMid: boolean
  revealApple: boolean
  highlight: 'top' | 'midL' | 'midR' | 'three' | 'apple' | null
  caption: string
  hold: number
  result: boolean
}

export interface PyramidStoryboard {
  apple: number
  steps: PyramidStep[]
  finalIndex: number
}

export function buildP24G1Q13Steps(lang: Lang): PyramidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PyramidStep[] = [
    {
      showRightMid: false,
      revealApple: false,
      highlight: 'top',
      hold: 1700,
      result: false,
      caption: t(
        'Each box is the sum of the two below it. The top is 20.',
        'Tiap kotak adalah jumlah dua kotak di bawahnya. Puncaknya 20.',
      ),
    },
    {
      showRightMid: false,
      revealApple: false,
      highlight: 'midL',
      hold: 1800,
      result: false,
      caption: t('20 = 13 + (right box). The left box is 13.', '20 = 13 + (kotak kanan). Kotak kiri 13.'),
    },
    {
      showRightMid: true,
      revealApple: false,
      highlight: 'midR',
      hold: 1900,
      result: false,
      caption: t(`So the right box = 20 − 13 = ${RIGHT_MID}.`, `Jadi kotak kanan = 20 − 13 = ${RIGHT_MID}.`),
    },
    {
      showRightMid: true,
      revealApple: false,
      highlight: 'three',
      hold: 1800,
      result: false,
      caption: t(
        `That ${RIGHT_MID} is 3 + apple. The 3 is already there.`,
        `${RIGHT_MID} itu = 3 + apel. Angka 3 sudah ada.`,
      ),
    },
    {
      showRightMid: true,
      revealApple: true,
      highlight: 'apple',
      hold: 0,
      result: true,
      caption: t(`Apple = ${RIGHT_MID} − 3 = ${APPLE} — answer B.`, `Apel = ${RIGHT_MID} − 3 = ${APPLE} — jawaban B.`),
    },
  ]

  return { apple: APPLE, steps, finalIndex: steps.length - 1 }
}
