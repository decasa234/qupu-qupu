// Beat-by-beat steps for IKMC-22-EC-Q12 explainer.
//
// Strategy: check every row sum → find the bad row → check every col sum →
// find the bad col → the shared cell (row 1, col 0 = "3") is the mistake;
// it must be 2.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SumGrid12ECPhase =
  | 'show'
  | 'row1'
  | 'row2'
  | 'row3'
  | 'col1'
  | 'col2'
  | 'col3'
  | 'cross'
  | 'result'

export interface SumGrid12ECStep {
  phase: SumGrid12ECPhase
  highlightRows: number[]
  highlightCol: number | null
  ringMistake: boolean
  showCorrection: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SumGrid12ECStory {
  steps: SumGrid12ECStep[]
  finalIndex: number
}

export function buildSumGrid12ECSteps(lang: Lang): SumGrid12ECStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SumGrid12ECStep[] = [
    {
      phase: 'show',
      highlightRows: [],
      highlightCol: null,
      ringMistake: false,
      showCorrection: false,
      hold: 1800,
      result: false,
      caption: t(
        'Mosif wants every row and every column to have the same total. Find the one wrong number.',
        'Mosif ingin setiap baris dan kolom memiliki jumlah yang sama. Temukan satu angka yang salah.',
      ),
    },
    {
      phase: 'row1',
      highlightRows: [0],
      highlightCol: null,
      ringMistake: false,
      showCorrection: false,
      hold: 2000,
      result: false,
      caption: t(
        'Row 1: 9 + 1 + 5 = 15. ✓',
        'Baris 1: 9 + 1 + 5 = 15. ✓',
      ),
    },
    {
      phase: 'row2',
      highlightRows: [1],
      highlightCol: null,
      ringMistake: false,
      showCorrection: false,
      hold: 2200,
      result: false,
      caption: t(
        'Row 2: 3 + 7 + 6 = 16 — one too many! ✗  Target is 15.',
        'Baris 2: 3 + 7 + 6 = 16 — lebih satu! ✗  Target adalah 15.',
      ),
    },
    {
      phase: 'row3',
      highlightRows: [2],
      highlightCol: null,
      ringMistake: false,
      showCorrection: false,
      hold: 2000,
      result: false,
      caption: t(
        'Row 3: 4 + 7 + 4 = 15. ✓  So the mistake is somewhere in row 2.',
        'Baris 3: 4 + 7 + 4 = 15. ✓  Jadi kesalahan ada di baris 2.',
      ),
    },
    {
      phase: 'col1',
      highlightRows: [],
      highlightCol: 0,
      ringMistake: false,
      showCorrection: false,
      hold: 2200,
      result: false,
      caption: t(
        'Column 1: 9 + 3 + 4 = 16 — one too many! ✗  The mistake is also in column 1.',
        'Kolom 1: 9 + 3 + 4 = 16 — lebih satu! ✗  Kesalahan juga ada di kolom 1.',
      ),
    },
    {
      phase: 'col2',
      highlightRows: [],
      highlightCol: 1,
      ringMistake: false,
      showCorrection: false,
      hold: 2000,
      result: false,
      caption: t(
        'Column 2: 1 + 7 + 7 = 15. ✓',
        'Kolom 2: 1 + 7 + 7 = 15. ✓',
      ),
    },
    {
      phase: 'col3',
      highlightRows: [],
      highlightCol: 2,
      ringMistake: false,
      showCorrection: false,
      hold: 2000,
      result: false,
      caption: t(
        'Column 3: 5 + 6 + 4 = 15. ✓  So the mistake is in column 1.',
        'Kolom 3: 5 + 6 + 4 = 15. ✓  Jadi kesalahan ada di kolom 1.',
      ),
    },
    {
      phase: 'cross',
      highlightRows: [1],
      highlightCol: 0,
      ringMistake: true,
      showCorrection: false,
      hold: 2400,
      result: false,
      caption: t(
        'Row 2 and column 1 are both wrong — their shared cell is row 2, column 1: the number 3.',
        'Baris 2 dan kolom 1 keduanya salah — sel yang mereka bagikan adalah baris 2, kolom 1: angka 3.',
      ),
    },
    {
      phase: 'result',
      highlightRows: [],
      highlightCol: null,
      ringMistake: false,
      showCorrection: true,
      hold: 0,
      result: true,
      caption: t(
        'Change 3 → 2. Now row 2: 2+7+6=15 ✓ and col 1: 9+2+4=15 ✓. Answer: B (the number 3).',
        'Ganti 3 → 2. Sekarang baris 2: 2+7+6=15 ✓ dan kol 1: 9+2+4=15 ✓. Jawaban: B (angka 3).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
