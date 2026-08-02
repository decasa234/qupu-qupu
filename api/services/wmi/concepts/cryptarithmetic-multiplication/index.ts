import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCryptaMulBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  /** The number being multiplied — 2 or 3 digits (the "shape" is its length). */
  top: z.number().int().min(10).max(999),
  /** The single-digit multiplier. Always SHOWN, so the ones column bites straight away. */
  multiplier: z.number().int().min(2).max(9),
  /** Indices (left to right) of the top row's digits that are covered by a letter. */
  hiddenTop: z.array(z.number().int().min(0).max(2)),
  /** Indices (left to right) of the product's digits that are covered by a letter. */
  hiddenProduct: z.array(z.number().int().min(0).max(3)),
  ask: z.enum(['the-product', 'sum-of-hidden-digits', 'one-named-digit']),
  /** Which hidden slot the question names, when ask === 'one-named-digit'. */
  askSlot: z.number().int().min(0).max(2),
})
export type Params = z.infer<typeof paramsSchema>
export type Ask = Params['ask']

export const meta = {
  slug: 'cryptarithmetic-multiplication',
  name_en: 'Missing-digit long multiplication',
  name_id: 'Teka-teki perkalian bersusun',
  grades: [3] as const,
  description_id:
    'Beberapa angka pada perkalian bersusun ditutup huruf; temukan kembali lewat kolom satuan dan simpanan.',
} as const

const asc = (a: number, b: number) => a - b

/** A digit covered by a letter. `col` is 0 for the ones column, counting leftwards. */
export interface Slot {
  row: 'top' | 'product'
  /** Index into that row's digit string, LEFT to right. */
  index: number
  /** Column, 0 = ones. */
  col: number
  letter: string
  /** The digit really hiding there. */
  digit: number
}

export interface Puzzle {
  top: number
  multiplier: number
  product: number
  /** True digits. */
  topStr: string
  prodStr: string
  /** Digits with the hidden ones swapped for their letter, e.g. "2A" and "B2". */
  topMask: string
  prodMask: string
  slots: Slot[]
  letters: string[]
  /** Slot named by the question (only meaningful for ask === 'one-named-digit'). */
  askedSlot: Slot
}

/**
 * Normalises the hidden-slot lists and hands out letters A, B, C in reading
 * order (top row left to right, then the product row left to right).
 *
 * A column may never hide BOTH its top digit and its product digit: that column
 * would pin neither of them, and the right-to-left chain the child is taught
 * would stall. Any such product slot is dropped here, so even hand-written or
 * stale params stay solvable column by column.
 */
export function buildPuzzle(p: Params): Puzzle {
  const topStr = String(p.top)
  const product = p.top * p.multiplier
  const prodStr = String(product)
  const topLen = topStr.length
  const prodLen = prodStr.length

  const topIdx = [...new Set(p.hiddenTop)].filter((i) => i >= 0 && i < topLen).sort(asc)
  const blockedCols = new Set(topIdx.map((i) => topLen - 1 - i))
  const prodIdx = [...new Set(p.hiddenProduct)]
    .filter((k) => k >= 0 && k < prodLen && !blockedCols.has(prodLen - 1 - k))
    .sort(asc)

  const slots: Slot[] = []
  const letterAt = (n: number) => String.fromCharCode(65 + n)
  for (const index of topIdx) {
    slots.push({
      row: 'top',
      index,
      col: topLen - 1 - index,
      letter: letterAt(slots.length),
      digit: Number(topStr[index]),
    })
  }
  for (const index of prodIdx) {
    slots.push({
      row: 'product',
      index,
      col: prodLen - 1 - index,
      letter: letterAt(slots.length),
      digit: Number(prodStr[index]),
    })
  }

  const mask = (str: string, row: 'top' | 'product') =>
    str
      .split('')
      .map((ch, i) => slots.find((s) => s.row === row && s.index === i)?.letter ?? ch)
      .join('')

  const askedSlot = slots[Math.min(Math.max(p.askSlot, 0), slots.length - 1)]

  return {
    top: p.top,
    multiplier: p.multiplier,
    product,
    topStr,
    prodStr,
    topMask: mask(topStr, 'top'),
    prodMask: mask(prodStr, 'product'),
    slots,
    letters: slots.map((s) => s.letter),
    askedSlot,
  }
}

