import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_SUM, BOTTOM_ROW_SUM, STAR_MIDCOL, TOP_ROW_SUM } from './P22G2Q21Illustration'

// Storyboard for WMI-22P2A-Q21 — fill 1..9, outside numbers are row/column totals.
// The figure marks ★ at the middle column (= 19). Solving the whole grid gives the
// two queried outside sums: top row = 11 and bottom row (◆) = 14 → 11 + 14 = 25 → D.
export interface GridStep {
  revealCells: string[]
  highlightRows: number[]
  highlightCols: number[]
  showStarValue: boolean
  showDiamond: boolean
  showDiamondValue: boolean
  showRowSums: number[]
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface GridStoryboard {
  starMidCol: number
  topRow: number
  bottomRow: number
  answer: number
  steps: GridStep[]
  finalIndex: number
}

export function buildP22G2Q21Steps(lang: Lang): GridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridStep[] = [
    {
      revealCells: [],
      highlightRows: [],
      highlightCols: [],
      showStarValue: false,
      showDiamond: false,
      showDiamondValue: false,
      showRowSums: [],
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Fill 1..9, each once. All nine cells add to 1+2+…+9 = 45.',
        'Isi 1..9, masing-masing sekali. Sembilan sel berjumlah 1+2+…+9 = 45.',
      ),
    },
    {
      revealCells: ['0,0', '0,2'],
      highlightRows: [0],
      highlightCols: [],
      showStarValue: false,
      showDiamond: false,
      showDiamondValue: false,
      showRowSums: [],
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Top row totals 11 with a 5 already there: 2 + 5 + 4 = 11.',
        'Baris atas berjumlah 11 dan sudah ada 5: 2 + 5 + 4 = 11.',
      ),
    },
    {
      revealCells: ['0,0', '0,2'],
      highlightRows: [],
      highlightCols: [1],
      showStarValue: true,
      showDiamond: false,
      showDiamondValue: false,
      showRowSums: [],
      showAnswer: false,
      hold: 2300,
      result: false,
      caption: t(
        `Columns total 45 too: 18 + ★ + 8 = 45, so the middle column ★ = ${STAR_MIDCOL}.`,
        `Kolom juga berjumlah 45: 18 + ★ + 8 = 45, jadi kolom tengah ★ = ${STAR_MIDCOL}.`,
      ),
    },
    {
      revealCells: ['0,0', '0,2', '1,1', '1,2', '2,0', '2,2'],
      highlightRows: [],
      highlightCols: [0, 2],
      showStarValue: true,
      showDiamond: false,
      showDiamondValue: false,
      showRowSums: [],
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Left column 9 + ? = 18 and right column ? = 8 pin the rest of the digits.',
        'Kolom kiri 9 + ? = 18 dan kolom kanan ? = 8 mengunci sisa angkanya.',
      ),
    },
    {
      revealCells: ['0,0', '0,2', '1,1', '1,2', '2,0', '2,2'],
      highlightRows: [0, 2],
      highlightCols: [],
      showStarValue: true,
      showDiamond: true,
      showDiamondValue: true,
      showRowSums: [0, 2],
      showAnswer: false,
      hold: 2300,
      result: false,
      caption: t(
        `Now read the two asked outside sums: top row = ${TOP_ROW_SUM}, bottom row ◆ = ${BOTTOM_ROW_SUM}.`,
        `Sekarang baca dua jumlah luar yang ditanya: baris atas = ${TOP_ROW_SUM}, baris bawah ◆ = ${BOTTOM_ROW_SUM}.`,
      ),
    },
    {
      revealCells: ['0,0', '0,2', '1,1', '1,2', '2,0', '2,2'],
      highlightRows: [0, 2],
      highlightCols: [],
      showStarValue: true,
      showDiamond: true,
      showDiamondValue: true,
      showRowSums: [0, 2],
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `${TOP_ROW_SUM} + ${BOTTOM_ROW_SUM} = ${ANSWER_SUM} — answer D.`,
        `${TOP_ROW_SUM} + ${BOTTOM_ROW_SUM} = ${ANSWER_SUM} — jawaban D.`,
      ),
    },
  ]

  return { starMidCol: STAR_MIDCOL, topRow: TOP_ROW_SUM, bottomRow: BOTTOM_ROW_SUM, answer: ANSWER_SUM, steps, finalIndex: steps.length - 1 }
}
