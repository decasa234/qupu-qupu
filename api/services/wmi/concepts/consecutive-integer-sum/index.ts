import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildConsecutiveSumBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(3).max(6),
  start: z.number().int().min(2).max(30),
  // Which end of the run the question asks for. The method is identical either
  // way — balance on the middle, then step out to the end that was asked.
  ask: z.enum(['smallest', 'largest']),
  // The single option that is NOT one of the run's numbers: the number just
  // before the run ('low') or just after it ('high'). Which side it sits on is
  // what moves the correct answer between the A–D slots.
  neighbour: z.enum(['low', 'high']),
})
export type Params = z.infer<typeof paramsSchema>

export const LABELS = ['A', 'B', 'C', 'D'] as const

export const meta = {
  slug: 'consecutive-integer-sum',
  name_en: 'Sum of consecutive numbers',
  name_id: 'Jumlah bilangan berurutan',
  grades: [3] as const,
  description_id:
    'Jumlah bilangan berurutan setimbang di tengah: jumlah = banyaknya × bilangan tengah; dari tengah melangkah ke ujung yang ditanya.',
} as const

// The sum of n consecutive whole numbers starting at `start`:
// start + (start+1) + ... + (start+n-1) = n*start + n*(n-1)/2.
export function sumOf(p: Params): number {
  return p.n * p.start + (p.n * (p.n - 1)) / 2
}

export function runOf(p: Params): number[] {
  return Array.from({ length: p.n }, (_, i) => p.start + i)
}

// The middle of the run — equivalently ⌊sum ÷ n⌋. For an even-length run there
// are two middles and this is the lower one.
export function middleValue(p: Params): number {
  return p.start + Math.floor((p.n - 1) / 2)
}

export function answerValue(p: Params): number {
  return p.ask === 'smallest' ? p.start : p.start + p.n - 1
}

// The four options, ascending. Always: both ends of the run, its (lower)
// middle, and one number just outside the run. Distinct by construction —
// start < middle < last, and the outsider sits strictly beyond one end.
//
// What each wrong option encodes:
//   • the other end of the run  → solved it, then read off the wrong end
//   • the middle (= ⌊sum ÷ n⌋)  → divided the total by the count and stopped
//   • start − 1 / start + n     → an off-by-one on the run's span (the ladder
//                                 0+1+…+(n−1) run one rung too long / short),
//                                 which lands you just outside the run
export function optionValues(p: Params): number[] {
  const outsider = p.neighbour === 'low' ? p.start - 1 : p.start + p.n
  return [p.start, middleValue(p), p.start + p.n - 1, outsider].sort((a, b) => a - b)
}

export function answerLabel(p: Params): string {
  return LABELS[optionValues(p).indexOf(answerValue(p))]
}

export function generate(rng: Rng): Params {
  const n = rng.int(3, 6)
  const start = rng.int(2, 30)
  const ask = rng.pick(['smallest', 'largest'] as const)
  const neighbour = rng.pick(['low', 'high'] as const)
  return { n, start, ask, neighbour }
}

export function render(params: Params) {
  const { n, start, ask } = params
  const sum = sumOf(params)
  const answer = answerValue(params)
  const label = answerLabel(params)
  const middle = middleValue(params)
  const isOdd = n % 2 === 1

  const choices: WmiChoice[] = optionValues(params).map((v, i) => ({
    label: LABELS[i],
    text: String(v),
  }))

  const askedEn = ask === 'smallest' ? 'smallest' : 'largest'
  const askedId = ask === 'smallest' ? 'terkecil' : 'terbesar'

  // Step 1 — the balancing insight (pair the ends inward; every pair matches).
  // Step 2 — turn that into one division. Step 3/4 — step out to the asked end.
  const hint_steps_en: string[] = [
    'Pair the left end with the right end. Step inward and the left goes up 1 while the right goes down 1, so every pair adds to the same amount.',
  ]
  const hint_steps_id: string[] = [
    'Pasangkan ujung kiri dengan ujung kanan. Melangkah ke dalam, yang kiri naik 1 dan yang kanan turun 1, jadi tiap pasangan jumlahnya sama.',
  ]

  if (isOdd) {
    const stepsOut = (n - 1) / 2
    hint_steps_en.push(
      `The middle number has no partner, so the total is ${n} × the middle: middle = ${sum} ÷ ${n} = ${middle}.`,
    )
    hint_steps_id.push(
      `Bilangan tengah tidak punya pasangan, jadi jumlah = ${n} × tengah: tengah = ${sum} ÷ ${n} = ${middle}.`,
    )
    hint_steps_en.push(
      ask === 'smallest'
        ? `From the middle, step back ${stepsOut}: ${middle} − ${stepsOut} = ${answer}. Pick ${label}.`
        : `From the middle, step on ${stepsOut}: ${middle} + ${stepsOut} = ${answer}. Pick ${label}.`,
    )
    hint_steps_id.push(
      ask === 'smallest'
        ? `Dari tengah mundur ${stepsOut} langkah: ${middle} − ${stepsOut} = ${answer}. Pilih ${label}.`
        : `Dari tengah maju ${stepsOut} langkah: ${middle} + ${stepsOut} = ${answer}. Pilih ${label}.`,
    )
  } else {
    const pairs = n / 2
    const pairSum = sum / pairs // = 2*start + n - 1, always a whole number
    const lowMid = middle // = (pairSum - 1) / 2
    const highMid = middle + 1
    const stepsOut = pairs - 1
    hint_steps_en.push(
      `Nothing is left over: ${pairs} equal pairs, so each pair is ${sum} ÷ ${pairs} = ${pairSum}.`,
    )
    hint_steps_id.push(
      `Tidak ada yang tersisa: ada ${pairs} pasangan yang sama besar, jadi tiap pasangan = ${sum} ÷ ${pairs} = ${pairSum}.`,
    )
    hint_steps_en.push(
      `The two middle numbers differ by 1 and add to ${pairSum}, so they are ${lowMid} and ${highMid}.`,
    )
    hint_steps_id.push(
      `Dua bilangan tengah selisih 1 dan berjumlah ${pairSum}, jadi bilangannya ${lowMid} dan ${highMid}.`,
    )
    hint_steps_en.push(
      ask === 'smallest'
        ? `From ${lowMid}, step back ${stepsOut}: ${lowMid} − ${stepsOut} = ${answer}. Pick ${label}.`
        : `From ${highMid}, step on ${stepsOut}: ${highMid} + ${stepsOut} = ${answer}. Pick ${label}.`,
    )
    hint_steps_id.push(
      ask === 'smallest'
        ? `Dari ${lowMid} mundur ${stepsOut} langkah: ${lowMid} − ${stepsOut} = ${answer}. Pilih ${label}.`
        : `Dari ${highMid} maju ${stepsOut} langkah: ${highMid} + ${stepsOut} = ${answer}. Pilih ${label}.`,
    )
  }

  return {
    body_en: `The sum of ${n} consecutive whole numbers is ${sum}.\n\nFind: What is the ${askedEn} of these numbers?`,
    body_id: `Jumlah ${n} bilangan bulat berurutan adalah ${sum}.\n\nCari: Berapakah bilangan ${askedId} di antara bilangan-bilangan ini?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: label,
    hint_en: `A run of consecutive numbers balances around its middle: the total is how many × the middle. Find the middle first, then step out to the end the question asks for.`,
    hint_id: `Bilangan berurutan itu setimbang di tengahnya: jumlah = banyaknya × bilangan tengah. Cari tengahnya dulu, lalu melangkah keluar ke ujung yang ditanya.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildConsecutiveSumBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
