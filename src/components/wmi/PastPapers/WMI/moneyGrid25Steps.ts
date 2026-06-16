// Storyboard for WMI-25F2A-Q24 (2025 Grade-2 Final, HARD).
//
// The figure is a 4×4 money grid with eight row/column totals and four shaded,
// labelled squares A, B, C, D whose bill values are the hidden answer. This pure
// builder turns the solved grid into ordered teaching beats:
//   1. State the goal (add the four shaded bills).
//   2. Solve each row from its total to pin the placements.
//   3. Reveal each shaded cell A→B→C→D one beat at a time, reading its value off
//      the matching row total and confirming it against the column total.
//   4. Add the four values to land on 70.
//
// Everything is DERIVED from MoneyGrid25Illustration's exports (MONEY_GRID25,
// ROW_SUMS25, COL_SUMS25, SHADED25_TOTAL) — no value is hardcoded here.

import {
  MONEY_GRID25,
  ROW_SUMS25,
  COL_SUMS25,
  SHADED25_TOTAL,
} from './MoneyGrid25G2Illustration'

export type ShadeKey = 'A' | 'B' | 'C' | 'D'

export interface MoneyGridStep {
  /** How many shaded cells to reveal in the figure (0..4). */
  revealCount: number
  /** The shaded cell this beat is solving, if any. */
  focus: ShadeKey | null
  /** Caption already localized for the active language. */
  caption: string
  /** Whether this beat is the winning conclusion. */
  result: boolean
  /** Hold time in ms before auto-advancing. */
  hold: number
}

export interface MoneyGridStoryboard {
  steps: MoneyGridStep[]
  finalIndex: number
  /** Ordered shaded keys A,B,C,D and their solved values + coordinates. */
  shaded: Array<{ key: ShadeKey; value: number; row: number; col: number }>
  total: number
}

// Locate each shaded square in the reconstructed grid so we know which row/column
// total to read its value from. Pure scan of the source grid.
function locate(key: ShadeKey): { row: number; col: number; value: number } {
  for (let r = 0; r < MONEY_GRID25.length; r++) {
    for (let c = 0; c < MONEY_GRID25[r].length; c++) {
      if (MONEY_GRID25[r][c].label === key) {
        return { row: r, col: c, value: MONEY_GRID25[r][c].value }
      }
    }
  }
  throw new Error(`shaded cell ${key} not found in MONEY_GRID25`)
}

const ORDER: ShadeKey[] = ['A', 'B', 'C', 'D']

export function buildMoneyGridStory(lang: 'en' | 'id'): MoneyGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const shaded = ORDER.map((key) => {
    const { row, col, value } = locate(key)
    return { key, value, row, col }
  })

  const steps: MoneyGridStep[] = []

  // Beat 0 — the goal.
  steps.push({
    revealCount: 0,
    focus: null,
    caption: t(
      'Goal: add the four shaded bills A + B + C + D. Each circle is its row or column total.',
      'Tujuan: jumlahkan empat uang berarsir A + B + C + D. Tiap koin adalah total baris atau kolomnya.',
    ),
    result: false,
    hold: 2600,
  })

  // Beat 1 — solve the easy rows from their totals (the deduction that fixes the grid).
  steps.push({
    revealCount: 0,
    focus: null,
    caption: t(
      `Each box is only $5, $10 or $50. The $${ROW_SUMS25[3]} row must be four $5s; the $${ROW_SUMS25[0]} row is 50+10+10+10.`,
      `Tiap kotak hanya $5, $10, atau $50. Baris $${ROW_SUMS25[3]} pasti empat $5; baris $${ROW_SUMS25[0]} = 50+10+10+10.`,
    ),
    result: false,
    hold: 2900,
  })

  // Beat 2 — the trickier rows + how the $50s settle the columns.
  steps.push({
    revealCount: 0,
    focus: null,
    caption: t(
      `The $${ROW_SUMS25[1]} row is 50+10+5+5 and the $${ROW_SUMS25[2]} row is 10+5+5+5. The two $50s slot in so the columns also fit.`,
      `Baris $${ROW_SUMS25[1]} = 50+10+5+5 dan baris $${ROW_SUMS25[2]} = 10+5+5+5. Dua $50 masuk supaya kolomnya juga pas.`,
    ),
    result: false,
    hold: 2900,
  })

  // Beats 3..6 — reveal each shaded cell, reading its value off the row total and
  // checking it against the column total.
  shaded.forEach((s, i) => {
    const rowSum = ROW_SUMS25[s.row]
    const colSum = COL_SUMS25[s.col]
    steps.push({
      revealCount: i + 1,
      focus: s.key,
      caption: t(
        `${s.key}: row $${rowSum} and column $${colSum} only fit with a $${s.value} bill — so ${s.key} = $${s.value}.`,
        `${s.key}: baris $${rowSum} dan kolom $${colSum} hanya pas dengan uang $${s.value} — jadi ${s.key} = $${s.value}.`,
      ),
      result: false,
      hold: 2100,
    })
  })

  // Final beat — add A+B+C+D = total.
  const addend = shaded.map((s) => s.value).join(' + ')
  steps.push({
    revealCount: 4,
    focus: null,
    caption: t(
      `Add them: ${addend} = ${SHADED25_TOTAL}.`,
      `Jumlahkan: ${addend} = ${SHADED25_TOTAL}.`,
    ),
    result: true,
    hold: 0,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    shaded,
    total: SHADED25_TOTAL,
  }
}
