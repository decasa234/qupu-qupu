import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildComparisonChainBreakdown } from './breakdown.js'

// A chain of comparisons: three or four children, each described only in terms
// of the one before ("4 more than Ani", "3 times as many as Budi"). Exactly ONE
// count is stated outright. The child pins that one, then walks the chain link
// by link — there is no other way in.
//
// The whole chain is BUILT FORWARD from whole numbers (`start` + integer links),
// so every count is automatically a whole number; the schema then rejects any
// params whose walk would leave the 2…120 window. When the stated count sits at
// the far end the child walks backwards, undoing each link — and because the
// chain was built forward by multiplication, every backwards division is exact.
export const ASKS = ['value', 'total', 'difference', 'rank'] as const
export type Ask = (typeof ASKS)[number]

export const LINK_KINDS = ['more', 'fewer', 'times', 'times-plus'] as const
export type LinkKind = (typeof LINK_KINDS)[number]

export const RANK_MODES = ['most', 'fewest'] as const
export type RankMode = (typeof RANK_MODES)[number]

/** Nobody may hold fewer than this — keeps every count non-negative AND sayable. */
const MIN_COUNT = 2
/** Grade 2–3 ceiling: a four-actor total still stays inside three digits. */
const MAX_COUNT = 120

const linkSchema = z.object({
  kind: z.enum(LINK_KINDS),
  k: z.number().int().min(1).max(12),
  m: z.number().int().min(2).max(3),
})
export type ChainLink = z.infer<typeof linkSchema>

/** The minimum shape needed to walk a chain — used by the schema refinements. */
export interface ChainShape {
  start: number
  links: ChainLink[]
}

/** One forward hop. Integer in, integer out, for every kind. */
export function applyLink(prev: number, link: ChainLink): number {
  switch (link.kind) {
    case 'more':
      return prev + link.k
    case 'fewer':
      return prev - link.k
    case 'times':
      return prev * link.m
    case 'times-plus':
      return prev * link.m + link.k
  }
}

/** Every child's count, index 0 first. Built forward, so never fractional. */
export function chainValues(shape: ChainShape): number[] {
  const out = [shape.start]
  for (const link of shape.links) out.push(applyLink(out[out.length - 1], link))
  return out
}

/** Index of the strictly largest / smallest count, or null when it is a tie. */
export function uniqueExtreme(values: number[], mode: RankMode): number | null {
  const best = mode === 'most' ? Math.max(...values) : Math.min(...values)
  const hits = values.filter((v) => v === best).length
  return hits === 1 ? values.indexOf(best) : null
}

const paramsSchema = z
  .object({
    ask: z.enum(ASKS),
    names: z.array(z.string().min(1)).min(3).max(4),
    start: z.number().int().min(MIN_COUNT).max(MAX_COUNT),
    links: z.array(linkSchema).min(2).max(3),
    /** Whose count is stated outright — the only number the child starts with. */
    givenIndex: z.number().int().min(0).max(3),
    /** Only read by the 'value' ask. */
    targetIndex: z.number().int().min(0).max(3),
    /** Only read by the 'difference' ask: the two children compared. */
    cmpA: z.number().int().min(0).max(3),
    cmpB: z.number().int().min(0).max(3),
    /** Only read by the 'rank' ask. */
    rankMode: z.enum(RANK_MODES),
    item_en: z.string().min(1),
    item_one_en: z.string().min(1),
    item_id: z.string().min(1),
  })
  .refine((v) => v.links.length === v.names.length - 1, {
    message: 'one link per hop: a chain of n children has n − 1 comparisons',
  })
  .refine((v) => new Set(v.names).size === v.names.length, {
    message: 'every child in the chain needs a different name',
  })
  .refine((v) => [v.targetIndex, v.cmpA, v.cmpB, v.givenIndex].every((i) => i < v.names.length), {
    message: 'every index must point at a child that exists',
  })
  .refine((v) => v.givenIndex === 0 || v.givenIndex === v.names.length - 1, {
    message: 'the stated count sits at one end of the chain, so the walk never splits in two',
  })
  .refine((v) => v.givenIndex === 0 || v.links.every((l) => l.kind !== 'times-plus'), {
    message: 'a backwards walk must never need "undo × then undo +" inside one hop',
  })
  .refine(
    (v) => chainValues(v).every((n) => Number.isInteger(n) && n >= MIN_COUNT && n <= MAX_COUNT),
    { message: `every child's count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}` },
  )
  .refine((v) => v.ask !== 'value' || v.targetIndex !== v.givenIndex, {
    message: 'asking for the count that is already printed is not a chain problem',
  })
  .refine(
    (v) =>
      v.ask !== 'difference' ||
      (Math.abs(v.cmpA - v.cmpB) >= 2 && chainValues(v)[v.cmpA] !== chainValues(v)[v.cmpB]),
    {
      message:
        'difference needs two children at least two hops apart holding different counts, or it is a one-step read-off',
    },
  )
  .refine((v) => v.ask !== 'rank' || uniqueExtreme(chainValues(v), v.rankMode) !== null, {
    message: 'rank needs one strict winner, never a tie',
  })
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Ani', 'Budi', 'Citra', 'Dimas', 'Eka', 'Fitri', 'Galih', 'Hana', 'Intan', 'Joko'] as const

