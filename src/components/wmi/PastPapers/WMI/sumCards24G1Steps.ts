import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SUM_CARDS_24G1 } from './SumCards24G1Illustration'

// WMI-24F1A-Q18 (2024 Grade 1 Final) — answer = 6 (fill-in).
//
// Eight cards 7,4,8,1,5,2,6,3 (left→right). The number on the □-th card from the
// LEFT plus the number on the △-th card from the RIGHT add up to 9. How many
// different values can □ + △ have?
//
// Strategy this storyboard teaches:
//   1. Two cards can pair only if their VALUES add to 9. The value-pairs are
//      (7,2), (4,5), (8,1), (6,3) — sitting at left positions {1,6},{2,5},{3,4},
//      {7,8}.
//   2. For each value-pair, EITHER card may be the "from-left" one. So every
//      value-pair gives TWO pairings (□ from left, △ from the right), and □ + △
//      is the answer we record.
//   3. △ (position from the right) of a card at left position k is 9 − k, since
//      there are 8 cards (N + 1 − k = 9 − k). So □ + △ = (left pos of from-left
//      card) + (9 − left pos of from-right card).
//   4. Walk all 8 pairings, dropping each □ + △ into a running SET. Duplicates
//      don't grow the set. The distinct totals are {4,6,8,10,12,14} → 6.

export interface SumCards24G1Step {
  /** Kid-voice caption for this beat. */
  caption: string
  /** □ — 1-based position from the LEFT to light (blue). null on framing beats. */
  litLeft: number | null
  /** △ — 1-based position from the RIGHT to light (orange). null on framing beats. */
  litRight: number | null
  /** Whether to print the "□ + △ = N" readout under the row. */
  showSum: boolean
  /** The □ + △ total this beat produces, or null on framing beats. */
  sum: number | null
  /** Distinct totals collected so far (after this beat resolves), in found order. */
  collected: number[]
  /** True when this pairing's total was ALREADY in the set (a duplicate). */
  duplicate: boolean
  /** True only on the final result beat. */
  result: boolean
  /** How long to hold this beat, in ms. Duplicates linger; the winner holds 0. */
  hold: number
}

export interface SumCards24G1Storyboard {
  cards: readonly number[]
  /** Distinct □ + △ totals, sorted ascending. */
  distinct: number[]
  /** The answer: how many different □ + △ values. */
  answer: number
  steps: SumCards24G1Step[]
  finalIndex: number
}

/** Value-pairs that sum to 9, written as the two LEFT positions (1-based) holding them. */
const VALUE_PAIRS_BY_LEFT_POS: ReadonlyArray<readonly [number, number]> = [
  [1, 6], // values 7 + 2
  [2, 5], // values 4 + 5
  [3, 4], // values 8 + 1
  [7, 8], // values 6 + 3
]

export function buildSumCards24G1Steps(lang: Lang): SumCards24G1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const cards = SUM_CARDS_24G1
  const N = cards.length // 8

  // Build the 8 ordered pairings: for each value-pair, either card can be the
  // "from-left" one. □ = left position of the from-left card; △ = position from
  // the right of the partner = N + 1 − (its left position) = 9 − k for N = 8.
  interface Pairing {
    box: number // □, 1-based from left
    tri: number // △, 1-based from right
    sum: number // □ + △
    leftVal: number
    rightVal: number
  }
  const pairings: Pairing[] = []
  for (const [p, q] of VALUE_PAIRS_BY_LEFT_POS) {
    for (const [L, R] of [
      [p, q],
      [q, p],
    ] as const) {
      const box = L
      const tri = N + 1 - R
      pairings.push({ box, tri, sum: box + tri, leftVal: cards[L - 1], rightVal: cards[R - 1] })
    }
  }

  const steps: SumCards24G1Step[] = []

  // Beat 0 — state the goal.
  steps.push({
    caption: t(
      'Pick the □-th card from the LEFT and the △-th from the RIGHT so they add to 9. Count the different □ + △.',
      'Pilih kartu ke-□ dari KIRI dan ke-△ dari KANAN supaya jumlahnya 9. Hitung berapa beda nilai □ + △.',
    ),
    litLeft: null,
    litRight: null,
    showSum: false,
    sum: null,
    collected: [],
    duplicate: false,
    result: false,
    hold: 2400,
  })

  // Beat 1 — the key idea: only value-pairs that sum to 9 work.
  steps.push({
    caption: t(
      'A pair works only if the two NUMBERS add to 9: 7+2, 4+5, 8+1, 6+3.',
      'Pasangan cocok hanya jika dua ANGKA-nya berjumlah 9: 7+2, 4+5, 8+1, 6+3.',
    ),
    litLeft: null,
    litRight: null,
    showSum: false,
    sum: null,
    collected: [],
    duplicate: false,
    result: false,
    hold: 2400,
  })

  // One beat per ordered pairing — light □ (left) and △ (right), show □ + △,
  // and drop it into the running set.
  const collected: number[] = []
  for (const pr of pairings) {
    const duplicate = collected.includes(pr.sum)
    if (!duplicate) collected.push(pr.sum)
    const caption = duplicate
      ? t(
          `□ + △ = ${pr.box} + ${pr.tri} = ${pr.sum} — already have it ✗`,
          `□ + △ = ${pr.box} + ${pr.tri} = ${pr.sum} — sudah ada ✗`,
        )
      : t(
          `${pr.leftVal} + ${pr.rightVal} = 9 ✓  □ + △ = ${pr.box} + ${pr.tri} = ${pr.sum} — new!`,
          `${pr.leftVal} + ${pr.rightVal} = 9 ✓  □ + △ = ${pr.box} + ${pr.tri} = ${pr.sum} — baru!`,
        )
    steps.push({
      caption,
      litLeft: pr.box,
      litRight: pr.tri,
      showSum: true,
      sum: pr.sum,
      collected: collected.slice(),
      duplicate,
      result: false,
      // Duplicates linger a touch longer so the "we already counted this" reads.
      hold: duplicate ? 2200 : 1700,
    })
  }

  const distinct = collected.slice().sort((a, b) => a - b)
  const answer = distinct.length

  // Result beat — the distinct set and the count.
  steps.push({
    caption: t(
      `Different totals: {${distinct.join(', ')}} → ${answer} values.`,
      `Nilai berbeda: {${distinct.join(', ')}} → ${answer} nilai.`,
    ),
    litLeft: null,
    litRight: null,
    showSum: false,
    sum: null,
    collected: distinct.slice(),
    duplicate: false,
    result: true,
    hold: 0,
  })

  return {
    cards,
    distinct,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
