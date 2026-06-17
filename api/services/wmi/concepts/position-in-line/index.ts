import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPositionInLineBreakdown } from './breakdown.js'

// ─── Params schema (union of four modes) ──────────────────────────────────────

// Mode 1 (original / G1-friendly): given position from front AND from back,
// find the total number of people in the line.
const countTotalSchema = z.object({
  mode: z.literal('count-total'),
  name: z.string().min(1),
  fromFront: z.number().int().min(2).max(20),
  fromBack: z.number().int().min(2).max(20),
})

// Mode 2 (harder): given total line length n and position from the front,
// find the position from the back.
const fromBackSchema = z.object({
  mode: z.literal('from-back'),
  name: z.string().min(1),
  n: z.number().int().min(8).max(25),
  pos: z.number().int().min(2),
})

// Mode 3 (harder): given two persons' positions from the front (pos1 < pos2),
// how many people are strictly between them?
const betweenSchema = z.object({
  mode: z.literal('between'),
  nameA: z.string().min(1),
  nameB: z.string().min(1),
  n: z.number().int().min(8).max(25),
  posA: z.number().int().min(1),
  posB: z.number().int().min(3),
})

// Mode 4 (harder): the line reverses direction. Person was at position pos from
// the front in a line of n. After the reversal, what is their new position from
// the front?  Answer = n − pos + 1.
const reversalSchema = z.object({
  mode: z.literal('reversal'),
  name: z.string().min(1),
  n: z.number().int().min(8).max(25),
  pos: z.number().int().min(2),
})

export const paramsSchema = z.discriminatedUnion('mode', [
  countTotalSchema,
  fromBackSchema,
  betweenSchema,
  reversalSchema,
])
export type Params = z.infer<typeof paramsSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NAMES = ['Dan', 'Paul', 'Ann', 'Ken', 'Maya', 'Budi', 'Lina', 'Rio'] as const

/** Total people in the line (count-total mode). */
export function lineLength(p: Extract<Params, { mode: 'count-total' }>): number {
  return p.fromFront + p.fromBack - 1
}

/** Position from the back for from-back mode (also used in reversal). */
export function posFromBack(n: number, pos: number): number {
  return n - pos + 1
}