/**
 * Every letter -> digit assignment that makes the written multiplication true:
 * no row may start with 0, and top x multiplier must equal the product exactly
 * as drawn (same number of digits, every shown digit unchanged).
 *
 * Brute force over 10^k assignments (k <= 3), so `generate` can reject any
 * puzzle that has 0 or 2+ solutions instead of trusting its own reasoning.
 */
export function solutions(p: Params): Array<Record<string, number>> {
  const z = buildPuzzle(p)
  const k = z.slots.length
  const found: Array<Record<string, number>> = []
  const assign: Record<string, number> = {}

  const build = (str: string, row: 'top' | 'product') =>
    str
      .split('')
      .map((ch, i) => {
        const slot = z.slots.find((s) => s.row === row && s.index === i)
        return slot ? String(assign[slot.letter]) : ch
      })
      .join('')

  const recurse = (idx: number) => {
    if (idx === k) {
      const t = build(z.topStr, 'top')
      const s = build(z.prodStr, 'product')
      if (t[0] === '0' || s[0] === '0') return
      if (Number(t) * p.multiplier === Number(s)) found.push({ ...assign })
      return
    }
    for (let d = 0; d <= 9; d++) {
      assign[z.slots[idx].letter] = d
      recurse(idx + 1)
    }
    delete assign[z.slots[idx].letter]
  }
  recurse(0)
  return found
}

/** One column of the written multiplication, right to left. */
export interface ColumnStep {
  /** 0 = ones. */
  col: number
  /** True when the top number still reaches this column. */
  hasTop: boolean
  topDigit: number
  topLetter: string | null
  carryIn: number
  /** topDigit * multiplier + carryIn. */
  raw: number
  prodDigit: number
  prodLetter: string | null
  carryOut: number
}

/** Walks the columns right to left, exactly the way the child is taught to. */
export function columnTrace(p: Params): ColumnStep[] {
  const z = buildPuzzle(p)
  const topLen = z.topStr.length
  const prodLen = z.prodStr.length
  const out: ColumnStep[] = []
  let carryIn = 0
  for (let col = 0; col < prodLen; col++) {
    const hasTop = col < topLen
    const topDigit = hasTop ? Number(z.topStr[topLen - 1 - col]) : 0
    const raw = topDigit * p.multiplier + carryIn
    const prodDigit = raw % 10
    const carryOut = (raw - prodDigit) / 10
    out.push({
      col,
      hasTop,
      topDigit,
      topLetter: z.slots.find((s) => s.row === 'top' && s.col === col)?.letter ?? null,
      carryIn,
      raw,
      prodDigit,
      prodLetter: z.slots.find((s) => s.row === 'product' && s.col === col)?.letter ?? null,
      carryOut,
    })
    carryIn = carryOut
  }
  return out
}

export function answerOf(p: Params): string {
  const z = buildPuzzle(p)
  if (p.ask === 'the-product') return String(z.product)
  if (p.ask === 'sum-of-hidden-digits')
    return String(z.slots.reduce((sum, s) => sum + s.digit, 0))
  return String(z.askedSlot.digit)
}

const COL_EN = ['ones', 'tens', 'hundreds', 'thousands']
const COL_ID = ['satuan', 'puluhan', 'ratusan', 'ribuan']

/**
 * Short lines that DERIVE every hidden digit instead of announcing it. Each line
 * is one column: the arithmetic that column forces, the digit that follows from
 * it, and the carry it hands to the column on its left.
 *
 * The walk ALWAYS opens on the ones column — that is where a child is taught to
 * start — and never skips a column that produces a carry, because a later line
 * would then lean on a carry nobody worked out. Columns that pin nothing and
 * carry nothing are the only ones left silent.
 */
