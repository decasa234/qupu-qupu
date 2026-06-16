// Deterministic storyboard for WMI-25P3A-Q15 (2025 Grade 3 Semifinal).
//
// A cube's 6 faces hold 6 CONSECUTIVE numbers; opposite faces sum to the same
// total. Three faces are given: 5 (top), 2 (front), 6 (right). Six consecutive
// numbers that must include 2, 5 and 6 can only be 2, 3, 4, 5, 6, 7 — they span
// from the smallest given (2) up to one past the largest given (must reach 7 to
// keep the run length 6). Sum = 2+3+4+5+6+7 = 27 (answer C).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const Q15_RUN = [2, 3, 4, 5, 6, 7] as const
export const Q15_SUM = Q15_RUN.reduce((a, b) => a + b, 0) // 27
export const Q15_ANSWER_LABEL = 'C'

export interface Q15Step {
  /** Numbers on the visible faces this beat (top/left/right). */
  top: number | null
  left: number | null
  right: number | null
  /** Show the "3 faces hidden" hint badge. */
  showHidden: boolean
  /** The full consecutive run revealed under the cube (empty before it is fixed). */
  run: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q15Storyboard {
  answer: number
  answerLabel: string
  steps: Q15Step[]
  finalIndex: number
}

export function buildP25G3Q15Steps(lang: Lang): Q15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q15Step[] = [
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: true,
      run: [],
      hold: 1800,
      result: false,
      caption: t(
        'We see only 3 faces: 5, 2 and 6. Three faces are hidden.',
        'Kita hanya lihat 3 sisi: 5, 2 dan 6. Tiga sisi tersembunyi.',
      ),
    },
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: true,
      run: [],
      hold: 2100,
      result: false,
      caption: t(
        'All 6 numbers are consecutive — an unbroken run that must contain 2, 5 and 6.',
        'Keenam bilangan berurutan — deret tak terputus yang harus memuat 2, 5 dan 6.',
      ),
    },
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: true,
      run: [],
      hold: 2200,
      result: false,
      caption: t(
        'From 2 up to 6 is already 5 numbers (2,3,4,5,6). We need 6 in a row.',
        'Dari 2 sampai 6 sudah 5 bilangan (2,3,4,5,6). Kita butuh 6 berurutan.',
      ),
    },
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: false,
      run: [2, 3, 4, 5, 6, 7],
      hold: 2200,
      result: false,
      caption: t(
        'Add one more on top: the run can only be 2, 3, 4, 5, 6, 7.',
        'Tambah satu lagi di atas: deretnya hanya bisa 2, 3, 4, 5, 6, 7.',
      ),
    },
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: false,
      run: [2, 3, 4, 5, 6, 7],
      hold: 2100,
      result: false,
      caption: t(
        'Check: opposite faces pair as 2+7, 3+6, 4+5 — each is 9. Consistent!',
        'Cek: sisi berhadapan berpasangan 2+7, 3+6, 4+5 — masing-masing 9. Cocok!',
      ),
    },
    {
      top: 5,
      left: 2,
      right: 6,
      showHidden: false,
      run: [2, 3, 4, 5, 6, 7],
      hold: 0,
      result: true,
      caption: t(
        `2 + 3 + 4 + 5 + 6 + 7 = ${Q15_SUM} — answer ${Q15_ANSWER_LABEL}.`,
        `2 + 3 + 4 + 5 + 6 + 7 = ${Q15_SUM} — jawaban ${Q15_ANSWER_LABEL}.`,
      ),
    },
  ]

  return {
    answer: Q15_SUM,
    answerLabel: Q15_ANSWER_LABEL,
    steps,
    finalIndex: steps.length - 1,
  }
}
