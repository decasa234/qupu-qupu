import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildLengthMeasureCompareBreakdown } from './breakdown.js'

// ---------------------------------------------------------------------------
// Grade-1 measuring: read a length off a picture, then measure or compare.
//
// Three media:
//   ruler         — the object is aligned at 0, so the right-hand number IS the
//                   length (still deduced as end − 0).
//   offset-ruler  — the SIGNATURE WMI twist: the object does not start at 0, so
//                   the child must subtract (end − start). Reading the right-hand
//                   number straight off the ruler is the trap.
//   unit-chain    — length measured with repeated non-standard units (paper
//                   clips / unit squares) laid end to end.
//
// Everything is whole numbers, never negative, and never above 20 units.
// ---------------------------------------------------------------------------

const OBJECT_KEYS = ['pensil', 'pita', 'ranting', 'sedotan', 'krayon', 'tali'] as const
export type ObjectKey = (typeof OBJECT_KEYS)[number]

export const OBJECTS: Record<
  ObjectKey,
  { id: string; en: string; artId: string; artEn: string }
> = {
  pensil: { id: 'pensil', en: 'pencil', artId: 'Sebuah', artEn: 'A' },
  pita: { id: 'pita', en: 'ribbon', artId: 'Sehelai', artEn: 'A' },
  ranting: { id: 'ranting', en: 'twig', artId: 'Sebatang', artEn: 'A' },
  sedotan: { id: 'sedotan', en: 'straw', artId: 'Sebuah', artEn: 'A' },
  krayon: { id: 'krayon', en: 'crayon', artId: 'Sebuah', artEn: 'A' },
  tali: { id: 'tali', en: 'string', artId: 'Seutas', artEn: 'A' },
}

const UNIT_WORDS = {
  cm: { shortId: 'cm', shortEn: 'cm', longId: 'penggaris', longEn: 'a ruler' },
  klip: { shortId: 'klip', shortEn: 'clips', longId: 'klip kertas', longEn: 'paper clips' },
  petak: { shortId: 'petak', shortEn: 'squares', longId: 'petak satuan', longEn: 'unit squares' },
} as const

const COUNT_ID = ['nol', 'Satu', 'Dua', 'Tiga'] as const
const COUNT_EN = ['zero', 'One', 'Two', 'Three'] as const
export const LABELS = ['A', 'B', 'C'] as const

const MINUS = '−' // proper minus sign, matches the other WMI concepts

const itemSchema = z.object({
  name: z.enum(['pensil', 'pita', 'ranting', 'sedotan', 'krayon', 'tali']),
  start: z.number().int().min(0).max(20),
  length: z.number().int().min(1).max(20),
})

