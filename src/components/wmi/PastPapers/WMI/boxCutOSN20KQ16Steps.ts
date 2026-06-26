// Storyboard for OSN-20-SD-KAB-Q16 post-answer explainer.
// "Volume IBCJ.LFGK" — answer: 2040 cm³.
//
// Beat 0  intro      — full box, no cut shown.
// Beat 1  mark-pts   — dims visible; IB=4, EL=12 derived from IB:EL=1:3, LI=15.
// Beat 2  show-solid — IBCJ.LFGK shaded blue; prism identified.
// Beat 3  trapezoid  — faces highlighted gold; cross-section area = ½(4+13)×12 = 102.
// Beat 4  result     — final formula badge 102 × 20 = 2040.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BoxCutPhase = 'intro' | 'mark-pts' | 'show-solid' | 'trapezoid' | 'result'

export interface BoxCutOSN20KQ16Step {
  phase: BoxCutPhase
  showSolid: boolean
  highlightFaces: boolean
  showDims: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BoxCutOSN20KQ16Storyboard {
  steps: BoxCutOSN20KQ16Step[]
  finalIndex: number
  answer: number
}

export function buildBoxCutOSN20KQ16Steps(lang: Lang): BoxCutOSN20KQ16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxCutOSN20KQ16Step[] = [
    {
      phase: 'intro',
      showSolid: false,
      highlightFaces: false,
      showDims: false,
      hold: 2000,
      result: false,
      caption: t(
        'Rectangular box ABCD.EFGH: AB = 25 cm, BC = 20 cm, CG = 12 cm.',
        'Balok ABCD.EFGH: AB = 25 cm, BC = 20 cm, CG = 12 cm.',
      ),
    },
    {
      phase: 'mark-pts',
      showSolid: false,
      highlightFaces: false,
      showDims: true,
      hold: 2800,
      result: false,
      caption: t(
        'IB : EL = 1 : 3 and LI = 15 cm. Let IB = t, EL = 3t. ' +
        'Then LI² = (4t − 25)² + 12² = 15² → t = 4. So IB = 4 cm, EL = 12 cm.',
        'IB : EL = 1 : 3 dan LI = 15 cm. Misal IB = t, EL = 3t. ' +
        'Maka LI² = (4t − 25)² + 12² = 15² → t = 4. Jadi IB = 4 cm, EL = 12 cm.',
      ),
    },
    {
      phase: 'show-solid',
      showSolid: true,
      highlightFaces: false,
      showDims: true,
      hold: 2400,
      result: false,
      caption: t(
        'Solid IBCJ.LFGK is a prism with depth BC = 20 cm. ' +
        'Its cross-section (front face IBFL) is a trapezoid.',
        'Benda IBCJ.LFGK adalah prisma dengan kedalaman BC = 20 cm. ' +
        'Penampangnya (bidang muka IBFL) berbentuk trapesium.',
      ),
    },
    {
      phase: 'trapezoid',
      showSolid: true,
      highlightFaces: true,
      showDims: true,
      hold: 2800,
      result: false,
      caption: t(
        'Trapezoid sides: IB = 4 and LF = AB − EL = 25 − 12 = 13; height = CG = 12. ' +
        'Area = ½ × (4 + 13) × 12 = 102 cm².',
        'Sisi sejajar trapesium: IB = 4 dan LF = AB − EL = 25 − 12 = 13; tinggi = CG = 12. ' +
        'Luas = ½ × (4 + 13) × 12 = 102 cm².',
      ),
    },
    {
      phase: 'result',
      showSolid: true,
      highlightFaces: true,
      showDims: true,
      hold: 0,
      result: true,
      caption: t(
        'Volume = cross-section area × depth = 102 × 20 = 2040 cm³.',
        'Volume = luas penampang × kedalaman = 102 × 20 = 2040 cm³.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 2040 }
}
