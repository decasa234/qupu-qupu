import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildCountManyObjectsBreakdown } from './breakdown.js'

export const ICON_KINDS = ['star', 'apple', 'ball', 'leaf', 'fish'] as const
export const LAYOUTS = ['rows', 'scatter', 'grouped-tens'] as const

const paramsSchema = z.object({
  icon: z.enum(ICON_KINDS),
  layout: z.enum(LAYOUTS),
  // How many icons the figure actually draws.
  total: z.number().int().min(15).max(65),
  // Lattice width: icons per row for 'rows', lattice columns for 'scatter'.
  // Unused by 'grouped-tens' (that layout always packs ten per cluster).
  perRow: z.number().int().min(5).max(10),
  // The three near-miss offsets from `total` that become the wrong options.
  distractorDeltas: z.array(z.number().int().min(-9).max(9)).length(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-many-objects',
  name_en: 'Count a large group of objects',
  name_id: 'Hitung benda yang banyak',
  grades: [1] as const,
  description_id:
    'Hitung benda yang jumlahnya banyak dengan cara mengelompokkan (5-an, 10-an, atau per baris), lalu pilih jumlah yang benar.',
} as const

export const LABELS = ['A', 'B', 'C', 'D'] as const

// The WMI signature for this question type: four options clustered tightly
// around the true total, so counting one-by-one and slipping by a couple lands
// you on a wrong-but-plausible number. Each triple is distinct and non-zero;
// the correct answer therefore falls in a different slot per set (A, B, C or D).
const DELTA_SETS: readonly (readonly [number, number, number])[] = [
  [1, 2, 4],
  [2, 3, 5],
  [2, 4, 6],
  [-1, 1, 2],
  [-2, 1, 3],
  [-2, 2, 4],
  [-4, 2, 4],
  [-2, -1, 2],
  [-4, -2, 2],
  [-4, -2, 4],
  [-3, -1, 2],
  [-3, -2, -1],
  [-4, -2, -1],
  [-6, -4, -2],
  [-5, -3, -1],
]

export const ICON_WORDS: Record<
  (typeof ICON_KINDS)[number],
  { id: string; en_p: string }
> = {
  star: { id: 'bintang', en_p: 'stars' },
  apple: { id: 'apel', en_p: 'apples' },
  ball: { id: 'bola', en_p: 'balls' },
  leaf: { id: 'daun', en_p: 'leaves' },
  fish: { id: 'ikan', en_p: 'fish' },
}

export const ARRANGEMENT: Record<(typeof LAYOUTS)[number], { id: string; en: string }> = {
  rows: {
    id: 'disusun rapi dalam baris yang sama panjang',
    en: 'laid out in neat rows of equal length',
  },
  'grouped-tens': {
    id: 'dikumpulkan dalam kelompok sepuluhan',
    en: 'gathered into groups of ten',
  },
  scatter: {
    id: 'tersebar tidak beraturan',
    en: 'scattered about with no pattern',
  },
}

// The four option values, ascending. Distinct by construction: the deltas are
// distinct and never zero.
export function optionValues(p: Params): number[] {
  return [p.total, ...p.distractorDeltas.map((d) => p.total + d)].sort((a, b) => a - b)
}

export function answerLabel(p: Params): string {
  return LABELS[optionValues(p).indexOf(p.total)]
}

// The tempting wrong answer: the near-miss you land on when you count one-by-one
// and slip. Prefer a two-off option (the classic miscount), else the closest.
export function trapValue(p: Params): number {
  const ds = p.distractorDeltas
  if (ds.includes(-2)) return p.total - 2
  if (ds.includes(2)) return p.total + 2
  const nearest = [...ds].sort((a, b) => Math.abs(a) - Math.abs(b))[0]
  return p.total + nearest
}

// How the efficient strategy chunks the pile for this layout: chunk size, how
// many whole chunks there are, and what is left over.
export function grouping(p: Params): { step: number; chunks: number; leftover: number } {
  if (p.layout === 'rows') {
    return {
      step: p.perRow,
      chunks: Math.floor(p.total / p.perRow),
      leftover: p.total % p.perRow,
    }
  }
  if (p.layout === 'grouped-tens') {
    return { step: 10, chunks: Math.floor(p.total / 10), leftover: p.total % 10 }
  }
  return { step: 5, chunks: Math.floor(p.total / 5), leftover: p.total % 5 }
}

// "8, 16, 24" for short runs; "5, 10, 15, …, 50" once the chain gets long.
function skipSeq(step: number, count: number): string {
  if (count <= 0) return ''
  const terms: number[] = []
  for (let i = 1; i <= count; i++) terms.push(step * i)
  if (count <= 6) return terms.join(', ')
  return `${terms[0]}, ${terms[1]}, ${terms[2]}, …, ${terms[count - 1]}`
}

export function generate(rng: Rng): Params {
  const icon = rng.pick(ICON_KINDS)
  const layout = rng.pick(LAYOUTS)
  const perRow = rng.int(5, 10)

  let total: number
  if (layout === 'rows') {
    // Enough rows to be worth skip-counting, few enough to fit the card.
    const minRows = Math.max(2, Math.ceil(15 / perRow))
    const maxRows = Math.max(minRows, Math.min(7, Math.floor(65 / perRow)))
    const fullRows = rng.int(minRows, maxRows)
    const headroom = Math.min(perRow - 1, 65 - perRow * fullRows)
    const extra = headroom > 0 ? rng.int(0, headroom) : 0
    total = perRow * fullRows + extra
  } else if (layout === 'grouped-tens') {
    const groups = rng.int(2, 6)
    total = Math.min(65, groups * 10 + rng.int(0, 9))
  } else {
    total = rng.int(15, 65)
  }

  const deltas = rng.pick(DELTA_SETS)
  return { icon, layout, total, perRow, distractorDeltas: [...deltas] }
}

export function render(params: Params) {
  const noun = ICON_WORDS[params.icon]
  const how = ARRANGEMENT[params.layout]
  const { step, chunks, leftover } = grouping(params)
  const fromChunks = step * chunks
  const seq = skipSeq(step, chunks)

  const choices: WmiChoice[] = optionValues(params).map((v, i) => ({
    label: LABELS[i],
    text: String(v),
  }))
  const answer = answerLabel(params)

  // Step 1 — name the efficient move. Step 2 — skip-count the whole chunks.
  // Step 3 — add the leftovers to land on the total (deduced, never asserted).
  const hint_steps_id: string[] = []
  const hint_steps_en: string[] = []

  if (params.layout === 'rows') {
    hint_steps_id.push(
      `Jangan hitung satu per satu. Hitung satu baris dulu: ada ${step} ${noun.id} tiap baris.`,
    )
    hint_steps_en.push(
      `Don't count one by one. Count a single row first: ${step} ${noun.en_p} in each row.`,
    )
    hint_steps_id.push(
      `Lompat hitung ${step}-an untuk ${chunks} baris penuh: ${seq} → ${fromChunks}.`,
    )
    hint_steps_en.push(
      `Skip-count by ${step} across the ${chunks} full rows: ${seq} → ${fromChunks}.`,
    )
    if (leftover > 0) {
      hint_steps_id.push(
        `Baris terakhir sisa ${leftover} ${noun.id}: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
      hint_steps_en.push(
        `The last row has ${leftover} left over: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
    } else {
      hint_steps_id.push(
        `Tidak ada baris yang kurang, jadi hasil lompat hitung tadi sudah jumlahnya: ${params.total}.`,
      )
      hint_steps_en.push(
        `No row is short, so the skip-count already is the total: ${params.total}.`,
      )
    }
  } else if (params.layout === 'grouped-tens') {
    hint_steps_id.push(
      `Jangan hitung satu per satu. Satu kelompok isinya 10 ${noun.id}, jadi hitung per kelompok.`,
    )
    hint_steps_en.push(
      `Don't count one by one. Each group holds 10 ${noun.en_p}, so count group by group.`,
    )
    hint_steps_id.push(`Ada ${chunks} kelompok penuh: ${seq} → ${fromChunks}.`)
    hint_steps_en.push(`There are ${chunks} full groups: ${seq} → ${fromChunks}.`)
    if (leftover > 0) {
      hint_steps_id.push(
        `Di luar kelompok sisa ${leftover} ${noun.id}: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
      hint_steps_en.push(
        `Outside the groups ${leftover} are left over: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
    } else {
      hint_steps_id.push(
        `Tidak ada yang tersisa di luar kelompok, jadi jumlahnya ${params.total}.`,
      )
      hint_steps_en.push(`Nothing is left outside the groups, so the total is ${params.total}.`)
    }
  } else {
    hint_steps_id.push(
      `Jangan hitung satu per satu. Lingkari dulu tiap 5 ${noun.id} supaya tidak ada yang terlewat.`,
    )
    hint_steps_en.push(
      `Don't count one by one. Ring off every 5 ${noun.en_p} first so none get missed.`,
    )
    hint_steps_id.push(`Dapat ${chunks} lingkaran isi 5: ${seq} → ${fromChunks}.`)
    hint_steps_en.push(`That makes ${chunks} rings of 5: ${seq} → ${fromChunks}.`)
    if (leftover > 0) {
      hint_steps_id.push(
        `Sisa ${leftover} ${noun.id} sendirian: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
      hint_steps_en.push(
        `${leftover} are left on their own: ${fromChunks} + ${leftover} = ${params.total}.`,
      )
    } else {
      hint_steps_id.push(`Tidak ada yang tersisa, jadi jumlahnya ${params.total}.`)
      hint_steps_en.push(`Nothing is left over, so the total is ${params.total}.`)
    }
  }

  return {
    body_en: `The picture above shows a big group of ${noun.en_p}. All the ${noun.en_p} are ${how.en}.\n\nFind: How many ${noun.en_p} are there in all?`,
    body_id: `Gambar di atas menunjukkan banyak ${noun.id}. Semua ${noun.id} itu ${how.id}.\n\nCari: Ada berapa ${noun.id} seluruhnya?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer,
    hint_en: `Don't count one by one — you will lose your place. Group them first (by rows, by 5s, or by 10s), skip-count the groups, then add whatever is left over.`,
    hint_id: `Jangan hitung satu per satu — pasti ada yang terlewat. Kelompokkan dulu (per baris, 5-an, atau 10-an), lompat hitung kelompoknya, lalu tambahkan sisanya.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildCountManyObjectsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
