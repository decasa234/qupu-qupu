import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildOrdinalPositionReadBreakdown } from './breakdown.js'

// ─────────────────────────────────────────────────────────────────────────────
// `ordinal-position-read` — read WHAT sits at the n-th place in a drawn row.
//
// Deliberately NOT `position-in-line`: that concept counts HOW MANY children a
// line holds and never draws the line. This one always draws a row of real
// items and asks the child to LAND on one of them — from the left, from the
// right, or by stepping away from a landmark item — then read, add, compare or
// name what they found.
//
// The whole difficulty is direction. "3rd from the right" is where six-year-olds
// slip: they count from the left because that is how they read. Every ask keeps
// that slip visible (it is the trap, and the hint steps walk the row out loud in
// the requested direction instead of asserting a formula).
// ─────────────────────────────────────────────────────────────────────────────

export const ASKS = ['read', 'sum', 'difference', 'which-option-contains-both'] as const
export type Ask = (typeof ASKS)[number]

export const KINDS = ['number', 'picture'] as const
export type Kind = (typeof KINDS)[number]

/** Glyph keys the picture rows draw from (mirrored by the illustration). */
export const PICTURE_KEYS = ['apple', 'banana', 'cherry', 'star', 'tree', 'house'] as const
export type PictureKey = (typeof PICTURE_KEYS)[number]

export const PICTURE_NAMES: Record<PictureKey, { id: string; en: string }> = {
  apple: { id: 'apel', en: 'apple' },
  banana: { id: 'pisang', en: 'banana' },
  cherry: { id: 'ceri', en: 'cherry' },
  star: { id: 'bintang', en: 'star' },
  tree: { id: 'pohon', en: 'tree' },
  house: { id: 'rumah', en: 'house' },
}

export const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const

/** Grade-1 ceiling: a `sum` ask must never push past 20. */
const SUM_CEILING = 20

// ─── params ──────────────────────────────────────────────────────────────────

const fromLeftSchema = z.object({
  type: z.literal('from-left'),
  k: z.number().int().min(1).max(12),
})
const fromRightSchema = z.object({
  type: z.literal('from-right'),
  k: z.number().int().min(1).max(12),
})
const neighbourSchema = z.object({
  type: z.literal('neighbour-of'),
  /** 0-based index of the landmark item, which must be unique in the row. */
  marker: z.number().int().min(0).max(11),
  side: z.enum(['left', 'right']),
})
const offsetSchema = z.object({
  type: z.literal('offset-from-item'),
  marker: z.number().int().min(0).max(11),
  dir: z.enum(['left', 'right']),
  step: z.number().int().min(2).max(3),
})

export const anchorSchema = z.discriminatedUnion('type', [
  fromLeftSchema,
  fromRightSchema,
  neighbourSchema,
  offsetSchema,
])
export type Anchor = z.infer<typeof anchorSchema>

