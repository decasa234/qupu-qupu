/**
 * diceNet24G1Steps — storyboard builder for WMI-24F1A-Q5 (2024 Grade 1 Final)
 *
 * "Fold the net into a cube. Find the sum of the differences between the dot
 * counts on the three pairs of opposite faces."
 *
 * After folding the staircase net, the three opposite-face pairs are:
 *   9 ↔ 3  → |9 − 3| = 6
 *   6 ↔ 4  → |6 − 4| = 2
 *   2 ↔ 1  → |2 − 1| = 1
 *   sum of differences = 6 + 2 + 1 = 9  (answer E)
 *
 * The animation teaches the METHOD one pair at a time: fold the net, then for
 * each opposite pair light it up and work out |a − b|, accumulating a running
 * sum, before landing on 6 + 2 + 1 = 9.
 *
 * Pure function — no Math.random, no Date. SSR-safe & deterministic.
 */

import { OPPOSITE_PAIRS, NET_FACES } from './DiceNet24G1Illustration'

export type Lang = 'en' | 'id'

export type DiceNetPhase =
  | 'intro' // show the bare net, state the goal
  | 'fold' // fold the net into a cube (showFolded)
  | 'pair' // light one opposite pair and compute |a − b|
  | 'result' // final beat: 6 + 2 + 1 = 9

export interface DiceNetStep {
  phase: DiceNetPhase
  /** Index into OPPOSITE_PAIRS (0|1|2) to light, or null on intro/fold/result. */
  litPair: number | null
  /** Draw the folded-cube glyph beside the net. */
  showFolded: boolean
  /** Dot count on face a of the current pair (pair beats only). */
  a: number | null
  /** Dot count on face b of the current pair (pair beats only). */
  b: number | null
  /** |a − b| for the current pair (pair beats only). */
  diff: number | null
  /** Running sum of differences after this beat. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface DiceNetStoryboard {
  /** Sum of the three differences = the answer (9). */
  total: number
  steps: DiceNetStep[]
  finalIndex: number
}

/** pips on a face id, from the net data. */
function pipsOf(id: number): number {
  return NET_FACES.find((f) => f.id === id)?.pips ?? 0
}

export function buildDiceNet24G1Steps(lang: Lang): DiceNetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiceNetStep[] = [
    // Beat 0 — intro: state the goal on the bare net
    {
      phase: 'intro',
      litPair: null,
      showFolded: false,
      a: null,
      b: null,
      diff: null,
      running: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Fold this net into a cube. Then add the gaps between each pair of opposite faces.',
        'Lipat jaring ini jadi kubus. Lalu jumlahkan selisih tiap pasang sisi yang berhadapan.',
      ),
    },
    // Beat 1 — fold: show the cube forming
    {
      phase: 'fold',
      litPair: null,
      showFolded: true,
      a: null,
      b: null,
      diff: null,
      running: 0,
      hold: 1800,
      result: false,
      caption: t(
        'Fold along the dotted lines — it makes a cube. Opposite faces sit across from each other.',
        'Lipat di garis putus-putus — jadilah kubus. Sisi berhadapan saling membelakangi.',
      ),
    },
  ]

  // One beat per opposite pair: light it, compute |a − b|, grow the running sum.
  let running = 0
  OPPOSITE_PAIRS.forEach((pair, i) => {
    const av = pipsOf(pair.a)
    const bv = pipsOf(pair.b)
    const hi = Math.max(av, bv)
    const lo = Math.min(av, bv)
    running += pair.diff
    steps.push({
      phase: 'pair',
      litPair: i,
      showFolded: true,
      a: av,
      b: bv,
      diff: pair.diff,
      running,
      hold: 2000,
      result: false,
      caption: t(
        `Opposite faces ${hi} and ${lo}: ${hi} − ${lo} = ${pair.diff}. Running total ${running}.`,
        `Sisi berhadapan ${hi} dan ${lo}: ${hi} − ${lo} = ${pair.diff}. Total sejauh ini ${running}.`,
      ),
    })
  })

  const sumParts = OPPOSITE_PAIRS.map((p) => p.diff).join(' + ')
  const total = OPPOSITE_PAIRS.reduce((s, p) => s + p.diff, 0)

  // Final beat — the answer.
  steps.push({
    phase: 'result',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    diff: null,
    running: total,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${total}. Answer: E (${total}).`,
      `${sumParts} = ${total}. Jawaban: E (${total}).`,
    ),
  })

  return { total, steps, finalIndex: steps.length - 1 }
}
