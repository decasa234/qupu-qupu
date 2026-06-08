export type Lang = 'en' | 'id'

interface Rule {
  def: string
  sub: (a: number, b: number) => string
  fn: (a: number, b: number) => number
}

// Mirrors the four formulas in api/services/wmi/concepts/custom-operation. The
// explainer needs the rule text, the substituted expression, and (to show the
// worked example) the numeric value of the rule applied.
const RULES: Record<string, Rule> = {
  'mul-minus-b': { def: 'a ★ b = a × b − b', sub: (a, b) => `${a} × ${b} − ${b}`, fn: (a, b) => a * b - b },
  'mul-plus-sum': { def: 'a ★ b = a × b + a + b', sub: (a, b) => `${a} × ${b} + ${a} + ${b}`, fn: (a, b) => a * b + a + b },
  'double-first-plus': { def: 'a ★ b = a + a + b', sub: (a, b) => `${a} + ${a} + ${b}`, fn: (a, b) => a + a + b },
  'sum-times-two': { def: 'a ★ b = (a + b) × 2', sub: (a, b) => `(${a} + ${b}) × 2`, fn: (a, b) => (a + b) * 2 },
}
const FALLBACK: Rule = { def: 'a ★ b = …', sub: (a, b) => `${a} ★ ${b}`, fn: () => NaN }

export interface SubParams {
  formula: string
  e1: number
  e2: number
  c: number
  d: number
}

export interface SubStep {
  showRule: boolean
  showExample: boolean
  showSub: boolean
  showResult: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface SubStoryboard {
  def: string
  e1: number
  e2: number
  /** The example with its numbers substituted, e.g. "2 × 3 − 3". */
  exampleSub: string
  exampleVal: number
  c: number
  d: number
  /** Your numbers substituted into the rule, e.g. "3 × 5 − 5". */
  sub: string
  answer: string
  steps: SubStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

export function buildSubstituteSteps(p: SubParams, answer: string, lang: Lang): SubStoryboard {
  // Defensive: tolerate stale/mismatched params (see compareSteps).
  const rule = RULES[p?.formula] ?? FALLBACK
  const e1 = num(p?.e1)
  const e2 = num(p?.e2)
  const c = num(p?.c)
  const d = num(p?.d)
  const exampleSub = rule.sub(e1, e2)
  const exampleVal = rule.fn(e1, e2)
  const sub = rule.sub(c, d)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SubStep[] = [
    // 1. Read the rule.
    {
      showRule: true, showExample: false, showSub: false, showResult: false,
      caption: t('read the rule', 'baca aturannya'),
      hold: 1900, result: false,
    },
    // 2. See the rule worked on the example.
    {
      showRule: true, showExample: true, showSub: false, showResult: false,
      caption: t(`example: ${e1} ★ ${e2} = ${exampleVal}`, `contoh: ${e1} ★ ${e2} = ${exampleVal}`),
      hold: 2300, result: false,
    },
    // 3. Put your own numbers in, the same way.
    {
      showRule: true, showExample: true, showSub: true, showResult: false,
      caption: t(`now put in ${c} and ${d}`, `sekarang masukkan ${c} dan ${d}`),
      hold: 2300, result: false,
    },
    // 4. Compute the result.
    {
      showRule: true, showExample: true, showSub: true, showResult: true,
      caption: `${c} ★ ${d} = ${answer}`,
      hold: 0, result: true,
    },
  ]
  return { def: rule.def, e1, e2, exampleSub, exampleVal, c, d, sub, answer, steps, finalIndex: steps.length - 1 }
}
