import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLE_COUNTS } from './TrianglePatternG2Illustration'

export type TrianglePatternPhase = 'intro' | 'count' | 'add' | 'result'

export interface TrianglePatternG2Step {
  phase: TrianglePatternPhase
  /** How many of the six counts (3,6,10,15,21,28) are revealed so far. */
  revealed: number
  /** Which picture (1..6) is highlighted this beat, or null. */
  focus: number | null
  caption: string
  hold: number
  result: boolean
}

export interface TrianglePatternG2Storyboard {
  counts: number[]
  answer: number
  steps: TrianglePatternG2Step[]
  finalIndex: number
}

/**
 * Storyboard for WMI-19F2A-Q13: read the counts 3, 6, 10, 15 from the drawn
 * pictures, notice the growing gaps +3, +4, +5, +6, +7, extend to picture (6).
 * Answer C = 28; flag 21 (picture 5) as the trap.
 */
export function buildTrianglePatternG2Steps(lang: Lang): TrianglePatternG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const counts = TRIANGLE_COUNTS // [3, 6, 10, 15, 21, 28]
  const answer = counts[5] // 28

  const steps: TrianglePatternG2Step[] = [
    {
      phase: 'intro',
      revealed: 4,
      focus: null,
      hold: 1700,
      result: false,
      caption: t(
        'Count the small triangles in each picture: 3, 6, 10, 15.',
        'Hitung segitiga kecil di tiap gambar: 3, 6, 10, 15.',
      ),
    },
    {
      phase: 'add',
      revealed: 4,
      focus: 4,
      hold: 2000,
      result: false,
      caption: t(
        'Each step adds one more: +3, +4, +5 (3→6→10→15).',
        'Tiap langkah menambah satu lebih banyak: +3, +4, +5 (3→6→10→15).',
      ),
    },
    {
      phase: 'count',
      revealed: 5,
      focus: 5,
      hold: 2000,
      result: false,
      caption: t(
        'Next gap is +6: picture (5) = 15 + 6 = 21. (Careful — 21 is a trap!)',
        'Selisih berikutnya +6: gambar (5) = 15 + 6 = 21. (Hati-hati — 21 adalah jebakan!)',
      ),
    },
    {
      phase: 'count',
      revealed: 6,
      focus: 6,
      hold: 2100,
      result: false,
      caption: t(
        'Then +7: picture (6) = 21 + 7 = 28.',
        'Lalu +7: gambar (6) = 21 + 7 = 28.',
      ),
    },
    {
      phase: 'result',
      revealed: 6,
      focus: 6,
      hold: 0,
      result: true,
      caption: t(
        'Picture (6) has 28 triangles — the answer is C (28), not 21.',
        'Gambar (6) memiliki 28 segitiga — jawabannya C (28), bukan 21.',
      ),
    },
  ]

  return { counts, answer, steps, finalIndex: steps.length - 1 }
}
