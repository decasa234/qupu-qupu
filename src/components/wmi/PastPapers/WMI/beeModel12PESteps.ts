// Storyboard for IKMC-23-PE-Q12 (2023 IKMC Pre-Ecolier, question 12).
//
// Raha wants to finish the bee on the left according to the model on the right.
// She needs to win points to unlock parts of the bee.
// How many points does she need to win to complete the bee?
//
// Setup (from figure 2023.imgs/030.jpg):
//   The legend table shows 6 unlockable bee parts with point costs:
//     Part 1 — antenna dot         → 1 point
//     Part 2 — flower antenna head → 2 points
//     Part 3 — curly wire antenna  → 3 points
//     Part 4 — scroll/3-shape tail → 4 points
//     Part 5 — smile mouth         → 5 points
//     Part 6 — sun/eye decoration  → 6 points
//
//   The INCOMPLETE left bee already has: dot (1), curl (3), scroll (4).
//   The left bee is MISSING: flower (2), smile (5), sunEye (6).
//
//   Missing cost = 2 + 5 + 6 = 13 points → Answer E.
//
// Animation beats:
//   0. intro     — show both bees, ask "which parts are missing?"
//   1. compare   — left bee is missing the flower antenna (cost 2)
//   2. compare   — left bee is missing the smile (cost 5)
//   3. compare   — left bee is missing the sun/eye (cost 6)
//   4. sum       — running total: 2 + 5 + 6 = 13
//   5. result    — 13 points → Answer E (green)

export type Lang = 'en' | 'id'

/** Which part is being highlighted on this beat (for the explainer to dim others). */
export type HighlightPart = 'flower' | 'smile' | 'sunEye' | null

export interface BeeModelStep {
  /** Caption text shown below the figure. */
  caption: string
  /** Which missing part to highlight in amber this beat. */
  highlight: HighlightPart
  /** Running cost total shown (null = not yet shown). */
  runningTotal: number | null
  /** Whether this is the final result beat. */
  result: boolean
  /** Auto-advance hold in ms. */
  hold: number
  /** Parts of the LEFT bee to show on this beat (we progressively add them in the explainer). */
  leftPartsShown: ReadonlyArray<'dot' | 'flower' | 'curl' | 'scroll' | 'smile' | 'sunEye'>
}

export interface BeeModelStoryboard {
  steps: BeeModelStep[]
  finalIndex: number
}

export function buildBeeModel12PESteps(lang: Lang): BeeModelStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const BASE_PARTS = ['dot', 'curl', 'scroll'] as const

  const steps: BeeModelStep[] = [
    // Beat 0 — intro: show both bees, no highlights
    {
      highlight: null,
      runningTotal: null,
      result: false,
      hold: 2500,
      leftPartsShown: [...BASE_PARTS],
      caption: t(
        'Compare the left bee to the right model. Which parts are missing from the left bee?',
        'Bandingkan lebah kiri dengan model sebelah kanan. Bagian apa yang belum ada di lebah kiri?',
      ),
    },

    // Beat 1 — flower antenna (cost 2) is missing
    {
      highlight: 'flower',
      runningTotal: 2,
      result: false,
      hold: 2200,
      leftPartsShown: [...BASE_PARTS],
      caption: t(
        'Missing: the flower antenna head — costs 2 points. Running total: 2.',
        'Kurang: kepala antena bunga — biayanya 2 poin. Total sejauh ini: 2.',
      ),
    },

    // Beat 2 — smile (cost 5) is missing
    {
      highlight: 'smile',
      runningTotal: 7,
      result: false,
      hold: 2200,
      leftPartsShown: [...BASE_PARTS],
      caption: t(
        'Missing: the smile — costs 5 points. Running total: 2 + 5 = 7.',
        'Kurang: senyum — biayanya 5 poin. Total sejauh ini: 2 + 5 = 7.',
      ),
    },

    // Beat 3 — sun/eye decoration (cost 6) is missing
    {
      highlight: 'sunEye',
      runningTotal: 13,
      result: false,
      hold: 2200,
      leftPartsShown: [...BASE_PARTS],
      caption: t(
        'Missing: the sun-eye decoration — costs 6 points. Running total: 7 + 6 = 13.',
        'Kurang: hiasan mata matahari — biayanya 6 poin. Total sejauh ini: 7 + 6 = 13.',
      ),
    },

    // Beat 4 — show completed bee (all parts) with cost summary
    {
      highlight: null,
      runningTotal: 13,
      result: false,
      hold: 2000,
      leftPartsShown: ['dot', 'flower', 'curl', 'scroll', 'smile', 'sunEye'],
      caption: t(
        '3 missing parts: flower (2) + smile (5) + sun-eye (6) = 13 points total.',
        '3 bagian kurang: bunga (2) + senyum (5) + mata matahari (6) = 13 poin.',
      ),
    },

    // Beat 5 — result
    {
      highlight: null,
      runningTotal: 13,
      result: true,
      hold: 0,
      leftPartsShown: ['dot', 'flower', 'curl', 'scroll', 'smile', 'sunEye'],
      caption: t(
        'Raha needs 2 + 5 + 6 = 13 points to complete the bee. Answer: E = 13.',
        'Raha membutuhkan 2 + 5 + 6 = 13 poin untuk melengkapi lebah. Jawaban: E = 13.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
