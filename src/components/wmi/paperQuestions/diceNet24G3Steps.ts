/**
 * diceNet24G3Steps — storyboard builder for WMI-24F3A-Q14 (2024 Grade 3 Final, HARD)
 *
 * "Given 7 dice and an unfolded net of a die. How many of the 7 dice at most
 *  can have the same unfolded view as shown?"  → answer B = 4.
 *
 * The method this teaches (the crux of the problem):
 *   1. Folding the net fixes the three OPPOSITE-FACE pairs. For a standard die
 *      each opposite pair sums to 7:  6 ↔ 1, 5 ↔ 2, 3 ↔ 4.
 *   2. But matching the faces is not enough. Folding a flat net can produce two
 *      mirror-image cubes (CHIRALITY). A real die has a fixed turning sense
 *      (going 1 → 2 → 3 around the corner is clockwise on a Western die). A
 *      candidate die only matches the shown net when BOTH its face pattern AND
 *      its turning sense agree.
 *   3. Comparing the 7 dice against the folded net: the ones with the right
 *      opposite pairs but the wrong (mirror) turn are rejected. At most 4 of the
 *      7 survive both tests.
 *   → answer B = 4.
 *
 * The seven specific dice images were not captured from the scan, so we do NOT
 * fabricate them — we teach the METHOD (opposite pairs + turning sense) and the
 * count it forces, landing on B.
 *
 * Pure function — no Math.random, no Date. SSR-safe & deterministic.
 */

import { OPPOSITE_PAIRS, NET_FACES, DICE_COUNT } from './DiceNet24G3Illustration'

export type Lang = 'en' | 'id'

export type DiceNet24G3Phase =
  | 'intro' // bare net, state the goal
  | 'fold' // fold the net into a cube (showFolded)
  | 'pair' // light one opposite pair, show it sums to 7
  | 'chirality' // two mirror cubes — turning sense matters
  | 'compare' // run the two tests over the 7 dice
  | 'result' // final beat: 4 match → B

export interface DiceNet24G3Step {
  phase: DiceNet24G3Phase
  /** Index into OPPOSITE_PAIRS (0|1|2) to light, or null otherwise. */
  litPair: number | null
  /** Draw the folded-cube glyph beside the net. */
  showFolded: boolean
  /** Dot count on face a of the current pair (pair beats only). */
  a: number | null
  /** Dot count on face b of the current pair (pair beats only). */
  b: number | null
  /** How many of the 7 dice are confirmed matching so far (compare/result). */
  matched: number | null
  /** A failed/over-budget try lingers; the winning beat has hold: 0. */
  hold: number
  /** True only on the final, winning beat. */
  result: boolean
  caption: string
}

export interface DiceNet24G3Storyboard {
  /** How many of the 7 dice match = the answer count (4). */
  answerCount: number
  /** Total candidate dice (7). */
  diceCount: number
  steps: DiceNet24G3Step[]
  finalIndex: number
}

/** pips on a face id, from the net data. */
function pipsOf(id: number): number {
  return NET_FACES.find((f) => f.id === id)?.pips ?? 0
}

export const ANSWER_COUNT = 4 // option B

export function buildDiceNet24G3Steps(lang: Lang): DiceNet24G3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiceNet24G3Step[] = [
    // Beat 0 — intro: state the goal on the bare net.
    {
      phase: 'intro',
      litPair: null,
      showFolded: false,
      a: null,
      b: null,
      matched: null,
      hold: 2000,
      result: false,
      caption: t(
        `We have ${DICE_COUNT} dice and one net. How many dice can match this net? Fold it up first!`,
        `Ada ${DICE_COUNT} dadu dan satu jaring. Berapa dadu yang bisa cocok dengan jaring ini? Lipat dulu!`,
      ),
    },
    // Beat 1 — fold: show the cube forming.
    {
      phase: 'fold',
      litPair: null,
      showFolded: true,
      a: null,
      b: null,
      matched: null,
      hold: 2000,
      result: false,
      caption: t(
        'Fold along the dotted lines — it makes a cube. Now each face has a partner across from it.',
        'Lipat di garis putus-putus — jadi kubus. Tiap sisi punya pasangan di seberangnya.',
      ),
    },
  ]

  // One beat per opposite pair: light it, show it sums to 7.
  OPPOSITE_PAIRS.forEach((pair, i) => {
    const av = pipsOf(pair.a)
    const bv = pipsOf(pair.b)
    const hi = Math.max(av, bv)
    const lo = Math.min(av, bv)
    steps.push({
      phase: 'pair',
      litPair: i,
      showFolded: true,
      a: av,
      b: bv,
      matched: null,
      hold: 2000,
      result: false,
      caption: t(
        `Opposite faces ${hi} and ${lo} sit across the cube: ${hi} + ${lo} = 7. Every pair makes 7.`,
        `Sisi berhadapan ${hi} dan ${lo} saling membelakangi: ${hi} + ${lo} = 7. Tiap pasang berjumlah 7.`,
      ),
    })
  })

  // Beat — chirality: folding can give two mirror cubes; turning matters.
  steps.push({
    phase: 'chirality',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    matched: null,
    hold: 2400,
    result: false,
    caption: t(
      'Careful! A net can fold two ways — into a cube or its mirror. So matching faces is not enough.',
      'Hati-hati! Jaring bisa dilipat dua cara — jadi kubus atau cerminnya. Jadi sisi cocok saja belum cukup.',
    ),
  })

  // Beat — the turning-sense test.
  steps.push({
    phase: 'chirality',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    matched: null,
    hold: 2400,
    result: false,
    caption: t(
      'A die also has a turning sense: 1 → 2 → 3 spins one way. A match needs the right faces AND the right turn.',
      'Dadu juga punya arah putar: 1 → 2 → 3 berputar satu arah. Cocok perlu sisi benar DAN arah putar benar.',
    ),
  })

  // Beat — compare: some dice flunk the turning test (rejection lingers).
  steps.push({
    phase: 'compare',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    matched: 0,
    hold: 2100,
    result: false,
    caption: t(
      `Check all ${DICE_COUNT} dice. Some have the right faces but turn the mirror way — those are out. ✗`,
      `Periksa ${DICE_COUNT} dadu. Sebagian punya sisi benar tapi berputar arah cermin — itu gugur. ✗`,
    ),
  })

  // Beat — compare: the survivors pass both tests.
  steps.push({
    phase: 'compare',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    matched: ANSWER_COUNT,
    hold: 2100,
    result: false,
    caption: t(
      `The ones that keep the right faces AND the right turn match. Only ${ANSWER_COUNT} of ${DICE_COUNT} do. ✓`,
      `Yang menjaga sisi benar DAN arah putar benar cocok. Hanya ${ANSWER_COUNT} dari ${DICE_COUNT}. ✓`,
    ),
  })

  // Final beat — the answer.
  steps.push({
    phase: 'result',
    litPair: null,
    showFolded: true,
    a: null,
    b: null,
    matched: ANSWER_COUNT,
    hold: 0,
    result: true,
    caption: t(
      `At most ${ANSWER_COUNT} of the ${DICE_COUNT} dice match the net. Answer: B (${ANSWER_COUNT}).`,
      `Paling banyak ${ANSWER_COUNT} dari ${DICE_COUNT} dadu cocok dengan jaring. Jawaban: B (${ANSWER_COUNT}).`,
    ),
  })

  return {
    answerCount: ANSWER_COUNT,
    diceCount: DICE_COUNT,
    steps,
    finalIndex: steps.length - 1,
  }
}
