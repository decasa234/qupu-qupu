import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19F2A-Q21 — all different-digit 2-digit numbers from {1,2,3,4}, sorted.
// 12 numbers; the 5th is 23, the 11th is 42; 42 - 23 = 19.
export const SORTED = [12, 13, 14, 21, 23, 24, 31, 32, 34, 41, 42, 43]
export const FIFTH_INDEX = 4 // 0-based -> the 5th number, 23
export const ELEVENTH_INDEX = 10 // -> the 11th number, 42
export const FIFTH = 23
export const ELEVENTH = 42
export const DIFF = 19

export interface ListStep {
  markFifth: boolean
  markEleventh: boolean
  showDiff: boolean
  caption: string
  hold: number
  result: boolean
}
export interface ListStoryboard {
  steps: ListStep[]
  finalIndex: number
}

export function buildTwoDigitListG2Steps(lang: Lang): ListStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ListStep[] = [
    {
      markFifth: false,
      markEleventh: false,
      showDiff: false,
      hold: 2000,
      result: false,
      caption: t(
        'All different-digit 2-digit numbers from 1, 2, 3, 4 — sorted smallest to largest.',
        'Semua bilangan dua angka berbeda dari 1, 2, 3, 4 — diurutkan dari terkecil ke terbesar.',
      ),
    },
    {
      markFifth: true,
      markEleventh: false,
      showDiff: false,
      hold: 1800,
      result: false,
      caption: t('Count to the 5th number: 23.', 'Hitung sampai bilangan ke-5: 23.'),
    },
    {
      markFifth: true,
      markEleventh: true,
      showDiff: false,
      hold: 1800,
      result: false,
      caption: t('Count to the 11th number: 42.', 'Hitung sampai bilangan ke-11: 42.'),
    },
    {
      markFifth: true,
      markEleventh: true,
      showDiff: true,
      hold: 0,
      result: true,
      caption: t('42 − 23 = 19.', '42 − 23 = 19.'),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
