import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildIntervalFencepostCountBreakdown } from './breakdown.js'

// Posts and gaps — the whole concept is ONE off-by-one.
//
//   n things standing in a LINE, one at each end  ->  n - 1 gaps between them
//   n things standing round a RING                ->  n     gaps between them
//
// 10 lamp posts along a 90 m road are 10 m apart (90 : 9), not 9 m (90 : 10).
// A clock that takes 6 seconds to chime 4 times leaves 2 s between chimes
// (6 : 3), so chiming 10 times takes 18 s (2 x 9), not 15 s.
//
// Getting the gap count wrong IS the question, and it is also the trap, so both
// arrangements are generated, both are named in the wording, and the test
// insists on seeing both. Everything downstream (steps, breakdown, figure,
// explainer) is derived from `solve`, so nothing can narrate a different rule
// than the one that produced the number.
//
// EXACTNESS. Every division a child performs must come out whole: the span is
// never chosen, it is BUILT as gapCount x gapSize, so `span : gapCount` is an
// integer by construction and a lamp is never 8.5 m along.
export const SCENARIOS = ['lamps-on-a-road', 'trees', 'clock-chimes'] as const
export type Scenario = (typeof SCENARIOS)[number]

/** `open` = a straight line with a thing at each end. `closed` = a ring. */
export const ENDS = ['open', 'closed'] as const
export type Ends = (typeof ENDS)[number]

export const ASKS = ['gap', 'total-for-m-items', 'how-long-until-the-nth'] as const
export type Ask = (typeof ASKS)[number]

/** The rule the whole concept exists to teach. */
export function gapsFor(items: number, ends: Ends): number {
  return ends === 'open' ? items - 1 : items
}

/** The same rule applied to the WRONG arrangement — where the trap comes from. */
export function wrongGapsFor(items: number, ends: Ends): number {
  return ends === 'open' ? items : items - 1
}

