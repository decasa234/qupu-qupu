import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC 2021 Pre-Ecolier Q11 — "flower pots".
// Julia has two pots.
//   Pot 1: 3 white pompom flowers, 0 orange sunflower flowers
//   Pot 2: 0 white flowers, 3 orange sunflower flowers
// She wants each pot to have the same count of each type.
// Target = 3 white AND 3 orange per pot.
//   Add 3 orange to Pot 1 → +3
//   Add 3 white  to Pot 2 → +3
//   Total bought = 6  → Answer: C

export const POT1_WHITE = 3
export const POT1_ORANGE = 0
export const POT2_WHITE = 0
export const POT2_ORANGE = 3

export const ADD_ORANGE = 3  // orange flowers added to Pot 1
export const ADD_WHITE  = 3  // white flowers added to Pot 2
export const TOTAL_BOUGHT = ADD_ORANGE + ADD_WHITE  // 6

export type FlowerPhase = 'goal' | 'checkPot1' | 'checkPot2' | 'addOrange' | 'addWhite' | 'result'

export interface FlowerStep {
  phase: FlowerPhase
  /** How many orange flowers are "being added" to Pot 1 (shown faded/dashed). */
  addedOrangePot1: number
  /** How many white flowers are "being added" to Pot 2 (shown faded/dashed). */
  addedWhitePot2: number
  /** Which pot to spotlight (1 or 2), or null for no spotlight. */
  activePot: 1 | 2 | null
  /** Running tally of flowers bought so far. */
  bought: number
  /** Localised caption for this beat. */
  caption: string
  /** Auto-advance hold in ms (0 = last beat / stay). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface FlowerStoryboard {
  steps: FlowerStep[]
  finalIndex: number
}

export function buildFlowerPots11PESteps(lang: Lang): FlowerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FlowerStep[] = []

  // Beat 0 — goal: show both pots as-is
  steps.push({
    phase: 'goal',
    addedOrangePot1: 0,
    addedWhitePot2: 0,
    activePot: null,
    bought: 0,
    hold: 2100,
    result: false,
    caption: t(
      'Each pot needs the same number of each flower type.',
      'Setiap pot harus memiliki jumlah yang sama dari setiap jenis bunga.',
    ),
  })

  // Beat 1 — checkPot1: spotlight Pot 1
  steps.push({
    phase: 'checkPot1',
    addedOrangePot1: 0,
    addedWhitePot2: 0,
    activePot: 1,
    bought: 0,
    hold: 1800,
    result: false,
    caption: t(
      'Pot 1 has 3 white flowers, 0 orange flowers.',
      'Pot 1 memiliki 3 bunga putih, 0 bunga oranye.',
    ),
  })

  // Beat 2 — checkPot2: spotlight Pot 2
  steps.push({
    phase: 'checkPot2',
    addedOrangePot1: 0,
    addedWhitePot2: 0,
    activePot: 2,
    bought: 0,
    hold: 1800,
    result: false,
    caption: t(
      'Pot 2 has 0 white flowers, 3 orange flowers.',
      'Pot 2 memiliki 0 bunga putih, 3 bunga oranye.',
    ),
  })

  // Beat 3 — addOrange: add 3 orange to Pot 1
  steps.push({
    phase: 'addOrange',
    addedOrangePot1: ADD_ORANGE,
    addedWhitePot2: 0,
    activePot: 1,
    bought: ADD_ORANGE,
    hold: 2100,
    result: false,
    caption: t(
      'Add 3 orange to Pot 1 → now both have 3 orange.',
      'Tambah 3 bunga oranye ke Pot 1 → kini keduanya punya 3 bunga oranye.',
    ),
  })

  // Beat 4 — addWhite: add 3 white to Pot 2
  steps.push({
    phase: 'addWhite',
    addedOrangePot1: ADD_ORANGE,
    addedWhitePot2: ADD_WHITE,
    activePot: 2,
    bought: TOTAL_BOUGHT,
    hold: 2100,
    result: false,
    caption: t(
      'Add 3 white to Pot 2 → now both have 3 white.',
      'Tambah 3 bunga putih ke Pot 2 → kini keduanya punya 3 bunga putih.',
    ),
  })

  // Beat 5 — result
  steps.push({
    phase: 'result',
    addedOrangePot1: ADD_ORANGE,
    addedWhitePot2: ADD_WHITE,
    activePot: null,
    bought: TOTAL_BOUGHT,
    hold: 0,
    result: true,
    caption: t(
      '3 + 3 = 6 flowers bought. Answer: C.',
      '3 + 3 = 6 bunga dibeli. Jawaban: C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
