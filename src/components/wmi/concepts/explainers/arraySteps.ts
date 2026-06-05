export interface ArrayStep {
  /** Rows of the array revealed so far. */
  rows: number
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface ArrayStoryboard {
  /** Rows (the first factor). */
  a: number
  /** Columns (the second factor). */
  b: number
  product: number
  steps: ArrayStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

function clampFactor(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(9, Math.round(n)))
}

// Builds a row-by-row reveal of an a×b dot array. Each beat adds a row and
// states the running product (1×b, 2×b, …) so multiplication reads as
// repeated addition of equal rows. Captions are symbolic, so no `lang`.
export function buildArraySteps(aRaw: number, bRaw: number): ArrayStoryboard {
  const a = clampFactor(aRaw)
  const b = clampFactor(bRaw)
  const product = a * b
  const steps: ArrayStep[] = []
  for (let r = 1; r <= a; r++) {
    const last = r === a
    steps.push({
      rows: r,
      caption: `${r} × ${b} = ${r * b}`,
      hold: last ? 0 : 1200,
      result: last,
    })
  }
  return { a, b, product, steps, finalIndex: steps.length - 1 }
}
