import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { GRID, LINES, lineMultiplies, lineEquation, CORRECT_COUNT, type Cell } from './P23G3Q24Illustration'

// WMI-23P3A-Q24 — test each of the 8 lines (3 rows, 3 columns, 2 diagonals) for
// "one number = product of the other two", lighting one line per beat with a
// running tally of the true ones, landing on 6 → choice B. Every verdict and the
// total come from the grid via lineMultiplies / CORRECT_COUNT.

export interface GridLineStep {
  /** The three cells of the line lit this beat, or undefined (intro). */
  cells?: readonly Cell[]
  verdict?: 'good' | 'bad'
  /** Equation string for a true line (shown under the grid). */
  equation: string | null
  /** Running count of true lines so far. */
  count: number
  result: boolean
  caption: string
  hold: number
}

export interface GridLineStoryboard {
  answer: number
  steps: GridLineStep[]
  finalIndex: number
}

// Friendly direction names for the captions.
const DIR_EN: Record<string, string> = {
  row0: 'top row',
  row1: 'middle row',
  row2: 'bottom row',
  col0: 'left column',
  col1: 'middle column',
  col2: 'right column',
  diagTLBR: 'main diagonal ↘',
  diagTRBL: 'other diagonal ↙',
}
const DIR_ID: Record<string, string> = {
  row0: 'baris atas',
  row1: 'baris tengah',
  row2: 'baris bawah',
  col0: 'kolom kiri',
  col1: 'kolom tengah',
  col2: 'kolom kanan',
  diagTLBR: 'diagonal utama ↘',
  diagTRBL: 'diagonal lain ↙',
}

export function buildP23G3Q24Steps(lang: Lang): GridLineStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridLineStep[] = []

  steps.push({
    equation: null,
    count: 0,
    result: false,
    hold: 2400,
    caption: t(
      'Check all 8 lines — 3 rows, 3 columns, 2 diagonals. A line counts if one number is the product of the other two.',
      'Periksa semua 8 garis — 3 baris, 3 kolom, 2 diagonal. Garis dihitung jika satu bilangan adalah hasil kali dua lainnya.',
    ),
  })

  let count = 0
  for (const line of LINES) {
    const ok = lineMultiplies(GRID, line.cells)
    const eq = lineEquation(GRID, line.cells)
    if (ok) count += 1
    const dir = t(DIR_EN[line.name], DIR_ID[line.name])
    const vals = line.cells.map(([r, c]) => GRID[r][c]).join(', ')
    steps.push({
      cells: line.cells,
      verdict: ok ? 'good' : 'bad',
      equation: ok ? eq : null,
      count,
      result: false,
      hold: 1500,
      caption: ok
        ? t(`The ${dir} (${vals}): ${eq} ✓ — count ${count}.`, `${dir} (${vals}): ${eq} ✓ — hitungan ${count}.`)
        : t(`The ${dir} (${vals}): not a product ✗.`, `${dir} (${vals}): bukan hasil kali ✗.`),
    })
  }

  steps.push({
    equation: null,
    count: CORRECT_COUNT,
    result: true,
    hold: 0,
    caption: t(
      `${CORRECT_COUNT} lines multiply correctly — answer B.`,
      `${CORRECT_COUNT} garis mengalikan dengan benar — jawaban B.`,
    ),
  })

  return { answer: CORRECT_COUNT, steps, finalIndex: steps.length - 1 }
}