/** Number of people strictly between posA and posB (posA < posB). */
export function peopleBetween(posA: number, posB: number): number {
  return posB - posA - 1
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const meta = {
  slug: 'position-in-line',
  name_en: 'Position in a line',
  name_id: 'Posisi dalam barisan',
  grades: [1, 2] as const,
  description_id: 'Hitung posisi seseorang dalam barisan dari berbagai arah.',
} as const

// ─── Generate ─────────────────────────────────────────────────────────────────

export function generate(rng: Rng): Params {
  // Weight toward harder modes for olympiad variety; keep count-total for G1.
  const modeRoll = rng.int(1, 4)

  if (modeRoll === 1) {
    // count-total (easy — keep accessible for G1)
    return {
      mode: 'count-total',
      name: rng.pick(NAMES),
      fromFront: rng.int(2, 12),
      fromBack: rng.int(2, 12),
    }
  }

  if (modeRoll === 2) {
    // from-back: given n and pos, find pos from back
    const n = rng.int(8, 20)
    const pos = rng.int(2, n - 1)
    return {
      mode: 'from-back',
      name: rng.pick(NAMES),
      n,
      pos,
    }
  }

  if (modeRoll === 3) {
    // between: two people in a line, count who's strictly between
    const n = rng.int(8, 20)
    const posA = rng.int(1, n - 2)
    const posB = rng.int(posA + 2, Math.min(posA + 8, n))
    const names = rng.shuffle([...NAMES]).slice(0, 2) as [string, string]
    return {
      mode: 'between',
      nameA: names[0],
      nameB: names[1],
      n,
      posA,
      posB,
    }
  }

  // modeRoll === 4: reversal
  const n = rng.int(8, 20)
  const pos = rng.int(2, n - 1)
  return {
    mode: 'reversal',
    name: rng.pick(NAMES),
    n,
    pos,
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

export function render(params: Params) {
  if (params.mode === 'count-total') {
    return renderCountTotal(params)
  }
  if (params.mode === 'from-back') {
    return renderFromBack(params)
  }
  if (params.mode === 'between') {
    return renderBetween(params)
  }
  return renderReversal(params)
}

// ── Mode 1: count-total ───────────────────────────────────────────────────────

function renderCountTotal(p: Extract<Params, { mode: 'count-total' }>) {
  const total = lineLength(p)
  const frontGroup = p.fromFront - 1
  const backGroup = p.fromBack - 1

  return {
    body_en: `${p.name} is standing in a line of children. Counting from the front, ${p.name} is in position ${p.fromFront}. Counting from the back, ${p.name} is in position ${p.fromBack}.\nFind: How many children are in the line?`,
    body_id: `${p.name} berdiri dalam sebuah barisan anak. Dihitung dari depan, ${p.name} berada di urutan ke-${p.fromFront}. Dihitung dari belakang, ${p.name} berada di urutan ke-${p.fromBack}.\nCari: Berapa banyak anak dalam barisan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en: `Think of ${p.name}'s position as splitting the line into three parts: the children in front, ${p.name} in the middle, and the children behind — then count the total.`,
    hint_id: `Bayangkan posisi ${p.name} membagi barisan menjadi tiga bagian: anak-anak di depan, ${p.name} sendiri, dan anak-anak di belakang — lalu hitung seluruhnya.`,
    hint_steps_en: [
      `Children strictly in front of ${p.name}: ${p.fromFront} − 1 = ${frontGroup}.`,
      `Children strictly behind ${p.name}: ${p.fromBack} − 1 = ${backGroup}.`,
      `Add the two groups plus ${p.name}: ${frontGroup} + 1 + ${backGroup} = ${total}.`,
      `There are ${total} children in the line.`,
    ],
    hint_steps_id: [
      `Anak tepat di depan ${p.name}: ${p.fromFront} − 1 = ${frontGroup} anak.`,
      `Anak tepat di belakang ${p.name}: ${p.fromBack} − 1 = ${backGroup} anak.`,
      `Jumlahkan keduanya ditambah ${p.name} sendiri: ${frontGroup} + 1 + ${backGroup} = ${total}.`,
      `Jadi ada ${total} anak dalam barisan itu.`,
    ],
    breakdown: buildPositionInLineBreakdown(p),
  }
}

// ── Mode 2: from-back ─────────────────────────────────────────────────────────

function renderFromBack(p: Extract<Params, { mode: 'from-back' }>) {
  const back = posFromBack(p.n, p.pos)

  return {
    body_en: `There are ${p.n} children standing in a line. ${p.name} is in position ${p.pos} counting from the front.\nFind: What is ${p.name}'s position counting from the back?`,
    body_id: `Ada ${p.n} anak berdiri dalam barisan. ${p.name} berada di urutan ke-${p.pos} dari depan.\nCari: Berapa urutan ${p.name} dihitung dari belakang?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(back),
    hint_en: `The line has ${p.n} children. ${p.name} is ${p.pos}th from the front, so there are ${p.n} − ${p.pos} = ${p.n - p.pos} children behind them, making ${p.name} the ${back}th from the back.`,
    hint_id: `Barisan berisi ${p.n} anak. ${p.name} urutan ke-${p.pos} dari depan, jadi ada ${p.n} − ${p.pos} = ${p.n - p.pos} anak di belakangnya, sehingga ${p.name} urutan ke-${back} dari belakang.`,
    hint_steps_en: [
      `Total children in the line: ${p.n}.`,
      `${p.name} is in position ${p.pos} from the front, so ${p.n} − ${p.pos} = ${p.n - p.pos} children are behind them.`,
      `Position from the back = children behind + 1 = ${p.n - p.pos} + 1 = ${back}.`,
    ],
    hint_steps_id: [
      `Total anak dalam barisan: ${p.n}.`,
      `${p.name} urutan ke-${p.pos} dari depan, jadi ada ${p.n} − ${p.pos} = ${p.n - p.pos} anak di belakangnya.`,
      `Urutan dari belakang = anak di belakang + 1 = ${p.n - p.pos} + 1 = ${back}.`,
    ],
    breakdown: buildPositionInLineBreakdown(p),
  }
}

// ── Mode 3: between ───────────────────────────────────────────────────────────

function renderBetween(p: Extract<Params, { mode: 'between' }>) {
  const between = peopleBetween(p.posA, p.posB)
  const wrongA = p.posB - p.posA       // trap: subtract without subtracting the endpoints

  return {
    body_en: `${p.n} children are standing in a line. ${p.nameA} is in position ${p.posA} from the front. ${p.nameB} is in position ${p.posB} from the front.\nFind: How many children are standing strictly between ${p.nameA} and ${p.nameB}?`,
    body_id: `${p.n} anak berdiri dalam barisan. ${p.nameA} berada di urutan ke-${p.posA} dari depan. ${p.nameB} berada di urutan ke-${p.posB} dari depan.\nCari: Berapa anak yang berdiri tepat di antara ${p.nameA} dan ${p.nameB}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(between),
    hint_en: `${p.nameA} is at position ${p.posA} and ${p.nameB} is at position ${p.posB}. The positions strictly between them are ${p.posA + 1} through ${p.posB - 1}: that is ${p.posB} − ${p.posA} − 1 = ${between} children.`,
    hint_id: `${p.nameA} di urutan ke-${p.posA} dan ${p.nameB} di urutan ke-${p.posB}. Urutan tepat di antara mereka adalah ${p.posA + 1} hingga ${p.posB - 1}: yaitu ${p.posB} − ${p.posA} − 1 = ${between} anak.`,
    hint_steps_en: [
      `${p.nameA} is at position ${p.posA}; ${p.nameB} is at position ${p.posB}.`,
      `The gap between their positions: ${p.posB} − ${p.posA} = ${wrongA}.`,
      `Subtract 1 to exclude both ${p.nameA} and ${p.nameB} themselves: ${wrongA} − 1 = ${between}.`,
    ],
    hint_steps_id: [
      `${p.nameA} di urutan ke-${p.posA}; ${p.nameB} di urutan ke-${p.posB}.`,
      `Selisih posisi mereka: ${p.posB} − ${p.posA} = ${wrongA}.`,
      `Kurangi 1 untuk tidak menghitung ${p.nameA} dan ${p.nameB} sendiri: ${wrongA} − 1 = ${between}.`,
    ],
    breakdown: buildPositionInLineBreakdown(p),
  }
}

// ── Mode 4: reversal ──────────────────────────────────────────────────────────

function renderReversal(p: Extract<Params, { mode: 'reversal' }>) {
  const newPos = posFromBack(p.n, p.pos) // n − pos + 1

  return {
    body_en: `${p.n} children are standing in a line. ${p.name} is in position ${p.pos} counting from the front. The children turn around and reverse the order of the line.\nFind: What is ${p.name}'s new position counting from the front after the reversal?`,
    body_id: `${p.n} anak berdiri dalam barisan. ${p.name} berada di urutan ke-${p.pos} dari depan. Anak-anak berbalik sehingga urutan barisan menjadi terbalik.\nCari: Berapa urutan ${p.name} dari depan setelah barisan dibalik?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(newPos),
    hint_en: `When the line reverses, ${p.name}'s old position from the front becomes their position from the back. Their new front-position = ${p.n} − ${p.pos} + 1 = ${newPos}.`,
    hint_id: `Saat barisan dibalik, posisi lama ${p.name} dari depan menjadi posisinya dari belakang. Posisi baru dari depan = ${p.n} − ${p.pos} + 1 = ${newPos}.`,
    hint_steps_en: [
      `Before reversal: ${p.name} is ${p.pos}th from the front in a line of ${p.n}.`,
      `After reversal, the front becomes the back — so ${p.name}'s old front-rank is now their back-rank.`,
      `New front-position = total − old position + 1 = ${p.n} − ${p.pos} + 1 = ${newPos}.`,
    ],
    hint_steps_id: [
      `Sebelum dibalik: ${p.name} urutan ke-${p.pos} dari depan dalam barisan ${p.n} anak.`,
      `Setelah dibalik, depan menjadi belakang — urutan lama ${p.name} dari depan kini menjadi urutan dari belakang.`,
      `Urutan baru dari depan = total − urutan lama + 1 = ${p.n} − ${p.pos} + 1 = ${newPos}.`,
    ],
    breakdown: buildPositionInLineBreakdown(p),
  }
}

// ─── Concept export ───────────────────────────────────────────────────────────

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
