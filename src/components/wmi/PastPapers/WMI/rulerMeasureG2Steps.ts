import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19F2A-Q12 — measure a blackboard with a 1 m ruler used 3 times, 50 cm left.
// Three full 1 m lengths + a 50 cm leftover = 3 m 50 cm.
export const RULER_SEGMENTS = [1, 1, 1, 0.5] // metres: three full lengths + the 50 cm leftover
export const TOTAL_METRES = 3.5

export interface RulerStep {
  /** How many ruler segments are laid down (0..4). */
  filled: number
  /** Running total label shown above the bar. */
  total: string
  caption: string
  hold: number
  result: boolean
}

export interface RulerStoryboard {
  steps: RulerStep[]
  finalIndex: number
}

export function buildRulerMeasureG2Steps(lang: Lang): RulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: RulerStep[] = [
    {
      filled: 0,
      total: '',
      hold: 1500,
      result: false,
      caption: t('The ruler is 1 m long. Lay it along the blackboard.', 'Penggaris panjangnya 1 m. Letakkan sepanjang papan tulis.'),
    },
    {
      filled: 1,
      total: '1 m',
      hold: 1300,
      result: false,
      caption: t('1st full length: 1 m.', 'Panjang penuh ke-1: 1 m.'),
    },
    {
      filled: 2,
      total: '2 m',
      hold: 1300,
      result: false,
      caption: t('2nd full length: 2 m.', 'Panjang penuh ke-2: 2 m.'),
    },
    {
      filled: 3,
      total: '3 m',
      hold: 1500,
      result: false,
      caption: t('3rd full length: 3 m — the ruler was used 3 times.', 'Panjang penuh ke-3: 3 m — penggaris dipakai 3 kali.'),
    },
    {
      filled: 4,
      total: '3 m 50 cm',
      hold: 1800,
      result: false,
      caption: t('50 cm is still left to measure — add it on.', 'Masih sisa 50 cm yang belum terukur — tambahkan.'),
    },
    {
      filled: 4,
      total: '3 m 50 cm',
      hold: 0,
      result: true,
      caption: t('Blackboard = 3 m + 50 cm = 3 m 50 cm.', 'Papan tulis = 3 m + 50 cm = 3 m 50 cm.'),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
