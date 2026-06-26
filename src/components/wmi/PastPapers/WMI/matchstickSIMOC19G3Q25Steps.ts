// Steps storyboard for SIMOC-19-G3-Q25 explainer.
//
// Problem: 869 (19 sticks) → move 3 → greatest 4-digit number.
// Answer : 9951 (6+6+5+2 = 19 sticks).
//
// 3-move path:
//   Move 1: E-segment of '8' (pos 1) → B-segment of new pos 2  (8→9)
//   Move 2: E-segment of '6' (pos 2) → C-segment of new pos 4  (6→9)
//   Move 3: B-segment of '9' (pos 3) → B-segment of new pos 4  (9→5, pos4→1)
//
// Freed segments:  E(pos1), E(pos2), B(pos3)  = 3 sticks
// Placed segments: B(pos2), C(pos4), B(pos4)  = 3 sticks → 9951 ✓

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Phase = 'intro' | 'count' | 'move1' | 'move2' | 'move3' | 'result' | 'verify'

export interface SIMOCStep {
  phase: Phase
  /** Digit string to render in the "before" panel (undefined → hide). */
  before?: string[]
  /** Highlighted segment indices removed in this beat (0-based within before array). */
  highlight?: string[]
  /** Digit string to render in the "after" panel (undefined → hide). */
  after?: string[]
  caption: string
  hold: number
  result: boolean
}

export interface SIMOCStoryboard {
  steps: SIMOCStep[]
  finalIndex: number
  answer: string
}

const t = (lang: Lang, en: string, id: string) => (lang === 'id' ? id : en)

export function buildMatchstickSIMOC19G3Q25Steps(lang: Lang): SIMOCStoryboard {
  const steps: SIMOCStep[] = [
    {
      phase: 'intro',
      before: ['8', '6', '9'],
      caption: t(
        lang,
        '869 uses 7 + 6 + 6 = 19 matchsticks.',
        '869 menggunakan 7 + 6 + 6 = 19 batang korek api.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'count',
      before: ['8', '6', '9'],
      caption: t(
        lang,
        'Move exactly 3 sticks to make the greatest 4-digit number.',
        'Pindahkan tepat 3 batang untuk membentuk bilangan 4 digit terbesar.',
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'move1',
      before: ['8', '6', '9'],
      highlight: ['E_0'],
      caption: t(
        lang,
        'Move 1: remove bottom-left of 8 → place as top-right of second digit. 8 becomes 9.',
        'Langkah 1: ambil bawah-kiri dari 8 → letakkan sebagai kanan-atas digit kedua. 8 menjadi 9.',
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'move2',
      before: ['9', '6', '9'],
      highlight: ['E_1'],
      caption: t(
        lang,
        'Move 2: remove bottom-left of 6 → add to new 4th digit. 6 becomes 9.',
        'Langkah 2: ambil bawah-kiri dari 6 → tambahkan ke digit ke-4 baru. 6 menjadi 9.',
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'move3',
      before: ['9', '9', '9'],
      highlight: ['B_2'],
      caption: t(
        lang,
        'Move 3: remove top-right of last 9 → 9 becomes 5; that stick completes the 4th digit "1".',
        'Langkah 3: ambil kanan-atas dari 9 terakhir → 9 menjadi 5; batang itu melengkapi digit ke-4 "1".',
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'result',
      before: ['9', '9', '5'],
      after: ['9', '9', '5', '1'],
      caption: t(
        lang,
        '9951 — four digits, starting with 9!',
        '9951 — empat digit, dimulai dengan 9!',
      ),
      hold: 2600,
      result: false,
    },
    {
      phase: 'verify',
      after: ['9', '9', '5', '1'],
      caption: t(
        lang,
        '9 + 9 + 5 + 1 = 6 + 6 + 5 + 2 = 19 sticks ✓  Greatest 4-digit answer: 9951.',
        '9 + 9 + 5 + 1 = 6 + 6 + 5 + 2 = 19 batang ✓  Jawaban 4 digit terbesar: 9951.',
      ),
      hold: 3200,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: '9951' }
}