const ITEMS = [
  { item_en: 'marbles', item_one_en: 'marble', item_id: 'kelereng' },
  { item_en: 'stickers', item_one_en: 'sticker', item_id: 'stiker' },
  { item_en: 'candies', item_one_en: 'candy', item_id: 'permen' },
  { item_en: 'pencils', item_one_en: 'pencil', item_id: 'pensil' },
  { item_en: 'story books', item_one_en: 'story book', item_id: 'buku cerita' },
  { item_en: 'balloons', item_one_en: 'balloon', item_id: 'balon' },
] as const

export const meta = {
  slug: 'comparison-chain-solve',
  name_en: 'Comparison chain word problem',
  name_id: 'Rantai perbandingan: lebih banyak dan berkali-kali',
  grades: [2, 3] as const,
  description_id:
    'Hanya satu jumlah yang diketahui; anak menelusuri rantai "lebih banyak / lebih sedikit / kali lipat" satu per satu untuk menemukan jumlah, total, selisih, atau siapa yang terbanyak.',
} as const

// English needs "1 marble" but "3 marbles"; Indonesian needs neither.
export function enCount(n: number, params: Pick<Params, 'item_en' | 'item_one_en'>): string {
  return `${n} ${n === 1 ? params.item_one_en : params.item_en}`
}

export interface Solution {
  /** Every child's count, index 0 first. */
  values: number[]
  /** The order the child can actually pin them in, starting at the stated one. */
  order: number[]
  /** True when the stated count is at index 0 and the walk runs left to right. */
  forward: boolean
  total: number
  /** 'value' ask. */
  targetIndex: number
  /** 'difference' ask, already sorted so hi holds more than lo. */
  hiIndex: number
  loIndex: number
  diff: number
  /** 'rank' ask. */
  rankIndex: number
  answer: string
}

/**
 * Walks the chain exactly the way the sentences are worded, then reads the answer
 * off the walk. No closed form, so the answer can never drift from the story.
 */
export function solve(params: Params): Solution {
  const { ask, names, givenIndex, targetIndex, cmpA, cmpB, rankMode } = params
  const values = chainValues(params)
  const n = names.length
  const forward = givenIndex === 0

  const order: number[] = []
  if (forward) for (let i = 0; i < n; i++) order.push(i)
  else for (let i = n - 1; i >= 0; i--) order.push(i)

  const total = values.reduce((sum, v) => sum + v, 0)
  const [hiIndex, loIndex] = values[cmpA] >= values[cmpB] ? [cmpA, cmpB] : [cmpB, cmpA]
  const diff = values[hiIndex] - values[loIndex]
  const rankIndex = uniqueExtreme(values, rankMode) ?? 0

  const answer =
    ask === 'value'
      ? String(values[targetIndex])
      : ask === 'total'
        ? String(total)
        : ask === 'difference'
          ? String(diff)
          : names[rankIndex]

  return { values, order, forward, total, targetIndex, hiIndex, loIndex, diff, rankIndex, answer }
}

