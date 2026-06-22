// appleBags23PESteps.ts
//
// Beat-by-beat storyboard for IKMC-23-PE-Q23.
//
// Solution path:
//   1. Show bags with CURRENT counts: 3, 4, 6.
//   2. Add up what's left: 3 + 4 + 6 = 13.
//   3. Subtract from total: 19 − 13 = 6 removed in all.
//   4. Divide by 3 bags: 6 ÷ 3 = 2 per bag.
//   5. Verify: bags were (3+2), (4+2), (6+2) = 5, 6, 8 → sum 19 ✓.
//   6. Answer: 2 apples — choice B.

import {
  BAG_COUNTS_AFTER,
  BAG_COUNTS_BEFORE,
  TOTAL_BEFORE,
  TOTAL_AFTER,
  TOTAL_REMOVED,
  REMOVED_PER_BAG,
} from './AppleBags23PEIllustration'

export type BagPhase = 'current' | 'sum-remaining' | 'removed-total' | 'per-bag' | 'verify' | 'answer'

export interface BagStep {
  phase: BagPhase
  /** Counts to display in each bag. */
  counts: [number, number, number]
  /** How many to dim in each bag (ghost the removed ones). */
  dimCounts: [number, number, number]
  /** Badge shown above each bag (e.g. "−2"), or null. */
  removedLabel: string | null
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BagStoryboard {
  steps: BagStep[]
  finalIndex: number
}

type Lang = 'en' | 'id'

export function buildAppleBags23PESteps(lang: Lang): BagStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [a, b, c] = BAG_COUNTS_AFTER   // 3, 4, 6
  const [pa, pb, pc] = BAG_COUNTS_BEFORE // 5, 6, 8

  const steps: BagStep[] = [
    // Beat 0: show the problem — three bags with current counts
    {
      phase: 'current',
      counts: [a, b, c],
      dimCounts: [0, 0, 0],
      removedLabel: null,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `The bags now have ${a}, ${b}, and ${c} apples. Maria took the same number from each.`,
        `Kantong-kantong sekarang memiliki ${a}, ${b}, dan ${c} apel. Maria mengambil jumlah yang sama dari setiap kantong.`,
      ),
    },

    // Beat 1: add up what remains
    {
      phase: 'sum-remaining',
      counts: [a, b, c],
      dimCounts: [0, 0, 0],
      removedLabel: null,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Add what's left: ${a} + ${b} + ${c} = ${TOTAL_AFTER} apples remain.`,
        `Jumlahkan yang tersisa: ${a} + ${b} + ${c} = ${TOTAL_AFTER} apel masih ada.`,
      ),
    },

    // Beat 2: total removed = 19 − 13 = 6
    {
      phase: 'removed-total',
      counts: [a, b, c],
      dimCounts: [0, 0, 0],
      removedLabel: null,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Maria started with ${TOTAL_BEFORE}. She has ${TOTAL_AFTER} left, so ${TOTAL_BEFORE} − ${TOTAL_AFTER} = ${TOTAL_REMOVED} apples were taken out in total.`,
        `Maria mulai dengan ${TOTAL_BEFORE}. Tersisa ${TOTAL_AFTER}, jadi ${TOTAL_BEFORE} − ${TOTAL_AFTER} = ${TOTAL_REMOVED} apel diambil secara total.`,
      ),
    },

    // Beat 3: divide by 3 to find per-bag
    {
      phase: 'per-bag',
      counts: [a, b, c],
      dimCounts: [0, 0, 0],
      removedLabel: `−${REMOVED_PER_BAG}`,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `${TOTAL_REMOVED} apples spread equally across ${BAG_COUNTS_AFTER.length} bags: ${TOTAL_REMOVED} ÷ ${BAG_COUNTS_AFTER.length} = ${REMOVED_PER_BAG} per bag.`,
        `${TOTAL_REMOVED} apel dibagi rata ke ${BAG_COUNTS_AFTER.length} kantong: ${TOTAL_REMOVED} ÷ ${BAG_COUNTS_AFTER.length} = ${REMOVED_PER_BAG} per kantong.`,
      ),
    },

    // Beat 4: verify by showing BEFORE counts with the removed ones ghosted
    {
      phase: 'verify',
      counts: [pa, pb, pc],
      dimCounts: [REMOVED_PER_BAG, REMOVED_PER_BAG, REMOVED_PER_BAG],
      removedLabel: `−${REMOVED_PER_BAG}`,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Check: bags had ${pa}, ${pb}, ${pc} apples → ${pa}+${pb}+${pc} = ${TOTAL_BEFORE} ✓`,
        `Cek: kantong punya ${pa}, ${pb}, ${pc} apel → ${pa}+${pb}+${pc} = ${TOTAL_BEFORE} ✓`,
      ),
    },

    // Beat 5: answer
    {
      phase: 'answer',
      counts: [a, b, c],
      dimCounts: [0, 0, 0],
      removedLabel: null,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Maria took out ${REMOVED_PER_BAG} apples from each bag — answer B.`,
        `Maria mengambil ${REMOVED_PER_BAG} apel dari setiap kantong — jawaban B.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
