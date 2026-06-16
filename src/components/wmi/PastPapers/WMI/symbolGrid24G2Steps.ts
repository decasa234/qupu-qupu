import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANSWER,
  COL_SUMS,
  GRID,
  MARKER_VALUES,
  SOLVED,
  type Marker,
} from './SymbolGrid24G2Illustration'

// WMI-24F2A-Q25 — solve the symbol sum-grid one marked cell at a time. Each
// column's grey circle is the sum of its three squares; the rows-are-1..9 rule
// plus the two known neighbours in a marked column force that marker's value.
// We deduce ● (col 17), then ◆ (col 18), then ★ (col 16), then combine:
//   ● + ◆ − ★ = 7 + 8 − 5 = 10.
//
// Pure builder: derives every number from the shared illustration constants
// (MARKER_VALUES / COL_SUMS / SOLVED). No randomness, no Date — SSR-safe.

export type SymbolGridPhase = 'intro' | 'bullet' | 'diamond' | 'star' | 'plug' | 'result'

export interface SymbolGridStep {
  phase: SymbolGridPhase
  /** The marker whose value is being forced this beat (null on intro/plug/result). */
  marker: Marker | null
  /** Column index highlighted this beat (the column carrying the marker), or null. */
  col: number | null
  /** Markers already revealed up to and including this beat. */
  revealed: Marker[]
  caption: string
  hold: number
  /** True on the final beat that lands the answer. */
  result: boolean
}

export interface SymbolGridStoryboard {
  /** ● + ◆ − ★ as a number, sourced from MARKER_VALUES. */
  answer: number
  values: Record<Marker, number>
  steps: SymbolGridStep[]
  finalIndex: number
}

const GLYPH: Record<Marker, string> = { bullet: '●', diamond: '◆', star: '★' }
const NAME: Record<Marker, [string, string]> = {
  bullet: ['dot', 'titik'],
  diamond: ['diamond', 'wajik'],
  star: ['star', 'bintang'],
}

/** Locate a marker's [row, col] in the transcribed source grid. */
function findMarker(mark: Marker): { row: number; col: number } {
  for (let r = 0; r < GRID.length; r++) {
    for (let c = 0; c < GRID[r].length; c++) {
      if (GRID[r][c].mark === mark) return { row: r, col: c }
    }
  }
  throw new Error(`marker ${mark} not found in GRID`)
}

/**
 * For a marked column, read its circle sum and the two KNOWN neighbour values
 * (the other two squares, taken from the verified completion), so the caption
 * can show `sum − a − b = value` with real arithmetic rather than an assertion.
 */
function columnFacts(mark: Marker) {
  const { row, col } = findMarker(mark)
  const sum = COL_SUMS[col]
  const neighbours: number[] = []
  for (let r = 0; r < SOLVED.length; r++) {
    if (r !== row) neighbours.push(SOLVED[r][col])
  }
  const value = sum - neighbours[0] - neighbours[1]
  return { col, sum, neighbours, value }
}

export function buildSymbolGrid24G2Steps(lang: Lang): SymbolGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Deduce the three markers in turn, deriving each value from the column sum.
  const order: Marker[] = ['bullet', 'diamond', 'star']

  const steps: SymbolGridStep[] = [
    {
      phase: 'intro',
      marker: null,
      col: null,
      revealed: [],
      caption: t(
        'Each grey circle = the three squares above it. Work one marked column at a time!',
        'Tiap lingkaran abu-abu = tiga kotak di atasnya. Kerjakan satu kolom bertanda sekaligus!',
      ),
      hold: 2600,
      result: false,
    },
  ]

  const revealed: Marker[] = []
  for (const mark of order) {
    const { col, sum, neighbours, value } = columnFacts(mark)
    revealed.push(mark)
    const [a, b] = neighbours
    steps.push({
      phase: mark,
      marker: mark,
      col,
      revealed: [...revealed],
      caption: t(
        `Column ${sum}: ${GLYPH[mark]} + ${a} + ${b} = ${sum}, so ${GLYPH[mark]} = ${sum} − ${a} − ${b} = ${value}.`,
        `Kolom ${sum}: ${GLYPH[mark]} + ${a} + ${b} = ${sum}, jadi ${GLYPH[mark]} = ${sum} − ${a} − ${b} = ${value}.`,
      ),
      hold: 2400,
      result: false,
    })
  }

  const v = MARKER_VALUES
  // Plug the three forced values into ● + ◆ − ★.
  steps.push({
    phase: 'plug',
    marker: null,
    col: null,
    revealed: [...order],
    caption: t(
      `Now ${GLYPH.bullet} + ${GLYPH.diamond} − ${GLYPH.star} = ${v.bullet} + ${v.diamond} − ${v.star}.`,
      `Sekarang ${GLYPH.bullet} + ${GLYPH.diamond} − ${GLYPH.star} = ${v.bullet} + ${v.diamond} − ${v.star}.`,
    ),
    hold: 2400,
    result: false,
  })

  // Land the answer (last beat, hold 0).
  steps.push({
    phase: 'result',
    marker: null,
    col: null,
    revealed: [...order],
    caption: t(
      `${v.bullet} + ${v.diamond} − ${v.star} = ${ANSWER}. Answer: ${ANSWER}.`,
      `${v.bullet} + ${v.diamond} − ${v.star} = ${ANSWER}. Jawaban: ${ANSWER}.`,
    ),
    hold: 0,
    result: true,
  })

  return {
    answer: ANSWER,
    values: { ...MARKER_VALUES },
    steps,
    finalIndex: steps.length - 1,
  }
}

export { GLYPH as SYMBOL_GLYPH, NAME as SYMBOL_NAME }
