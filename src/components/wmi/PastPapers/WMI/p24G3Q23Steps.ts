import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q23_ANSWER_LABEL, Q23_CANCEL_CELLS, Q23_GRID1, Q23_GRID2, Q23_RESULT, type Grid3 } from './P24G3Q23Illustration'

// WMI-24P3A-Q23 storyboard.
//
// Rule (proven by the row-1 worked example): the grids add cell by cell as XOR —
// a result cell holds a circle only when exactly ONE grid has one; where BOTH
// have a circle they CANCEL. So for row 2:
//   grid 1 (white): (0,2) (1,1) (1,2) (2,0) (2,1) (2,2)
//   grid 2 (black): (0,0) (1,1) (1,2)         (2,2)
//   both (cancel) : (1,1) (1,2) (2,2)
//   survivors     : (0,0)● (0,2)○ (2,0)○ (2,1)○   -> option C.

export interface Q23Step {
  showResult: boolean
  hi1?: Record<number, 'keep' | 'cancel'>
  hi2?: Record<number, 'keep' | 'cancel'>
  resultGrid?: Grid3
  markAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answerLabel: string
  steps: Q23Step[]
  finalIndex: number
}

const EMPTY: Grid3 = [null, null, null, null, null, null, null, null, null]

// Build the cancel-highlight map for both grids (red rings on the shared cells).
function cancelMap(): Record<number, 'keep' | 'cancel'> {
  const m: Record<number, 'keep' | 'cancel'> = {}
  for (const i of Q23_CANCEL_CELLS) m[i] = 'cancel'
  return m
}

// Survivor-highlight maps (green rings on the cells each grid contributes).
function survivorMap(grid: Grid3): Record<number, 'keep' | 'cancel'> {
  const m: Record<number, 'keep' | 'cancel'> = {}
  grid.forEach((cell, i) => {
    if (cell != null && Q23_RESULT[i] != null) m[i] = 'keep'
  })
  return m
}

export function buildP24G3Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      showResult: false,
      markAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Add the two grids cell by cell. Watch the worked row: where BOTH grids have a circle, it cancels.',
        'Jumlahkan kedua kisi sel demi sel. Lihat baris contoh: di sel yang dipakai KEDUA kisi, lingkaran saling hilang.',
      ),
    },
    {
      showResult: false,
      hi1: cancelMap(),
      hi2: cancelMap(),
      markAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Both grids share the middle pair and bottom-right (red) — those three cells cancel to empty.',
        'Kedua kisi sama-sama isi pasangan tengah dan kanan-bawah (merah) — ketiga sel itu hilang jadi kosong.',
      ),
    },
    {
      showResult: false,
      hi1: survivorMap(Q23_GRID1),
      hi2: survivorMap(Q23_GRID2),
      markAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Only the lone circles survive: black top-left, and whites top-right and bottom-left/center.',
        'Hanya lingkaran sendirian yang bertahan: hitam kiri-atas, dan putih kanan-atas serta kiri/tengah-bawah.',
      ),
    },
    {
      showResult: true,
      resultGrid: EMPTY,
      markAnswer: false,
      hold: 1500,
      result: false,
      caption: t('So the result keeps exactly those four circles.', 'Jadi hasilnya menyimpan tepat keempat lingkaran itu.'),
    },
    {
      showResult: true,
      resultGrid: Q23_RESULT,
      markAnswer: true,
      hold: 0,
      result: true,
      caption: t(`Four circles in that pattern — answer ${Q23_ANSWER_LABEL}.`, `Empat lingkaran dengan pola itu — jawaban ${Q23_ANSWER_LABEL}.`),
    },
  ]

  return {
    answerLabel: Q23_ANSWER_LABEL,
    steps,
    finalIndex: steps.length - 1,
  }
}
