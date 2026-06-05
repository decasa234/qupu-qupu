export type Lang = 'en' | 'id'

interface Rule {
  def: string
  sub: (a: number, b: number) => string
}

// Mirrors the four formulas in api/services/wmi/concepts/custom-operation. The
// explainer only needs the rule text and the substituted expression; the
// numeric answer is passed in (the concept already computed it).
const RULES: Record<string, Rule> = {
  'mul-minus-b': { def: 'a ◎ b = a × b − b', sub: (a, b) => `${a} × ${b} − ${b}` },
  'mul-plus-sum': { def: 'a ◎ b = a × b + a + b', sub: (a, b) => `${a} × ${b} + ${a} + ${b}` },
  'double-first-plus': { def: 'a ◎ b = a + a + b', sub: (a, b) => `${a} + ${a} + ${b}` },
  'sum-times-two': { def: 'a ◎ b = (a + b) × 2', sub: (a, b) => `(${a} + ${b}) × 2` },
}
const FALLBACK: Rule = { def: 'a ◎ b = …', sub: (a, b) => `${a} ◎ ${b}` }

export interface SubStep {
  showRule: boolean
  showSub: boolean
  showResult: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface SubStoryboard {
  def: string
  c: number
  d: number
  /** The rule with the two numbers substituted in, e.g. "3 × 5 − 5". */
  sub: string
  answer: string
  steps: SubStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

export function buildSubstituteSteps(
  formulaId: string,
  c: number,
  d: number,
  answer: string,
  lang: Lang,
): SubStoryboard {
  const rule = RULES[formulaId] ?? FALLBACK
  const sub = rule.sub(c, d)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: SubStep[] = [
    // 1. Read the rule.
    {
      showRule: true, showSub: false, showResult: false,
      caption: t('read the rule', 'baca aturannya'),
      hold: 2000, result: false,
    },
    // 2. Substitute your two numbers, like the example.
    {
      showRule: true, showSub: true, showResult: false,
      caption: t(`put in ${c} and ${d}`, `masukkan ${c} dan ${d}`),
      hold: 2200, result: false,
    },
    // 3. Compute the result.
    {
      showRule: true, showSub: true, showResult: true,
      caption: `${c} ◎ ${d} = ${answer}`,
      hold: 0, result: true,
    },
  ]
  return { def: rule.def, c, d, sub, answer, steps, finalIndex: steps.length - 1 }
}
