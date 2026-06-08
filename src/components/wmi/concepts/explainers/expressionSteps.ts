export type Lang = 'en' | 'id'
export type ExprMode = 'sum-list' | 'product-plus' | 'product-diff'

export interface ExprParams {
  mode: ExprMode
  a: number
  b: number
  c: number
  d: number
}

/** A piece of the expression line. `active` pieces are boxed as a group. */
export interface ExprToken {
  text: string
  active: boolean
}

export interface ExpressionStep {
  tokens: ExprToken[]
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface ExpressionStoryboard {
  answer: number
  steps: ExpressionStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

const HOLD = 2200
const tok = (text: string, active = false): ExprToken => ({ text, active })

// Each beat boxes the sub-expression(s) being worked on (the "group") and then
// reduces it. Products resolve before +/−; the four-number sum is grouped into
// two pairs so the chunks stay small.
export function buildExpressionSteps(p: ExprParams, lang: Lang): ExpressionStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  let answer = 0
  const raw: Array<{ tokens: ExprToken[]; caption: string }> = []

  if (p.mode === 'sum-list') {
    const s1 = p.a + p.b
    const s2 = p.c + p.d
    answer = s1 + s2
    raw.push({ tokens: [tok(`${p.a} + ${p.b}`, true), tok(' + '), tok(`${p.c} + ${p.d}`, true)], caption: t('group into pairs', 'kelompokkan berpasangan') })
    raw.push({ tokens: [tok(`${s1}`, true), tok(' + '), tok(`${p.c} + ${p.d}`, false)], caption: `${p.a} + ${p.b} = ${s1}` })
    raw.push({ tokens: [tok(`${s1}`, false), tok(' + '), tok(`${s2}`, true)], caption: `${p.c} + ${p.d} = ${s2}` })
    raw.push({ tokens: [tok(`${s1} + ${s2}`, true)], caption: `${s1} + ${s2}` })
    raw.push({ tokens: [tok(`${answer}`, true)], caption: `= ${answer}` })
  } else if (p.mode === 'product-plus') {
    const prod = p.a * p.b
    answer = prod + p.c
    raw.push({ tokens: [tok(`${p.a} × ${p.b}`, true), tok(` + ${p.c}`)], caption: t('multiply first', 'kalikan dulu') })
    raw.push({ tokens: [tok(`${prod}`, true), tok(` + ${p.c}`)], caption: `${p.a} × ${p.b} = ${prod}` })
    raw.push({ tokens: [tok(`${prod} + ${p.c}`, true)], caption: `${prod} + ${p.c}` })
    raw.push({ tokens: [tok(`${answer}`, true)], caption: `= ${answer}` })
  } else {
    const p1 = p.a * p.b
    const p2 = p.c * p.d
    answer = p1 - p2
    raw.push({ tokens: [tok(`${p.a} × ${p.b}`, true), tok(' − '), tok(`${p.c} × ${p.d}`, true)], caption: t('do the products first', 'kerjakan perkalian dulu') })
    raw.push({ tokens: [tok(`${p1}`, true), tok(' − '), tok(`${p.c} × ${p.d}`, false)], caption: `${p.a} × ${p.b} = ${p1}` })
    raw.push({ tokens: [tok(`${p1}`, false), tok(' − '), tok(`${p2}`, true)], caption: `${p.c} × ${p.d} = ${p2}` })
    raw.push({ tokens: [tok(`${p1} − ${p2}`, true)], caption: `${p1} − ${p2}` })
    raw.push({ tokens: [tok(`${answer}`, true)], caption: `= ${answer}` })
  }

  const steps: ExpressionStep[] = raw.map((r, i) => ({
    tokens: r.tokens,
    caption: r.caption,
    hold: i === raw.length - 1 ? 0 : HOLD,
    result: i === raw.length - 1,
  }))
  return { answer, steps, finalIndex: steps.length - 1 }
}