// ── Sentence pieces. Every phrase the breakdown highlights is produced HERE and
// reused verbatim by both the body and breakdown.ts, so a highlight can never
// drift out of the rendered text. ───────────────────────────────────────────

/** The relation clause for link i, i.e. how names[i+1] compares with names[i]. */
export function linkPhraseEn(params: Params, i: number): string {
  const link = params.links[i]
  const from = params.names[i]
  const { item_en } = params
  switch (link.kind) {
    case 'more':
      return `${link.k} more ${item_en} than ${from}`
    case 'fewer':
      return `${link.k} fewer ${item_en} than ${from}`
    case 'times':
      return `${link.m} times as many ${item_en} as ${from}`
    case 'times-plus':
      return `${link.m} times as many ${item_en} as ${from}, plus ${link.k} more`
  }
}

export function linkPhraseId(params: Params, i: number): string {
  const link = params.links[i]
  const from = params.names[i]
  const { item_id } = params
  switch (link.kind) {
    case 'more':
      return `${link.k} ${item_id} lebih banyak daripada ${from}`
    case 'fewer':
      return `${link.k} ${item_id} lebih sedikit daripada ${from}`
    case 'times':
      return `${item_id} ${link.m} kali lipat dari ${from}`
    case 'times-plus':
      return `${item_id} ${link.m} kali lipat dari ${from}, ditambah ${link.k} lagi`
  }
}

export const linkSentenceEn = (params: Params, i: number): string =>
  `${params.names[i + 1]} has ${linkPhraseEn(params, i)}.`
export const linkSentenceId = (params: Params, i: number): string =>
  `${params.names[i + 1]} punya ${linkPhraseId(params, i)}.`

/**
 * The one stated count. The trailing full stop is part of the phrase on purpose:
 * when the stated child is also the right-hand side of a link ("Citra has 6 fewer
 * … than Budi. … Citra has 6 marbles."), the stop is what stops the shorter fact
 * phrase from also matching inside the longer link sentence.
 */
export const givenPhraseEn = (params: Params, values: number[]): string =>
  `${params.names[params.givenIndex]} has ${enCount(values[params.givenIndex], params)}.`
export const givenPhraseId = (params: Params, values: number[]): string =>
  `${params.names[params.givenIndex]} punya ${values[params.givenIndex]} ${params.item_id}.`

export function questionPhraseEn(params: Params, sol: Solution): string {
  const { names, item_en } = params
  switch (params.ask) {
    case 'value':
      return `How many ${item_en} does ${names[sol.targetIndex]} have?`
    case 'total':
      return `How many ${item_en} do they have altogether?`
    case 'difference':
      return `How many more ${item_en} does ${names[sol.hiIndex]} have than ${names[sol.loIndex]}?`
    case 'rank':
      return params.rankMode === 'most'
        ? `Who has the most ${item_en}?`
        : `Who has the fewest ${item_en}?`
  }
}

export function questionPhraseId(params: Params, sol: Solution): string {
  const { names, item_id } = params
  switch (params.ask) {
    case 'value':
      return `Berapa ${item_id} yang dimiliki ${names[sol.targetIndex]}?`
    case 'total':
      return `Berapa jumlah ${item_id} mereka semua?`
    case 'difference':
      return `Berapa ${item_id} lebih banyak yang dimiliki ${names[sol.hiIndex]} daripada ${names[sol.loIndex]}?`
    case 'rank':
      return params.rankMode === 'most'
        ? `Siapa yang punya ${item_id} paling banyak?`
        : `Siapa yang punya ${item_id} paling sedikit?`
  }
}

