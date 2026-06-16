import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const LETTERS_ANSWER = 'W and M'

/**
 * WMI-22F1A-Q2 — three letters W, M, I drawn in red on a grid (Grade 1).
 *
 * Each letter is built from straight strokes on the grid:
 *   W — four long slanted strokes.
 *   M — four long slanted strokes (the SAME total length as W).
 *   I — a short top bar + a short vertical stem + a short bottom bar
 *       (the smallest total of the three).
 *
 * Goal: find which letter is drawn with the LONGEST line. We compare in
 * kid terms — count the strokes and see how long each one is:
 *   1. Show all three; we want the one drawn with the longest line.
 *   2. Light I: it is short — a little stem with two little bars. Shortest.
 *   3. Light W: four LONG slanted strokes — much longer than I.
 *   4. Light M: also four LONG slanted strokes — the SAME length as W.
 *   5. Result: W and M are TIED for the longest → answer "W and M".
 *
 * No try is "rejected" arithmetically; instead each beat measures a letter so
 * the tie at the top reads honestly: I is ruled out for being short, then W
 * and M are shown to match.
 */

export type LitLetter = 'W' | 'M' | 'I'

export interface LettersStep {
  /** Letter panel to light this beat (undefined = none lit, all three plain). */
  litLetter?: LitLetter
  caption: string
  /** ms to hold this beat before advancing (0 = final/winning beat, lingers). */
  hold: number
  /** True only on the winning beat — flips the caption box + answer chip to green. */
  result: boolean
}

export interface LettersStoryboard {
  answer: string
  steps: LettersStep[]
  finalIndex: number
}

export function buildLetters22G1Steps(lang: Lang): LettersStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LettersStep[] = [
    {
      litLetter: undefined,
      hold: 2600,
      result: false,
      caption: t(
        'Three red letters: W, M, I. We want the one drawn with the LONGEST line.',
        'Tiga huruf merah: W, M, I. Kita cari yang digambar dengan garis TERPANJANG.',
      ),
    },
    {
      litLetter: 'I',
      hold: 2400,
      result: false,
      caption: t(
        'Look at I: just a little stem with two short bars. That is the SHORTEST of the three.',
        'Lihat I: hanya satu garis tegak dengan dua palang pendek. Itu yang TERPENDEK dari ketiganya.',
      ),
    },
    {
      litLetter: 'W',
      hold: 2400,
      result: false,
      caption: t(
        'Now W: four LONG slanted strokes — way longer than I.',
        'Sekarang W: empat coretan miring PANJANG — jauh lebih panjang dari I.',
      ),
    },
    {
      litLetter: 'M',
      hold: 2400,
      result: false,
      caption: t(
        'Now M: also four LONG slanted strokes — the SAME length as W.',
        'Sekarang M: juga empat coretan miring PANJANG — SAMA panjang dengan W.',
      ),
    },
    {
      litLetter: undefined,
      hold: 0,
      result: true,
      caption: t(
        `W and M tie for the longest line, so the answer is ${LETTERS_ANSWER}.`,
        'W dan M sama-sama paling panjang, jadi jawabannya W dan M.',
      ),
    },
  ]

  return {
    answer: LETTERS_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
