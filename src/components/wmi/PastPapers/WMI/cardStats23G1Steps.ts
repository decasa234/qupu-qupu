import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { CardColor, CardShape } from './CardStats23G1Illustration'

/**
 * WMI-23F1A-Q13 — storyboard for the card-statistics deduction (G1 2023 Final).
 *
 * The 11 visible cards give: 5 squares, 3 circles, 3 triangles; 6 gray, 5 white.
 * The printed tables WANT: square 5, circle 3, triangle 4; gray 7, white 5.
 *
 * One idea per beat:
 *   1 intro    — read the two tally tables (shape + colour).
 *   2 shape    — light the triangle row: table wants 4, only 3 are visible →
 *                the missing card must be a TRIANGLE.
 *   3 colour   — light the gray row: table wants 7, only 6 are visible →
 *                the missing card must be GRAY.
 *   4 result   — gray + triangle = a GRAY TRIANGLE → drop it into the "?" slot
 *                → that is candidate D.
 *
 * Pure (lang) => board; no randomness, no dates — SSR-safe & deterministic.
 */

export type CardStatsPhase = 'intro' | 'shape' | 'colour' | 'result'

export interface CardStatsStep {
  phase: CardStatsPhase
  /** Which shape row/cards to light this beat (only on the shape & result beats). */
  litShape: CardShape | null
  /** Which colour row/cards to light this beat (only on the colour & result beats). */
  litColor: CardColor | null
  /** Drop the deduced gray triangle into the "?" slot (result beat only). */
  revealMissing: boolean
  /** The "wants N, sees M" line shown above the caption (null on intro/result). */
  tally: { wants: number; sees: number } | null
  caption: string
  result: boolean
  /** Hold time in ms; deduction beats linger, the winning reveal holds 0. */
  hold: number
}

export interface CardStatsStoryboard {
  /** Target counts read off the printed tables. */
  wantTriangle: number
  seeTriangle: number
  wantGray: number
  seeGray: number
  /** The answer label (the option letter). */
  answer: string
  steps: CardStatsStep[]
  finalIndex: number
}

// Read straight from the figure so the story can never drift from the picture.
const WANT_TRIANGLE = 4
const SEE_TRIANGLE = 3
const WANT_GRAY = 7
const SEE_GRAY = 6

export function buildCardStats23G1Steps(lang: Lang, answer = 'D'): CardStatsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CardStatsStep[] = [
    {
      phase: 'intro',
      litShape: null,
      litColor: null,
      revealMissing: false,
      tally: null,
      result: false,
      hold: 2000,
      caption: t(
        'Two tables count the cards: by shape, and by colour. The "?" card must make both come true.',
        'Dua tabel menghitung kartu: menurut bentuk, dan menurut warna. Kartu "?" harus membuat keduanya benar.',
      ),
    },
    {
      phase: 'shape',
      litShape: 'triangle',
      litColor: null,
      revealMissing: false,
      tally: { wants: WANT_TRIANGLE, sees: SEE_TRIANGLE },
      result: false,
      hold: 2200,
      caption: t(
        `Triangles: the table wants ${WANT_TRIANGLE}, but only ${SEE_TRIANGLE} are showing. The "?" must be a TRIANGLE.`,
        `Segitiga: tabel ingin ${WANT_TRIANGLE}, tapi hanya ada ${SEE_TRIANGLE}. Jadi "?" pasti SEGITIGA.`,
      ),
    },
    {
      phase: 'colour',
      litShape: null,
      litColor: 'gray',
      revealMissing: false,
      tally: { wants: WANT_GRAY, sees: SEE_GRAY },
      result: false,
      hold: 2200,
      caption: t(
        `Gray: the table wants ${WANT_GRAY}, but only ${SEE_GRAY} are showing. The "?" must be GRAY.`,
        `Abu-abu: tabel ingin ${WANT_GRAY}, tapi hanya ada ${SEE_GRAY}. Jadi "?" pasti ABU-ABU.`,
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
