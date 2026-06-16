import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { CardColor, CardShape } from './CardStats23G2Illustration'

/**
 * WMI-23F2A-Q12 — storyboard for the card-statistics deduction (G2 2023 Final).
 *
 * The 11 visible cards give: 5 squares, 3 circles, 3 triangles; 6 gray, 5 white.
 * The printed tables WANT: square 5, circle 3, triangle 4; gray 7, white 5.
 *
 * One deduction per beat — first pin the SHAPE, then the COLOUR, then combine:
 *   1 intro     — read the two tally tables; the "?" must complete both.
 *   2 shape     — squares 5/5 ✓ and circles 3/3 ✓ are already done, but
 *                 triangles only show 3 of 4 → light the triangle row, 1 short.
 *   3 is-tri    — so the "?" card is a TRIANGLE.
 *   4 colour    — white 5/5 ✓ is done, but gray only shows 6 of 7 → light the
 *                 gray row, 1 short.
 *   5 is-gray   — so the "?" card is GRAY.
 *   6 result    — gray + triangle = a GRAY TRIANGLE → drop it into the "?" slot
 *                 → that is candidate D.
 *
 * Pure (lang, answer) => board; no randomness, no dates — SSR-safe & deterministic.
 */

export type CardStatsPhase = 'intro' | 'shape' | 'is-shape' | 'colour' | 'is-colour' | 'result'

export interface CardStats23G2Step {
  phase: CardStatsPhase
  /** Which shape row/cards to light this beat. */
  litShape: CardShape | null
  /** Which colour row/cards to light this beat. */
  litColor: CardColor | null
  /** Drop the deduced gray triangle into the "?" slot (result beat only). */
  revealMissing: boolean
  /** The "want N − see M = needs" line shown above the caption (deduction beats only). */
  tally: { label: string; wants: number; sees: number } | null
  caption: string
  result: boolean
  /** Hold time in ms; deduction beats linger, the winning reveal holds 0. */
  hold: number
}

export interface CardStats23G2Storyboard {
  /** Target counts read off the printed tables. */
  wantTriangle: number
  seeTriangle: number
  wantGray: number
  seeGray: number
  /** The answer label (the option letter). */
  answer: string
  steps: CardStats23G2Step[]
  finalIndex: number
}

// Read straight from the figure so the story can never drift from the picture.
const WANT_SQUARE = 5
const SEE_SQUARE = 5
const WANT_CIRCLE = 3
const SEE_CIRCLE = 3
const WANT_TRIANGLE = 4
const SEE_TRIANGLE = 3
const WANT_WHITE = 5
const SEE_WHITE = 5
const WANT_GRAY = 7
const SEE_GRAY = 6

export function buildCardStats23G2Steps(lang: Lang, answer = 'D'): CardStats23G2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CardStats23G2Step[] = [
    {
      phase: 'intro',
      litShape: null,
      litColor: null,
      revealMissing: false,
      tally: null,
      result: false,
      hold: 2200,
      caption: t(
        'Two tables count the cards: by SHAPE, and by COLOUR. The "?" card must make both totals come true.',
        'Dua tabel menghitung kartu: menurut BENTUK, dan menurut WARNA. Kartu "?" harus membuat kedua total benar.',
      ),
    },
    {
      phase: 'shape',
      litShape: 'triangle',
      litColor: null,
      revealMissing: false,
      tally: { label: t('triangles', 'segitiga'), wants: WANT_TRIANGLE, sees: SEE_TRIANGLE },
      result: false,
      hold: 2400,
      caption: t(
        `Squares ${SEE_SQUARE}/${WANT_SQUARE} ✓ and circles ${SEE_CIRCLE}/${WANT_CIRCLE} ✓ are done. But triangles show only ${SEE_TRIANGLE} of ${WANT_TRIANGLE} — 1 short!`,
        `Persegi ${SEE_SQUARE}/${WANT_SQUARE} ✓ dan lingkaran ${SEE_CIRCLE}/${WANT_CIRCLE} ✓ sudah pas. Tapi segitiga baru ada ${SEE_TRIANGLE} dari ${WANT_TRIANGLE} — kurang 1!`,
      ),
    },
    {
      phase: 'is-shape',
      litShape: 'triangle',
      litColor: null,
      revealMissing: false,
      tally: null,
      result: false,
      hold: 2100,
      caption: t(
        'So the "?" card must be a TRIANGLE.',
        'Jadi kartu "?" pasti SEGITIGA.',
      ),
    },
    {
      phase: 'colour',
      litShape: null,
      litColor: 'gray',
      revealMissing: false,
      tally: { label: t('gray', 'abu-abu'), wants: WANT_GRAY, sees: SEE_GRAY },
      result: false,
      hold: 2400,
      caption: t(
        `Now colours: white ${SEE_WHITE}/${WANT_WHITE} ✓ is done. But gray shows only ${SEE_GRAY} of ${WANT_GRAY} — 1 short!`,
        `Sekarang warna: putih ${SEE_WHITE}/${WANT_WHITE} ✓ sudah pas. Tapi abu-abu baru ada ${SEE_GRAY} dari ${WANT_GRAY} — kurang 1!`,
      ),
    },
    {
      phase: 'is-colour',
      litShape: null,
      litColor: 'gray',
      revealMissing: false,
      tally: null,
      result: false,
      hold: 2100,
      caption: t(
        'So the "?" card must be GRAY.',
        'Jadi kartu "?" pasti ABU-ABU.',
      ),
    },
    {
      phase: 'result',
      litShape: 'triangle',
      litColor: 'gray',
      revealMissing: true,
      tally: null,
      result: true,
      hold: 0,
      caption: t(
        `Gray + triangle = a gray triangle. That fills the "?" — answer ${answer}.`,
        `Abu-abu + segitiga = segitiga abu-abu. Itu mengisi "?" — jawaban ${answer}.`,
      ),
    },
  ]

  return {
    wantTriangle: WANT_TRIANGLE,
    seeTriangle: SEE_TRIANGLE,
    wantGray: WANT_GRAY,
    seeGray: SEE_GRAY,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
