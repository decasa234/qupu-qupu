import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  CELLS_25G3,
  SYMMETRY_RESULTS_25G3,
  SYMMETRY_COUNT_25G3,
  type SymAxis,
  type SymResult,
} from './Symmetry25G3Illustration'

// Post-answer storyboard for WMI-25F3A-Q17 (2025 Grade-3 Final).
//
// Strategy: move exactly one square so the six squares gain a mirror line, then
// count the DISTINCT line-symmetric figures (rotations counted as the same). The
// animation reveals the six results one per beat — drawing each result's six cells
// plus its mirror axis, highlighting the square that moved from the start shape —
// and runs a counter up to SYMMETRY_COUNT_25G3 (= 6). The count is DERIVED from the
// co-exported data, never hardcoded.

export interface SymStep {
  /** The result being shown this beat, or null on the intro beat. */
  result: SymResult | null
  /** Occupied cells to draw (the result's six squares), or the start shape on intro. */
  cells: Array<[number, number]>
  /** Cell(s) that differ from the start shape — the relocated square. */
  moved: Array<[number, number]>
  /** Mirror axes to draw this beat. */
  axes: SymAxis[]
  /** Running tally of symmetric figures found so far (0 on intro). */
  count: number
  caption: string
  /** Hold time in ms; the winning final beat holds 0. */
  hold: number
  result_beat: boolean
}

export interface SymStoryboard {
  /** Total distinct line-symmetric figures (derived). */
  total: number
  answer: string
  /** Inclusive grid bounds for the drawing area (rows/cols across all results). */
  bounds: { rows: number; cols: number }
  steps: SymStep[]
  finalIndex: number
}

const key = (p: [number, number]) => `${p[0]},${p[1]}`

// Words for each axis kind, used in the per-beat captions.
const AXIS_WORD: Record<SymAxis, [string, string]> = {
  horizontal: ['a left–right mirror line', 'garis cermin kiri–kanan'],
  vertical: ['an up–down mirror line', 'garis cermin atas–bawah'],
  diagonal: ['a slanted mirror line', 'garis cermin miring'],
  antidiagonal: ['a slanted mirror line', 'garis cermin miring'],
}

export function buildSymmetry25G3Steps(lang: Lang): SymStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const startCells = CELLS_25G3.map((c) => [c.r, c.c] as [number, number])
  const startSet = new Set(startCells.map(key))

  // Grid bounds large enough for the start shape AND every result.
  let maxRow = 0
  let maxCol = 0
  const bump = (cs: Array<[number, number]>) => {
    for (const [r, c] of cs) {
      if (r > maxRow) maxRow = r
      if (c > maxCol) maxCol = c
    }
  }
  bump(startCells)
  SYMMETRY_RESULTS_25G3.forEach((res) => bump(res.cells))

  const total = SYMMETRY_COUNT_25G3 // derived, not hardcoded

  const steps: SymStep[] = [
    {
      result: null,
      cells: startCells,
      moved: [],
      axes: [],
      count: 0,
      hold: 2600,
      result_beat: false,
      caption: t(
        'Slide exactly ONE square to a new spot, then check: does the new shape fold onto itself across a mirror line? Count every different one.',
        'Geser TEPAT SATU persegi ke tempat baru, lalu periksa: apakah bentuk barunya bisa dilipat pas pada garis cermin? Hitung tiap bentuk yang berbeda.',
      ),
    },
  ]

  SYMMETRY_RESULTS_25G3.forEach((res, i) => {
    const moved = res.cells.filter((p) => !startSet.has(key(p)))
    const count = i + 1
    const isLast = i === SYMMETRY_RESULTS_25G3.length - 1
    const axisWord = AXIS_WORD[res.axes[0]]
    const twoLines = res.axes.length > 1
    const enLines = twoLines ? 'two mirror lines' : axisWord[0]
    const idLines = twoLines ? 'dua garis cermin' : axisWord[1]
    const caption = isLast
      ? t(
          `Figure ${count}: ${enLines} — symmetric! That makes ${count} different ones in all → ${total}.`,
          `Bentuk ${count}: ${idLines} — simetris! Jadi ada ${count} bentuk berbeda → ${total}.`,
        )
      : t(
          `Figure ${count}: it folds across ${enLines}. Symmetric! Tally: ${count}.`,
          `Bentuk ${count}: terlipat pas pada ${idLines}. Simetris! Hitungan: ${count}.`,
        )
    steps.push({
      result: res,
      cells: res.cells,
      moved,
      axes: res.axes,
      count,
      // Each found figure lingers a beat so the kid can see the fold; the winning
      // (last) beat holds 0 as the contract requires.
      hold: isLast ? 0 : 2200,
      result_beat: isLast,
      caption,
    })
  })

  return {
    total,
    answer: String(total),
    bounds: { rows: maxRow + 1, cols: maxCol + 1 },
    steps,
    finalIndex: steps.length - 1,
  }
}
