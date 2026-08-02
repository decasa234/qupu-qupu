import type { Lang } from './makeTenSteps'

// Storyboard for the concept `odd-one-out`. Four options; three obey a rule that
// is never printed, and one breaks it. The beats replay the only honest method:
// name a rule, TEST it on the three that pass (one beat each, with the working
// shown), then watch the fourth fail it. The answer is never revealed before the
// three checks have been walked.
//
// Mirrors api/services/wmi/concepts/odd-one-out. Params arrive as plain JSON, so
// the shapes and the rule wording are mirrored here rather than imported.
export type OptionState = 'idle' | 'pass' | 'fail'

export interface OddOneOutBeat {
  caption: string
  /** Per-option colour state at this beat, index-aligned with `options`. */
  states: OptionState[]
  /** The rule banner text, or null before a rule has been proposed. */
  rule: string | null
  /** True on the closing beat. */
  result: boolean
  hold: number
}

export interface OddOneOutStoryboard {
  options: { label: string; text: string }[]
  answerIndex: number
  answerLabel: string
  answerText: string
  rule: string
  steps: OddOneOutBeat[]
  finalIndex: number
}

export interface OddOneOutParams {
  domain: 'number-sequence' | 'attribute-group'
  items: string[]
  answerIndex: number
  rule: { kind: string; k: number }
}

const LABELS = ['A', 'B', 'C', 'D']

/** Mirrors SHAPES in api/services/wmi/concepts/odd-one-out. */
const SHAPE_NAMES: Record<string, { id: string; en: string; sides: number; curved: boolean }> = {
  lingkaran: { id: 'lingkaran', en: 'circle', sides: 0, curved: true },
  oval: { id: 'oval', en: 'oval', sides: 0, curved: true },
  segitiga: { id: 'segitiga', en: 'triangle', sides: 3, curved: false },
  persegi: { id: 'persegi', en: 'square', sides: 4, curved: false },
  'persegi-panjang': { id: 'persegi panjang', en: 'rectangle', sides: 4, curved: false },
  'belah-ketupat': { id: 'belah ketupat', en: 'rhombus', sides: 4, curved: false },
  'jajar-genjang': { id: 'jajar genjang', en: 'parallelogram', sides: 4, curved: false },
  trapesium: { id: 'trapesium', en: 'trapezium', sides: 4, curved: false },
  'segi-lima': { id: 'segi lima', en: 'pentagon', sides: 5, curved: false },
  'segi-enam': { id: 'segi enam', en: 'hexagon', sides: 6, curved: false },
}

export function optionText(p: OddOneOutParams, item: string, lang: Lang): string {
  if (p.domain === 'number-sequence') return item
  const shape = SHAPE_NAMES[item]
  if (!shape) return item
  return lang === 'id' ? shape.id : shape.en
}

function ruleWords(p: OddOneOutParams, lang: Lang): string {
  const k = p.rule.k
  const id = lang === 'id'
  switch (p.rule.kind) {
    case 'all-even':
      return id ? 'semuanya genap' : 'all even'
    case 'all-odd':
      return id ? 'semuanya ganjil' : 'all odd'
    case 'multiples':
      return id ? `semuanya kelipatan ${k}` : `all multiples of ${k}`
    case 'squares':
      return id ? 'semuanya bilangan kuadrat' : 'all square numbers'
    case 'same-step':
      return id ? `melompat ${k} setiap kali` : `jumping up by ${k} each time`
    case 'same-sides':
      return id ? `semuanya bersisi ${k}` : `all with ${k} sides`
    case 'straight-sides':
      return id ? 'sisinya lurus semua' : 'all straight sides'
    case 'equal-sides':
      return id ? 'sisinya sama panjang semua' : 'all sides the same length'
    default:
      return id ? 'satu aturan yang sama' : 'one shared rule'
  }
}

/** Ascending for numbers (the method starts by putting them in order); as shown for shapes. */
function keeperOrder(p: OddOneOutParams): number[] {
  const rest = p.items.map((_, i) => i).filter((i) => i !== p.answerIndex)
  if (p.domain !== 'number-sequence') return rest
  return rest.sort((a, b) => Number(p.items[a]) - Number(p.items[b]))
}