const paramsSchema = z
  .object({
    kind: z.enum(KINDS),
    /** Left-to-right row contents: digit strings, or PICTURE_KEYS. */
    cells: z.array(z.string().min(1)).min(6).max(12),
    /** One anchor for `read`, two for every other ask. */
    anchors: z.array(anchorSchema).min(1).max(2),
    ask: z.enum(ASKS),
    /** Deterministic rotation of the multiple-choice option order. */
    optionShift: z.number().int().min(0).max(3),
  })
  .superRefine((v, ctx) => {
    const n = v.cells.length
    const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message })

    if (v.kind === 'number') {
      if (!v.cells.every((c) => /^\d+$/.test(c))) fail('number rows hold digit strings only')
      if (new Set(v.cells).size !== n) fail('number rows must hold distinct values so every card is a unique landmark')
    } else {
      if (!v.cells.every((c) => (PICTURE_KEYS as readonly string[]).includes(c))) {
        fail('picture rows hold PICTURE_KEYS only')
      }
      if (new Set(v.cells).size < 3) fail('picture rows need at least 3 different objects so the options are not a coin flip')
    }

    const wantTwo = v.ask !== 'read'
    if (wantTwo && v.anchors.length !== 2) fail(`${v.ask} needs exactly two anchors`)
    if (!wantTwo && v.anchors.length !== 1) fail('read needs exactly one anchor')

    for (const a of v.anchors) {
      const t = resolveAnchor(a, n)
      if (t < 0 || t >= n) fail('an anchor points off the end of the row')
      if (a.type === 'neighbour-of' || a.type === 'offset-from-item') {
        if (a.marker < 0 || a.marker >= n) fail('the landmark is off the end of the row')
        else if (v.cells.filter((c) => c === v.cells[a.marker]).length !== 1) {
          fail('the landmark item must appear exactly once, or the child cannot find it')
        }
      }
    }

    if (wantTwo && v.anchors.length === 2) {
      const [ta, tb] = v.anchors.map((a) => resolveAnchor(a, n))
      if (ta === tb) fail('the two anchors must land on different items')
      if (v.ask === 'difference' && v.cells[ta] === v.cells[tb]) fail('difference needs two different numbers')
      if (v.ask === 'which-option-contains-both' && v.cells[ta] === v.cells[tb]) {
        fail('which-option-contains-both needs two different items to name')
      }
      if (v.ask === 'sum' && Number(v.cells[ta]) + Number(v.cells[tb]) > SUM_CEILING) {
        fail(`a sum must stay at or below the grade-1 ceiling of ${SUM_CEILING}`)
      }
    }
  })

export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'ordinal-position-read',
  name_en: 'Read the n-th item from either end',
  name_id: 'Benda ke-n dari kiri atau kanan',
  grades: [1, 2] as const,
  description_id:
    'Menemukan benda di urutan ke-n dari kiri atau dari kanan pada sebuah barisan, lalu membaca, menjumlah, atau membandingkan isinya.',
} as const

// ─── pure geometry of the row ────────────────────────────────────────────────

/** Where an anchor lands, as a 0-based index into `cells`. */
export function resolveAnchor(a: Anchor, n: number): number {
  switch (a.type) {
    case 'from-left':
      return a.k - 1
    case 'from-right':
      return n - a.k
    case 'neighbour-of':
      return a.side === 'left' ? a.marker - 1 : a.marker + 1
    case 'offset-from-item':
      return a.dir === 'left' ? a.marker - a.step : a.marker + a.step
  }
}

/**
 * The item a child lands on when they make THIS anchor's classic mistake:
 * counting from the wrong end, grabbing the landmark itself, or stepping one
 * place instead of `step`. Always a real cell, never the correct one by
 * construction except when the row is symmetric — callers check.
 */
export function mistakeIndex(a: Anchor, n: number): number {
  switch (a.type) {
    case 'from-left':
      return n - a.k
    case 'from-right':
      return a.k - 1
    case 'neighbour-of':
      return a.marker
    case 'offset-from-item':
      return a.dir === 'left' ? a.marker - 1 : a.marker + 1
  }
}

// ─── labels ──────────────────────────────────────────────────────────────────

export function cellLabel(cell: string, kind: Kind, lang: 'en' | 'id'): string {
  if (kind === 'number') return cell
  const entry = PICTURE_NAMES[cell as PictureKey]
  return entry ? entry[lang] : cell
}

/** What one item in the row is called: a card, or a place holding a picture. */
function unitWord(kind: Kind, lang: 'en' | 'id'): string {
  if (lang === 'id') return kind === 'number' ? 'kartu' : 'tempat'
  return kind === 'number' ? 'card' : 'place'
}

/** How the stem points at the landmark item. */
function markerRef(cells: string[], kind: Kind, marker: number, lang: 'en' | 'id'): string {
  const label = cellLabel(cells[marker], kind, lang)
  if (lang === 'id') return kind === 'number' ? `kartu ${label}` : `gambar ${label}`
  return kind === 'number' ? `card ${label}` : `the ${label} picture`
}

