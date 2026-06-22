// IKMC-22-PE-Q17 — storyboard for the Painted Houses animation.
//
// Problem: two houses, each with 5 numbers summing to 20.
// Some numbers are painted over (white circles).
// Left house shows: 6, 2, 5 → visible sum = 13 → painted circles sum to 7.
// Right house shows: 3, 1 → plus same painted sum (7) → visible total = 11 → ? = 20 − 11 = 9.
//
// Teaching walk (one idea per beat):
//   0. intro    — show both houses; state the rule: each house sums to 20.
//   1. left     — highlight left house; 6 + 2 + 5 = 13; so painted circles = 7.
//   2. right    — focus right house; visible (3 + 1 + 7 painted) = 11.
//   3. find-q   — ? = 20 − 11 = 9.
//   4. result   — answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'left' | 'right' | 'find-q' | 'result'

export interface HouseBeat {
  /** Animation phase id. */
  phase: PhaseId
  /** True when the left house should be highlighted. */
  highlightLeft: boolean
  /** True when the right house should be highlighted. */
  highlightRight: boolean
  /** When true, show the equation overlay for the LEFT house. */
  showLeftEq: boolean
  /** When true, show the equation overlay for the RIGHT house visible-sum. */
  showRightEq: boolean
  /** When true, reveal the answer circle in the right house (? → 9). */
  showAnswer: boolean
  /** Equation / maths text shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface HouseStoryboard {
  steps: HouseBeat[]
  finalIndex: number
}

export function buildPaintedHouses17PESteps(lang: Lang): HouseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HouseBeat[] = [
    // Beat 0 — intro: show both houses, state the rule
    {
      phase: 'intro',
      highlightLeft: false,
      highlightRight: false,
      showLeftEq: false,
      showRightEq: false,
      showAnswer: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Each house holds five numbers. All five must add up to 20.',
        'Setiap rumah memiliki lima angka. Kelima angka harus berjumlah 20.',
      ),
    },

    // Beat 1 — left house: 6+2+5=13, painted sum=7
    {
      phase: 'left',
      highlightLeft: true,
      highlightRight: false,
      showLeftEq: true,
      showRightEq: false,
      showAnswer: false,
      equation: '6 + 2 + 5 = 13',
      hold: 2600,
      result: false,
      caption: t(
        'Left house: 6 + 2 + 5 = 13. The two painted circles must sum to 20 − 13 = 7.',
        'Rumah kiri: 6 + 2 + 5 = 13. Dua lingkaran yang dicat harus berjumlah 20 − 13 = 7.',
      ),
    },

    // Beat 2 — right house: show that painted circles also sum to 7
    {
      phase: 'right',
      highlightLeft: false,
      highlightRight: true,
      showLeftEq: false,
      showRightEq: true,
      showAnswer: false,
      equation: '3 + 7 + 1 = 11',
      hold: 2600,
      result: false,
      caption: t(
        'Right house: visible numbers are 3 and 1, plus the same two painted circles summing to 7. Total visible = 3 + 7 + 1 = 11.',
        'Rumah kanan: angka yang terlihat adalah 3 dan 1, ditambah dua lingkaran cat yang berjumlah 7. Total terlihat = 3 + 7 + 1 = 11.',
      ),
    },

    // Beat 3 — find the question mark
    {
      phase: 'find-q',
      highlightLeft: false,
      highlightRight: true,
      showLeftEq: false,
      showRightEq: true,
      showAnswer: false,
      equation: '? = 20 − 11 = 9',
      hold: 2600,
      result: false,
      caption: t(
        'The five numbers must sum to 20. The four known values sum to 11. So the hidden number = 20 − 11 = 9.',
        'Kelima angka harus berjumlah 20. Empat nilai yang diketahui berjumlah 11. Jadi angka tersembunyi = 20 − 11 = 9.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightLeft: false,
      highlightRight: true,
      showLeftEq: false,
      showRightEq: false,
      showAnswer: true,
      equation: '9 → D',
      hold: 0,
      result: true,
      caption: t(
        'The hidden number is 9 — answer D.',
        'Angka tersembunyi adalah 9 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
