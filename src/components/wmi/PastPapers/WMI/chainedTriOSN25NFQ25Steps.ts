// OSN-25-SD-NAS-FINAL-Q25 storyboard — three chained right triangles.
//
// Given: AB = 12, BC = 5, CD = 9. Find FE given FE ∥ BD.
//
// Solution:
//   Beat 0 (intro):   Label the given sides; right angles at B, D, C(△ECF).
//   Beat 1 (find-ac): △ABC siku-siku di B → AC = √(12²+5²) = 13.
//   Beat 2 (find-de): △CDE ~ △ABC (skala 9/12 = 3/4) → DE = 15/4, CE = 39/4.
//   Beat 3 (find-f):  △ECF siku-siku di C: CE ⊥ CF. FE ∥ BD ⇒ F on AC at y = 15/4.
//                     Line AC: (5t, 12−12t). y=15/4 → t = 11/16. F_x = 55/16.
//   Beat 4 (result):  FE = 14 − 55/16 = 169/16 cm.
//
// Note: seed answer 25/16 is flagged "verify-answer" — geometry confirms 169/16.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ChainedTriPhase = 'intro' | 'find-ac' | 'find-de' | 'find-f' | 'result'

export interface ChainedTriStep {
  phase: ChainedTriPhase
  highlightFE: boolean
  highlightCE: boolean
  highlightCF: boolean
  feLabel?: string
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface ChainedTriStoryboard {
  steps: ChainedTriStep[]
  finalIndex: number
}

export function buildChainedTriOSN25NFQ25Steps(lang: Lang): ChainedTriStoryboard {
  const id = lang === 'id'

  const steps: ChainedTriStep[] = [
    {
      phase: 'intro',
      highlightFE: false,
      highlightCE: false,
      highlightCF: false,
      equation: 'AB = 12,  BC = 5,  CD = 9',
      caption: id
        ? 'Tiga segitiga siku-siku berurutan. Siku-siku di B (△ABC), di D (△CDE), dan di C (△ECF).'
        : 'Three chained right triangles. Right angles at B (△ABC), D (△CDE), and C (△ECF).',
      hold: 2000,
      result: false,
    },
    {
      phase: 'find-ac',
      highlightFE: false,
      highlightCE: false,
      highlightCF: false,
      equation: 'AC = √(12² + 5²) = √169 = 13 cm',
      caption: id
        ? '△ABC siku-siku di B: gunakan Pythagoras → AC = 13 cm.'
        : 'Right △ABC at B: Pythagorean theorem → hypotenuse AC = 13 cm.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'find-de',
      highlightFE: false,
      highlightCE: true,
      highlightCF: false,
      equation: 'DE = (5/12) × 9 = 15/4 cm,  CE = (13/12) × 9 = 39/4 cm',
      caption: id
        ? '△CDE sebangun △ABC (sudut di C sama; siku-siku di D). Skala = 9/12 = 3/4.'
        : '△CDE ~ △ABC (equal angle at C; right angle at D). Scale = 9/12 = 3/4.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'find-f',
      highlightFE: false,
      highlightCE: true,
      highlightCF: true,
      equation: 'CE ⊥ CF  →  F ∈ garis AC,  y_F = DE = 15/4',
      caption: id
        ? '△ECF siku-siku di C ⇒ CE ⊥ CF. Karena FE ∥ BD, F ada di AC pada ketinggian y = 15/4. Garis AC: t = 11/16 → F_x = 55/16.'
        : 'Right △ECF at C ⇒ CE ⊥ CF. Since FE ∥ BD, F lies on AC at height y = 15/4. Line AC gives t = 11/16 → F_x = 55/16.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'result',
      highlightFE: true,
      highlightCE: false,
      highlightCF: false,
      feLabel: '169/16',
      equation: 'FE = 14 − 55/16 = 224/16 − 55/16 = 169/16 cm',
      caption: id
        ? 'FE = x_E − x_F = 14 − 55/16 = 169/16 cm.'
        : 'FE = x_E − x_F = 14 − 55/16 = 169/16 cm.',
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
