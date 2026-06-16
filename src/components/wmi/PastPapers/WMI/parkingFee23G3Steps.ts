// WMI-23F3A-Q7 (2023 Grade 3 Final) — equal parking fees, least combined hours.
//
// "Small car: $5 first hour, then $3 each later hour. Big car: $7 first hour,
//  then $5 each later hour. Kevin (small) and Josh (big) pay the SAME total.
//  At least how many hours in total do they park?"   Answer: B = 8.
//
// METHOD (build two cost ladders, then match the first equal fee).
//   Small car after h hours: 5, then +3 each later hour  → cost = 3h + 2.
//        h:  1   2   3   4   5
//      cost: 5   8  11  14  17
//   Big car after k hours:   7, then +5 each later hour  → cost = 5k + 2.
//        k:  1   2   3
//      cost: 7  12  17
//   Same fee ⇒ 3h + 2 = 5k + 2 ⇒ 3h = 5k. Smallest whole-number match: the
//   first dollar value that appears in BOTH ladders is $17 — small at h = 5,
//   big at k = 3. Combined least total hours = 5 + 3 = 8 → choice B.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. The cost numbers are computed here from the printed rates so
// every beat shows concrete running sums; the figure reveal is driven by passing
// smallHours / bigHours up to the matched 5 / 3 into the ParkingFee23G3 primitive.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Printed rates (from the question stem).
export const SMALL_FIRST = 5
export const SMALL_LATER = 3
export const BIG_FIRST = 7
export const BIG_LATER = 5

// The matched fee, the two hour counts that reach it, and the final answer.
export const MATCH_FEE = 17
export const SMALL_MATCH_H = 5
export const BIG_MATCH_K = 3
export const ANSWER_HOURS = SMALL_MATCH_H + BIG_MATCH_K // 8
export const ANSWER_LABEL = 'B'

/** Small-car cost after h hours: 5 then +3 each later hour. */
export function smallCost(h: number): number {
  return h <= 0 ? 0 : SMALL_FIRST + SMALL_LATER * (h - 1)
}

/** Big-car cost after k hours: 7 then +5 each later hour. */
export function bigCost(k: number): number {
  return k <= 0 ? 0 : BIG_FIRST + BIG_LATER * (k - 1)
}

/** Build the small-car ladder of (hour, cost) up to h hours. */
export function smallLadder(h: number): Array<{ hour: number; cost: number }> {
  const out: Array<{ hour: number; cost: number }> = []
  for (let i = 1; i <= h; i++) out.push({ hour: i, cost: smallCost(i) })
  return out
}

/** Build the big-car ladder of (hour, cost) up to k hours. */
export function bigLadder(k: number): Array<{ hour: number; cost: number }> {
  const out: Array<{ hour: number; cost: number }> = []
  for (let i = 1; i <= k; i++) out.push({ hour: i, cost: bigCost(i) })
  return out
}

/** Which car a beat is building / focusing. */
export type Focus = 'goal' | 'small' | 'big' | 'match' | 'total'

export interface ParkingStep {
  focus: Focus
  /** How many small-car hours to show on the figure this beat (drives the reveal). */
  smallHours: number
  /** How many big-car hours to show on the figure this beat. */
  bigHours: number
  /** Small-car ladder rungs to render in the panel this beat. */
  small: Array<{ hour: number; cost: number }>
  /** Big-car ladder rungs to render in the panel this beat. */
  big: Array<{ hour: number; cost: number }>
  /** Highlight the rung whose cost equals MATCH_FEE (the first shared fee). */
  highlightFee: number | null
  /** Tell the figure to print the dollar totals (final reveal only). */
  showTotals: boolean
  /** True only on the final winning beat. */
  result: boolean
  caption: string
  hold: number
}

export interface ParkingStoryboard {
  answerHours: number
  answerLabel: string
  matchFee: number
  smallMatchH: number
  bigMatchK: number
  steps: ParkingStep[]
  finalIndex: number
}