const paramsSchema = z.object({
  medium: z.enum(['ruler', 'offset-ruler', 'unit-chain']),
  unitLabel: z.enum(['cm', 'klip', 'petak']),
  ask: z.enum(['measure-one', 'longest', 'difference']),
  // Rulers: the biggest number printed on the ruler. Unit chains: the longest
  // chain (used only for laying out the figure).
  rulerMax: z.number().int().min(1).max(20),
  items: z.array(itemSchema).min(1).max(3),
  focusA: z.number().int().min(0).max(2),
  focusB: z.number().int().min(0).max(2),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'length-measure-compare',
  name_en: 'Measure and compare lengths',
  name_id: 'Ukur dan bandingkan panjang',
  grades: [1] as const,
  description_id:
    'Baca panjang benda dari gambar penggaris atau satuan berulang, lalu ukur atau bandingkan. Kalau benda tidak mulai dari 0, kurangi!',
} as const

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

export function generate(rng: Rng): Params {
  // offset-ruler is the signature type, so it gets extra weight.
  const medium = rng.pick(['ruler', 'offset-ruler', 'offset-ruler', 'unit-chain'] as const)
  const unitLabel: Params['unitLabel'] =
    medium === 'unit-chain' ? rng.pick(['klip', 'petak'] as const) : 'cm'
  const ask = rng.pick(['measure-one', 'measure-one', 'longest', 'difference'] as const)
  const keys = rng.shuffle(OBJECT_KEYS)

  if (ask === 'measure-one') {
    const name = keys[0]
    if (medium === 'unit-chain') {
      const length = rng.int(4, 10)
      return {
        medium,
        unitLabel,
        ask,
        rulerMax: length,
        items: [{ name, start: 0, length }],
        focusA: 0,
        focusB: 0,
      }
    }
    const start = medium === 'offset-ruler' ? rng.int(1, 4) : 0
    const length = medium === 'offset-ruler' ? rng.int(3, 8) : rng.int(3, 10)
    const end = start + length
    const rulerMax = Math.min(14, end + rng.int(1, 3))
    return {
      medium,
      unitLabel,
      ask,
      rulerMax,
      items: [{ name, start, length }],
      focusA: 0,
      focusB: 0,
    }
  }

  if (ask === 'longest') {
    const count = rng.int(2, 3)
    // Distinct lengths, biggest first — guarantees a single longest object.
    const lengths = rng
      .shuffle([3, 4, 5, 6, 7, 8])
      .slice(0, count)
      .sort((a, b) => b - a)

    if (medium === 'unit-chain') {
      const built = lengths.map((length, i) => ({ name: keys[i], start: 0, length }))
      return {
        medium,
        unitLabel,
        ask,
        rulerMax: lengths[0],
        items: rng.shuffle(built),
        focusA: 0,
        focusB: 0,
      }
    }

    if (medium === 'ruler') {
      const built = lengths.map((length, i) => ({ name: keys[i], start: 0, length }))
      const rulerMax = Math.min(14, lengths[0] + rng.int(1, 3))
      return { medium, unitLabel, ask, rulerMax, items: rng.shuffle(built), focusA: 0, focusB: 0 }
    }

    // offset-ruler — build the trap on purpose: the SECOND-longest object is
    // slid right far enough that it ends at the biggest number on the ruler,
    // even though the longest object is genuinely longer.
    const overshoot = rng.int(1, 2)
    const gap = lengths[0] - lengths[1] // >= 1, lengths are distinct
    const built = [
      { name: keys[0], start: 1, length: lengths[0] },
      { name: keys[1], start: 1 + gap + overshoot, length: lengths[1] },
    ]
    if (count === 3) built.push({ name: keys[2], start: rng.int(1, 3), length: lengths[2] })
    const maxEnd = built.reduce((m, it) => Math.max(m, it.start + it.length), 0)
    const rulerMax = Math.min(14, maxEnd + rng.int(1, 2))
    return { medium, unitLabel, ask, rulerMax, items: rng.shuffle(built), focusA: 0, focusB: 0 }
  }

  // ask === 'difference' — A is always the longer one.
  const lenB = medium === 'unit-chain' ? rng.int(3, 6) : rng.int(3, 5)
  let diff = rng.int(1, 4)
  let startA = 0
  let startB = 0
  if (medium === 'offset-ruler') {
    startA = rng.int(1, 4)
    // Keep enough room that a valid, DIFFERENT startB exists below startA + diff.
    if (startA + diff < 3) diff = 3 - startA
    const upper = Math.min(4, startA + diff - 1)
    const options: number[] = []
    for (let v = 1; v <= upper; v++) if (v !== startA) options.push(v)
    startB = rng.pick(options)
  }
  const lenA = lenB + diff
  const a = { name: keys[0], start: startA, length: lenA }
  const b = { name: keys[1], start: startB, length: lenB }
  const flip = rng.int(0, 1) === 1
  const items = flip ? [b, a] : [a, b]
  const maxEnd = Math.max(a.start + a.length, b.start + b.length)
  const rulerMax = medium === 'unit-chain' ? lenA : Math.min(14, maxEnd + rng.int(1, 2))
  return {
    medium,
    unitLabel,
    ask,
    rulerMax,
    items,
    focusA: flip ? 1 : 0,
    focusB: flip ? 0 : 1,
  }
}

// ---------------------------------------------------------------------------
// derive — the single source of truth shared by render() and the breakdown, so
// every highlight phrase is literally built from the same string pieces as the
// body it must be a substring of.
// ---------------------------------------------------------------------------

export interface ItemInfo {
  key: ObjectKey
  nameId: string
  nameEn: string
  NameId: string
  NameEn: string
  artId: string
  artEn: string
  start: number
  end: number
  length: number
}

export interface Phrase {
  id: string
  en: string
}

export interface Derived {
  infos: ItemInfo[]
  unit: (typeof UNIT_WORDS)[keyof typeof UNIT_WORDS]
  a: ItemInfo
  b: ItemInfo
  longestIndex: number
  farthestEndIndex: number
  answer: string
  answer_type: 'fill_in' | 'multiple_choice'
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
  body_id: string
  body_en: string
  object: Phrase
  question: Phrase
  setup: Phrase | null
  leftEnd: Phrase | null
  rightEnd: Phrase | null
}

export function derive(params: Params): Derived {
  const { medium, unitLabel, ask, items, focusA, focusB } = params
  const unit = UNIT_WORDS[unitLabel]

  const infos: ItemInfo[] = items.map((it) => {
    const o = OBJECTS[it.name]
    return {
      key: it.name,
      nameId: o.id,
      nameEn: o.en,
      NameId: cap(o.id),
      NameEn: cap(o.en),
      artId: o.artId,
      artEn: o.artEn,
      start: it.start,
      end: it.start + it.length,
      length: it.length,
    }
  })

  const a = infos[Math.min(focusA, infos.length - 1)]
  const b = infos[Math.min(focusB, infos.length - 1)]

  let longestIndex = 0
  let farthestEndIndex = 0
  infos.forEach((it, i) => {
    if (it.length > infos[longestIndex].length) longestIndex = i
    if (it.end > infos[farthestEndIndex].end) farthestEndIndex = i
  })

  // --- subject of the opening sentence -------------------------------------
  let subjectId: string
  let subjectEn: string
  let isAreEn: string
  if (ask === 'measure-one') {
    subjectId = `${a.artId} ${a.nameId}`
    subjectEn = `${a.artEn} ${a.nameEn}`
    isAreEn = 'is'
  } else if (ask === 'longest') {
    subjectId = `${COUNT_ID[infos.length]} benda`
    subjectEn = `${COUNT_EN[infos.length]} objects`
    isAreEn = 'are'
  } else {
    subjectId = `${a.NameId} dan ${b.nameId}`
    subjectEn = `${a.artEn} ${a.nameEn} and ${b.artEn.toLowerCase()} ${b.nameEn}`
    isAreEn = 'are'
  }

  // --- sentence 1: how the measuring is set up -----------------------------
  let s1Id: string
  let s1En: string
  if (medium === 'ruler') {
    s1Id = `${subjectId} diukur dengan penggaris.`
    s1En = `${subjectEn} ${isAreEn} measured with a ruler.`
  } else if (medium === 'offset-ruler') {
    s1Id = `${subjectId} diletakkan di atas penggaris.`
    s1En = `${subjectEn} ${isAreEn} placed on a ruler.`
  } else {
    s1Id = `${subjectId} diukur memakai ${unit.longId} yang disusun rapat tanpa celah.`
    s1En = `${subjectEn} ${isAreEn} measured using ${unit.longEn} laid end to end with no gaps.`
  }

  // --- sentence 2: where the ends sit --------------------------------------
  let s2Id = ''
  let s2En = ''
  let setup: Phrase | null = null
  let leftEnd: Phrase | null = null
  let rightEnd: Phrase | null = null

  if (medium === 'ruler') {
    if (ask === 'measure-one') {
      setup = { id: 'Ujung kirinya tepat di angka 0', en: 'Its left end is exactly at 0' }
    } else {
      setup = { id: 'Semua ujung kiri ada di angka 0', en: 'All the left ends are at 0' }
    }
    s2Id = `${setup.id}.`
    s2En = `${setup.en}.`
  } else if (medium === 'offset-ruler') {
    if (ask === 'measure-one') {
      leftEnd = { id: `Ujung kirinya di angka ${a.start}`, en: `Its left end is at ${a.start}` }
      rightEnd = { id: `ujung kanannya di angka ${a.end}`, en: `its right end is at ${a.end}` }
      s2Id = `${leftEnd.id}, ${rightEnd.id}.`
      s2En = `${leftEnd.en} and ${rightEnd.en}.`
    } else {
      setup = { id: 'Ujung kirinya tidak di angka 0', en: 'Their left ends are not at 0' }
      s2Id = `${setup.id}.`
      s2En = `${setup.en}.`
    }
  } else {
    setup = { id: 'disusun rapat tanpa celah', en: 'laid end to end with no gaps' }
  }

  // --- the question --------------------------------------------------------
  let question: Phrase
  if (ask === 'measure-one') {
    question = {
      id: `Berapa ${unit.shortId} panjang ${a.nameId} itu?`,
      en: `How many ${unit.shortEn} long is the ${a.nameEn}?`,
    }
  } else if (ask === 'longest') {
    question = { id: 'Benda mana yang paling panjang?', en: 'Which object is the longest?' }
  } else {
    question = {
      id: `Berapa ${unit.shortId} ${a.nameId} lebih panjang daripada ${b.nameId}?`,
      en: `How many ${unit.shortEn} longer is the ${a.nameEn} than the ${b.nameEn}?`,
    }
  }

  const headId = s2Id ? `${s1Id} ${s2Id}` : s1Id
  const headEn = s2En ? `${s1En} ${s2En}` : s1En
  const body_id = `${headId}\n\nCari: ${question.id}`
  const body_en = `${headEn}\n\nFind: ${question.en}`

  // --- answer + choices ----------------------------------------------------
  let answer: string
  let answer_type: 'fill_in' | 'multiple_choice'
  let choices_id: WmiChoice[] | null = null
  let choices_en: WmiChoice[] | null = null
  if (ask === 'longest') {
    answer_type = 'multiple_choice'
    answer = LABELS[longestIndex]
    choices_id = infos.map((it, i) => ({ label: LABELS[i], text: it.NameId }))
    choices_en = infos.map((it, i) => ({ label: LABELS[i], text: it.NameEn }))
  } else if (ask === 'measure-one') {
    answer_type = 'fill_in'
    answer = String(a.length)
  } else {
    answer_type = 'fill_in'
    answer = String(a.length - b.length)
  }

  return {
    infos,
    unit,
    a,
    b,
    longestIndex,
    farthestEndIndex,
    answer,
    answer_type,
    choices_id,
    choices_en,
    body_id,
    body_en,
    object: { id: subjectId, en: subjectEn },
    question,
    setup,
    leftEnd,
    rightEnd,
  }
}

// ---------------------------------------------------------------------------
// render
// ---------------------------------------------------------------------------

function hintSteps(params: Params, d: Derived): { id: string[]; en: string[] } {
  const { medium, ask } = params
  const u = d.unit
  const a = d.a
  const b = d.b

  if (ask === 'measure-one') {
    if (medium === 'unit-chain') {
      return {
        id: [
          `${cap(u.longId)} disusun rapat dari ujung kiri sampai ujung kanan ${a.nameId}.`,
          `Hitung satu per satu: 1, 2, 3, ... sampai yang terakhir.`,
          `Yang terakhir bernomor ${a.length}, jadi panjangnya ${a.length} ${u.shortId}.`,
        ],
        en: [
          `The ${u.longEn} run from the left end of the ${a.nameEn} to its right end.`,
          `Count them one by one: 1, 2, 3, ... up to the last one.`,
          `The last one is number ${a.length}, so the length is ${a.length} ${u.shortEn}.`,
        ],
      }
    }
    if (medium === 'offset-ruler') {
      return {
        id: [
          `Ujung kiri ${a.nameId} ada di angka ${a.start}, bukan di 0.`,
          `Ujung kanannya ada di angka ${a.end}.`,
          `Panjang = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortId}.`,
        ],
        en: [
          `The left end of the ${a.nameEn} is at ${a.start}, not at 0.`,
          `Its right end is at ${a.end}.`,
          `Length = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortEn}.`,
        ],
      }
    }
    return {
      id: [
        `Ujung kiri ${a.nameId} tepat di angka 0.`,
        `Ujung kanannya ada di angka ${a.end}.`,
        `Panjang = ${a.end} ${MINUS} 0 = ${a.length} ${u.shortId}.`,
      ],
      en: [
        `The left end of the ${a.nameEn} is exactly at 0.`,
        `Its right end is at ${a.end}.`,
        `Length = ${a.end} ${MINUS} 0 = ${a.length} ${u.shortEn}.`,
      ],
    }
  }

  if (ask === 'longest') {
    const win = d.infos[d.longestIndex]
    if (medium === 'unit-chain') {
      const listId = d.infos
        .map((it) => `${it.nameId} ${it.length} ${u.shortId}`)
        .join(', ')
      const listEn = d.infos
        .map((it) => `${it.nameEn} ${it.length} ${u.shortEn}`)
        .join(', ')
      return {
        id: [
          `Hitung ${u.longId} pada setiap benda.`,
          `${cap(listId)}.`,
          `${win.length} paling besar, jadi ${win.nameId} yang paling panjang.`,
        ],
        en: [
          `Count the ${u.longEn} under each object.`,
          `${cap(listEn)}.`,
          `${win.length} is the biggest, so the ${win.nameEn} is the longest.`,
        ],
      }
    }
    if (medium === 'offset-ruler') {
      const listId = d.infos
        .map((it) => `${it.nameId} ${it.end} ${MINUS} ${it.start} = ${it.length}`)
        .join(', ')
      const listEn = d.infos
        .map((it) => `${it.nameEn} ${it.end} ${MINUS} ${it.start} = ${it.length}`)
        .join(', ')
      return {
        id: [
          `Tidak ada yang mulai dari 0, jadi panjang = angka kanan ${MINUS} angka kiri.`,
          `${cap(listId)}.`,
          `${win.length} paling besar, jadi ${win.nameId} yang paling panjang.`,
        ],
        en: [
          `Nothing starts at 0, so length = right number ${MINUS} left number.`,
          `${cap(listEn)}.`,
          `${win.length} is the biggest, so the ${win.nameEn} is the longest.`,
        ],
      }
    }
    const listId = d.infos.map((it) => `${it.nameId} sampai ${it.end}`).join(', ')
    const listEn = d.infos.map((it) => `${it.nameEn} up to ${it.end}`).join(', ')
    return {
      id: [
        `Semua benda mulai di angka 0.`,
        `${cap(listId)}.`,
        `${win.end} paling besar, jadi ${win.nameId} yang paling panjang.`,
      ],
      en: [
        `Every object starts at 0.`,
        `${cap(listEn)}.`,
        `${win.end} is the biggest, so the ${win.nameEn} is the longest.`,
      ],
    }
  }

  // difference
  const diff = a.length - b.length
  if (medium === 'unit-chain') {
    return {
      id: [
        `Hitung ${u.longId} pada ${a.nameId}: ${a.length}.`,
        `Hitung ${u.longId} pada ${b.nameId}: ${b.length}.`,
        `Selisihnya: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortId}.`,
      ],
      en: [
        `Count the ${u.longEn} under the ${a.nameEn}: ${a.length}.`,
        `Count the ${u.longEn} under the ${b.nameEn}: ${b.length}.`,
        `Difference: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortEn}.`,
      ],
    }
  }
  return {
    id: [
      `Panjang ${a.nameId} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortId}.`,
      `Panjang ${b.nameId} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortId}.`,
      `Selisihnya: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortId}.`,
    ],
    en: [
      `Length of the ${a.nameEn} = ${a.end} ${MINUS} ${a.start} = ${a.length} ${u.shortEn}.`,
      `Length of the ${b.nameEn} = ${b.end} ${MINUS} ${b.start} = ${b.length} ${u.shortEn}.`,
      `Difference: ${a.length} ${MINUS} ${b.length} = ${diff} ${u.shortEn}.`,
    ],
  }
}

export function render(params: Params) {
  const d = derive(params)
  const steps = hintSteps(params, d)

  const hint_id =
    params.medium === 'offset-ruler'
      ? `Panjang bukan angka di ujung kanan! Kurangi dulu: angka ujung kanan ${MINUS} angka ujung kiri.`
      : params.medium === 'unit-chain'
        ? `Hitung satuan yang disusun rapat, jangan sampai ada yang terlewat atau terhitung dua kali.`
        : `Bendanya mulai dari 0, jadi angka di ujung kanan itulah panjangnya.`
  const hint_en =
    params.medium === 'offset-ruler'
      ? `The length is not the right-hand number! Subtract first: right number ${MINUS} left number.`
      : params.medium === 'unit-chain'
        ? `Count the units laid end to end — do not skip one or count one twice.`
        : `The object starts at 0, so the right-hand number is the length.`

  return {
    body_en: d.body_en,
    body_id: d.body_id,
    answer_type: d.answer_type,
    choices_en: d.choices_en,
    choices_id: d.choices_id,
    answer: d.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildLengthMeasureCompareBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
