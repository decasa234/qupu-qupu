import type { StickerType } from './Stickers17ECIllustration'
import { SOLVED_PLACEMENT, ANSWER_SQUARE } from './Stickers17ECIllustration'

// stickers17ECSteps — IKMC-21-EC-Q17
//
// Logic puzzle: 5 stickers (triangle, circle, star, flower, apple) on a
// numbered strip (1–5) under three constraints:
//   (1) apple is on square 1
//   (2) star is NOT on square 5
//   (3) flower is adjacent to BOTH circle AND triangle
//
// Deduction chain:
//   A. Fix apple at sq 1.
//   B. Flower must have a neighbour on each side → flower cannot be at 1 or 5.
//      If flower at 2, neighbours are 1(apple) and 3 — only one non-apple → ✗
//      If flower at 3, neighbours are 2 and 4 → circle and triangle fill 2&4,
//         leaving star at 5 — but star≠5 → ✗
//      If flower at 4, neighbours are 3 and 5 → circle and triangle fill 3&5,
//         leaving star at 2 ≠ 5 → ✓ — unique solution.
//   C. Final: apple(1), star(2), circle(3), flower(4), triangle(5)  [or circle/triangle swapped at 3/5 — both valid, both give flower@4]
//
// Answer: 4 (D)

export type Lang = 'en' | 'id'

export interface StickerStep {
  /** Stickers placed so far in this beat (1-based square → sticker). */
  placement: Partial<Record<number, StickerType>>
  /** Squares to highlight (blue tint). */
  highlighted: number[]
  /** Show green answer ring on sq 4. */
  answerRing: boolean
  caption: string
  /** Hold duration in ms (0 = auto-advance last beat stays). */
  hold: number
  /** True on the final beat — triggers green styling. */
  result: boolean
}

export interface StickerStoryboard {
  steps: StickerStep[]
  finalIndex: number
  /** "4" */
  answer: string
  /** "square 4" / "kotak 4" */
  answerPhrase: string
}

export function buildStickers17ECSteps(lang: Lang): StickerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer = String(ANSWER_SQUARE) // "4"
  const answerPhrase = t(`square ${ANSWER_SQUARE}`, `kotak ${ANSWER_SQUARE}`)

  const steps: StickerStep[] = [
    // Beat 0: problem state — blank strip, all rules shown
    {
      placement: {},
      highlighted: [],
      answerRing: false,
      hold: 2600,
      result: false,
      caption: t(
        'Eva places 5 different stickers on squares 1–5. Three rules tell us where each goes.',
        'Eva menempatkan 5 stiker berbeda di kotak 1–5. Tiga aturan menentukan posisinya.',
      ),
    },
    // Beat 1: fix apple at square 1 (rule A)
    {
      placement: { 1: 'apple' },
      highlighted: [1],
      answerRing: false,
      hold: 2800,
      result: false,
      caption: t(
        'Rule: apple is on square 1. Fixed!',
        'Aturan: apel ada di kotak 1. Sudah pasti!',
      ),
    },
    // Beat 2: flower can't be at 2 (only one non-apple neighbour)
    {
      placement: { 1: 'apple' },
      highlighted: [2],
      answerRing: false,
      hold: 3000,
      result: false,
      caption: t(
        'Can flower go on square 2? Its neighbours are square 1 (apple) and square 3 — only one free neighbour, but flower needs two (circle AND triangle). ✗',
        'Bisakah bunga di kotak 2? Tetangganya adalah kotak 1 (apel) dan kotak 3 — hanya 1 tetangga bebas, tapi bunga butuh dua (lingkaran DAN segitiga). ✗',
      ),
    },
    // Beat 3: flower can't be at 3 (would force star to sq 5)
    {
      placement: { 1: 'apple' },
      highlighted: [3, 5],
      answerRing: false,
      hold: 3200,
      result: false,
      caption: t(
        'Can flower go on square 3? Then circle and triangle fill squares 2 and 4, leaving star on square 5 — but rule says star ≠ square 5! ✗',
        'Bisakah bunga di kotak 3? Maka lingkaran dan segitiga mengisi kotak 2 dan 4, menyisakan bintang di kotak 5 — tapi aturan bilang bintang bukan di kotak 5! ✗',
      ),
    },
    // Beat 4: flower must go at 4
    {
      placement: { 1: 'apple' },
      highlighted: [3, 4, 5],
      answerRing: false,
      hold: 3000,
      result: false,
      caption: t(
        'Flower on square 4! Neighbours are square 3 and square 5 — both free for circle and triangle. And star lands on square 2 (not 5). All rules work! ✓',
        'Bunga di kotak 4! Tetangganya adalah kotak 3 dan kotak 5 — bebas untuk lingkaran dan segitiga. Dan bintang di kotak 2 (bukan 5). Semua aturan terpenuhi! ✓',
      ),
    },
    // Beat 5: reveal full solution
    {
      placement: { ...SOLVED_PLACEMENT },
      highlighted: [],
      answerRing: false,
      hold: 2600,
      result: false,
      caption: t(
        'Final arrangement: apple(1), star(2), circle(3), flower(4), triangle(5). Every rule is satisfied.',
        'Susunan akhir: apel(1), bintang(2), lingkaran(3), bunga(4), segitiga(5). Semua aturan terpenuhi.',
      ),
    },
    // Beat 6 (final): spotlight the flower on sq 4
    {
      placement: { ...SOLVED_PLACEMENT },
      highlighted: [ANSWER_SQUARE],
      answerRing: true,
      hold: 0,
      result: true,
      caption: t(
        `Flower is on square ${ANSWER_SQUARE} — answer D.`,
        `Bunga ada di kotak ${ANSWER_SQUARE} — jawaban D.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer, answerPhrase }
}
