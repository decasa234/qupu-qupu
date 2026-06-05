export type Lang = 'en' | 'id'

export interface Expr {
  op: '+' | '-'
  x: number
  y: number
}
export interface CompareParams {
  target: number
  exprs: Expr[]
}

function evalExpr(e: Expr): number {
  return e.op === '+' ? e.x + e.y : e.x - e.y
}
function exprText(e: Expr): string {
  return `${e.x} ${e.op === '+' ? '+' : '−'} ${e.y}`
}

export interface CompareRow {
  label: string
  text: string
  value: number
  match: boolean
}

export interface CompareStep {
  /** How many rows have been evaluated (shown with their value + ✓/✗). */
  evaluated: number
  /** Highlight the matching row. */
  spotlight: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface CompareStoryboard {
  target: number
  rows: CompareRow[]
  /** Label (A–D) of the expression that equals the target. */
  answer: string
  steps: CompareStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

const LABELS = ['A', 'B', 'C', 'D']

// Evaluates each option in turn and marks it against the target, then
// spotlights the match.
export function buildCompareSteps(p: CompareParams, lang: Lang): CompareStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const rows: CompareRow[] = p.exprs.map((e, i) => {
    const value = evalExpr(e)
    return { label: LABELS[i] ?? '?', text: exprText(e), value, match: value === p.target }
  })
  const matchIdx = rows.findIndex((r) => r.match)
  const answer = matchIdx >= 0 ? rows[matchIdx].label : ''

  const steps: CompareStep[] = [
    {
      evaluated: 0, spotlight: false,
      caption: t(`which equals ${p.target}?`, `mana yang hasilnya ${p.target}?`),
      hold: 1300, result: false,
    },
  ]
  rows.forEach((r) => {
    steps.push({
      evaluated: steps[steps.length - 1].evaluated + 1, spotlight: false,
      caption: `${r.text} = ${r.value}`,
      hold: 1300, result: false,
    })
  })
  steps.push({
    evaluated: rows.length, spotlight: true,
    caption: t(`${answer} equals ${p.target}`, `${answer} sama dengan ${p.target}`),
    hold: 0, result: true,
  })

  return { target: p.target, rows, answer, steps, finalIndex: steps.length - 1 }
}
