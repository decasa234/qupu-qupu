// Steps for SASMO-20-G4-Q2 — gear-train rotation explainer.
// Eight beats: introduce → propagate CW/CCW through each gear → highlight answer C.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface GearTrainStep {
  /** How many gears (from A) have their rotation arrow revealed (0–6). */
  revealCount: number
  /** Highlight gear C (answer) in green and dim others. */
  highlightC: boolean
  caption: string
  hold: number
  result: boolean
}

export interface GearTrainStoryboard {
  steps: GearTrainStep[]
  finalIndex: number
}

export function buildGearTrainSASMO20G4Q2Steps(lang: Lang): GearTrainStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GearTrainStep[] = [
    // Beat 0 — introduce the chain
    {
      revealCount: 0,
      highlightC:  false,
      caption: t(
        'Six gears A–F are meshed in a chain. Adjacent meshed gears always rotate in opposite directions.',
        'Enam roda gigi A–F saling bersentuhan dalam rantai. Roda gigi yang bersentuhan selalu berputar berlawanan arah.',
      ),
      hold: 2400,
      result: false,
    },
    // Beat 1 — A is given CCW
    {
      revealCount: 1,
      highlightC:  false,
      caption: t(
        'Gear A: anti-clockwise ↺ (given).',
        'Roda Gigi A: berlawanan jarum jam ↺ (diketahui).',
      ),
      hold: 1800,
      result: false,
    },
    // Beat 2 — B reverses to CW
    {
      revealCount: 2,
      highlightC:  false,
      caption: t(
        'B meshes with A → reverses direction → clockwise ↻.',
        'B bersentuhan dengan A → arah terbalik → searah jarum jam ↻.',
      ),
      hold: 1800,
      result: false,
    },
    // Beat 3 — C reverses to CCW
    {
      revealCount: 3,
      highlightC:  false,
      caption: t(
        'C meshes with B → reverses again → anti-clockwise ↺.',
        'C bersentuhan dengan B → terbalik lagi → berlawanan jarum jam ↺.',
      ),
      hold: 1800,
      result: false,
    },
    // Beat 4 — D
    {
      revealCount: 4,
      highlightC:  false,
      caption: t(
        'D meshes with C → clockwise ↻.',
        'D bersentuhan dengan C → searah jarum jam ↻.',
      ),
      hold: 1600,
      result: false,
    },
    // Beat 5 — E
    {
      revealCount: 5,
      highlightC:  false,
      caption: t(
        'E meshes with D → anti-clockwise ↺.',
        'E bersentuhan dengan D → berlawanan jarum jam ↺.',
      ),
      hold: 1600,
      result: false,
    },
    // Beat 6 — F
    {
      revealCount: 6,
      highlightC:  false,
      caption: t(
        'F meshes with E → clockwise ↻. All six gears traced.',
        'F bersentuhan dengan E → searah jarum jam ↻. Semua enam roda gigi sudah dilacak.',
      ),
      hold: 2000,
      result: false,
    },
    // Beat 7 — highlight answer: C is CCW → choice D
    {
      revealCount: 6,
      highlightC:  true,
      caption: t(
        'Gear C rotates anti-clockwise ↺ → Answer D is correct.',
        'Roda Gigi C berputar berlawanan jarum jam ↺ → Jawaban D benar.',
      ),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