export function buildParkingFeeSteps(lang: Lang): ParkingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const fullSmall = smallLadder(SMALL_MATCH_H) // 5,8,11,14,17
  const fullBig = bigLadder(BIG_MATCH_K) // 7,12,17

  const steps: ParkingStep[] = []

  // Beat 1 — the goal.
  steps.push({
    focus: 'goal',
    smallHours: 0,
    bigHours: 0,
    small: [],
    big: [],
    highlightFee: null,
    showTotals: false,
    result: false,
    hold: 2600,
    caption: t(
      'Kevin pays the small-car fee, Josh the big-car fee. We want the first time both pay the SAME — using the fewest hours.',
      'Kevin bayar tarif mobil kecil, Josh tarif mobil besar. Cari pertama kali keduanya bayar SAMA — dengan jam paling sedikit.',
    ),
  })

  // Beat 2 — build the small-car ladder 5, 8, 11, 14, 17.
  steps.push({
    focus: 'small',
    smallHours: SMALL_MATCH_H,
    bigHours: 0,
    small: fullSmall,
    big: [],
    highlightFee: null,
    showTotals: false,
    result: false,
    hold: 2400,
    caption: t(
      `Small car: $${SMALL_FIRST} for hour 1, then +$${SMALL_LATER} each hour → 5, 8, 11, 14, 17.`,
      `Mobil kecil: $${SMALL_FIRST} jam ke-1, lalu +$${SMALL_LATER} tiap jam → 5, 8, 11, 14, 17.`,
    ),
  })

  // Beat 3 — build the big-car ladder 7, 12, 17.
  steps.push({
    focus: 'big',
    smallHours: SMALL_MATCH_H,
    bigHours: BIG_MATCH_K,
    small: fullSmall,
    big: fullBig,
    highlightFee: null,
    showTotals: false,
    result: false,
    hold: 2400,
    caption: t(
      `Big car: $${BIG_FIRST} for hour 1, then +$${BIG_LATER} each hour → 7, 12, 17.`,
      `Mobil besar: $${BIG_FIRST} jam ke-1, lalu +$${BIG_LATER} tiap jam → 7, 12, 17.`,
    ),
  })

  // Beat 4 — the first shared fee is $17: small at 5 h, big at 3 h.
  steps.push({
    focus: 'match',
    smallHours: SMALL_MATCH_H,
    bigHours: BIG_MATCH_K,
    small: fullSmall,
    big: fullBig,
    highlightFee: MATCH_FEE,
    showTotals: true,
    result: false,
    hold: 2400,
    caption: t(
      `The first fee in BOTH ladders is $${MATCH_FEE}: small car at ${SMALL_MATCH_H} h, big car at ${BIG_MATCH_K} h.`,
      `Tarif pertama yang ada di KEDUA tangga adalah $${MATCH_FEE}: mobil kecil ${SMALL_MATCH_H} jam, mobil besar ${BIG_MATCH_K} jam.`,
    ),
  })

  // Beat 5 — total hours = 5 + 3 = 8 → B.
  steps.push({
    focus: 'total',
    smallHours: SMALL_MATCH_H,
    bigHours: BIG_MATCH_K,
    small: fullSmall,
    big: fullBig,
    highlightFee: MATCH_FEE,
    showTotals: true,
    result: true,
    hold: 0,
    caption: t(
      `Least total hours = ${SMALL_MATCH_H} + ${BIG_MATCH_K} = ${ANSWER_HOURS} → ${ANSWER_LABEL}.`,
      `Total jam paling sedikit = ${SMALL_MATCH_H} + ${BIG_MATCH_K} = ${ANSWER_HOURS} → ${ANSWER_LABEL}.`,
    ),
  })

  return {
    answerHours: ANSWER_HOURS,
    answerLabel: ANSWER_LABEL,
    matchFee: MATCH_FEE,
    smallMatchH: SMALL_MATCH_H,
    bigMatchK: BIG_MATCH_K,
    steps,
    finalIndex: steps.length - 1,
  }
}
