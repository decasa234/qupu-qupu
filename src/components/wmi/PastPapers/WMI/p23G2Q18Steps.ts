import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { Cell } from './P23G2Q18Illustration'
import { ADDED_DOTS } from './P23G2Q18Illustration'

// WMI-23P2A-Q18 (2023 Semifinal Grade 2 Paper A) — "At least how many ●'s must
// be added so every row AND every column has 3 or more ●'s?"  Answer: B (4).
//
// METHOD (count the gaps, don't guess):
//   Per-row counts:  row0=2, row1=3, row2=2, row3=3, row4=1
//   Per-col counts:  col0=1, col1=1, col2=3, col3=3, col4=3
//   Short rows (need to reach 3): row0 (+1), row2 (+1), row4 (+2) → 4 dots minimum
//     just to fix the rows.  Short cols: col0 (+2), col1 (+2) → also 4 dots minimum
//     just to fix the columns.  Both floors are 4, so we can NEVER do it with 3.
//   And 4 is enough: put the 4 new dots where a short row crosses a short column —
//     (0,0), (2,1), (4,0), (4,1) — and every short row AND short column reaches 3
//     at the same time.  So the least number of dots is 4.

export interface DotGridStep {
  caption: string
  /** Added dots visible this beat. */
  added: Cell[]
  /** Rows to outline (the short rows under discussion). */
  markRows: number[]
  /** Columns to outline (the short columns under discussion). */
  markCols: number[]
  /** Running count of dots added so far. */
  running: number
  /** True only on the final answer beat. */
  result: boolean
  hold: number
}

export interface DotGridStoryboard {
  answer: number
  steps: DotGridStep[]
  finalIndex: number
}

export function buildP23G2Q18Steps(lang: Lang): DotGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const all = ADDED_DOTS as Cell[]
  const answer = all.length // 4

  const steps: DotGridStep[] = []

  // Beat 0 — the goal.
  steps.push({
    caption: t(
      'Goal: every row AND every column must end with 3 or more ●.',
      'Tujuan: setiap baris DAN setiap kolom harus punya 3 ● atau lebih.',
    ),
    added: [],
    markRows: [],
    markCols: [],
    running: 0,
    result: false,
    hold: 2200,
  })

  // Beat 1 — count the short rows.
  steps.push({
    caption: t(
      'Short rows: row 1 has 2, row 3 has 2, row 5 has 1 → need 1 + 1 + 2 = 4 more.',
      'Baris kurang: baris 1 ada 2, baris 3 ada 2, baris 5 ada 1 → kurang 1 + 1 + 2 = 4.',
    ),
    added: [],
    markRows: [0, 2, 4],
    markCols: [],
    running: 0,
    result: false,
    hold: 2600,
  })

  // Beat 2 — count the short columns.
  steps.push({
    caption: t(
      'Short columns: column 1 has 1, column 2 has 1 → need 2 + 2 = 4 more.',
      'Kolom kurang: kolom 1 ada 1, kolom 2 ada 1 → kurang 2 + 2 = 4.',
    ),
    added: [],
    markRows: [],
    markCols: [0, 1],
    running: 0,
    result: false,
    hold: 2600,
  })

  // Beat 3 — the floor: both gaps demand at least 4, so 3 can never work.
  steps.push({
    caption: t(
      'Both the rows and the columns each need 4 — so 3 dots can never be enough.',
      'Baris butuh 4 dan kolom butuh 4 — jadi 3 titik tidak akan pernah cukup.',
    ),
    added: [],
    markRows: [0, 2, 4],
    markCols: [0, 1],
    running: 0,
    result: false,
    hold: 2600,
  })

  // Beats 4..7 — drop the 4 dots one at a time, each where a short row meets a
  // short column so it fixes a row AND a column together.
  all.forEach((cell, i) => {
    const running = i + 1
    const [r, c] = cell
    steps.push({
      caption: t(
        `Put a ● where short row ${r + 1} crosses short column ${c + 1}. Dot ${running}.`,
        `Taruh ● di pertemuan baris ${r + 1} dan kolom ${c + 1}. Titik ${running}.`,
      ),
      added: all.slice(0, running),
      markRows: [r],
      markCols: [c],
      running,
      result: false,
      hold: 1900,
    })
  })

  // Final beat — the answer.
  steps.push({
    caption: t(
      `4 dots fix every row and column. Least number of ● = 4 → answer B.`,
      `4 titik membereskan semua baris dan kolom. Jumlah ● paling sedikit = 4 → jawaban B.`,
    ),
    added: all,
    markRows: [],
    markCols: [],
    running: answer,
    result: true,
    hold: 0,
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
