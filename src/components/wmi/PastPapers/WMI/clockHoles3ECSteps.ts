// IKMC-23-EC-Q3 — grey disc with 2 holes over a clock face.
//
// "A gray circle with 2 large holes in it is put on top of a clock-face, as
// shown. The gray circle is turned around its center. Which 2 numbers is it
// possible to see at the same time?"   Answer: B = 5 and 9.
//
// METHOD (deduce, never jump to the answer):
//   1. State the setup: the holes are 4 clock-positions apart.
//   2. Starting position from figure: holes show 1 and 5 (4 apart ✓).
//   3. Rotate — holes slide to 2 and 6, then 3 and 7, etc.
//   4. Try each choice: only 5 and 9 is a valid pair 4 apart.
//   5. Announce answer: 5 and 9 → B.
//
// Bound to breakdown.quantities:
//   GAP = 4  (holes 4 clock-positions apart)
//   ANSWER_A = 5, ANSWER_B = 9  (the valid pair for choice B)
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const GAP = 4          // clock-positions between the two holes
export const ANSWER_A = 5     // answer pair first number
export const ANSWER_B = 9     // answer pair second number
export const ANSWER = 'B'

export interface ClockHolesStep {
  /** Clock-number that hole A is currently pointing at (1–12). */
  holeA: number
  /** Whether to draw highlight rings around the visible numbers. */
  highlightVisible: boolean
  /** When set, green ring around these two numbers on the clock face. */
  answerPair: [number, number] | null
  /** Tone for the arithmetic chip / caption. */
  tone: 'goal' | 'rotate' | 'check' | 'win'
  /** True only on the final winning beat (holds). */
  result: boolean
  /** Running arithmetic line above the figure (null = no chip). */
  math: string | null
  /** Caption text. */
  caption: string
  /** Hold duration in ms (0 = hold indefinitely on this beat). */
  hold: number
}

export interface ClockHolesStoryboard {
  steps: ClockHolesStep[]
  finalIndex: number
}

export function buildClockHolesSteps(lang: Lang): ClockHolesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockHolesStep[] = [
    // Beat 1 — setup: disc has 2 holes, 4 clock-positions apart.
    {
      holeA: 1,
      highlightVisible: false,
      answerPair: null,
      tone: 'goal',
      result: false,
      math: t('Holes are 4 positions apart', 'Lubang berjarak 4 posisi'),
      hold: 2400,
      caption: t(
        'The gray disc has 2 holes. The holes are 4 clock-positions apart from each other.',
        'Cakram abu-abu memiliki 2 lubang. Lubang-lubang berjarak 4 posisi jam satu sama lain.',
      ),
    },
    // Beat 2 — starting position: holes show 1 and 5.
    {
      holeA: 1,
      highlightVisible: true,
      answerPair: null,
      tone: 'rotate',
      result: false,
      math: `1 + 4 = 5`,
      hold: 2200,
      caption: t(
        'Starting position: holes show 1 and 5 (4 apart ✓). As the disc rotates, the pair shifts.',
        'Posisi awal: lubang menampilkan 1 dan 5 (jarak 4 ✓). Saat cakram berputar, pasangan berganti.',
      ),
    },
    // Beat 3 — rotate: holes now at 2 and 6.
    {
      holeA: 2,
      highlightVisible: true,
      answerPair: null,
      tone: 'rotate',
      result: false,
      math: `2 + 4 = 6`,
      hold: 2000,
      caption: t(
        'Rotate one step → holes show 2 and 6.',
        'Putar satu langkah → lubang menampilkan 2 dan 6.',
      ),
    },
    // Beat 4 — rotate: holes at 5 and 9 (the answer pair).
    {
      holeA: 5,
      highlightVisible: true,
      answerPair: null,
      tone: 'rotate',
      result: false,
      math: `5 + 4 = 9`,
      hold: 2200,
      caption: t(
        'Keep rotating → holes show 5 and 9 (5 + 4 = 9). Can we see 5 and 9 at the same time?',
        'Terus berputar → lubang menampilkan 5 dan 9 (5 + 4 = 9). Bisakah kita melihat 5 dan 9 bersamaan?',
      ),
    },
    // Beat 5 — check each choice quickly.
    {
      holeA: 5,
      highlightVisible: false,
      answerPair: null,
      tone: 'check',
      result: false,
      math: t('Check choices', 'Cek pilihan'),
      hold: 2400,
      caption: t(
        'A: 4 & 9 → gap = 5 ✗  B: 5 & 9 → gap = 4 ✓  C: 5 & 10 → gap = 5 ✗  D: 6 & 9 → gap = 3 ✗  E: 7 & 12 → gap = 5 ✗',
        'A: 4 & 9 → jarak = 5 ✗  B: 5 & 9 → jarak = 4 ✓  C: 5 & 10 → jarak = 5 ✗  D: 6 & 9 → jarak = 3 ✗  E: 7 & 12 → jarak = 5 ✗',
      ),
    },
    // Beat 6 — answer: 5 and 9 → B.
    {
      holeA: ANSWER_A,
      highlightVisible: true,
      answerPair: [ANSWER_A, ANSWER_B],
      tone: 'win',
      result: true,
      math: `${ANSWER_A} + 4 = ${ANSWER_B}`,
      hold: 0,
      caption: t(
        `Only 5 and 9 are exactly 4 positions apart. The answer is B: 5 and 9.`,
        `Hanya 5 dan 9 yang berjarak tepat 4 posisi. Jawabannya adalah B: 5 dan 9.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
