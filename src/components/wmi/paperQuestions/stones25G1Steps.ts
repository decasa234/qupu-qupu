import type { Lang } from '../concepts/explainers/makeTenSteps'
import { STONE_IDS } from './Stones25G1Illustration'

// WMI-25F1A-Q1 (2025 Grade 1 Final).
// A row of 14 birds: 13 small bullfinches + 1 big toucan. The toucan is the 10th
// from the left, so 9 small birds stand to its LEFT (and 4 to its right). The
// question asks how many small birds are to the left of the toucan — answer 9.
//
// The storyboard teaches the method one idea per beat, never jumping to "9":
//   1. State the goal — we only count the small birds LEFT of the big bird.
//   2. Find the landmark — light the toucan (the big yellow-beaked bird).
//   3..11. Count the small birds left of it, one at a time, growing the lit set
//          b0 → b0,b1 → … → b0..b8 with a running counter 1, 2, … 9.
//   12. Result — 9 small birds stand to the left of the toucan.
//
// Pure builder, deterministic, SSR-safe — no random, no dates.

export type StonesPhase = 'goal' | 'landmark' | 'count' | 'result'

export interface StonesStep {
  phase: StonesPhase
  /** Bird ids highlighted on this beat (passed to the primitive's litStones). */
  lit: string[]
  /** Running tally of small birds counted on the left so far (0 before counting). */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface StonesStoryboard {
  /** The final answer — small birds to the left of the toucan. */
  answer: number
  /** Total birds in the row (14) and how many sit to the right (4). */
  total: number
  rightCount: number
  /** The toucan's id, for the landmark beat. */
  toucanId: string
  steps: StonesStep[]
  finalIndex: number
}

// The toucan sits at index 9; the nine small birds to its left are b0..b8.
const TOUCAN_ID = 'toucan'
const LEFT_IDS = STONE_IDS.slice(0, STONE_IDS.indexOf(TOUCAN_ID)) // ['b0'..'b8']
const RIGHT_IDS = STONE_IDS.slice(STONE_IDS.indexOf(TOUCAN_ID) + 1) // ['b10'..'b13']

export function buildStonesSteps(lang: Lang): StonesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer = LEFT_IDS.length // 9
  const rightCount = RIGHT_IDS.length // 4
  const total = STONE_IDS.length // 14

  const steps: StonesStep[] = [
    {
      phase: 'goal',
      lit: [],
      running: 0,
      hold: 2000,
      result: false,
      caption: t(
        'How many small birds are to the LEFT of the big bird?',
        'Ada berapa burung kecil di sebelah KIRI burung besar?',
      ),
    },
    {
      phase: 'landmark',
      lit: [TOUCAN_ID],
      running: 0,
      hold: 2000,
      result: false,
      caption: t(
        'First find the big bird — the toucan with the yellow beak.',
        'Cari dulu burung besar — si toucan dengan paruh kuning.',
      ),
    },
  ]

  // Count the small birds to the left, one at a time, lighting b0..b8 and
  // growing the running tally 1, 2, … 9. The toucan stays lit as the landmark.
  LEFT_IDS.forEach((id, i) => {
    const running = i + 1
    const lastLeft = running === answer
    steps.push({
      phase: 'count',
      lit: [TOUCAN_ID, ...LEFT_IDS.slice(0, running)],
      running,
      hold: lastLeft ? 1700 : 1300,
      result: false,
      caption: t(
        `Count the small birds on the left: ${running}.`,
        `Hitung burung kecil di sebelah kiri: ${running}.`,
      ),
    })
  })

  steps.push({
    phase: 'result',
    lit: [TOUCAN_ID, ...LEFT_IDS],
    running: answer,
    hold: 0,
    result: true,
    caption: t(
      `${answer} small birds are to the left of the toucan.`,
      `${answer} burung kecil ada di sebelah kiri toucan.`,
    ),
  })

  return {
    answer,
    total,
    rightCount,
    toucanId: TOUCAN_ID,
    steps,
    finalIndex: steps.length - 1,
  }
}