const paramsSchema = z
  .object({
    scenario: z.enum(SCENARIOS),
    ends: z.enum(ENDS),
    /** Posts / trees / chimes actually standing in the given arrangement. */
    count: z.number().int().min(4).max(10),
    /** Total length in metres, or total time in seconds. */
    span: z.number().int().min(4).max(400),
    ask: z.enum(ASKS),
    /** `m` for total-for-m-items, `n` for how-long-until-the-nth, null for gap. */
    target: z.number().int().min(3).max(20).nullable(),
  })
  // Chimes happen one after another in time; there is no ring of chimes.
  .refine((v) => v.scenario !== 'clock-chimes' || v.ends === 'open', {
    message: 'clock chimes are always a straight run in time, never a ring',
  })
  // The one rule that keeps every answer a whole number.
  .refine((v) => v.span % gapsFor(v.count, v.ends) === 0, {
    message: 'the span must divide exactly by the number of gaps',
  })
  .refine((v) => (v.ask === 'gap') === (v.target === null), {
    message: 'only the gap ask has no target; the other two always name one',
  })
  .refine((v) => v.ask !== 'total-for-m-items' || (v.target !== null && v.target > v.count), {
    message: 'scaling up must ask about MORE items than the arrangement already has',
  })
  .refine(
    (v) => v.ask !== 'how-long-until-the-nth' || (v.target !== null && v.target >= 3 && v.target < v.count),
    { message: 'the nth item must be a real item inside the arrangement, and not the first two' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'interval-fencepost-count',
  name_en: 'Posts and gaps',
  name_id: 'Berapa jarak antar tiang?',
  grades: [2, 3] as const,
  description_id:
    'Mengubah banyaknya benda menjadi banyaknya jarak di antaranya: di garis lurus jaraknya satu kurang dari benda, di lingkaran jaraknya sama banyak dengan benda.',
} as const

// ── Solving ──────────────────────────────────────────────────────────────────

export interface Solution {
  /** Gaps in the arrangement the question describes. */
  gapCount: number
  /** The off-by-one count a careless reader uses instead. */
  wrongGapCount: number
  /** One gap, in metres or seconds. Always a whole number. */
  gapSize: number
  /** Gaps in the arrangement the question ASKS about. */
  targetGaps: number
  /** The off-by-one gap count for the asked-about arrangement. */
  trapGaps: number
  /** The answer as a number. */
  value: number
  /** The off-by-one answer, or null when it is not a whole number. */
  trap: number | null
  unit: 'm' | 's'
  answer: string
}

export function solve(p: Params): Solution {
  const gapCount = gapsFor(p.count, p.ends)
  const wrongGapCount = wrongGapsFor(p.count, p.ends)
  const gapSize = p.span / gapCount
  const unit: 'm' | 's' = p.scenario === 'clock-chimes' ? 's' : 'm'

  let targetGaps: number
  let trapGaps: number
  let value: number
  let rawTrap: number

  if (p.ask === 'gap') {
    targetGaps = gapCount
    trapGaps = wrongGapCount
    value = gapSize
    rawTrap = p.span / wrongGapCount
  } else if (p.ask === 'total-for-m-items') {
    const m = p.target as number
    targetGaps = gapsFor(m, p.ends)
    trapGaps = wrongGapsFor(m, p.ends)
    value = targetGaps * gapSize
    rawTrap = trapGaps * gapSize
  } else {
    // Walking from item 1 to item n crosses n - 1 gaps, on a line AND on a ring.
    const n = p.target as number
    targetGaps = n - 1
    trapGaps = n
    value = targetGaps * gapSize
    rawTrap = trapGaps * gapSize
  }

  const trap = Number.isInteger(rawTrap) && rawTrap > 0 && rawTrap !== value ? rawTrap : null

  return { gapCount, wrongGapCount, gapSize, targetGaps, trapGaps, value, trap, unit, answer: String(value) }
}

// ── Counting the gaps out loud (used by the hints, never by `solve`) ─────────

/** Every gap of an arrangement, named by the two items it sits between. */
export function gapPairs(items: number, ends: Ends): Array<[number, number]> {
  const pairs: Array<[number, number]> = []
  for (let i = 1; i < items; i++) pairs.push([i, i + 1])
  if (ends === 'closed') pairs.push([items, 1])
  return pairs
}

/** "1 ke 2, 2 ke 3, …, 9 ke 10" — short lists are written out in full. */
export function pairList(pairs: Array<[number, number]>, lang: 'en' | 'id'): string {
  const say = ([a, b]: [number, number]) => (lang === 'id' ? `${a} ke ${b}` : `${a} to ${b}`)
  if (pairs.length <= 4) return pairs.map(say).join(', ')
  return [say(pairs[0]), say(pairs[1]), '…', say(pairs[pairs.length - 1])].join(', ')
}

// ── Wording ──────────────────────────────────────────────────────────────────

/**
 * Every string a learner sees, built once. `breakdown.ts` highlights these very
 * strings, so a highlight can never drift out of the body it is meant to spotlight.
 */
export interface Text {
  body_en: string
  body_id: string
  question_en: string
  question_id: string
  /** "10 lamp posts" — the things being counted. */
  itemsPhrase_en: string
  itemsPhrase_id: string
  /** The words that say line-with-both-ends vs ring. The heart of the problem. */
  endsPhrase_en: string
  endsPhrase_id: string
  /** The total length or total time. */
  spanPhrase_en: string
  spanPhrase_id: string
  /** Bare nouns reused by the hints. */
  item_en: string
  items_en: string
  item_id: string
  gapWord_en: string
  gapWord_id: string
  gapsWord_en: string
  unit_en: string
  unit_id: string
  /** "road" / "park" — where the things stand, for the hint prose. */
  place_en: string
  place_id: string
}

interface Nouns {
  item_en: string
  items_en: string
  item_id: string
  items_id: string
  verb_en: string
  verb_id: string
  line_en: string
  line_id: string
  ring_en: string
  ring_id: string
}

const NOUNS: Record<'lamps-on-a-road' | 'trees', Nouns> = {
  'lamps-on-a-road': {
    item_en: 'post',
    items_en: 'lamp posts',
    item_id: 'tiang',
    items_id: 'tiang lampu',
    verb_en: 'stand',
    verb_id: 'berdiri',
    line_en: 'road',
    line_id: 'jalan',
    ring_en: 'park',
    ring_id: 'taman',
  },
  trees: {
    item_en: 'tree',
    items_en: 'trees',
    item_id: 'pohon',
    items_id: 'pohon',
    verb_en: 'are planted',
    verb_id: 'ditanam',
    line_en: 'path',
    line_id: 'jalan setapak',
    ring_en: 'pond',
    ring_id: 'kolam',
  },
}

export function compose(p: Params): Text {
  const { scenario, ends, count, span, ask, target } = p

  if (scenario === 'clock-chimes') {
    const stem_en = `A clock chimes ${count} times in a row, with the same gap between one chime and the next. From the first chime to the last chime takes ${span} seconds.`
    const stem_id = `Sebuah jam berdentang ${count} kali berturut-turut, dengan jeda yang sama antara satu dentangan dan dentangan berikutnya. Dari dentangan pertama sampai dentangan terakhir memakan waktu ${span} detik.`

    let premise_en = ''
    let premise_id = ''
    let question_en: string
    let question_id: string
    if (ask === 'gap') {
      question_en = `How many seconds are there between one chime and the next?`
      question_id = `Berapa detik jeda antara satu dentangan dan dentangan berikutnya?`
    } else if (ask === 'total-for-m-items') {
      premise_en = ` Later the same clock chimes ${target} times in a row, with the same gap.`
      premise_id = ` Nanti jam yang sama berdentang ${target} kali berturut-turut dengan jeda yang sama.`
      question_en = `How many seconds do those ${target} chimes take altogether?`
      question_id = `Berapa detik seluruh ${target} dentangan itu?`
    } else {
      question_en = `How many seconds after the first chime do you hear chime number ${target}?`
      question_id = `Berapa detik setelah dentangan pertama kamu mendengar dentangan ke-${target}?`
    }

    return {
      body_en: `${stem_en}${premise_en} Find: ${question_en}`,
      body_id: `${stem_id}${premise_id} Cari: ${question_id}`,
      question_en,
      question_id,
      itemsPhrase_en: `chimes ${count} times`,
      itemsPhrase_id: `berdentang ${count} kali`,
      endsPhrase_en: `From the first chime to the last chime`,
      endsPhrase_id: `Dari dentangan pertama sampai dentangan terakhir`,
      spanPhrase_en: `${span} seconds`,
      spanPhrase_id: `${span} detik`,
      item_en: 'chime',
      items_en: 'chimes',
      item_id: 'dentangan',
      gapWord_en: 'gap',
      gapWord_id: 'jeda',
      gapsWord_en: 'gaps',
      unit_en: 'seconds',
      unit_id: 'detik',
      place_en: 'clock',
      place_id: 'jam',
    }
  }

  const n = NOUNS[scenario]

  const stem_en =
    ends === 'open'
      ? `${count} ${n.items_en} ${n.verb_en} evenly spaced along a straight ${n.line_en}, with one ${n.item_en} at each end of the ${n.line_en}. The ${n.line_en} is ${span} m long.`
      : `${count} ${n.items_en} ${n.verb_en} evenly spaced around a round ${n.ring_en}. Walking right around the ${n.ring_en} past every ${n.item_en} and back to the first ${n.item_en} is ${span} m.`
  const stem_id =
    ends === 'open'
      ? `${count} ${n.items_id} ${n.verb_id} berjarak sama di sepanjang ${n.line_id} lurus, dengan satu ${n.item_id} tepat di setiap ujung ${n.line_id}. Panjang ${n.line_id} itu ${span} m.`
      : `${count} ${n.items_id} ${n.verb_id} berjarak sama mengelilingi sebuah ${n.ring_id} bundar. Berjalan mengelilingi ${n.ring_id} melewati semua ${n.item_id} lalu kembali ke ${n.item_id} pertama sejauh ${span} m.`

  let premise_en = ''
  let premise_id = ''
  let question_en: string
  let question_id: string

  if (ask === 'gap') {
    question_en = `How many metres apart are two ${n.items_en} that are next to each other?`
    question_id = `Berapa meter jarak antara dua ${n.items_id} yang bersebelahan?`
  } else if (ask === 'total-for-m-items') {
    if (ends === 'open') {
      premise_en = ` A longer straight ${n.line_en} has ${target} ${n.items_en} spaced exactly the same way, again with a ${n.item_en} at each end.`
      premise_id = ` Sebuah ${n.line_id} lurus yang lebih panjang punya ${target} ${n.items_id} dengan jarak yang persis sama, dan tetap ada ${n.item_id} di setiap ujungnya.`
      question_en = `How many metres long is that ${n.line_en}?`
      question_id = `Berapa meter panjang ${n.line_id} yang lebih panjang itu?`
    } else {
      premise_en = ` A bigger round ${n.ring_en} has ${target} ${n.items_en} spaced exactly the same way, all the way around it.`
      premise_id = ` Sebuah ${n.ring_id} bundar yang lebih besar punya ${target} ${n.items_id} dengan jarak yang persis sama, mengelilingi ${n.ring_id} itu.`
      question_en = `How many metres is it right around that bigger ${n.ring_en}?`
      question_id = `Berapa meter jarak mengelilingi ${n.ring_id} yang lebih besar itu?`
    }
  } else if (ends === 'open') {
    question_en = `How many metres is it from the first ${n.item_en} to ${n.item_en} number ${target}?`
    question_id = `Berapa meter jarak dari ${n.item_id} pertama sampai ${n.item_id} ke-${target}?`
  } else {
    question_en = `Walking around the ${n.ring_en} in one direction, how many metres is it from the first ${n.item_en} to ${n.item_en} number ${target}?`
    question_id = `Berjalan mengelilingi ${n.ring_id} ke satu arah, berapa meter jarak dari ${n.item_id} pertama sampai ${n.item_id} ke-${target}?`
  }

  return {
    body_en: `${stem_en}${premise_en} Find: ${question_en}`,
    body_id: `${stem_id}${premise_id} Cari: ${question_id}`,
    question_en,
    question_id,
    itemsPhrase_en: `${count} ${n.items_en}`,
    itemsPhrase_id: `${count} ${n.items_id}`,
    endsPhrase_en:
      ends === 'open'
        ? `with one ${n.item_en} at each end of the ${n.line_en}`
        : `back to the first ${n.item_en}`,
    endsPhrase_id:
      ends === 'open'
        ? `dengan satu ${n.item_id} tepat di setiap ujung ${n.line_id}`
        : `kembali ke ${n.item_id} pertama`,
    spanPhrase_en: ends === 'open' ? `${span} m long` : `is ${span} m`,
    spanPhrase_id: ends === 'open' ? `Panjang ${n.line_id} itu ${span} m` : `sejauh ${span} m`,
    item_en: n.item_en,
    items_en: n.items_en,
    item_id: n.item_id,
    gapWord_en: 'gap',
    gapWord_id: 'jarak',
    gapsWord_en: 'gaps',
    unit_en: 'm',
    unit_id: 'm',
    place_en: ends === 'open' ? n.line_en : n.ring_en,
    place_id: ends === 'open' ? n.line_id : n.ring_id,
  }
}

// ── Generation ───────────────────────────────────────────────────────────────

/** Nice gap sizes for the scale-up asks, where nothing forces a multiple. */
const METRE_GAPS = [2, 3, 4, 5, 6, 8, 10, 12] as const
const SECOND_GAPS = [2, 3, 4, 5] as const

function draft(rng: Rng): Params {
  const scenario = rng.pick(SCENARIOS)
  const chimes = scenario === 'clock-chimes'
  const ends: Ends = chimes ? 'open' : rng.pick(ENDS)
  // Chimes are left out of the `gap` ask on purpose: that ask needs the span to
  // divide exactly by BOTH gap counts so the off-by-one trap is a whole number
  // too, which forces gap sizes of 4-10 — fine for metres, silly for a clock.
  const ask: Ask = chimes ? rng.pick(['total-for-m-items', 'how-long-until-the-nth'] as const) : rng.pick(ASKS)

  const count = rng.int(4, 10)
  const gapCount = gapsFor(count, ends)
  const wrongCount = wrongGapsFor(count, ends)

  // `gap` ask: make the span a multiple of both gap counts, so the child's
  // division AND the tempting wrong division both land on whole numbers.
  // Other asks: pick a friendly gap size; span = gapCount x gapSize is exact anyway.
  const gapSize = ask === 'gap' ? wrongCount * rng.int(1, 3) : chimes ? rng.pick(SECOND_GAPS) : rng.pick(METRE_GAPS)
  const span = gapCount * gapSize

  const target =
    ask === 'gap' ? null : ask === 'total-for-m-items' ? Math.min(20, count + rng.int(2, 8)) : rng.int(3, count - 1)

  return { scenario, ends, count, span, ask, target }
}

/**
 * Quality filter, not a correctness rule. Rejects the shapes where the child
 * could reach the answer without ever deciding how many gaps there are: an
 * answer that is literally one of the numbers already printed in the problem,
 * or a trap that quietly agrees with the answer.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (s.gapSize < 2) return false
  if (s.value === p.span) return false
  if (s.trap === null) return false
  return s.trap !== s.value
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = draft(rng)
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first as Params
}

// ── Rendering ────────────────────────────────────────────────────────────────

export function render(params: Params): Rendered {
  const { scenario, ends, count, span, ask, target } = params
  const s = solve(params)
  const t = compose(params)
  const breakdown = buildIntervalFencepostCountBreakdown(params)

  const ring = ends === 'closed'
  const list_en = pairList(gapPairs(count, ends), 'en')
  const list_id = pairList(gapPairs(count, ends), 'id')

  // Step 1 — the smallest picture, drawn rather than asserted. Two things in a
  // line have one gap; three things round a ring have three. The rule is read
  // off that picture, never handed down.
  const smallest_en = ring
    ? `Start with the smallest picture: 3 ${t.items_en} around a ${t.place_en}. Walk 1 to 2, then 2 to 3, then 3 back to 1 — that last walk is a ${t.gapWord_en} as well. 3 ${t.items_en}, 3 ${t.gapsWord_en}. On a ring the number of ${t.gapsWord_en} is the same as the number of ${t.items_en}.`
    : `Start with the smallest picture: 2 ${t.items_en} have just 1 ${t.gapWord_en} between them. Add one more and there are 2 ${t.gapsWord_en}. Every extra one adds a single ${t.gapWord_en}, so in a straight line the number of ${t.gapsWord_en} is always one less than the number of ${t.items_en}.`
  const smallest_id = ring
    ? `Mulai dari gambar terkecil: 3 ${t.item_id} mengelilingi ${t.place_id}. Jalan dari 1 ke 2, lalu 2 ke 3, lalu 3 kembali ke 1 — jalan terakhir itu juga satu ${t.gapWord_id}. 3 ${t.item_id}, 3 ${t.gapWord_id}. Di lingkaran, banyak ${t.gapWord_id} sama dengan banyak ${t.item_id}.`
    : `Mulai dari gambar terkecil: 2 ${t.item_id} hanya punya 1 ${t.gapWord_id} di antaranya. Tambah satu lagi, ${t.gapWord_id}nya jadi 2. Setiap tambahan hanya menambah satu ${t.gapWord_id}, jadi di garis lurus banyak ${t.gapWord_id} selalu satu kurang dari banyak ${t.item_id}.`

  // Step 2 — count THIS problem's gaps by naming them, and say out loud which
  // number the off-by-one would have used.
  const count_en = ring
    ? `Here there are ${count} ${t.items_en} around the ${t.place_en}, so count the ${t.gapsWord_en}: ${list_en} — the last one comes back to number 1. That is ${s.gapCount} ${t.gapsWord_en}.`
    : `Here there are ${count} ${t.items_en}, so count the ${t.gapsWord_en} one by one: ${list_en}. That is ${s.gapCount} ${t.gapsWord_en}, not ${count}.`
  const count_id = ring
    ? `Di soal ini ada ${count} ${t.item_id} mengelilingi ${t.place_id}, jadi hitung ${t.gapWord_id}nya: ${list_id} — yang terakhir kembali ke nomor 1. Ada ${s.gapCount} ${t.gapWord_id}.`
    : `Di soal ini ada ${count} ${t.item_id}, jadi hitung ${t.gapWord_id}nya satu per satu: ${list_id}. Ada ${s.gapCount} ${t.gapWord_id}, bukan ${count}.`

  // Step 3 — the only division, and it always comes out whole.
  const divide_en = `The ${span} ${t.unit_en} is shared equally by those ${s.gapCount} ${t.gapsWord_en}: ${span} : ${s.gapCount} = ${s.gapSize}. So one ${t.gapWord_en} is ${s.gapSize} ${t.unit_en}.`
  const divide_id = `${span} ${t.unit_id} dibagi rata ke ${s.gapCount} ${t.gapWord_id} itu: ${span} : ${s.gapCount} = ${s.gapSize}. Jadi satu ${t.gapWord_id} adalah ${s.gapSize} ${t.unit_id}.`

  const steps_en: string[] = [smallest_en, count_en]
  const steps_id: string[] = [smallest_id, count_id]

  if (ask === 'gap') {
    steps_en.push(
      `${divide_en} That is the answer: ${s.value} ${t.unit_en}.`,
    )
    steps_id.push(`${divide_id} Itulah jawabannya: ${s.value} ${t.unit_id}.`)
  } else {
    steps_en.push(divide_en)
    steps_id.push(divide_id)

    if (ask === 'total-for-m-items') {
      const m = target as number
      steps_en.push(
        ring
          ? `Now ${m} ${t.items_en} round a ring: same rule, ${m} ${t.items_en} make ${m} ${t.gapsWord_en} (the last one closes the circle). So ${m} x ${s.gapSize} = ${s.value} ${t.unit_en}.`
          : `Now ${m} ${t.items_en} in a straight line: same rule, ${m} - 1 = ${s.targetGaps} ${t.gapsWord_en}. So ${s.targetGaps} x ${s.gapSize} = ${s.value} ${t.unit_en}.`,
      )
      steps_id.push(
        ring
          ? `Sekarang ${m} ${t.item_id} mengelilingi lingkaran: aturannya sama, ${m} ${t.item_id} membuat ${m} ${t.gapWord_id} (yang terakhir menutup lingkaran). Jadi ${m} x ${s.gapSize} = ${s.value} ${t.unit_id}.`
          : `Sekarang ${m} ${t.item_id} di garis lurus: aturannya sama, ${m} - 1 = ${s.targetGaps} ${t.gapWord_id}. Jadi ${s.targetGaps} x ${s.gapSize} = ${s.value} ${t.unit_id}.`,
      )
    } else {
      const n = target as number
      const walk_en = pairList(gapPairs(n, 'open'), 'en')
      const walk_id = pairList(gapPairs(n, 'open'), 'id')
      steps_en.push(
        `From number 1 to number ${n} you cross ${walk_en}. Count them: ${s.targetGaps} ${t.gapsWord_en}, not ${n}. So ${s.targetGaps} x ${s.gapSize} = ${s.value} ${t.unit_en}.`,
      )
      steps_id.push(
        `Dari nomor 1 sampai nomor ${n} kamu melewati ${walk_id}. Hitung: ada ${s.targetGaps} ${t.gapWord_id}, bukan ${n}. Jadi ${s.targetGaps} x ${s.gapSize} = ${s.value} ${t.unit_id}.`,
      )
    }
  }

  const hint_en = ring
    ? `Count the ${t.gapsWord_en}, not the ${t.items_en}. Round a ring the last ${t.gapWord_en} comes back to the first one, so there are just as many ${t.gapsWord_en} as ${t.items_en}.`
    : `Count the ${t.gapsWord_en}, not the ${t.items_en}. In a straight line with one at each end there is always one ${t.gapWord_en} fewer than there are ${t.items_en}.`
  const hint_id = ring
    ? `Hitung ${t.gapWord_id}nya, bukan ${t.item_id}nya. Di lingkaran, ${t.gapWord_id} terakhir kembali ke yang pertama, jadi banyak ${t.gapWord_id} sama dengan banyak ${t.item_id}.`
    : `Hitung ${t.gapWord_id}nya, bukan ${t.item_id}nya. Di garis lurus dengan satu di tiap ujung, ${t.gapWord_id} selalu satu lebih sedikit daripada ${t.item_id}.`

  return {
    body_en: t.body_en,
    body_id: t.body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept

/** Re-exported so the scenario switch stays readable in the figure/explainer. */
export type { Scenario as IntervalScenario }