/** Sentences in reading order: stated count first on a forward walk, last on a backwards one. */
function bodySentences(params: Params, sol: Solution, lang: 'en' | 'id'): string[] {
  const link = lang === 'id' ? linkSentenceId : linkSentenceEn
  const given = lang === 'id' ? givenPhraseId(params, sol.values) : givenPhraseEn(params, sol.values)
  const links = params.links.map((_, i) => link(params, i))
  return sol.forward ? [given, ...links] : [...links, given]
}

// ── Step-by-step. Each line pins exactly one more count and shows the arithmetic
// that pins it, so the final line is forced by the lines above it. ───────────

/** Forward hop: names[i] is known, names[i+1] follows from it. */
function forwardStep(params: Params, values: number[], i: number, lang: 'en' | 'id'): string {
  const link = params.links[i]
  const from = params.names[i]
  const to = params.names[i + 1]
  const a = values[i]
  const b = values[i + 1]
  const id = lang === 'id'
  switch (link.kind) {
    case 'more':
      return id
        ? `${to} punya ${link.k} lebih banyak daripada ${from} — ${a} + ${link.k} = ${b}. ${to} punya ${b}.`
        : `${to} has ${link.k} more than ${from} — ${a} + ${link.k} = ${b}. ${to} has ${b}.`
    case 'fewer':
      return id
        ? `${to} punya ${link.k} lebih sedikit daripada ${from} — ${a} − ${link.k} = ${b}. ${to} punya ${b}.`
        : `${to} has ${link.k} fewer than ${from} — ${a} − ${link.k} = ${b}. ${to} has ${b}.`
    case 'times':
      return id
        ? `${to} punya ${link.m} kali lipat ${from} — ${a} × ${link.m} = ${b}. ${to} punya ${b}.`
        : `${to} has ${link.m} times what ${from} has — ${a} × ${link.m} = ${b}. ${to} has ${b}.`
    case 'times-plus':
      return id
        ? `${to} punya ${link.m} kali lipat ${from} ditambah ${link.k} — ${a} × ${link.m} + ${link.k} = ${b}. ${to} punya ${b}.`
        : `${to} has ${link.m} times what ${from} has plus ${link.k} — ${a} × ${link.m} + ${link.k} = ${b}. ${to} has ${b}.`
  }
}

/** Backwards hop: names[i+1] is known, undo the link to pin names[i]. */
function backwardStep(params: Params, values: number[], i: number, lang: 'en' | 'id'): string {
  const link = params.links[i]
  const from = params.names[i]
  const to = params.names[i + 1]
  const a = values[i]
  const b = values[i + 1]
  const id = lang === 'id'
  switch (link.kind) {
    case 'more':
      return id
        ? `${to} punya ${link.k} lebih banyak daripada ${from}, jadi putar balik — ${b} − ${link.k} = ${a}. ${from} punya ${a}.`
        : `${to} has ${link.k} more than ${from}, so rewind — ${b} − ${link.k} = ${a}. ${from} has ${a}.`
    case 'fewer':
      return id
        ? `${to} punya ${link.k} lebih sedikit daripada ${from}, jadi putar balik — ${b} + ${link.k} = ${a}. ${from} punya ${a}.`
        : `${to} has ${link.k} fewer than ${from}, so rewind — ${b} + ${link.k} = ${a}. ${from} has ${a}.`
    case 'times':
      return id
        ? `${to} punya ${link.m} kali lipat ${from}, jadi putar balik — ${b} ÷ ${link.m} = ${a}. ${from} punya ${a}.`
        : `${to} has ${link.m} times what ${from} has, so rewind — ${b} ÷ ${link.m} = ${a}. ${from} has ${a}.`
    // Never reachable: the schema forbids 'times-plus' on a backwards walk.
    case 'times-plus':
      return id
        ? `${to} punya ${link.m} kali lipat ${from} ditambah ${link.k}, jadi putar balik — (${b} − ${link.k}) ÷ ${link.m} = ${a}. ${from} punya ${a}.`
        : `${to} has ${link.m} times ${from} plus ${link.k}, so rewind — (${b} − ${link.k}) ÷ ${link.m} = ${a}. ${from} has ${a}.`
  }
}

