// IKMC-20-PE-Q14 — storyboard for the coloured-squares animation.
//
// The question: numbers 1–6 placed in six squares (3 blue, 2 yellow, 1 white).
//   Blue sum  = 10
//   Yellow sum = 10
//   White square = ?  → 1 (answer A)
//
// Teaching walk, one idea per beat:
//   0. intro   — show the static grid with "?"; state the problem.
//   1. total   — 1+2+3+4+5+6 = 21 (sum of all six numbers).
//   2. blue    — blue squares must total 10 (highlight blue, show sum).
//   3. yellow  — yellow squares must total 10 (highlight yellow, show sum).
//   4. white   — 21 − 10 − 10 = 1 → white square = 1.
//   5. result  — answer is 1 → choice A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ColorPhaseId = 'intro' | 'total' | 'blue' | 'yellow' | 'white' | 'result'

export interface ColorBeat {
  /** Which animation phase this beat belongs to. */
  phase: ColorPhaseId
  /** Highlight the blue cells (glow border). */
  highlightBlue: boolean
  /** Highlight the yellow cells (glow border). */
  highlightYellow: boolean
  /** Highlight the white cell (glow border). */
  highlightWhite: boolean
  /** Show the running total label "1+2+3+4+5+6=21" below the grid. */
  showTotal: boolean
  /** Show the blue-sum label "blue = 10". */
  showBlueSum: boolean
  /** Show the yellow-sum label "yellow = 10". */
  showYellowSum: boolean
  /** Show the answer in the white cell: "1" instead of "?". */
  showAnswer: boolean
  /** Equation / maths line below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ColorStoryboard {
  steps: ColorBeat[]
  finalIndex: number
}

export function buildColorSquares14PESteps(lang: Lang): ColorStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColorBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightBlue: false,
      highlightYellow: false,
      highlightWhite: false,
      showTotal: false,
      showBlueSum: false,
      showYellowSum: false,
      showAnswer: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Mary places numbers 1–6 in the six squares. Each number is used once. Blue squares sum to 10, yellow squares sum to 10. What goes in the white square?',
        'Mary meletakkan angka 1–6 di enam kotak. Setiap angka dipakai sekali. Kotak biru berjumlah 10, kotak kuning berjumlah 10. Apa yang ada di kotak putih?',
      ),
    },

    // Beat 1 — total of all six numbers
    {
      phase: 'total',
      highlightBlue: false,
      highlightYellow: false,
      highlightWhite: false,
      showTotal: true,
      showBlueSum: false,
      showYellowSum: false,
      showAnswer: false,
      equation: '1+2+3+4+5+6 = 21',
      hold: 2200,
      result: false,
      caption: t(
        'All six numbers (1, 2, 3, 4, 5, 6) add up to 21.',
        'Keenam angka (1, 2, 3, 4, 5, 6) berjumlah 21.',
      ),
    },

    // Beat 2 — blue sum = 10
    {
      phase: 'blue',
      highlightBlue: true,
      highlightYellow: false,
      highlightWhite: false,
      showTotal: true,
      showBlueSum: true,
      showYellowSum: false,
      showAnswer: false,
      equation: 'Blue = 10',
      hold: 2200,
      result: false,
      caption: t(
        'The three blue squares must sum to 10.',
        'Tiga kotak biru harus berjumlah 10.',
      ),
    },

    // Beat 3 — yellow sum = 10
    {
      phase: 'yellow',
      highlightBlue: false,
      highlightYellow: true,
      highlightWhite: false,
      showTotal: true,
      showBlueSum: true,
      showYellowSum: true,
      showAnswer: false,
      equation: 'Yellow = 10',
      hold: 2200,
      result: false,
      caption: t(
        'The two yellow squares must also sum to 10.',
        'Dua kotak kuning juga harus berjumlah 10.',
      ),
    },

    // Beat 4 — white = 21 − 10 − 10 = 1
    {
      phase: 'white',
      highlightBlue: false,
      highlightYellow: false,
      highlightWhite: true,
      showTotal: true,
      showBlueSum: true,
      showYellowSum: true,
      showAnswer: true,
      equation: '21 − 10 − 10 = 1',
      hold: 2400,
      result: false,
      caption: t(
        'Blue + Yellow = 10 + 10 = 20. The white square gets the leftover: 21 − 20 = 1.',
        'Biru + Kuning = 10 + 10 = 20. Kotak putih mendapat sisanya: 21 − 20 = 1.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightBlue: false,
      highlightYellow: false,
      highlightWhite: true,
      showTotal: false,
      showBlueSum: false,
      showYellowSum: false,
      showAnswer: true,
      equation: '1 → A',
      hold: 0,
      result: true,
      caption: t(
        'The white square must contain 1 — answer A.',
        'Kotak putih harus berisi 1 — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
