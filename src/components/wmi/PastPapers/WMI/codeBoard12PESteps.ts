// IKMC-21-PE-Q12 — storyboard for the code-board decoding animation.
//
// The question: Tom encodes words using a 4×4 grid.
// Columns A–D, rows 1–4. Code format: column letter then row number.
// e.g. A2 = column A, row 2 = P.
// Decode B3 B2 C4 D2 → M A T H → Answer E (MATH).
//
// Teaching walk, one idea per beat:
//   0. intro    — show the static grid; explain the code format.
//   1. decode1  — B3 → column B, row 3 → M  (highlight cell B3).
//   2. decode2  — B2 → column B, row 2 → A  (highlight cell B2).
//   3. decode3  — C4 → column C, row 4 → T  (highlight cell C4).
//   4. decode4  — D2 → column D, row 2 → H  (highlight cell D2).
//   5. result   — M A T H = MATH → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type DecodePhaseId = 'intro' | 'decode1' | 'decode2' | 'decode3' | 'decode4' | 'result'

export interface DecodeBeat {
  /** Which animation phase this beat belongs to. */
  phase: DecodePhaseId
  /**
   * Index (0-based) of the CODE_SEQUENCE pair that is currently being decoded.
   * -1 means none active (intro / result beats).
   */
  activeCodeIndex: number
  /**
   * Pairs already fully decoded (0-based indices), shown in green.
   * Builds up across beats.
   */
  doneCodeIndices: number[]
  /**
   * Grid cell to highlight in amber during this beat.
   * null means no amber highlight.
   */
  highlightCell: { col: number; row: number } | null
  /**
   * Grid cells to mark as results (green) — accumulates across beats.
   */
  resultCells: { col: number; row: number }[]
  /** Equation / maths line displayed below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface DecodeStoryboard {
  steps: DecodeBeat[]
  finalIndex: number
}

export function buildCodeBoard12PESteps(lang: Lang): DecodeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Decoded letters accumulate — we pass resultCells on each beat
  // B3→M(col1,row2), B2→A(col1,row1), C4→T(col2,row3), D2→H(col3,row1)
  const decoded = [
    { col: 1, row: 2 }, // B3 → M
    { col: 1, row: 1 }, // B2 → A
    { col: 2, row: 3 }, // C4 → T
    { col: 3, row: 1 }, // D2 → H
  ]

  const steps: DecodeBeat[] = [
    // Beat 0 — intro: show the static grid, explain the code format
    {
      phase: 'intro',
      activeCodeIndex: -1,
      doneCodeIndices: [],
      highlightCell: null,
      resultCells: [],
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The code works like a map: the letter gives the COLUMN, the number gives the ROW. Find where they cross.',
        'Kode bekerja seperti peta: huruf menunjukkan KOLOM, angka menunjukkan BARIS. Temukan perpotongannya.',
      ),
    },

    // Beat 1 — decode B3 → column B, row 3 → M
    {
      phase: 'decode1',
      activeCodeIndex: 0,
      doneCodeIndices: [],
      highlightCell: decoded[0],
      resultCells: [],
      equation: 'B3 → col B, row 3 → M',
      hold: 2400,
      result: false,
      caption: t(
        'B3: column B, row 3 → the letter is M.',
        'B3: kolom B, baris 3 → hurufnya adalah M.',
      ),
    },

    // Beat 2 — decode B2 → column B, row 2 → A
    {
      phase: 'decode2',
      activeCodeIndex: 1,
      doneCodeIndices: [0],
      highlightCell: decoded[1],
      resultCells: [decoded[0]],
      equation: 'B2 → col B, row 2 → A',
      hold: 2400,
      result: false,
      caption: t(
        'B2: column B, row 2 → the letter is A.',
        'B2: kolom B, baris 2 → hurufnya adalah A.',
      ),
    },

    // Beat 3 — decode C4 → column C, row 4 → T
    {
      phase: 'decode3',
      activeCodeIndex: 2,
      doneCodeIndices: [0, 1],
      highlightCell: decoded[2],
      resultCells: [decoded[0], decoded[1]],
      equation: 'C4 → col C, row 4 → T',
      hold: 2400,
      result: false,
      caption: t(
        'C4: column C, row 4 → the letter is T.',
        'C4: kolom C, baris 4 → hurufnya adalah T.',
      ),
    },

    // Beat 4 — decode D2 → column D, row 2 → H
    {
      phase: 'decode4',
      activeCodeIndex: 3,
      doneCodeIndices: [0, 1, 2],
      highlightCell: decoded[3],
      resultCells: [decoded[0], decoded[1], decoded[2]],
      equation: 'D2 → col D, row 2 → H',
      hold: 2400,
      result: false,
      caption: t(
        'D2: column D, row 2 → the letter is H.',
        'D2: kolom D, baris 2 → hurufnya adalah H.',
      ),
    },

    // Beat 5 — result: M + A + T + H = MATH → answer E
    {
      phase: 'result',
      activeCodeIndex: -1,
      doneCodeIndices: [0, 1, 2, 3],
      highlightCell: null,
      resultCells: decoded,
      equation: 'M + A + T + H = MATH',
      hold: 0,
      result: true,
      caption: t(
        'Put the letters together: M-A-T-H = MATH — answer E.',
        'Gabungkan huruf-hurufnya: M-A-T-H = MATH — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