/** The hop lines, in the order the child can actually pin the counts. */
export function walkSteps(params: Params, sol: Solution, lang: 'en' | 'id'): string[] {
  const out: string[] = []
  if (sol.forward) {
    for (let i = 0; i < params.links.length; i++) out.push(forwardStep(params, sol.values, i, lang))
  } else {
    for (let i = params.links.length - 1; i >= 0; i--) out.push(backwardStep(params, sol.values, i, lang))
  }
  return out
}

function hintSteps(params: Params, sol: Solution, lang: 'en' | 'id'): string[] {
  const id = lang === 'id'
  const { names, item_id, item_en } = params
  const givenName = names[params.givenIndex]
  const givenValue = sol.values[params.givenIndex]
  const item = id ? item_id : item_en

  const opening = id
    ? `Cuma satu angka yang pasti — ${givenName} punya ${givenValue} ${item}. Mulai dari situ${sol.forward ? '' : ' dan telusuri mundur'}.`
    : `Only one count is actually printed — ${givenName} has ${givenValue} ${item}. Start there${sol.forward ? '' : ' and work backwards'}.`

  const hops = walkSteps(params, sol, lang)
  const lastPinned = sol.order[sol.order.length - 1]

  if (params.ask === 'value') {
    // When the final hop already lands on the child being asked about, saying it
    // again would be a fresh assertion — fold the answer into that same hop.
    if (lastPinned === sol.targetIndex && hops.length > 0) {
      const tail = id ? ' Itu yang ditanya.' : ' That is the one being asked for.'
      return [opening, ...hops.slice(0, -1), hops[hops.length - 1] + tail]
    }
    const v = sol.values[sol.targetIndex]
    return [
      opening,
      ...hops,
      id
        ? `Yang ditanya ${names[sol.targetIndex]}, dan tadi sudah terkunci — ${v} ${item}.`
        : `The question asks about ${names[sol.targetIndex]}, already pinned above — ${v} ${item}.`,
    ]
  }

  if (params.ask === 'total') {
    const sum = sol.values.join(' + ')
    return [
      opening,
      ...hops,
      id
        ? `Sekarang semua sudah terkunci, tinggal dijumlahkan — ${sum} = ${sol.total}.`
        : `Every count is pinned now, so add them up — ${sum} = ${sol.total}.`,
    ]
  }

  if (params.ask === 'difference') {
    const hi = names[sol.hiIndex]
    const lo = names[sol.loIndex]
    return [
      opening,
      ...hops,
      id
        ? `${hi} punya ${sol.values[sol.hiIndex]} dan ${lo} punya ${sol.values[sol.loIndex]}, jadi selisihnya ${sol.values[sol.hiIndex]} − ${sol.values[sol.loIndex]} = ${sol.diff}.`
        : `${hi} has ${sol.values[sol.hiIndex]} and ${lo} has ${sol.values[sol.loIndex]}, so the difference is ${sol.values[sol.hiIndex]} − ${sol.values[sol.loIndex]} = ${sol.diff}.`,
    ]
  }

  const roll = names.map((name, i) => `${name} ${sol.values[i]}`).join(', ')
  return [
    opening,
    ...hops,
    id
      ? `Sekarang bandingkan semuanya — ${roll}. Paling ${params.rankMode === 'most' ? 'banyak' : 'sedikit'} adalah ${names[sol.rankIndex]}.`
      : `Now line them all up — ${roll}. The ${params.rankMode === 'most' ? 'most' : 'fewest'} is ${names[sol.rankIndex]}.`,
  ]
}

// ── Generation ──────────────────────────────────────────────────────────────

