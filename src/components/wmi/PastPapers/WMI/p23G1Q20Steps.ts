import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { N, ORIGINAL, TOTAL_ADDED } from './P23G1Q20Illustration'

// WMI-23P1A-Q20 (2023 Grade 1 Semifinal): least dots to add so every row and every
// column of the 5×5 grid has ≥ 3 dots.
//
// Original per-row counts (top→bottom): 2, 3, 2, 3, 1 → rows 1,3 short by 1; row 5
// short by 2  ⇒ row shortfall = 4.
// Original per-col counts (left→right): 1, 1, 3, 3, 3 → cols 1,2 short by 2 each
//   ⇒ col shortfall = 4.
// One dot can repair a short row AND a short column at the same time, and the two
// shortfalls line up, so the minimum is exactly 4 (answer B). Verified exhaustively.
//
// One idea per beat:
//   beat 0 — restate the rule: every row and column needs ≥ 3.
//   beat 1 — find the short ROWS (rows 1, 3 need 1; row 5 needs 2).
//   beat 2 — find the short COLUMNS (cols 1, 2 need 2 each).
//   beat 3 — key idea: a dot at a short-row ∩ short-column fixes both at once.
//   beat 4 — place the 4 dots and check every line now has ≥ 3.
//   beat 5 — result: 4 dots (answer B).

// derive row/col counts from the original dots so the storyboard cannot drift.
function rowCount(r: number): number {
  return ORIGINAL.filter(([rr]) => rr === r).length
}
function colCount(c: number): number {
  return ORIGINAL.filter(([, cc]) => cc === c).length
}
const ROW_COUNTS = Array.from({ length: N }, (_, r) => rowCount(r)) // [2,3,2,3,1]
const COL_COUNTS = Array.from({ length: N }, (_, c) => colCount(c)) // [1,1,3,3,3]
const SHORT_ROWS = ROW_COUNTS.map((n, r) => ({ r, need: 3 - n })).filter((x) => x.need > 0)
const SHORT_COLS = COL_COUNTS.map((n, c) => ({ c, need: 3 - n })).filter((x) => x.need > 0)

export type P23G1Q20Phase = 'rule' | 'rows' | 'cols' | 'idea' | 'place' | 'result'

export interface P23G1Q20Step {
  phase: P23G1Q20Phase
  /** How many of the four added dots to show (0..4). */
  revealedAdds: number
  /** Row to spotlight (or null). */
  litRow: number | null
  /** Col to spotlight (or null). */
  litCol: number | null
  caption: string
  hold: number
  result: boolean
}

export interface P23G1Q20Storyboard {
  rowCounts: number[]
  colCounts: number[]
  answer: number
  steps: P23G1Q20Step[]
  finalIndex: number
}

export function buildP23G1Q20Steps(lang: Lang): P23G1Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // human-friendly 1-indexed labels
  const rowLabels = SHORT_ROWS.map((x) => `row ${x.r + 1} (+${x.need})`).join(', ')
  const rowLabelsId = SHORT_ROWS.map((x) => `baris ${x.r + 1} (+${x.need})`).join(', ')
  const colLabels = SHORT_COLS.map((x) => `col ${x.c + 1} (+${x.need})`).join(', ')
  const colLabelsId = SHORT_COLS.map((x) => `kolom ${x.c + 1} (+${x.need})`).join(', ')

  const steps: P23G1Q20Step[] = [
    {
      phase: 'rule',
      revealedAdds: 0,
      litRow: null,
      litCol: null,
      hold: 1900,
      result: false,
      caption: t(
        'Every row AND every column must end up with 3 or more dots.',
        'Setiap baris DAN setiap kolom harus berisi 3 titik atau lebih.',
      ),
    },
    {
      phase: 'rows',
      revealedAdds: 0,
      litRow: 4,
      litCol: null,
      hold: 2200,
      result: false,
      caption: t(
        `Short rows: ${rowLabels}. That's 4 dots needed counting by rows.`,
        `Baris yang kurang: ${rowLabelsId}. Berarti 4 titik jika dihitung per baris.`,
      ),
    },
    {
      phase: 'cols',
      revealedAdds: 0,
      litRow: null,
      litCol: 0,
      hold: 2200,
      result: false,
      caption: t(
        `Short columns: ${colLabels}. Also 4 dots needed counting by columns.`,
        `Kolom yang kurang: ${colLabelsId}. Juga 4 titik jika dihitung per kolom.`,
      ),
    },
    {
      phase: 'idea',
      revealedAdds: 0,
      litRow: 4,
      litCol: 0,
      hold: 2400,
      result: false,
      caption: t(
        'Key idea: a dot on a short row AND a short column repairs both at once.',
        'Ide kunci: satu titik di baris kurang DAN kolom kurang memperbaiki keduanya sekaligus.',
      ),
    },
    {
      phase: 'place',
      revealedAdds: TOTAL_ADDED,
      litRow: null,
      litCol: null,
      hold: 2400,
      result: false,
      caption: t(
        'Drop 4 dots at those crossings — now every row and column has 3 or more.',
        'Letakkan 4 titik di persilangan itu — kini setiap baris dan kolom punya 3 atau lebih.',
      ),
    },
    {
      phase: 'result',
      revealedAdds: TOTAL_ADDED,
      litRow: null,
      litCol: null,
      hold: 0,
      result: true,
      caption: t(`Just ${TOTAL_ADDED} dots are enough — answer B.`, `Cukup ${TOTAL_ADDED} titik saja — jawaban B.`),
    },
  ]

  return { rowCounts: ROW_COUNTS, colCounts: COL_COUNTS, answer: TOTAL_ADDED, steps, finalIndex: steps.length - 1 }
}
