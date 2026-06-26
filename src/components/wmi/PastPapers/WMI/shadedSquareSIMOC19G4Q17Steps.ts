// shadedSquareSIMOC19G4Q17Steps.ts — SIMOC-19-G4-Q17
//
// Square ABCD side 12 cm. L is any point on AB.
// H,I trisect AD; J,K trisect BC; G,F,E quarter DC.
// Shaded: quad L-H-D-G, triangle L-F-E, triangle L-J-K → total 60 cm².
//
// With L at midpoint (x=6):
//   Region 1 (L-H-D-G): △LHD + △LDG = ½·4·6 + ½·3·12 = 12 + 18 = 30
//   Region 2 (L-F-E):   ½ · FE · 12 = ½ · 3 · 12 = 18
//   Region 3 (L-J-K):   ½ · JK · 6  = ½ · 4 · 6  = 12
//   Total = 60  (Lx-dependent terms cancel ⇒ constant for all L)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PhaseSIMOC19G4Q17 = 'intro' | 'region1' | 'region2' | 'region3' | 'total'

export interface StepSIMOC19G4Q17 {
  phase: PhaseSIMOC19G4Q17
  /** Highlight quadrilateral L-H-D-G (amber) */
  showR1: boolean
  /** Highlight triangle L-F-E (green) */
  showR2: boolean
  /** Highlight triangle L-J-K (blue) */
  showR3: boolean
  caption: string
  hold: number
  result: boolean
}

export interface StorySIMOC19G4Q17 {
  steps: StepSIMOC19G4Q17[]
  finalIndex: number
  answer: number
}

export function buildShadedSquareSIMOC19G4Q17Steps(lang: Lang): StorySIMOC19G4Q17 {
  const t = (en: string, id: string) => lang === 'id' ? id : en
  const steps: StepSIMOC19G4Q17[] = []

  // Beat 0 – intro: show the labelled figure, no highlights
  steps.push({
    phase: 'intro',
    showR1: false, showR2: false, showR3: false,
    hold: 1800, result: false,
    caption: t(
      'Square ABCD, side 12 cm. L is any point on AB. Find the total shaded area.',
      'Persegi ABCD sisi 12 cm. L sembarang titik di AB. Temukan total luas diarsir.',
    ),
  })

  // Beat 1 – reveal Region 1: quad L-H-D-G
  steps.push({
    phase: 'region1',
    showR1: true, showR2: false, showR3: false,
    hold: 2800, result: false,
    caption: t(
      'Region 1 (L-H-D-G): △LHD + △LDG = ½·4·6 + ½·3·12 = 12 + 18 = 30 cm²',
      'Daerah 1 (L-H-D-G): △LHD + △LDG = ½·4·6 + ½·3·12 = 12 + 18 = 30 cm²',
    ),
  })

  // Beat 2 – reveal Region 2: triangle L-F-E
  steps.push({
    phase: 'region2',
    showR1: true, showR2: true, showR3: false,
    hold: 2600, result: false,
    caption: t(
      'Region 2 (△L-F-E): ½ × FE × 12 = ½ × 3 × 12 = 18 cm²',
      'Daerah 2 (△L-F-E): ½ × FE × 12 = ½ × 3 × 12 = 18 cm²',
    ),
  })

  // Beat 3 – reveal Region 3: triangle L-J-K
  steps.push({
    phase: 'region3',
    showR1: true, showR2: true, showR3: true,
    hold: 2600, result: false,
    caption: t(
      'Region 3 (△L-J-K): ½ × JK × 6 = ½ × 4 × 6 = 12 cm²',
      'Daerah 3 (△L-J-K): ½ × JK × 6 = ½ × 4 × 6 = 12 cm²',
    ),
  })

  // Beat 4 – final total (Lx terms cancel)
  steps.push({
    phase: 'total',
    showR1: true, showR2: true, showR3: true,
    hold: 0, result: true,
    caption: t(
      '30 + 18 + 12 = 60 cm² — constant for any position of L on AB!',
      '30 + 18 + 12 = 60 cm² — selalu sama untuk sembarang posisi L di AB!',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 60 }
}
