// HKIMO-24-P2H-Q10 — storyboard for the column-addition animation.
//
// Question: AB + BA = 165 (A, B different single digits). Find max B.
// Answer: B = 9 (A = 6, since A+B = 15 and min A with A ≥ 1 is 6).
//
// Teaching walk, one idea per beat:
//   0. intro     — show the column addition; state the two given digits are different.
//   1. expand    — AB = 10A+B, BA = 10B+A → sum = 11(A+B).
//   2. equation  — 11(A+B) = 165 → A+B = 15.
//   3. maximize  — to maximize B, minimize A; A ≥ 1 and A ≠ B.
//   4. result    — A = 6, B = 9; verify 69 + 96 = 165 ✓. Max B = 9.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'expand' | 'equation' | 'maximize' | 'result'

export interface AddBeat {
  phase: PhaseId
  /** Highlight the A/B variable cells (beat ≥ 1). */
  highlightVars: boolean
  /** Show the expansion equation below the grid. */
  showExpansion: boolean
  /** Show the simplified equation A+B=15. */
  showSum: boolean
  /** Highlight that A must be minimized. */
  showMinA: boolean
  /** Show the concrete solution (A=6, B=9). */
  showSolution: boolean
  /** Equation text shown in the caption box ('/' for line break). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface AddStoryboard {
  steps: AddBeat[]
  finalIndex: number
}

export function buildColumnAddHK24P2Q10Steps(lang: Lang): AddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AddBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightVars: false,
      showExpansion: false,
      showSum: false,
      showMinA: false,
      showSolution: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A and B are different single-digit numbers. Their column sum is 165. Find the maximum value of B.',
        'A dan B adalah bilangan satu digit yang berbeda. Jumlah kolomnya adalah 165. Cari nilai maksimum B.',
      ),
    },

    // Beat 1 — expand place values
    {
      phase: 'expand',
      highlightVars: true,
      showExpansion: true,
      showSum: false,
      showMinA: false,
      showSolution: false,
      equation: 'AB + BA = (10A+B) + (10B+A) = 11A + 11B',
      hold: 2500,
      result: false,
      caption: t(
        'AB means 10×A + B, and BA means 10×B + A. Their sum = 11A + 11B = 11(A+B).',
        'AB artinya 10×A + B, dan BA artinya 10×B + A. Jumlahnya = 11A + 11B = 11(A+B).',
      ),
    },

    // Beat 2 — solve for A+B
    {
      phase: 'equation',
      highlightVars: true,
      showExpansion: true,
      showSum: true,
      showMinA: false,
      showSolution: false,
      equation: '11(A+B) = 165  →  A+B = 15',
      hold: 2500,
      result: false,
      caption: t(
        '11(A+B) = 165, divide both sides by 11: A + B = 15.',
        '11(A+B) = 165, bagi kedua sisi dengan 11: A + B = 15.',
      ),
    },

    // Beat 3 — maximize B
    {
      phase: 'maximize',
      highlightVars: true,
      showExpansion: false,
      showSum: true,
      showMinA: true,
      showSolution: false,
      equation: 'A+B = 15,  A ≥ 1,  A ≠ B',
      hold: 2500,
      result: false,
      caption: t(
        'To maximize B, minimize A. Since AB is a 2-digit number, A ≥ 1. Also A ≠ B.',
        'Untuk memaksimalkan B, minimalkan A. Karena AB bilangan 2 digit, A ≥ 1. Juga A ≠ B.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightVars: false,
      showExpansion: false,
      showSum: false,
      showMinA: false,
      showSolution: true,
      equation: '69 + 96 = 165 ✓  →  B = 9',
      hold: 0,
      result: true,
      caption: t(
        'Min A = 6 gives B = 9, and 6 ≠ 9. Check: 69 + 96 = 165 ✓. Maximum B = 9.',
        'A minimum = 6 memberi B = 9, dan 6 ≠ 9. Periksa: 69 + 96 = 165 ✓. Nilai maksimum B = 9.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
