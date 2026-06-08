export type CombinationPhase = 'facts' | 'pairs' | 'check' | 'match' | 'result'

export interface CombinationRow {
  a: number
  b: number
  product: number
  matches: boolean
}

export interface CombinationStep {
  phase: CombinationPhase
  caption: string
  visibleRows: number
  checkedRows: number
  hold: number
  result?: boolean
}

export interface CombinationStory {
  x: number
  y: number
  sum: number
  product: number
  answer: number
  rows: CombinationRow[]
  steps: CombinationStep[]
  finalIndex: number
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

export function buildCombinationProductSteps(xRaw: unknown, yRaw: unknown, lang: 'en' | 'id' = 'en'): CombinationStory {
  const x = clampInt(xRaw, 2, 1, 12)
  const y = Math.max(x + 1, clampInt(yRaw, x + 1, 2, 24))
  const sum = x + y
  const product = x * y
  const rows: CombinationRow[] = Array.from({ length: x }, (_, i) => {
    const a = i + 1
    const b = sum - a
    return { a, b, product: a * b, matches: a === x && b === y }
  })

  const text = {
    facts:
      lang === 'id'
        ? `Kita tahu jumlahnya ${sum} dan hasil kalinya ${product}.`
        : `We know the sum is ${sum} and the product is ${product}.`,
    pairs:
      lang === 'id'
        ? `Buat pasangan bilangan yang jumlahnya selalu ${sum}.`
        : `List number pairs that always add to ${sum}.`,
    check:
      lang === 'id'
        ? `Kalikan tiap pasangan dan cari hasil kali ${product}.`
        : `Multiply each pair and look for product ${product}.`,
    match:
      lang === 'id'
        ? `${x} x ${y} = ${product}, jadi pasangan yang cocok adalah (${x}, ${y}).`
        : `${x} x ${y} = ${product}, so the matching pair is (${x}, ${y}).`,
    result: lang === 'id' ? `Bilangan yang lebih besar adalah ${y}.` : `The larger number is ${y}.`,
  }

  const steps: CombinationStep[] = [
    { phase: 'facts', caption: text.facts, visibleRows: 0, checkedRows: 0, hold: 1000 },
    { phase: 'pairs', caption: text.pairs, visibleRows: rows.length, checkedRows: 0, hold: 1200 },
    { phase: 'check', caption: text.check, visibleRows: rows.length, checkedRows: Math.max(0, rows.length - 1), hold: 1500 },
    { phase: 'match', caption: text.match, visibleRows: rows.length, checkedRows: rows.length, hold: 1300 },
    { phase: 'result', caption: text.result, visibleRows: rows.length, checkedRows: rows.length, hold: 0, result: true },
  ]

  return { x, y, sum, product, answer: y, rows, steps, finalIndex: steps.length - 1 }
}
