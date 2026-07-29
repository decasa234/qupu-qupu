import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildTransferToEqualizeBreakdown } from './breakdown.js'

export const ASKS = ['equalize', 'after-transfer', 'find-original'] as const
export type Ask = (typeof ASKS)[number]

export const SUBJECTS = ['giver', 'receiver'] as const
export type Subject = (typeof SUBJECTS)[number]

// Moving k items from one child to another changes the GAP by 2k, not k: the
// giver loses k AND the receiver gains k. Every ask form below is a different
// door into that one fact.
const paramsSchema = z
  .object({
    ask: z.enum(ASKS),
    nameA: z.string().min(1),
    nameB: z.string().min(1),
    startA: z.number().int().min(0).max(20),
    startB: z.number().int().min(0).max(20),
    transfer: z.number().int().min(1).max(9),
    // Only read by the 'find-original' ask: whose starting count is unknown.
    subject: z.enum(SUBJECTS),
    item_en: z.string().min(1),
    item_one_en: z.string().min(1),
    item_id: z.string().min(1),
  })
  .refine((v) => v.nameA !== v.nameB, {
    message: 'the two children must have different names',
  })
  .refine((v) => v.transfer <= v.startA, {
    message: 'nobody can give away more than they hold',
  })
  .refine((v) => v.startB + v.transfer <= 20, {
    message: 'counts must stay at or below the grade-1 ceiling of 20',
  })
  .refine((v) => v.ask !== 'equalize' || equalizingTransfer(v.startA, v.startB) === v.transfer, {
    message: 'equalize needs a whole-number transfer that makes both counts equal',
  })
  .refine(
    (v) => v.ask !== 'after-transfer' || v.startA - v.transfer - (v.startB + v.transfer) >= 1,
    { message: 'after-transfer keeps the giver strictly ahead so the gap never flips or hits 0' },
  )
  .refine(
    (v) => v.ask !== 'find-original' || (v.startA > 2 * v.transfer && v.startB + 2 * v.transfer <= 20),
    { message: 'find-original keeps both the answer and its tempting wrong answer inside 1…20' },
  )
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Budi', 'Siti', 'Ayu', 'Rian', 'Dewi', 'Tono', 'Nadia', 'Fajar'] as const

const ITEMS = [
  { item_en: 'marbles', item_one_en: 'marble', item_id: 'kelereng' },
  { item_en: 'stickers', item_one_en: 'sticker', item_id: 'stiker' },
  { item_en: 'candies', item_one_en: 'candy', item_id: 'permen' },
  { item_en: 'pencils', item_one_en: 'pencil', item_id: 'pensil' },
] as const

export const meta = {
  slug: 'transfer-to-equalize',
  name_en: 'Move some over to make them equal',
  name_id: 'Pindahkan agar sama banyak',
  grades: [1] as const,
  description_id:
    'Memindahkan benda dari satu anak ke anak lain: setiap 1 benda yang pindah mengubah selisih sebanyak 2.',
} as const

// English needs "1 marble" but "3 marbles"; Indonesian needs neither.
export function enCount(n: number, params: Params): string {
  return `${n} ${n === 1 ? params.item_one_en : params.item_en}`
}

// Direct simulation: try every whole number of items to move and return the one
// that lands both children on the same count. Returns null when no whole number
// works (an odd total), so the generator can never emit a rounded answer.
export function equalizingTransfer(startA: number, startB: number): number | null {
  for (let t = 0; t <= startA; t++) {
    if (startA - t === startB + t) return t
  }
  return null
}

export interface Simulation {
  afterA: number
  afterB: number
  gapBefore: number
  gapAfter: number
  /** Only for the 'equalize' ask: the whole number of items that must move. */
  equalTransfer: number | null
  /** Only for the 'equalize' ask: what each child ends up holding. */
  equalCount: number | null
  /** Only for the 'find-original' ask: whose starting count is asked for. */
  subjectName: string
  answer: string
}

