export type Lang = 'en' | 'id'
export type ExprMode = 'sum-list' | 'product-plus' | 'product-diff'

export interface ExprParams {
  mode: ExprMode
  a: number
  b: number
  c: number
  d: number
}

export interface ExpressionStep {
  /** How many derivation lines are visible. */
  linesShown: number
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface ExpressionStoryboard {
  /** The expression reduced one step at a time; last line is the answer. */
  lines: string[]
  answer: number
  steps: ExpressionStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

// Reduces the expression step by step. Products are resolved before +/− (the
// precedence lesson); the four-number sum accumulates left to right.
export function buildExpressionSteps(p: ExprParams, lang: Lang): ExpressionStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const lines: string[] = []
  const captions: string[] = []
  let answer = 0

  if (p.mode === 'sum-list') {
    const s1 = p.a + p.b
    const s2 = s1 + p.c
    const s3 = s2 + p.d
    answer = s3
    lines.push(`${p.a} + ${p.b} + ${p.c} + ${p.d}`)
    captions.push(t('add from left to right', 'jumlahkan dari kiri ke kanan'))
    lines.push(`${s1} + ${p.c} + ${p.d}`)
    captions.push(`${p.a} + ${p.b} = ${s1}`)
    lines.push(`${s2} + ${p.d}`)
    captions.push(`${s1} + ${p.c} = ${s2}`)
    lines.push(`${s3}`)
    captions.push(`${s2} + ${p.d} = ${s3}`)
  } else if (p.mode === 'product-plus') {
    const prod = p.a * p.b
    answer = prod + p.c
    lines.push(`${p.a} × ${p.b} + ${p.c}`)
    captions.push(t('multiply first', 'kalikan dulu'))
    lines.push(`${prod} + ${p.c}`)
    captions.push(`${p.a} × ${p.b} = ${prod}`)
    lines.push(`${answer}`)
    captions.push(`${prod} + ${p.c} = ${answer}`)
  } else {
    const p1 = p.a * p.b
    const p2 = p.c * p.d
    answer = p1 - p2
    lines.push(`${p.a} × ${p.b} − ${p.c} × ${p.d}`)
    captions.push(t('do the products first', 'kerjakan perkalian dulu'))
    lines.push(`${p1} − ${p.c} × ${p.d}`)
    captions.push(`${p.a} × ${p.b} = ${p1}`)
    lines.push(`${p1} − ${p2}`)
    captions.push(`${p.c} × ${p.d} = ${p2}`)
    lines.push(`${answer}`)
    captions.push(`${p1} − ${p2} = ${answer}`)
  }

  const steps: ExpressionStep[] = lines.map((_, i) => ({
    linesShown: i + 1,
    caption: captions[i],
    hold: i === lines.length - 1 ? 0 : 1600,
    result: i === lines.length - 1,
  }))
  return { lines, answer, steps, finalIndex: steps.length - 1 }
}
