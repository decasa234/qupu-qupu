// IKMC-23-PE-Q10 — storyboard for the coloured-squares counting animation.
//
// Problem: 24 squares total, 9 already coloured (purple).
// Goal: half of 24 = 12 coloured. How many more? 12 − 9 = 3 (answer C).
//
// Teaching beats (one idea per beat):
//   0. intro   — show the grid as-is; state the problem.
//   1. half    — half of 24 = 12 (that is the target).
//   2. count   — count the already-coloured squares: 9.
//   3. diff    — 12 − 9 = 3 more squares needed.
//   4. result  — answer is 3 → choice C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ColorGrid10PhaseId = 'intro' | 'half' | 'count' | 'diff' | 'result'

export interface ColorGrid10Beat {
  /** Which animation phase this beat belongs to. */
  phase: ColorGrid10PhaseId
  /** Highlight the 9 already-coloured cells with a ring. */
  highlightExisting: boolean
  /** Show the 3 "extra" cells that need to be added. */
  showExtra: boolean
  /** Highlight the 3 extra cells with a distinct ring. */
  highlightExtra: boolean
  /** Equation shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ColorGrid10Storyboard {
  steps: ColorGrid10Beat[]
  finalIndex: number
}

/**
 * Three additional squares to colour so the total reaches 12.
 * These are white squares in the original grid — pick three that are
 * easy to point to and do not overlap with the existing 9.
 *
 * Candidates from the 15 white squares: (0,1) (0,3) (0,5)
 * These fill the alternating gaps in row 0 and are the most visually
 * obvious "next" squares to complete the top row.
 */
export const EXTRA_CELLS: Array<[number, number]> = [
  [0, 1],
  [0, 3],
  [0, 5],
]

export function buildColorGrid10PESteps(lang: Lang): ColorGrid10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColorGrid10Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightExisting: false,
      showExtra: false,
      highlightExtra: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'There are 24 squares in total. Suchit has already coloured some of them purple. How many more need to be coloured so that half are coloured?',
        'Ada 24 kotak secara total. Suchit sudah mewarnai beberapa kotak dengan warna ungu. Berapa banyak lagi yang perlu diwarnai agar setengah berwarna?',
      ),
    },

    // Beat 1 — half of 24 = 12
    {
      phase: 'half',
      highlightExisting: false,
      showExtra: false,
      highlightExtra: false,
      equation: t('24 ÷ 2 = 12 target', '24 ÷ 2 = 12 target'),
      hold: 2200,
      result: false,
      caption: t(
        'Half of 24 is 12. So we need exactly 12 coloured squares in total.',
        'Setengah dari 24 adalah 12. Jadi kita perlu tepat 12 kotak berwarna secara total.',
      ),
    },

    // Beat 2 — count already-coloured (9)
    {
      phase: 'count',
      highlightExisting: true,
      showExtra: false,
      highlightExtra: false,
      equation: t('Already coloured: 9', 'Sudah diwarnai: 9'),
      hold: 2400,
      result: false,
      caption: t(
        'Count the purple squares: there are 9 squares already coloured.',
        'Hitung kotak ungu: ada 9 kotak yang sudah diwarnai.',
      ),
    },

    // Beat 3 — 12 − 9 = 3 more needed
    {
      phase: 'diff',
      highlightExisting: false,
      showExtra: true,
      highlightExtra: true,
      equation: t('12 − 9 = 3 more', '12 − 9 = 3 lagi'),
      hold: 2400,
      result: false,
      caption: t(
        'We need 12 but only have 9. So 12 − 9 = 3 more squares need to be coloured.',
        'Kita perlu 12 tapi baru punya 9. Jadi 12 − 9 = 3 kotak lagi perlu diwarnai.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightExisting: false,
      showExtra: true,
      highlightExtra: true,
      equation: t('3 → C', '3 → C'),
      hold: 0,
      result: true,
      caption: t(
        '3 more squares need to be coloured — answer C.',
        '3 kotak lagi perlu diwarnai — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