/**
 * Draws one link that keeps the running count inside 2…120. Retrying (instead of
 * solving for a legal k) keeps the mix of link kinds varied; the fallback at the
 * end is always legal because a count can never be near both ends of the window.
 */
function buildLink(rng: Rng, prev: number, allowTimesPlus: boolean): ChainLink {
  const kinds: readonly LinkKind[] = allowTimesPlus
    ? LINK_KINDS
    : (['more', 'fewer', 'times'] as const)
  for (let attempt = 0; attempt < 16; attempt++) {
    const kind = rng.pick(kinds)
    const m = rng.int(2, 3)
    const k = kind === 'times-plus' ? rng.int(1, 9) : rng.int(2, 12)
    const link: ChainLink = { kind, k, m }
    const next = applyLink(prev, link)
    if (next >= MIN_COUNT && next <= MAX_COUNT) return link
  }
  return prev + 2 <= MAX_COUNT
    ? { kind: 'more', k: 2, m: 2 }
    : { kind: 'fewer', k: 2, m: 2 }
}

export function generate(rng: Rng): Params {
  const n = rng.pick([3, 3, 3, 4] as const)
  const names = rng.shuffle(NAMES).slice(0, n)
  const item = rng.pick(ITEMS)
  // ~1 in 3 problems state the LAST count, turning the chain into a rewind. Those
  // never carry a "× then +" link, so undoing a hop is a single clean operation.
  const backward = rng.int(1, 3) === 1
  const givenIndex = backward ? n - 1 : 0
  const start = rng.int(3, 14)

  const links: ChainLink[] = []
  let prev = start
  for (let i = 0; i < n - 1; i++) {
    const link = buildLink(rng, prev, !backward)
    links.push(link)
    prev = applyLink(prev, link)
  }
  const values = chainValues({ start, links })

  // Only offer an ask this particular chain can actually support, so the schema
  // never has to reject what generate() produced.
  const asks: Ask[] = ['value', 'total']
  const pairs: Array<readonly [number, number]> = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 2; b < n; b++) if (values[a] !== values[b]) pairs.push([a, b] as const)
  }
  if (pairs.length > 0) asks.push('difference')
  const modes = RANK_MODES.filter((mode) => uniqueExtreme(values, mode) !== null)
  if (modes.length > 0) asks.push('rank')

  const ask = rng.pick(asks)
  const others = names.map((_, i) => i).filter((i) => i !== givenIndex)
  const [cmpA, cmpB] = pairs.length > 0 ? rng.pick(pairs) : ([0, n - 1] as const)

  return {
    ask,
    names,
    start,
    links,
    givenIndex,
    targetIndex: rng.pick(others),
    cmpA,
    cmpB,
    rankMode: modes.length > 0 ? rng.pick(modes) : 'most',
    ...item,
  }
}

export function render(params: Params): Rendered {
  const sol = solve(params)
  const breakdown = buildComparisonChainBreakdown(params)

  const body_en = `${bodySentences(params, sol, 'en').join(' ')} Find: ${questionPhraseEn(params, sol)}`
  const body_id = `${bodySentences(params, sol, 'id').join(' ')} Cari: ${questionPhraseId(params, sol)}`

  const givenName = params.names[params.givenIndex]
  const hint_en = sol.forward
    ? `Only ${givenName}'s count is printed. Pin it, then take the chain one link at a time — never jump to the last child.`
    : `Only ${givenName}'s count is printed, and it is at the END of the chain. Undo one link at a time to walk back.`
  const hint_id = sol.forward
    ? `Cuma jumlah ${givenName} yang tertulis. Kunci itu dulu, lalu telusuri rantainya satu per satu — jangan langsung lompat ke anak terakhir.`
    : `Cuma jumlah ${givenName} yang tertulis, dan itu ada di UJUNG rantai. Putar balik satu langkah demi satu langkah.`

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: sol.answer,
    hint_en,
    hint_id,
    hint_steps_en: hintSteps(params, sol, 'en'),
    hint_steps_id: hintSteps(params, sol, 'id'),
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
