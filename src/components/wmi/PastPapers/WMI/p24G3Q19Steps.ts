import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q19_NODES, Q19_SOLVED } from './P24G3Q19Illustration'

// WMI-24P3A-Q19 storyboard.
//
// Target cycle: A --(+23)--> B --(x4)--> C --(-26)--> D --(/6)--> E --(x0)--> A.
// The last arrow E --(x0)--> A forces A = 0 (anything times 0 is 0). From there:
//   B = 0 + 23 = 23
//   C = 23 x 4 = 92
//   D = 92 - 26 = 66
//   E = 66 / 6 = 11
// Check: E x 0 = 0 = A (cycle closes). B + E = 23 + 11 = 34 → choice D.

export interface Q19Step {
  /** Solved values to reveal so far (length 5, index by node A..E; null = unknown). */
  targetValues: Array<string | null>
  /** Node to spotlight (0..4). */
  spotlight?: number
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answerValue: string
  answerLabel: string
  steps: Q19Step[]
  finalIndex: number
}

const NONE: Array<string | null> = [null, null, null, null, null]

function reveal(upTo: number): Array<string | null> {
  // reveal nodes whose solved value index < upTo, in solve order A,B,C,D,E
  return Q19_SOLVED.map((v, i) => (i < upTo ? v : null))
}

export function buildP24G3Q19Steps(lang: Lang): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  void Q19_NODES

  const steps: Q19Step[] = [
    {
      targetValues: NONE,
      hold: 1900,
      result: false,
      caption: t(
        'Every arrow must be correct all the way around the cycle.',
        'Setiap panah harus benar mengelilingi seluruh siklus.',
      ),
    },
    {
      targetValues: reveal(1), // A = 0
      spotlight: 0,
      hold: 2100,
      result: false,
      caption: t(
        'The last arrow is E ×0 → A. Anything × 0 = 0, so A = 0.',
        'Panah terakhir E ×0 → A. Apa pun × 0 = 0, jadi A = 0.',
      ),
    },
    {
      targetValues: reveal(2), // B = 23
      spotlight: 1,
      hold: 2000,
      result: false,
      caption: t('A +23 → B: 0 + 23 = 23, so B = 23.', 'A +23 → B: 0 + 23 = 23, jadi B = 23.'),
    },
    {
      targetValues: reveal(3), // C = 92
      spotlight: 2,
      hold: 1900,
      result: false,
      caption: t('B ×4 → C: 23 × 4 = 92, so C = 92.', 'B ×4 → C: 23 × 4 = 92, jadi C = 92.'),
    },
    {
      targetValues: reveal(4), // D = 66
      spotlight: 3,
      hold: 1900,
      result: false,
      caption: t('C −26 → D: 92 − 26 = 66, so D = 66.', 'C −26 → D: 92 − 26 = 66, jadi D = 66.'),
    },
    {
      targetValues: reveal(5), // E = 11
      spotlight: 4,
      hold: 2100,
      result: false,
      caption: t('D ÷6 → E: 66 ÷ 6 = 11, so E = 11. Check: 11 × 0 = 0 = A. ✓', 'D ÷6 → E: 66 ÷ 6 = 11, jadi E = 11. Cek: 11 × 0 = 0 = A. ✓'),
    },
    {
      targetValues: reveal(5),
      hold: 0,
      result: true,
      caption: t('B + E = 23 + 11 = 34 — answer D.', 'B + E = 23 + 11 = 34 — jawaban D.'),
    },
  ]

  return {
    answerValue: '34',
    answerLabel: 'D',
    steps,
    finalIndex: steps.length - 1,
  }
}
