import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type AreaPhase = 'show' | 'split' | 'triA' | 'triB' | 'result'

export interface AreaStep {
  phase: AreaPhase
  showSplit: boolean
  litTriangles: 0 | 1 | 2
  showTally: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AreaStoryboard {
  answer: string
  steps: AreaStep[]
  finalIndex: number
}

export function buildP25G3Q4Steps(lang: Lang, answer: string): AreaStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const A = answer || 'B'

  const steps: AreaStep[] = [
    {
      phase: 'show',
      showSplit: false,
      litTriangles: 0,
      showTally: false,
      hold: 1700,
      result: false,
      caption: t('Each grid square is 1 cm × 1 cm = 1 cm².', 'Tiap kotak kisi 1 cm × 1 cm = 1 cm².'),
    },
    {
      phase: 'split',
      showSplit: true,
      litTriangles: 0,
      showTally: false,
      hold: 2000,
      result: false,
      caption: t(
        'Cut the slanted shape along its long diagonal into 2 equal triangles.',
        'Potong bangun miring di sepanjang diagonal panjangnya menjadi 2 segitiga sama.',
      ),
    },
    {
      phase: 'triA',
      showSplit: true,
      litTriangles: 1,
      showTally: true,
      hold: 2100,
      result: false,
      caption: t(
        'Each triangle has base 3 and height 1: area = 3 × 1 ÷ 2 = 1½ cm².',
        'Tiap segitiga beralas 3 dan tinggi 1: luas = 3 × 1 ÷ 2 = 1½ cm².',
      ),
    },
    {
      phase: 'triB',
      showSplit: true,
      litTriangles: 2,
      showTally: true,
      hold: 2000,
      result: false,
      caption: t('The two triangles match: 1½ + 1½.', 'Kedua segitiga sama: 1½ + 1½.'),
    },
    {
      phase: 'result',
      showSplit: false,
      litTriangles: 0,
      showTally: false,
      hold: 0,
      result: true,
      caption: t(`1½ + 1½ = 3 cm² — answer ${A}.`, `1½ + 1½ = 3 cm² — jawaban ${A}.`),
    },
  ]

  return { answer: A, steps, finalIndex: steps.length - 1 }
}
