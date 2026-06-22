// IKMC-21-PE-Q2 — storyboard for the Kangaroo constellation explainer.
//
// The question: "All stars have a number greater than 3 and their sum is 20."
//
// Star sets:
//   A: 3, 4, 7, 6  — sum=20 but 3 is NOT > 3 → eliminated
//   B: 5, 8, 7      — all > 3, sum=5+8+7=20 → ANSWER
//   C: 3, 7, 2, 5, 8 — contains 3 and 2 → eliminated
//   D: 5, 1, 4, 9   — contains 1 → eliminated
//   E: 9, 2, 9      — contains 2 → eliminated
//
// Teaching walk (eliminate then verify):
//   0. intro   — two rules: every star > 3, AND sum = 20.
//   1. elim_A  — A has a 3 (not > 3) → struck out.
//   2. elim_C  — C has 3 and 2 → struck out.
//   3. elim_D  — D has 1 → struck out.
//   4. elim_E  — E has 2 → struck out.
//   5. verify  — B: 5, 8, 7 — all > 3. 5+8+7=20 ✓
//   6. result  — B is the Kangaroo constellation.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ConstellationPhaseId =
  | 'intro'
  | 'elim_A'
  | 'elim_C'
  | 'elim_D'
  | 'elim_E'
  | 'verify'
  | 'result'

export interface ConstellationBeat {
  phase: ConstellationPhaseId
  /** Which option letter is highlighted in this beat (null = all shown neutrally). */
  focusLabel: string | null
  /** Whether the focused option is being eliminated (shown as crossed-out). */
  eliminating: boolean
  /** Whether the focused option is the correct answer. */
  isAnswer: boolean
  /** Equation/tally shown in the chip. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface ConstellationStoryboard {
  steps: ConstellationBeat[]
  finalIndex: number
}

export function buildConstellation2PESteps(lang: Lang): ConstellationStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ConstellationBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      focusLabel: null,
      eliminating: false,
      isAnswer: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Two rules: every star number must be GREATER than 3, AND all star numbers must sum to 20.',
        'Dua aturan: setiap angka bintang harus LEBIH BESAR dari 3, DAN semua angka bintang harus berjumlah 20.',
      ),
    },

    // Beat 1 — eliminate A (has 3)
    {
      phase: 'elim_A',
      focusLabel: 'A',
      eliminating: true,
      isAnswer: false,
      equation: '3 ≤ 3 ✗',
      hold: 2200,
      result: false,
      caption: t(
        'A: stars 3, 4, 7, 6 — contains 3, which is NOT greater than 3. Eliminated!',
        'A: bintang 3, 4, 7, 6 — mengandung 3, yang TIDAK lebih dari 3. Dieliminasi!',
      ),
    },

    // Beat 2 — eliminate C (has 3 and 2)
    {
      phase: 'elim_C',
      focusLabel: 'C',
      eliminating: true,
      isAnswer: false,
      equation: '3 ≤ 3 ✗, 2 ≤ 3 ✗',
      hold: 2200,
      result: false,
      caption: t(
        'C: stars 3, 7, 2, 5, 8 — contains 3 and 2. Both break the rule. Eliminated!',
        'C: bintang 3, 7, 2, 5, 8 — mengandung 3 dan 2. Keduanya melanggar aturan. Dieliminasi!',
      ),
    },

    // Beat 3 — eliminate D (has 1)
    {
      phase: 'elim_D',
      focusLabel: 'D',
      eliminating: true,
      isAnswer: false,
      equation: '1 ≤ 3 ✗',
      hold: 2000,
      result: false,
      caption: t(
        'D: stars 5, 1, 4, 9 — contains 1. Eliminated!',
        'D: bintang 5, 1, 4, 9 — mengandung 1. Dieliminasi!',
      ),
    },

    // Beat 4 — eliminate E (has 2)
    {
      phase: 'elim_E',
      focusLabel: 'E',
      eliminating: true,
      isAnswer: false,
      equation: '2 ≤ 3 ✗',
      hold: 2000,
      result: false,
      caption: t(
        'E: stars 9, 2, 9 — contains 2. Eliminated!',
        'E: bintang 9, 2, 9 — mengandung 2. Dieliminasi!',
      ),
    },

    // Beat 5 — verify B
    {
      phase: 'verify',
      focusLabel: 'B',
      eliminating: false,
      isAnswer: true,
      equation: '5 + 8 + 7 = 20 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'B: stars 5, 8, 7 — all greater than 3 ✓. And 5 + 8 + 7 = 20 ✓. Both rules pass!',
        'B: bintang 5, 8, 7 — semua lebih dari 3 ✓. Dan 5 + 8 + 7 = 20 ✓. Kedua aturan terpenuhi!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      focusLabel: 'B',
      eliminating: false,
      isAnswer: true,
      equation: 'B ✓',
      hold: 0,
      result: true,
      caption: t(
        'B is the Kangaroo constellation — all stars are greater than 3 and their sum is exactly 20.',
        'B adalah rasi bintang Kanguru — semua bintang lebih dari 3 dan jumlahnya tepat 20.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