export function buildHintSteps(p: Params): { en: string[]; id: string[] } {
  const z = buildPuzzle(p)
  const m = p.multiplier
  const en: string[] = []
  const id: string[] = []

  const trace = columnTrace(p)
  const lastDecisive = trace.reduce(
    (last, c) => (c.topLetter || c.prodLetter ? c.col : last),
    0,
  )

  for (const c of trace) {
    if (c.col > lastDecisive) break
    const decisive = !!(c.topLetter || c.prodLetter)
    if (!decisive && c.col !== 0 && c.carryOut === 0) continue
    const nameEn = COL_EN[c.col] ?? 'next'
    const nameId = COL_ID[c.col] ?? 'berikutnya'
    const headEn = `${nameEn[0].toUpperCase()}${nameEn.slice(1)} column:`
    const headId = `Kolom ${nameId}:`
    const carryEn = c.carryOut > 0 ? ` Carry ${c.carryOut} to the left.` : ' Nothing to carry.'
    const carryId = c.carryOut > 0 ? ` Simpan ${c.carryOut} ke kiri.` : ' Tidak ada simpanan.'

    if (c.topLetter) {
      // The product digit here is shown, so the column asks "which digit times
      // the multiplier ends in it?" — and with multiplier 3, 7 or 9 exactly one
      // digit out of 0-9 can, which is what pins the letter.
      const plus = c.carryIn > 0 ? ` plus the carried ${c.carryIn}` : ''
      const plusId = c.carryIn > 0 ? ` ditambah simpanan ${c.carryIn}` : ''
      en.push(
        `${headEn} ${c.topLetter} × ${m}${plus} has to end in ${c.prodDigit}. Testing 0-9, only ${c.topDigit} does, so ${c.topLetter} = ${c.topDigit}.${carryEn}`,
      )
      id.push(
        `${headId} ${c.topLetter} × ${m}${plusId} harus berakhir angka ${c.prodDigit}. Dicoba 0-9, cuma ${c.topDigit} yang cocok, jadi ${c.topLetter} = ${c.topDigit}.${carryId}`,
      )
      continue
    }

    // The top digit is known here, so the column just works itself out; either it
    // fills the hidden product box, or it confirms the digit already written and
    // — the point of not skipping it — produces the carry the next line needs.
    const L = c.prodLetter
    if (!c.hasTop) {
      const tailEn = L ? `so ${L} = ${c.carryIn}.` : `matching the ${c.prodDigit} already written.`
      const tailId = L
        ? `jadi ${L} = ${c.carryIn}.`
        : `cocok dengan ${c.prodDigit} yang sudah tertulis.`
      en.push(`${headEn} nothing left to multiply, only the carried ${c.carryIn}, ${tailEn}`)
      id.push(`${headId} tidak ada yang dikali lagi, tinggal simpanan ${c.carryIn}, ${tailId}`)
      continue
    }
    const sumEn =
      c.carryIn > 0
        ? `${c.topDigit} × ${m} = ${c.topDigit * m}, plus the carried ${c.carryIn} makes ${c.raw}`
        : `${c.topDigit} × ${m} = ${c.raw}`
    const sumId =
      c.carryIn > 0
        ? `${c.topDigit} × ${m} = ${c.topDigit * m}, ditambah simpanan ${c.carryIn} jadi ${c.raw}`
        : `${c.topDigit} × ${m} = ${c.raw}`
    const tailEn = L ? `so ${L} = ${c.prodDigit}.` : `matching the ${c.prodDigit} already written.`
    const tailId = L
      ? `jadi ${L} = ${c.prodDigit}.`
      : `cocok dengan ${c.prodDigit} yang sudah tertulis.`
    en.push(`${headEn} ${sumEn}, ${tailEn}${carryEn}`)
    id.push(`${headId} ${sumId}, ${tailId}${carryId}`)
  }

  if (p.ask === 'the-product') {
    en.push(`Every box is filled now: ${z.top} × ${m} = ${z.product}.`)
    id.push(`Sekarang semua kotak terisi: ${z.top} × ${m} = ${z.product}.`)
  } else if (p.ask === 'sum-of-hidden-digits') {
    const digits = z.slots.map((s) => s.digit)
    const total = digits.reduce((a, b) => a + b, 0)
    en.push(`Add the digits the letters were hiding: ${digits.join(' + ')} = ${total}.`)
    id.push(`Jumlahkan angka yang tadi tertutup huruf: ${digits.join(' + ')} = ${total}.`)
  } else {
    const s = z.askedSlot
    en.push(`So the letter ${s.letter} was hiding ${s.digit}.`)
    id.push(`Jadi huruf ${s.letter} menutupi angka ${s.digit}.`)
  }

  return { en, id }
}