// Walks the story forward exactly as it is worded, then reads the answer off the
// simulated state. No closed-form shortcut, so the answer can never disagree
// with the sentences the child reads.
export function simulate(params: Params): Simulation {
  const { ask, startA, startB, transfer, subject, nameA, nameB } = params
  const subjectName = subject === 'giver' ? nameA : nameB
  const gapBefore = Math.abs(startA - startB)

  if (ask === 'equalize') {
    const t = equalizingTransfer(startA, startB)
    if (t === null || t < 1) {
      throw new Error(
        `transfer-to-equalize: no whole number of items moves ${startA} and ${startB} to the same count`,
      )
    }
    return {
      afterA: startA - t,
      afterB: startB + t,
      gapBefore,
      gapAfter: 0,
      equalTransfer: t,
      equalCount: startA - t,
      subjectName,
      answer: String(t),
    }
  }

  const afterA = startA - transfer
  const afterB = startB + transfer
  const gapAfter = Math.abs(afterA - afterB)

  if (ask === 'after-transfer') {
    return {
      afterA,
      afterB,
      gapBefore,
      gapAfter,
      equalTransfer: null,
      equalCount: null,
      subjectName,
      answer: String(gapAfter),
    }
  }

  // find-original — the body shows the AFTER counts; the child works backwards.
  return {
    afterA,
    afterB,
    gapBefore,
    gapAfter,
    equalTransfer: null,
    equalCount: null,
    subjectName,
    answer: String(subject === 'giver' ? startA : startB),
  }
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const names = rng.shuffle(NAMES)
  const item = rng.pick(ITEMS)
  const subject = rng.pick(SUBJECTS)
  const base = { ask, nameA: names[0], nameB: names[1], subject, ...item }

  if (ask === 'equalize') {
    // Build backwards from the answer so the total is always even.
    const transfer = rng.int(1, 4)
    const startB = rng.int(2, 12)
    const startA = startB + 2 * transfer // ≤ 12 + 8 = 20
    return { ...base, startA, startB, transfer }
  }

  if (ask === 'after-transfer') {
    // Gap must stay bigger than 2 × transfer so the giver is still ahead after
    // the move — no flip, no zero gap, nothing negative.
    const transfer = rng.int(1, 4)
    const startB = rng.int(1, 20 - 2 * transfer - 1)
    const gap = rng.int(2 * transfer + 1, 20 - startB)
    return { ...base, startA: startB + gap, startB, transfer }
  }

  // find-original: startA > 2 × transfer and startB + 2 × transfer ≤ 20 keep both
  // the answer and its tempting wrong answer inside 1…20. The strict inequality
  // also stops the giver's AFTER count from landing exactly on the transfer,
  // which reads confusingly ("gave 2, now has 2").
  const transfer = rng.int(1, 5)
  const startA = rng.int(2 * transfer + 1, 20)
  const startB = rng.int(1, 20 - 2 * transfer)
  return { ...base, startA, startB, transfer }
}

