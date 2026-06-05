import type { Lang } from './makeTenSteps'

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + Number(c), 0)
}

export interface MultipleCheck {
  n: number
  featureEn: string
  featureId: string
  pass: boolean
}

export interface FindMultipleStoryboard {
  d: number
  options: number[]
  ruleEn: string
  ruleId: string
  /** True when the rule is "look at the last digit" (so the UI highlights it). */
  lastDigitRule: boolean
  checks: MultipleCheck[]
  correctIndex: number
  steps: { checked: number; result: boolean; caption: string }[]
  finalIndex: number
}

function ruleText(d: number): { en: string; id: string; lastDigit: boolean } {
  switch (d) {
    case 2:
      return { en: 'Multiples of 2 end in 0, 2, 4, 6 or 8.', id: 'Kelipatan 2 berakhir 0, 2, 4, 6, atau 8.', lastDigit: true }
    case 5:
      return { en: 'Multiples of 5 end in 0 or 5.', id: 'Kelipatan 5 berakhir 0 atau 5.', lastDigit: true }
    case 3:
      return { en: 'For a multiple of 3, the digits add up to a multiple of 3.', id: 'Untuk kelipatan 3, jumlah digitnya kelipatan 3.', lastDigit: false }
    case 9:
      return { en: 'For a multiple of 9, the digits add up to a multiple of 9.', id: 'Untuk kelipatan 9, jumlah digitnya kelipatan 9.', lastDigit: false }
    case 4:
      return { en: 'A multiple of 4 is even, and its half is even too.', id: 'Kelipatan 4 itu genap, dan setengahnya juga genap.', lastDigit: false }
    case 6:
      return { en: 'A multiple of 6 is even AND its digits add up to a multiple of 3.', id: 'Kelipatan 6 itu genap DAN jumlah digitnya kelipatan 3.', lastDigit: false }
    default:
      return { en: `A multiple of ${d} divides by ${d} with no remainder.`, id: `Kelipatan ${d} habis dibagi ${d}.`, lastDigit: false }
  }
}

function checkOne(d: number, n: number): { en: string; id: string; pass: boolean } {
  const last = n % 10
  const ds = digitSum(n)
  switch (d) {
    case 2:
      return { en: `ends in ${last}`, id: `berakhir ${last}`, pass: last % 2 === 0 }
    case 5:
      return { en: `ends in ${last}`, id: `berakhir ${last}`, pass: last === 0 || last === 5 }
    case 3:
      return { en: `digits add to ${ds}`, id: `jumlah digit ${ds}`, pass: ds % 3 === 0 }
    case 9:
      return { en: `digits add to ${ds}`, id: `jumlah digit ${ds}`, pass: ds % 9 === 0 }
    case 4:
      return n % 2 === 0
        ? { en: `half is ${n / 2}`, id: `setengahnya ${n / 2}`, pass: (n / 2) % 2 === 0 }
        : { en: 'odd', id: 'ganjil', pass: false }
    case 6:
      return { en: `even? digits ${ds}`, id: `genap? digit ${ds}`, pass: n % 2 === 0 && ds % 3 === 0 }
    default:
      return { en: `${n} ÷ ${d}`, id: `${n} ÷ ${d}`, pass: n % d === 0 }
  }
}

export function buildFindMultipleSteps(d: number, options: number[], lang: Lang): FindMultipleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const rule = ruleText(d)
  const checks: MultipleCheck[] = options.map((n) => {
    const c = checkOne(d, n)
    return { n, featureEn: c.en, featureId: c.id, pass: c.pass }
  })
  const correctIndex = checks.findIndex((c) => c.pass)
  const correct = options[correctIndex]

  const steps: { checked: number; result: boolean; caption: string }[] = []
  steps.push({ checked: 0, result: false, caption: t(rule.en, rule.id) })
  for (let i = 1; i <= 4; i++) {
    const c = checks[i - 1]
    const mark = c.pass ? '✓' : '✗'
    steps.push({
      checked: i,
      result: false,
      caption: t(`${c.n} → ${c.featureEn} ${mark}`, `${c.n} → ${c.featureId} ${mark}`),
    })
  }
  steps.push({
    checked: 4,
    result: true,
    caption: t(`${correct} fits the rule — it is a multiple of ${d}.`, `${correct} sesuai aturan — kelipatan ${d}.`),
  })

  return { d, options, ruleEn: rule.en, ruleId: rule.id, lastDigitRule: rule.lastDigit, checks, correctIndex, steps, finalIndex: steps.length - 1 }
}