// A hand-checked puzzle (2A × 3 = B2, unique: A = 4, B = 7), used only if the
// generation loop somehow never lands a fresh unique one.
const FALLBACK: Params = {
  top: 24,
  multiplier: 3,
  hiddenTop: [1],
  hiddenProduct: [0],
  ask: 'one-named-digit',
  askSlot: 1,
}

export function generate(rng: Rng): Params {
  for (let tries = 0; tries < 4000; tries++) {
    const topLen = rng.pick([2, 3])
    const multiplier = rng.int(2, 9)
    const top = rng.int(topLen === 2 ? 10 : 100, topLen === 2 ? 99 : 999)
    const hideTopCount = rng.pick([0, 1, 1, 1])
    const hideProdCount = rng.pick([1, 2])

    // Hiding a top digit only teaches column work when the ones column forces
    // that digit outright, i.e. when d × multiplier has a different last digit
    // for every d. That holds exactly for multipliers coprime with 10.
    if (hideTopCount === 1 && ![3, 7, 9].includes(multiplier)) continue
    // Two hidden digits minimum, otherwise "sum of the hidden digits" is not a sum.
    if (hideTopCount + hideProdCount < 2) continue

    const prodStr = String(top * multiplier)
    const prodLen = prodStr.length
    const hiddenTop = hideTopCount === 1 ? [rng.int(0, topLen - 1)] : []
    const blocked = new Set(hiddenTop.map((i) => topLen - 1 - i))
    const openProd = [...Array(prodLen).keys()].filter((k) => !blocked.has(prodLen - 1 - k))
    if (openProd.length < hideProdCount) continue
    const hiddenProduct = rng.shuffle(openProd).slice(0, hideProdCount).sort(asc)

    // "What is the product?" is only a puzzle when part of the top row is hidden;
    // otherwise the child just multiplies and never reads a column backwards.
    const asks: Ask[] = ['sum-of-hidden-digits', 'one-named-digit']
    if (hiddenTop.length > 0) asks.push('the-product')
    const ask = rng.pick(asks)
    const askSlot = rng.int(0, hiddenTop.length + hiddenProduct.length - 1)

    const candidate: Params = { top, multiplier, hiddenTop, hiddenProduct, ask, askSlot }
    if (solutions(candidate).length !== 1) continue
    return candidate
  }
  return FALLBACK
}

export function render(params: Params) {
  const z = buildPuzzle(params)
  const steps = buildHintSteps(params)

  const askEn =
    params.ask === 'the-product'
      ? 'What is the product?'
      : params.ask === 'sum-of-hidden-digits'
        ? 'What is the sum of all the hidden digits?'
        : `What digit does the letter ${z.askedSlot.letter} hide?`
  const askId =
    params.ask === 'the-product'
      ? 'Berapa hasil perkaliannya?'
      : params.ask === 'sum-of-hidden-digits'
        ? 'Berapa jumlah semua angka yang tertutup huruf?'
        : `Angka berapa yang ditutupi huruf ${z.askedSlot.letter}?`

  return {
    // The preamble ends with a FULL STOP, never a colon: section labels collapse
    // the blank lines at display time, and a trailing "…0:" then runs straight
    // into the sum and reads as part of the equation.
    body_en: `Each letter hides one digit, two letters may hide the same digit, and no number starts with 0.\n\n  ${z.topMask} × ${z.multiplier} = ${z.prodMask}\n\nFind: ${askEn}`,
    body_id: `Setiap huruf menutupi satu angka, dua huruf boleh menutupi angka yang sama, dan tidak ada bilangan yang diawali 0.\n\n  ${z.topMask} × ${z.multiplier} = ${z.prodMask}\n\nCari: ${askId}`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: answerOf(params),
    hint_en: 'Start at the ones column and work leftwards, carrying as you go.',
    hint_id: 'Mulai dari kolom satuan lalu jalan ke kiri sambil membawa simpanan.',
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildCryptaMulBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
