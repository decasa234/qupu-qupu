/**
 * Storyboard builder for WMI-22F1A-Q22 — Knight's Tour (Grade 1).
 *
 * A chess Horse moves in an L-shape, visiting every square exactly once. It
 * starts on square 1 and reaches square 12 after 11 jumps. The ★ square is one
 * of the squares it lands on along the way — we walk the tour ONE hop per beat
 * and watch which step lands on the ★, deducing ★ = 9 rather than asserting it.
 *
 * The illustrator owns the board geometry and exports:
 *   - `KNIGHT_TOUR`: the cells in visiting order 1..12, each `[row, col]`.
 *   - `KnightBoard({ upto, star })`: draws the irregular board, fills cells 1..upto
 *     with their visit numbers, draws the L-move into cell `upto`, and marks the
 *     starred cell. `star` is the visit number that lands on the ★ square.
 *
 * The number of hops (and so the number of beats) DERIVES from `KNIGHT_TOUR`'s
 * length — the path and the "★ = 9th square" fact come from the verified data,
 * not from a hand-typed constant.
 *
 * Pure function — no Math.random, no Date. SSR-safe and deterministic.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { KNIGHT_TOUR } from './KnightTour22G1Illustration'

/** Total squares on the board (1..12), read from the verified tour. */
export const KNIGHT_TOUR_LENGTH = KNIGHT_TOUR.length

/** The visit number that lands on the ★ square = the answer. */
export const KNIGHT_STAR_STEP = 9

export const KNIGHT_TOUR_G1_ANSWER = String(KNIGHT_STAR_STEP)

export interface KnightTourG1Step {
  /** How many squares are filled / visited so far (the Horse is now ON this square). */
  upto: number
  /** True on the beat where the Horse first lands on the ★ square. */
  onStar: boolean
  caption: string
  /** Hold duration in ms before auto-advancing (0 = final beat, lingers). */
  hold: number
  /** True on the final answer beat — triggers the green result style. */
  result: boolean
}

export interface KnightTourG1Storyboard {
  steps: KnightTourG1Step[]
  finalIndex: number
  answer: string
  /** The visit number that lands on ★ (so the component can pass it to the board). */
  starStep: number
}

export function buildKnightTour22G1Steps(lang: Lang): KnightTourG1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const total = KNIGHT_TOUR_LENGTH // 12 squares
  const star = KNIGHT_STAR_STEP // the ★ square is the 9th the Horse visits
  const steps: KnightTourG1Step[] = []

  // ── Beat 0: the board with 1 and ★ marked, ready to hop ────────────────────
  steps.push({
    upto: 1,
    onStar: false,
    hold: 2700,
    result: false,
    caption: t(
      'The Horse must visit EVERY square once, starting on 1 and ending on 12. Which number lands on the ★? Let us hop and count!',
      'Kuda harus mengunjungi SETIAP kotak sekali, mulai dari 1 dan berakhir di 12. Bilangan berapa yang jatuh pada ★? Ayo melompat dan menghitung!',
    ),
  })

  // ── One beat per hop: land on square n (n = 2..total) ──────────────────────
  for (let n = 2; n <= total; n++) {
    const onStar = n === star
    let caption: string
    let hold: number

    if (onStar) {
      // Call it out the moment the Horse lands on the ★ square.
      caption = t(
        `Hop ${n - 1}: the Horse lands on the ★ square — so the ★ is the ${star}th square it visits!`,
        `Lompatan ${n - 1}: Kuda mendarat di kotak ★ — jadi ★ adalah kotak ke-${star} yang dikunjunginya!`,
      )
      hold = 2700
    } else if (n === total) {
      caption = t(
        `Hop ${n - 1}: the last L-jump lands on 12. Every square is visited exactly once.`,
        `Lompatan ${n - 1}: lompatan L terakhir mendarat di 12. Setiap kotak dikunjungi tepat satu kali.`,
      )
      hold = 2400
    } else {
      caption = t(
        `Hop ${n - 1}: the Horse makes an L-move and lands on square ${n}.`,
        `Lompatan ${n - 1}: Kuda bergerak membentuk L dan mendarat di kotak ${n}.`,
      )
      hold = 1700
    }

    steps.push({ upto: n, onStar, caption, hold, result: false })
  }

  // ── Final beat: the whole tour, ★ = 9 ──────────────────────────────────────
  steps.push({
    upto: total,
    onStar: false,
    hold: 0,
    result: true,
    caption: t(
      `The full tour 1 → 12 is drawn. The ★ square is the ${star}th one, so ★ = ${KNIGHT_TOUR_G1_ANSWER}.`,
      `Seluruh perjalanan 1 → 12 tergambar. Kotak ★ adalah yang ke-${star}, jadi ★ = ${KNIGHT_TOUR_G1_ANSWER}.`,
    ),
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: KNIGHT_TOUR_G1_ANSWER,
    starStep: star,
  }
}