function passWhy(p: OddOneOutParams, index: number, lang: Lang): string {
  const item = p.items[index]
  const n = Number(item)
  const shape = SHAPE_NAMES[item]
  const id = lang === 'id'
  switch (p.rule.kind) {
    case 'all-even':
      return `${n} = 2 × ${n / 2}`
    case 'all-odd':
      return `${n} = 2 × ${(n - 1) / 2} + 1`
    case 'multiples':
      return `${n} = ${p.rule.k} × ${n / p.rule.k}`
    case 'squares': {
      const r = Math.round(Math.sqrt(n))
      return `${n} = ${r} × ${r}`
    }
    case 'same-step': {
      const order = keeperOrder(p)
      const at = order.indexOf(index)
      if (at <= 0) return id ? `mulai dari ${n}` : `start at ${n}`
      const prev = Number(p.items[order[at - 1]])
      return `${prev} + ${p.rule.k} = ${n}`
    }
    case 'same-sides':
      return id ? `${shape?.sides ?? 0} sisi` : `${shape?.sides ?? 0} sides`
    case 'straight-sides':
      return id ? `${shape?.sides ?? 0} garis lurus` : `${shape?.sides ?? 0} straight lines`
    case 'equal-sides':
      return id ? 'sisinya sama panjang' : 'sides all equal'
    default:
      return ''
  }
}

function failWhy(p: OddOneOutParams, lang: Lang): string {
  const item = p.items[p.answerIndex]
  const n = Number(item)
  const shape = SHAPE_NAMES[item]
  const id = lang === 'id'
  switch (p.rule.kind) {
    case 'all-even':
      return id ? `${n} = 2 × ${(n - 1) / 2} + 1, sisa 1` : `${n} = 2 × ${(n - 1) / 2} + 1, one left over`
    case 'all-odd':
      return id ? `${n} = 2 × ${n / 2}, pas habis` : `${n} = 2 × ${n / 2}, no remainder`
    case 'multiples': {
      const k = p.rule.k
      const q = Math.floor(n / k)
      return `${k} × ${q} = ${k * q}, ${k} × ${q + 1} = ${k * (q + 1)}`
    }
    case 'squares': {
      const lo = Math.floor(Math.sqrt(n))
      return `${lo} × ${lo} = ${lo * lo}, ${lo + 1} × ${lo + 1} = ${(lo + 1) * (lo + 1)}`
    }
    case 'same-step': {
      const order = keeperOrder(p)
      const first = Number(p.items[order[0]])
      const k = p.rule.k
      const lo = first + Math.floor((n - first) / k) * k
      return id ? `lompatan kena ${lo} lalu ${lo + k}` : `the jumps land on ${lo} then ${lo + k}`
    }
    case 'same-sides':
      return shape?.curved
        ? id
          ? 'tidak punya sisi lurus'
          : 'no straight sides'
        : id
          ? `${shape?.sides ?? 0} sisi, bukan ${p.rule.k}`
          : `${shape?.sides ?? 0} sides, not ${p.rule.k}`
    case 'straight-sides':
      return id ? 'sisinya melengkung' : 'its side curves round'
    case 'equal-sides':
      return id ? 'ada sisi panjang dan sisi pendek' : 'long sides and short sides'
    default:
      return ''
  }
}

export function buildOddOneOutSteps(p: OddOneOutParams, lang: Lang): OddOneOutStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const options = p.items.map((item, i) => ({ label: LABELS[i], text: optionText(p, item, lang) }))
  const order = keeperOrder(p)
  const rule = ruleWords(p, lang)
  const answerText = optionText(p, p.items[p.answerIndex], lang)

  const states: OptionState[] = p.items.map(() => 'idle')
  const steps: OddOneOutBeat[] = [
    {
      caption: t(
        'Three follow one rule and one does not. Look for what three of them share.',
        'Tiga pilihan ikut satu aturan, satu tidak. Cari dulu kesamaan tiga pilihan.',
      ),
      states: [...states],
      rule: null,
      result: false,
      hold: 2200,
    },
  ]

  order.forEach((index, n) => {
    states[index] = 'pass'
    const lead = n === 0 ? t('Try: ', 'Coba: ') : ''
    steps.push({
      caption: `${lead}${options[index].text} — ${passWhy(p, index, lang)}`,
      states: [...states],
      rule,
      result: false,
      hold: 1900,
    })
  })

  states[p.answerIndex] = 'fail'
  steps.push({
    caption: `${answerText} — ${failWhy(p, lang)}`,
    states: [...states],
    rule,
    result: false,
    hold: 2300,
  })

  steps.push({
    caption: t(
      `Only ${answerText} fails the rule, so the answer is ${LABELS[p.answerIndex]}.`,
      `Hanya ${answerText} yang tidak lolos aturan, jadi jawabannya ${LABELS[p.answerIndex]}.`,
    ),
    states: [...states],
    rule,
    result: true,
    hold: 0,
  })

  return {
    options,
    answerIndex: p.answerIndex,
    answerLabel: LABELS[p.answerIndex],
    answerText,
    rule,
    steps,
    finalIndex: steps.length - 1,
  }
}