export function render(params: Params): Rendered {
  const { ask, nameA, nameB, startA, startB, transfer, item_id, item_en, item_one_en } = params
  const sim = simulate(params)
  const breakdown = buildTransferToEqualizeBreakdown(params)

  if (ask === 'equalize') {
    const t = sim.equalTransfer as number
    const each = sim.equalCount as number
    return {
      body_en:
        `${nameA} has ${enCount(startA, params)}. ${nameB} has ${enCount(startB, params)}. ` +
        `${nameA} wants to give some ${item_en} to ${nameB} so that they have the same number of ${item_en}. ` +
        `Find: How many ${item_en} must ${nameA} give to ${nameB}?`,
      body_id:
        `${nameA} punya ${startA} ${item_id}. ${nameB} punya ${startB} ${item_id}. ` +
        `${nameA} ingin memberi beberapa ${item_id} kepada ${nameB} supaya ${item_id} mereka sama banyak. ` +
        `Cari: Berapa ${item_id} yang harus ${nameA} berikan kepada ${nameB}?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: sim.answer,
      hint_en: `Every 1 ${item_one_en} that moves shrinks the gap by 2, not by 1 — so move half the gap.`,
      hint_id: `Setiap 1 ${item_id} yang pindah membuat selisih berkurang 2, bukan 1 — jadi pindahkan setengah dari selisihnya.`,
      hint_steps_en: [
        `The gap right now: ${startA} − ${startB} = ${sim.gapBefore}.`,
        `Every 1 ${item_one_en} that moves changes the gap by 2, not 1: the giver loses 1 and the receiver gains 1.`,
        `So the number to move is ${sim.gapBefore} ÷ 2 = ${t}. Check: ${startA} − ${t} = ${each} and ${startB} + ${t} = ${each}.`,
      ],
      hint_steps_id: [
        `Selisih mereka sekarang: ${startA} − ${startB} = ${sim.gapBefore}.`,
        `Setiap 1 ${item_id} yang pindah mengubah selisih sebanyak 2, bukan 1: yang memberi berkurang 1 dan yang menerima bertambah 1.`,
        `Jadi banyak yang dipindah = ${sim.gapBefore} ÷ 2 = ${t}. Cek: ${startA} − ${t} = ${each} dan ${startB} + ${t} = ${each}.`,
      ],
      breakdown,
    }
  }

  if (ask === 'after-transfer') {
    const twice = 2 * transfer
    return {
      body_en:
        `${nameA} has ${enCount(startA, params)}. ${nameB} has ${enCount(startB, params)}. ` +
        `Then ${nameA} gives ${enCount(transfer, params)} to ${nameB}. ` +
        `Find: How many more ${item_en} does ${nameA} have than ${nameB} now?`,
      body_id:
        `${nameA} punya ${startA} ${item_id}. ${nameB} punya ${startB} ${item_id}. ` +
        `Lalu ${nameA} memberi ${transfer} ${item_id} kepada ${nameB}. ` +
        `Cari: Sekarang ${nameA} punya berapa ${item_id} lebih banyak daripada ${nameB}?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: sim.answer,
      hint_en: `The gap does not shrink by ${transfer}. It shrinks by 2 × ${transfer}, because one child loses ${transfer} and the other gains ${transfer}.`,
      hint_id: `Selisihnya tidak berkurang ${transfer}. Selisih berkurang 2 × ${transfer}, karena satu anak berkurang ${transfer} dan satu lagi bertambah ${transfer}.`,
      hint_steps_en: [
        `The gap before the move: ${startA} − ${startB} = ${sim.gapBefore}.`,
        `${enCount(transfer, params)} move across, so the gap changes by 2 × ${transfer} = ${twice}, not ${transfer}: ${nameA} loses ${transfer} and ${nameB} gains ${transfer}.`,
        `The gap now: ${sim.gapBefore} − ${twice} = ${sim.gapAfter}. Check: ${nameA} has ${sim.afterA}, ${nameB} has ${sim.afterB}, and ${sim.afterA} − ${sim.afterB} = ${sim.gapAfter}.`,
      ],
      hint_steps_id: [
        `Selisih sebelum dipindah: ${startA} − ${startB} = ${sim.gapBefore}.`,
        `${transfer} ${item_id} pindah, jadi selisih berubah 2 × ${transfer} = ${twice}, bukan ${transfer}: ${nameA} berkurang ${transfer} dan ${nameB} bertambah ${transfer}.`,
        `Selisih sekarang: ${sim.gapBefore} − ${twice} = ${sim.gapAfter}. Cek: ${nameA} punya ${sim.afterA}, ${nameB} punya ${sim.afterB}, dan ${sim.afterA} − ${sim.afterB} = ${sim.gapAfter}.`,
      ],
      breakdown,
    }
  }

  // find-original — the child sees the AFTER counts and rewinds the move.
  const twice = 2 * transfer
  const isGiver = params.subject === 'giver'
  const undo_en = isGiver
    ? `Rewind for ${nameA}: ${sim.afterA} + ${transfer} = ${enCount(startA, params)}. Check: ${startA} − ${transfer} = ${sim.afterA}.`
    : `Rewind for ${nameB}: ${sim.afterB} − ${transfer} = ${enCount(startB, params)}. Check: ${startB} + ${transfer} = ${sim.afterB}.`
  const undo_id = isGiver
    ? `Putar balik untuk ${nameA}: ${sim.afterA} + ${transfer} = ${startA} ${item_id}. Cek: ${startA} − ${transfer} = ${sim.afterA}.`
    : `Putar balik untuk ${nameB}: ${sim.afterB} − ${transfer} = ${startB} ${item_id}. Cek: ${startB} + ${transfer} = ${sim.afterB}.`

  return {
    body_en:
      `${nameA} gives ${enCount(transfer, params)} to ${nameB}. ` +
      `Now ${nameA} has ${enCount(sim.afterA, params)} and ${nameB} has ${enCount(sim.afterB, params)}. ` +
      `Find: How many ${item_en} did ${sim.subjectName} have at first?`,
    body_id:
      `${nameA} memberi ${transfer} ${item_id} kepada ${nameB}. ` +
      `Sekarang ${nameA} punya ${sim.afterA} ${item_id} dan ${nameB} punya ${sim.afterB} ${item_id}. ` +
      `Cari: Berapa ${item_id} yang ${sim.subjectName} punya mula-mula?`,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: sim.answer,
    hint_en: `Rewind the move. One transfer changes two numbers at once, so the gap between them shifted by 2 × ${transfer} = ${twice}.`,
    hint_id: `Putar balik perpindahannya. Satu perpindahan mengubah dua bilangan sekaligus, jadi selisih mereka bergeser 2 × ${transfer} = ${twice}.`,
    hint_steps_en: [
      `The move already happened: ${nameA} gave ${enCount(transfer, params)} to ${nameB}.`,
      `One move changes two numbers: ${nameA} went down ${transfer} and ${nameB} went up ${transfer}, so their gap shifted by 2 × ${transfer} = ${twice}.`,
      undo_en,
    ],
    hint_steps_id: [
      `Perpindahannya sudah terjadi: ${nameA} memberi ${transfer} ${item_id} kepada ${nameB}.`,
      `Satu perpindahan mengubah dua bilangan: ${nameA} berkurang ${transfer} dan ${nameB} bertambah ${transfer}, jadi selisih mereka bergeser 2 × ${transfer} = ${twice}.`,
      undo_id,
    ],
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
