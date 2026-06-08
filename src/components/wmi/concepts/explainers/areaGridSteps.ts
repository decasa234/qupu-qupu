export type Lang = 'en' | 'id'

export interface AreaGridStep {
  /** Number of rows of the grid revealed so far. */
  rowsShown: number
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface AreaGridStoryboard {
  cols: number
  rows: number
  area: number
  steps: AreaGridStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

function clampDim(n: unknown, lo: number, hi: number): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return lo
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

/**
 * Builds a row-by-row reveal of a cols×rows unit-square grid.
 * Each intermediate beat reveals one more row and states the running total;
 * the final beat shows the full multiplication equation.
 */
export function buildAreaGridSteps(
  colsRaw: unknown,
  rowsRaw: unknown,
  lang: Lang,
): AreaGridStoryboard {
  const cols = clampDim(colsRaw, 2, 10)
  const rows = clampDim(rowsRaw, 2, 9)
  const area = cols * rows

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AreaGridStep[] = []

  for (let r = 1; r <= rows; r++) {
    const running = cols * r
    const last = r === rows
    if (last) {
      steps.push({
        rowsShown: r,
        caption: t(
          `${cols} × ${rows} = ${area} unit squares`,
          `${cols} × ${rows} = ${area} persegi satuan`,
        ),
        hold: 0,
        result: true,
      })
    } else {
      steps.push({
        rowsShown: r,
        caption: t(
          `Row ${r}: ${running} squares so far`,
          `Baris ${r}: ${running} persegi sejauh ini`,
        ),
        hold: 1200,
        result: false,
      })
    }
  }

  return { cols, rows, area, steps, finalIndex: steps.length - 1 }
}
