// IKMC-20-EC-Q14 — storyboard for the secret-subtraction animation.
//
// Problem: sum of three original numbers = 50. Karin subtracts the same
// secret from each, getting 24, 13, and 7.
// Solution:
//   1. Sum of results = 24 + 13 + 7 = 44.
//   2. Total reduction = 50 − 44 = 6 over 3 numbers → secret = 6 ÷ 3 = 2.
//   3. Originals = 24+2=26, 13+2=15, 7+2=9.
//   4. Only 9 appears in the choices → answer A.
//
// Beats:
//   0. intro    — blank top row, results shown; state the task.
//   1. sum-res  — highlight results; show 24+13+7=44.
//   2. total    — show 50−44=6 total reduction over 3 numbers.
//   3. secret   — badge reveals "−2"; show secret = 6÷3 = 2.
//   4. originals— fill in top row: 26, 15, 9 (highlight all).
//   5. result   — highlight the "9" box (the answer); show "9 → A".
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SubPhase = 'intro' | 'sum-res' | 'total' | 'secret' | 'originals' | 'result'

export interface SubBeat {
  /** Animation phase. */
  phase: SubPhase
  /** Override for the "−?" badge (null = show "−?"). */
  secret: number | null
  /** Values shown in top row [left, middle, right]; null = blank □. */
  topValues: [number | null, number | null, number | null]
  /** Indices of top boxes that are highlighted (blue). */
  topHighlight: number[]
  /** Indices of top boxes shown as the answer (green). */
  topAnswer: number[]
  /** Indices of bottom boxes that are highlighted (sky-blue). */
  bottomHighlight: number[]
  /** Equation string shown below figure ('' = none). */
  equation: string
  /** Caption. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface SubStoryboard {
  steps: SubBeat[]
  finalIndex: number
}

/** The three result values in order. */
export const R = [24, 13, 7] as const

/** The sum of the three results. */
export const SUM_R = R[0] + R[1] + R[2]  // 44

/** The original total. */
export const TOTAL = 50

/** The secret number. */
export const SECRET = (TOTAL - SUM_R) / 3  // 2

/** The three original numbers in order. */
export const ORIGINALS = [R[0] + SECRET, R[1] + SECRET, R[2] + SECRET] as const  // 26, 15, 9

/** Index of the original that matches answer A (9). */
export const ANSWER_INDEX = 2  // 7 + 2 = 9

export function buildSubtract14ECSteps(lang: Lang): SubStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SubBeat[] = [
    // Beat 0 — intro: blank top row, results visible; state the task.
    {
      phase: 'intro',
      secret: null,
      topValues: [null, null, null],
      topHighlight: [],
      topAnswer: [],
      bottomHighlight: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        `The same secret number was subtracted from each of three numbers. The results are ${R[0]}, ${R[1]}, and ${R[2]}. The three originals sum to ${TOTAL}.`,
        `Angka rahasia yang sama dikurangkan dari masing-masing tiga angka. Hasilnya adalah ${R[0]}, ${R[1]}, dan ${R[2]}. Ketiga angka asli berjumlah ${TOTAL}.`,
      ),
    },

    // Beat 1 — sum-res: highlight all three results; show their sum.
    {
      phase: 'sum-res',
      secret: null,
      topValues: [null, null, null],
      topHighlight: [],
      topAnswer: [],
      bottomHighlight: [0, 1, 2],
      equation: `${R[0]} + ${R[1]} + ${R[2]} = ${SUM_R}`,
      hold: 2400,
      result: false,
      caption: t(
        `Add the three results: ${R[0]} + ${R[1]} + ${R[2]} = ${SUM_R}.`,
        `Tambahkan ketiga hasil: ${R[0]} + ${R[1]} + ${R[2]} = ${SUM_R}.`,
      ),
    },

    // Beat 2 — total: compare sum-of-results with original total.
    {
      phase: 'total',
      secret: null,
      topValues: [null, null, null],
      topHighlight: [],
      topAnswer: [],
      bottomHighlight: [0, 1, 2],
      equation: `${TOTAL} − ${SUM_R} = ${TOTAL - SUM_R}`,
      hold: 2400,
      result: false,
      caption: t(
        `The originals sum to ${TOTAL}, results sum to ${SUM_R}. Total reduction = ${TOTAL} − ${SUM_R} = ${TOTAL - SUM_R}, across ${R.length} numbers.`,
        `Angka asli berjumlah ${TOTAL}, hasil berjumlah ${SUM_R}. Total pengurangan = ${TOTAL} − ${SUM_R} = ${TOTAL - SUM_R}, untuk ${R.length} angka.`,
      ),
    },

    // Beat 3 — secret: reveal the secret in the badge.
    {
      phase: 'secret',
      secret: SECRET,
      topValues: [null, null, null],
      topHighlight: [],
      topAnswer: [],
      bottomHighlight: [],
      equation: `${TOTAL - SUM_R} ÷ ${R.length} = ${SECRET}`,
      hold: 2400,
      result: false,
      caption: t(
        `${TOTAL - SUM_R} reduction shared by ${R.length} numbers → secret = ${TOTAL - SUM_R} ÷ ${R.length} = ${SECRET}.`,
        `Pengurangan ${TOTAL - SUM_R} dibagi ${R.length} angka → rahasia = ${TOTAL - SUM_R} ÷ ${R.length} = ${SECRET}.`,
      ),
    },

    // Beat 4 — originals: fill in the three original values.
    {
      phase: 'originals',
      secret: SECRET,
      topValues: [ORIGINALS[0], ORIGINALS[1], ORIGINALS[2]],
      topHighlight: [0, 1, 2],
      topAnswer: [],
      bottomHighlight: [],
      equation: `+${SECRET} → ${ORIGINALS[0]}, ${ORIGINALS[1]}, ${ORIGINALS[2]}`,
      hold: 2400,
      result: false,
      caption: t(
        `Add ${SECRET} back to each result: ${R[0]}+${SECRET}=${ORIGINALS[0]}, ${R[1]}+${SECRET}=${ORIGINALS[1]}, ${R[2]}+${SECRET}=${ORIGINALS[2]}.`,
        `Tambahkan ${SECRET} ke setiap hasil: ${R[0]}+${SECRET}=${ORIGINALS[0]}, ${R[1]}+${SECRET}=${ORIGINALS[1]}, ${R[2]}+${SECRET}=${ORIGINALS[2]}.`,
      ),
    },

    // Beat 5 — result: highlight the answer (9).
    {
      phase: 'result',
      secret: SECRET,
      topValues: [ORIGINALS[0], ORIGINALS[1], ORIGINALS[2]],
      topHighlight: [],
      topAnswer: [ANSWER_INDEX],
      bottomHighlight: [ANSWER_INDEX],
      equation: `${ORIGINALS[ANSWER_INDEX]} → A`,
      hold: 0,
      result: true,
      caption: t(
        `${ORIGINALS[ANSWER_INDEX]} appears in the choices — answer A.`,
        `${ORIGINALS[ANSWER_INDEX]} muncul di antara pilihan — jawaban A.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
