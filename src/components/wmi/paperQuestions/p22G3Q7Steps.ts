// WMI-22P3A-Q7 (2022 Grade 3 Semifinal) — total the bills in the table.
//
// Columns: $100 × 7, $50 × 5, $20 × 0, $10 × 3, $5 × 5.
//   value × count: 700, 250, 0, 30, 25  ⇒  700 + 250 + 0 + 30 + 25 = 1005.
// Answer C = 1005.
//
// METHOD (one column per beat, then add):
//   1. Goal: each column is a bill value × how many of it — multiply, then total.
//   2..6. Walk the columns left → right, ringing each and showing value × count
//          and the running total. The empty $20 column contributes 0 (the trap:
//          forgetting a column or miscounting a stack).
//   7. Add it all up to 1005 = choice C.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe &
// deterministic. Each beat names which column to ring + its subtotal, and the
// running total so far.

import { COLUMNS, GRAND_TOTAL } from './P22G3Q7Illustration'

export type Lang = 'en' | 'id'

export const ANSWER_TOTAL = GRAND_TOTAL // 1005
export const ANSWER_CHOICE = 'C'

export interface MoneyStep {
  /** Column index to ring this beat (null = none). */
  highlight: number | null
  /** Column index to print a subtotal under (null = none). */
  subtotalFor: number | null
  /** Running total revealed so far. */
  runningTotal: number
  result: boolean
  caption: string
  hold: number
}

export interface MoneyStoryboard {
  total: number
  choice: string
  steps: MoneyStep[]
  finalIndex: number
}

export function buildP22G3Q7Steps(lang: Lang): MoneyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MoneyStep[] = []

  // 1. Goal.
  steps.push({
    highlight: null,
    subtotalFor: null,
    runningTotal: 0,
    result: false,
    hold: 2400,
    caption: t(
      'Each column is one bill value times how many there are. Multiply each, then add.',
      'Tiap kolom adalah satu nilai uang dikali jumlah lembarnya. Kalikan tiap kolom, lalu jumlahkan.',
    ),
  })

  // 2..6. Walk each column.
  let running = 0
  COLUMNS.forEach((col, i) => {
    const sub = col.value * col.count
    running += sub
    if (col.count === 0) {
      steps.push({
        highlight: i,
        subtotalFor: i,
        runningTotal: running,
        result: false,
        hold: 2200,
        caption: t(
          `$${col.value}: there are NONE here, so this column adds $0. Don't skip it — count it as 0. Total so far ${running}.`,
          `$${col.value}: di sini KOSONG, jadi kolom ini menambah $0. Jangan dilewati — hitung sebagai 0. Total sejauh ini ${running}.`,
        ),
      })
    } else {
      steps.push({
        highlight: i,
        subtotalFor: i,
        runningTotal: running,
        result: false,
        hold: 2200,
        caption: t(
          `$${col.value} × ${col.count} = ${sub}. Total so far ${running}.`,
          `$${col.value} × ${col.count} = ${sub}. Total sejauh ini ${running}.`,
        ),
      })
    }
  })

  // 7. Conclude.
  steps.push({
    highlight: null,
    subtotalFor: null,
    runningTotal: ANSWER_TOTAL,
    result: true,
    hold: 0,
    caption: t(
      `700 + 250 + 0 + 30 + 25 = ${ANSWER_TOTAL} dollars — that's choice ${ANSWER_CHOICE}.`,
      `700 + 250 + 0 + 30 + 25 = ${ANSWER_TOTAL} dolar — itulah pilihan ${ANSWER_CHOICE}.`,
    ),
  })

  return {
    total: ANSWER_TOTAL,
    choice: ANSWER_CHOICE,
    steps,
    finalIndex: steps.length - 1,
  }
}