const ORD_EN = [
  '0th', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th',
] as const
function ordEn(k: number): string {
  return ORD_EN[k] ?? `${k}th`
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function range(from: number, to: number): number[] {
  const out: number[] = []
  for (let i = from; i <= to; i++) out.push(i)
  return out
}

// ─── one anchor, fully worded ────────────────────────────────────────────────

export interface AnchorView {
  anchor: Anchor
  /** 0-based index the anchor lands on. */
  target: number
  /** 0-based index the classic mistake lands on. */
  mistake: number
  /** The noun phrase used in the stem, verbatim (also the breakdown highlight). */
  phrase_id: string
  phrase_en: string
  /** Blue "fact" reads as a rule about direction; a landmark reads as an object. */
  category: 'condition' | 'object'
  label_id: string
  label_en: string
  /** Hint-step pieces. Every one of them is derived, never asserted. */
  setup_id: string
  setup_en: string
  walk_id: string
  walk_en: string
  land_id: string
  land_en: string
  check_id: string
  check_en: string
  compact_id: string
  compact_en: string
}

/** "ke-1 = 5, ke-2 = 2, ke-3 = 8" — the row actually walked out, one item at a time. */
function countOff(
  cells: string[],
  kind: Kind,
  from: 'left' | 'right',
  k: number,
  lang: 'en' | 'id',
): string {
  const n = cells.length
  const parts: string[] = []
  for (let j = 1; j <= k; j++) {
    const idx = from === 'left' ? j - 1 : n - j
    const label = cellLabel(cells[idx], kind, lang)
    parts.push(lang === 'id' ? `ke-${j} = ${label}` : `${ordEn(j)} = ${label}`)
  }
  return parts.join(', ')
}

export function viewAnchor(cells: string[], kind: Kind, anchor: Anchor): AnchorView {
  const n = cells.length
  const target = resolveAnchor(anchor, n)
  const mistake = mistakeIndex(anchor, n)
  const uId = unitWord(kind, 'id')
  const uEn = unitWord(kind, 'en')
  const label_id = cellLabel(cells[target], kind, 'id')
  const label_en = cellLabel(cells[target], kind, 'en')
  /** 1-based place of the target counted from each end — the cross-check pair. */
  const fromLeftPos = target + 1
  const fromRightPos = n - target

  if (anchor.type === 'from-left' || anchor.type === 'from-right') {
    const side = anchor.type === 'from-left' ? 'left' : 'right'
    const sideId = side === 'left' ? 'kiri' : 'kanan'
    const otherId = side === 'left' ? 'kanan' : 'kiri'
    const other = side === 'left' ? 'right' : 'left'
    const otherPos = side === 'left' ? fromRightPos : fromLeftPos
    const phrase_id = `${uId} ke-${anchor.k} dari ${sideId}`
    const phrase_en = `the ${ordEn(anchor.k)} ${uEn} from the ${side}`
    return {
      anchor,
      target,
      mistake,
      phrase_id,
      phrase_en,
      category: 'condition',
      label_id,
      label_en,
      setup_id: `Barisan ini punya ${n} ${uId}. Soal minta dihitung dari ${sideId.toUpperCase()}, jadi mulai dari ${uId} paling ujung ${sideId} — bukan ujung ${otherId}.`,
      setup_en: `The row holds ${n} ${uEn}s. The question counts from the ${side.toUpperCase()}, so start at the far ${side} ${uEn} — not the ${other} one.`,
      walk_id: `Hitung satu per satu dari ${sideId}: ${countOff(cells, kind, side, anchor.k, 'id')}.`,
      walk_en: `Count them one at a time from the ${side}: ${countOff(cells, kind, side, anchor.k, 'en')}.`,
      land_id: `Berhenti di hitungan ke-${anchor.k}, isinya ${label_id}.`,
      land_en: `Stop on count ${anchor.k}; it holds ${label_en}.`,
      check_id: `Cek dari sisi lain: ${n} − ${anchor.k} + 1 = ${otherPos}, dan ${uId} ke-${otherPos} dari ${otherId} juga ${label_id}. Jadi jawabannya ${label_id}.`,
      check_en: `Check from the other end: ${n} − ${anchor.k} + 1 = ${otherPos}, and the ${ordEn(otherPos)} ${uEn} from the ${other} is ${label_en} too. So the answer is ${label_en}.`,
      compact_id: `${cap(phrase_id)}: hitung dari ${sideId} — ${countOff(cells, kind, side, anchor.k, 'id')}. Jadi ${label_id}.`,
      compact_en: `${cap(phrase_en)}: count from the ${side} — ${countOff(cells, kind, side, anchor.k, 'en')}. That is ${label_en}.`,
    }
  }

  // Landmark anchors: find the named item first, then step away from it.
  const marker = anchor.marker
  const refId = markerRef(cells, kind, marker, 'id')
  const refEn = markerRef(cells, kind, marker, 'en')
  const markerPos = marker + 1
  const dir = anchor.type === 'neighbour-of' ? anchor.side : anchor.dir
  const dirId = dir === 'left' ? 'kiri' : 'kanan'
  const step = anchor.type === 'neighbour-of' ? 1 : anchor.step
  const phrase_id =
    anchor.type === 'neighbour-of'
      ? `${uId} tepat di sebelah ${dirId} ${refId}`
      : `${uId} ke-${step} di sebelah ${dirId} ${refId}`
  const phrase_en =
    anchor.type === 'neighbour-of'
      ? `the ${uEn} immediately to the ${dir} of ${refEn}`
      : `the ${uEn} ${step} places to the ${dir} of ${refEn}`

  const hops_id = range(1, step)
    .map((s) => `langkah ${s} → ke-${dir === 'left' ? markerPos - s : markerPos + s}`)
    .join(', ')
  const hops_en = range(1, step)
    .map((s) => `step ${s} → ${ordEn(dir === 'left' ? markerPos - s : markerPos + s)}`)
    .join(', ')

  return {
    anchor,
    target,
    mistake,
    phrase_id,
    phrase_en,
    category: 'object',
    label_id,
    label_en,
    setup_id: `Cari dulu ${refId}. Hitung dari kiri sampai ketemu: itu urutan ke-${markerPos}.`,
    setup_en: `Find ${refEn} first. Count from the left until you reach it: that is place ${markerPos}.`,
    walk_id:
      anchor.type === 'neighbour-of'
        ? `"Tepat di sebelah ${dirId}" berarti geser 1 tempat ke ${dirId}: dari urutan ke-${markerPos} ke urutan ke-${fromLeftPos}.`
        : `Melangkah ${step} tempat ke ${dirId} dari urutan ke-${markerPos}: ${hops_id}.`,
    walk_en:
      anchor.type === 'neighbour-of'
        ? `"Immediately to the ${dir}" means one place to the ${dir}: from place ${markerPos} to place ${fromLeftPos}.`
        : `Take ${step} places to the ${dir} from place ${markerPos}: ${hops_en}.`,
    land_id: `Urutan ke-${fromLeftPos} dari kiri berisi ${label_id}.`,
    land_en: `Place ${fromLeftPos} from the left holds ${label_en}.`,
    check_id: `Cek dari kanan: urutan ke-${fromRightPos} dari kanan juga ${label_id}, bukan ${refId}. Jadi jawabannya ${label_id}.`,
    check_en: `Check from the right: the ${ordEn(fromRightPos)} ${uEn} from the right is ${label_en} too, not ${refEn}. So the answer is ${label_en}.`,
    compact_id: `${cap(phrase_id)}: ${refId} ada di urutan ke-${markerPos} dari kiri, geser ${step} ke ${dirId} → urutan ke-${fromLeftPos} = ${label_id}.`,
    compact_en: `${cap(phrase_en)}: ${refEn} sits at place ${markerPos} from the left, move ${step} to the ${dir} → place ${fromLeftPos} = ${label_en}.`,
  }
}

// ─── options ─────────────────────────────────────────────────────────────────

interface Bilingual {
  id: string
  en: string
}

function dedupe(items: Bilingual[]): Bilingual[] {
  const seen = new Set<string>()
  const out: Bilingual[] = []
  for (const it of items) {
    const key = `${it.id} ${it.en}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

/** Every distinct item label in the row, left to right, then the rest of the pool. */
function labelUniverse(cells: string[], kind: Kind): Bilingual[] {
  const rowKeys = cells.filter((c, i) => cells.indexOf(c) === i)
  const poolKeys = kind === 'picture' ? PICTURE_KEYS.filter((k) => !rowKeys.includes(k)) : []
  return [...rowKeys, ...poolKeys].map((c) => ({
    id: cellLabel(c, kind, 'id'),
    en: cellLabel(c, kind, 'en'),
  }))
}

function pairText(a: Bilingual, b: Bilingual): Bilingual {
  return { id: `${a.id} dan ${b.id}`, en: `${a.en} and ${b.en}` }
}

/**
 * Lays the four options out with the correct one at slot `optionShift`, so the
 * answer letter moves around without any randomness at render time.
 */
function layOut(candidates: Bilingual[], optionShift: number): {
  choices_id: WmiChoice[]
  choices_en: WmiChoice[]
  answer: string
} {
  if (candidates.length < 4) {
    throw new Error(
      `ordinal-position-read: only ${candidates.length} distinct options available; need 4`,
    )
  }
  const four = candidates.slice(0, 4)
  const correct = four[0]
  const rest = four.slice(1)
  const slot = optionShift % 4
  const ordered: Bilingual[] = []
  let r = 0
  for (let i = 0; i < 4; i++) ordered.push(i === slot ? correct : rest[r++])
  return {
    choices_id: ordered.map((o, i) => ({ label: CHOICE_LABELS[i], text: o.id })),
    choices_en: ordered.map((o, i) => ({ label: CHOICE_LABELS[i], text: o.en })),
    answer: CHOICE_LABELS[slot],
  }
}

// ─── derive: the single source of truth for stem, answer and options ─────────

export interface Derived {
  n: number
  views: AnchorView[]
  values: number[]
  /** Fill-in answer, or the correct choice letter. */
  answer: string
  answer_type: 'fill_in' | 'multiple_choice'
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
  /** The tempting wrong answer this instance actually offers, if any. */
  trapValue: string | null
  fact_id: string
  fact_en: string
  intro_id: string
  intro_en: string
  look_id: string
  look_en: string
  question_id: string
  question_en: string
  body_id: string
  body_en: string
}

export function derive(params: Params): Derived {
  const { cells, kind, ask, anchors, optionShift } = params
  const n = cells.length
  const views = anchors.map((a) => viewAnchor(cells, kind, a))
  const values = views.map((v) => Number(cells[v.target]))

  const fact_id = kind === 'number' ? `Ada ${n} kartu angka berjajar` : `Ada ${n} benda berjajar`
  const fact_en = kind === 'number' ? `${n} number cards are lined up` : `${n} objects are lined up`
  const intro_id = `${fact_id} seperti pada gambar.`
  const intro_en = `${fact_en} in a row as shown.`

  const look_id =
    views.length === 1
      ? `Lihat ${views[0].phrase_id}.`
      : `Lihat ${views[0].phrase_id} dan ${views[1].phrase_id}.`
  const look_en =
    views.length === 1
      ? `Look at ${views[0].phrase_en}.`
      : `Look at ${views[0].phrase_en} and ${views[1].phrase_en}.`

  let question_id: string
  let question_en: string
  let answer: string
  let answer_type: Derived['answer_type'] = 'fill_in'
  let choices_id: WmiChoice[] | null = null
  let choices_en: WmiChoice[] | null = null
  let trapValue: string | null = null

  const mistakeLabel = (v: AnchorView): Bilingual => ({
    id: cellLabel(cells[v.mistake], kind, 'id'),
    en: cellLabel(cells[v.mistake], kind, 'en'),
  })
  const trueLabel = (v: AnchorView): Bilingual => ({ id: v.label_id, en: v.label_en })

  if (ask === 'read') {
    const v = views[0]
    if (kind === 'number') {
      question_id = 'Angka berapa yang ada di kartu itu?'
      question_en = 'What number is on that card?'
      answer = v.label_id
      if (v.mistake !== v.target) trapValue = cellLabel(cells[v.mistake], kind, 'id')
    } else {
      question_id = 'Gambar apa yang ada di tempat itu?'
      question_en = 'Which object is in that place?'
      const candidates = dedupe([trueLabel(v), mistakeLabel(v), ...labelUniverse(cells, kind)])
      const laid = layOut(candidates, optionShift)
      choices_id = laid.choices_id
      choices_en = laid.choices_en
      answer = laid.answer
      answer_type = 'multiple_choice'
      // A repeated glyph can put the "wrong end" reading on the SAME object, in
      // which case the slip is not wrong at all and there is no trap to name.
      if (mistakeLabel(v).id !== v.label_id) {
        const wrong = laid.choices_id.find(
          (c) => c.text === mistakeLabel(v).id && c.label !== laid.answer,
        )
        trapValue = wrong ? wrong.label : null
      }
    }
  } else if (ask === 'sum' || ask === 'difference') {
    const [a, b] = views
    const total = ask === 'sum' ? values[0] + values[1] : Math.abs(values[0] - values[1])
    question_id =
      ask === 'sum' ? 'Berapa jumlah kedua angka itu?' : 'Berapa selisih kedua angka itu?'
    question_en =
      ask === 'sum'
        ? 'What is the sum of those two numbers?'
        : 'What is the difference between those two numbers?'
    answer = String(total)
    // The tempting answer: read ONE anchor off the wrong end, keep the other.
    const slip = a.mistake !== a.target ? a : b.mistake !== b.target ? b : null
    if (slip) {
      const wrongPair =
        slip === a
          ? [Number(cells[a.mistake]), values[1]]
          : [values[0], Number(cells[b.mistake])]
      const wrong =
        ask === 'sum' ? wrongPair[0] + wrongPair[1] : Math.abs(wrongPair[0] - wrongPair[1])
      if (wrong !== total) trapValue = String(wrong)
    }
  } else {
    const [a, b] = views
    question_id =
      kind === 'number'
        ? 'Pilihan mana yang menyebutkan kedua angka itu dengan benar?'
        : 'Pilihan mana yang menyebutkan kedua benda itu dengan benar?'
    question_en =
      kind === 'number'
        ? 'Which option correctly names those two numbers?'
        : 'Which option correctly names those two objects?'

    const correct = pairText(trueLabel(a), trueLabel(b))
    const others = labelUniverse(cells, kind)
    const raw: Bilingual[] = [
      correct,
      pairText(trueLabel(a), mistakeLabel(b)),
      pairText(mistakeLabel(a), trueLabel(b)),
      pairText(mistakeLabel(a), mistakeLabel(b)),
      ...others.map((o) => pairText(trueLabel(a), o)),
      ...others.map((o) => pairText(o, trueLabel(b))),
    ]
    // An option that merely swaps the correct two labels would ALSO be correct,
    // so it can never appear as a distractor.
    const swapped = pairText(trueLabel(b), trueLabel(a))
    const candidates = dedupe(raw).filter(
      (c, i) => i === 0 || !(c.id === swapped.id && c.en === swapped.en),
    )
    const laid = layOut(candidates, optionShift)
    choices_id = laid.choices_id
    choices_en = laid.choices_en
    answer = laid.answer
    answer_type = 'multiple_choice'
    const mirror = pairText(mistakeLabel(a), mistakeLabel(b))
    const wrong = laid.choices_id.find((c) => c.text === mirror.id && c.label !== laid.answer)
    trapValue = wrong ? wrong.label : null
  }

  return {
    n,
    views,
    values,
    answer,
    answer_type,
    choices_id,
    choices_en,
    trapValue,
    fact_id,
    fact_en,
    intro_id,
    intro_en,
    look_id,
    look_en,
    question_id,
    question_en,
    body_id: `${intro_id} ${look_id}\n\nCari: ${question_id}`,
    body_en: `${intro_en} ${look_en}\n\nFind: ${question_en}`,
  }
}

// ─── generate ────────────────────────────────────────────────────────────────

/** Every anchor this row can legally carry, given where the landmark sits. */
function anchorOptions(n: number, landmark: number): Anchor[] {
  const out: Anchor[] = []
  const maxK = Math.min(5, n - 1)
  for (let k = 2; k <= maxK; k++) {
    out.push({ type: 'from-left', k })
    out.push({ type: 'from-right', k })
  }
  if (landmark - 1 >= 0) out.push({ type: 'neighbour-of', marker: landmark, side: 'left' })
  if (landmark + 1 <= n - 1) out.push({ type: 'neighbour-of', marker: landmark, side: 'right' })
  for (const step of [2, 3] as const) {
    if (landmark - step >= 0) out.push({ type: 'offset-from-item', marker: landmark, dir: 'left', step })
    if (landmark + step <= n - 1) out.push({ type: 'offset-from-item', marker: landmark, dir: 'right', step })
  }
  return out
}

function shuffledValues(rng: Rng, max: number, take: number): string[] {
  return rng.shuffle(range(1, max)).slice(0, take).map(String)
}

/**
 * A picture row with exactly one unique landmark glyph plus three repeatable
 * fillers, all seeded away from the two ends so a landmark always has room to
 * step in either direction and the options always have 4 distinct names.
 */
function pictureRow(rng: Rng, n: number): { cells: string[]; landmark: number } {
  const vocab = rng.shuffle(PICTURE_KEYS)
  const landmarkKey = vocab[0]
  const fillers = [vocab[1], vocab[2], vocab[3]]
  const slots = rng.shuffle(range(1, n - 2))
  const cells = new Array<string>(n).fill('')
  cells[slots[0]] = landmarkKey
  cells[slots[1]] = fillers[0]
  cells[slots[2]] = fillers[1]
  cells[slots[3]] = fillers[2]
  for (let i = 0; i < n; i++) if (!cells[i]) cells[i] = rng.pick(fillers)
  return { cells, landmark: slots[0] }
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const kind: Kind = ask === 'sum' || ask === 'difference' ? 'number' : rng.pick(KINDS)
  // `sum` keeps the row inside 1…10 so any pair the anchors pick stays ≤ 20.
  const n = ask === 'sum' ? rng.int(6, 10) : rng.int(6, 12)

  let cells: string[]
  let landmark: number
  if (kind === 'number') {
    cells = shuffledValues(rng, ask === 'sum' ? 10 : 20, n)
    landmark = rng.int(1, n - 2)
  } else {
    const row = pictureRow(rng, n)
    cells = row.cells
    landmark = row.landmark
  }

  const options = anchorOptions(n, landmark)
  const optionShift = rng.int(0, 3)

  if (ask === 'read') {
    return { kind, cells, anchors: [rng.pick(options)], ask, optionShift }
  }

  const ok = (a: Anchor, b: Anchor): boolean => {
    const ta = resolveAnchor(a, n)
    const tb = resolveAnchor(b, n)
    if (ta === tb) return false
    if (ask === 'sum') return Number(cells[ta]) + Number(cells[tb]) <= SUM_CEILING
    return cells[ta] !== cells[tb]
  }

  for (let attempt = 0; attempt < 60; attempt++) {
    const a = rng.pick(options)
    const b = rng.pick(options)
    if (ok(a, b)) return { kind, cells, anchors: [a, b], ask, optionShift }
  }
  // Deterministic fallback — the row always admits at least one legal pair
  // because positions 1…n-2 always hold at least two different items.
  const wide: Anchor[] = [
    ...options,
    ...range(2, n - 1).flatMap((k): Anchor[] => [
      { type: 'from-left', k },
      { type: 'from-right', k },
    ]),
  ]
  for (const a of wide) for (const b of wide) if (ok(a, b)) return { kind, cells, anchors: [a, b], ask, optionShift }
  throw new Error(`ordinal-position-read: no legal anchor pair for a ${ask} row of ${n}`)
}

// ─── render ──────────────────────────────────────────────────────────────────

export function render(params: Params): Rendered {
  const d = derive(params)
  const { kind, ask } = params
  const uId = unitWord(kind, 'id')
  const uEn = unitWord(kind, 'en')

  const usesRight = d.views.some((v) => v.anchor.type === 'from-right')
  const usesLandmark = d.views.some(
    (v) => v.anchor.type === 'neighbour-of' || v.anchor.type === 'offset-from-item',
  )

  const hint_id = usesRight
    ? `"Dari kanan" berarti hitungan ke-1 adalah ${uId} paling ujung KANAN, bukan yang di kiri.`
    : usesLandmark
      ? `Temukan dulu benda yang disebut soal, baru melangkah dari situ — benda itu sendiri bukan jawabannya.`
      : `Hitung satu per satu dari ujung yang diminta soal, jangan menebak dari tengah.`
  const hint_en = usesRight
    ? `"From the right" means count number 1 at the far RIGHT ${uEn}, not the left one.`
    : usesLandmark
      ? `Find the named item first, then step away from it — that item itself is not the answer.`
      : `Count one at a time from the end the question names; do not guess from the middle.`

  let hint_steps_id: string[]
  let hint_steps_en: string[]

  if (ask === 'read') {
    const v = d.views[0]
    hint_steps_id = [v.setup_id, `${v.walk_id} ${v.land_id}`, v.check_id]
    hint_steps_en = [v.setup_en, `${v.walk_en} ${v.land_en}`, v.check_en]
  } else {
    const [a, b] = d.views
    const [va, vb] = d.values
    if (ask === 'sum') {
      hint_steps_id = [a.compact_id, b.compact_id, `Jumlahkan yang sudah ditemukan: ${va} + ${vb} = ${d.answer}.`]
      hint_steps_en = [a.compact_en, b.compact_en, `Add the two you found: ${va} + ${vb} = ${d.answer}.`]
    } else if (ask === 'difference') {
      const hi = Math.max(va, vb)
      const lo = Math.min(va, vb)
      hint_steps_id = [a.compact_id, b.compact_id, `Kurangkan yang besar dengan yang kecil: ${hi} − ${lo} = ${d.answer}.`]
      hint_steps_en = [a.compact_en, b.compact_en, `Take the smaller from the larger: ${hi} − ${lo} = ${d.answer}.`]
    } else {
      const correctText = (d.choices_id ?? []).find((c) => c.label === d.answer)?.text ?? ''
      const correctTextEn = (d.choices_en ?? []).find((c) => c.label === d.answer)?.text ?? ''
      hint_steps_id = [
        a.compact_id,
        b.compact_id,
        `Yang ditemukan adalah ${correctText}, jadi pilih ${d.answer}.`,
      ]
      hint_steps_en = [
        a.compact_en,
        b.compact_en,
        `What you found is ${correctTextEn}, so choose ${d.answer}.`,
      ]
    }
  }

  return {
    body_en: d.body_en,
    body_id: d.body_id,
    answer_type: d.answer_type,
    choices_en: d.choices_en,
    choices_id: d.choices_id,
    answer: d.answer,
    hint_en,
    hint_id,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildOrdinalPositionReadBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
