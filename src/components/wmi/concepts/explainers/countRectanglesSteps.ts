export type CountRectanglesPhase = 'grid' | 'size' | 'result'

export interface SquareInstance {
  row: number
  col: number
  size: number
}

export interface SquareGroup {
  size: number
  count: number
  squares: SquareInstance[]
}

export interface CountRectanglesStep {
  phase: CountRectanglesPhase
  caption: string
  activeSize: number | null
  result?: boolean
  hold: number
}

export interface CountRectanglesStory {
  cols: number
  rows: number
  groups: SquareGroup[]
  total: number
  sumText: string
  steps: CountRectanglesStep[]
  finalIndex: number
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

export function buildCountRectanglesSteps(colsRaw: unknown, rowsRaw: unknown, lang: 'en' | 'id' = 'en'): CountRectanglesStory {
  const cols = clampInt(colsRaw, 2, 1, 6)
  const rows = clampInt(rowsRaw, 2, 1, 5)
  const groups: SquareGroup[] = []

  for (let size = 1; size <= Math.min(cols, rows); size++) {
    const squares: SquareInstance[] = []
    for (let row = 0; row <= rows - size; row++) {
      for (let col = 0; col <= cols - size; col++) squares.push({ row, col, size })
    }
    groups.push({ size, count: squares.length, squares })
  }

  const total = groups.reduce((sum, group) => sum + group.count, 0)
  const sumText = groups.map((group) => group.count).join(' + ')
  const steps: CountRectanglesStep[] = [
    {
      phase: 'grid',
      caption:
        lang === 'id'
          ? `Kisi ini punya ${cols} kolom dan ${rows} baris. Hitung semua persegi.`
          : `This grid has ${cols} columns and ${rows} rows. Count every square.`,
      activeSize: null,
      hold: 900,
    },
    ...groups.map((group): CountRectanglesStep => ({
      phase: 'size',
      caption:
        lang === 'id'
          ? `Persegi ${group.size}x${group.size}: ${cols - group.size + 1} x ${rows - group.size + 1} = ${group.count}.`
          : `${group.size}x${group.size} squares: ${cols - group.size + 1} x ${rows - group.size + 1} = ${group.count}.`,
      activeSize: group.size,
      hold: group.size === 1 ? 1200 : 1400,
    })),
    {
      phase: 'result',
      caption: lang === 'id' ? `Total persegi: ${sumText} = ${total}.` : `Total squares: ${sumText} = ${total}.`,
      activeSize: null,
      result: true,
      hold: 0,
    },
  ]

  return { cols, rows, groups, total, sumText, steps, finalIndex: steps.length - 1 }
}
