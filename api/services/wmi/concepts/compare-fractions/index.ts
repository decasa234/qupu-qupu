import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildCompareFractionsBreakdown } from './breakdown.js'

// Pick the biggest / smallest / nearest-to-a-whole fraction out of a short list.
//
// The one thing this concept lives or dies on: the child must be able to DECIDE
// between the options with a single named rule, not by evaluating decimals in
// their head. So the option set is never a random handful of fractions — it is
// always built so that exactly one comparison rule settles it:
//
//   same-numerator      same top number, so fewer pieces (smaller bottom) = bigger
//   same-denominator    same size pieces, so more pieces taken (bigger top) = bigger
//   one-equivalent-pair one odd fraction is re-cut into the shared bottom number,
//                       and then it is a same-denominator comparison
//   benchmark-half      exactly ONE option sits on the winning side of 1/2
//
// The second load-bearing rule: **no two options may be the same number.** 1/2 and
// 2/4 are one number wearing two coats; a child who picks either is right, and any
// key that names only one of them is wrong. Every comparison here is done by
// cross-multiplying integers (`cmp`), never by dividing — 1/3 vs 0.3333 is exactly
// the kind of rounding that turns a correct answer into a wrong one.
export const MODES = [
  'same-numerator',
  'same-denominator',
  'one-equivalent-pair',
  'benchmark-half',
] as const
export type Mode = (typeof MODES)[number]

export const ASKS = ['largest', 'smallest', 'closest-to-one'] as const
export type Ask = (typeof ASKS)[number]

export const LABELS = ['A', 'B', 'C', 'D'] as const

export interface Frac {
  num: number
  den: number
}

/** Exact comparison. >0 when a is bigger, 0 when a and b are the SAME number. */
export function cmp(a: Frac, b: Frac): number {
  return a.num * b.den - b.num * a.den
}

/** −1 below one half, 0 exactly one half, +1 above. Integers only. */
export function halfSide(f: Frac): number {
  return Math.sign(2 * f.num - f.den)
}

export function fracText(f: Frac): string {
  return `${f.num}/${f.den}`
}

function allDistinctValues(fs: Frac[]): boolean {
  for (let i = 0; i < fs.length; i++) {
    for (let j = i + 1; j < fs.length; j++) {
      if (cmp(fs[i], fs[j]) === 0) return false
    }
  }
  return true
}

/**
 * For `one-equivalent-pair`: which option is the odd one out, what everybody
 * else's bottom number is, and how many smaller pieces each of the odd one's
 * pieces splits into. `null` when the set is not of that shape.
 */
export function equivalentPairParts(
  fs: Frac[],
): { commonDen: number; oddIndex: number; factor: number; scaled: Frac[] } | null {
  const counts = new Map<number, number>()
  for (const f of fs) counts.set(f.den, (counts.get(f.den) ?? 0) + 1)
  if (counts.size !== 2) return null
  const commonDen = [...counts.entries()].find(([, n]) => n === fs.length - 1)?.[0]
  if (commonDen === undefined) return null
  const oddIndex = fs.findIndex((f) => f.den !== commonDen)
  const odd = fs[oddIndex]
  if (odd.den >= commonDen || commonDen % odd.den !== 0) return null
  const factor = commonDen / odd.den
  const scaled = fs.map((f) => (f.den === commonDen ? f : { num: f.num * factor, den: commonDen }))
  return { commonDen, oddIndex, factor, scaled }
}

/** Does the named comparison rule actually settle THIS set? */
export function modeHolds(mode: Mode, fs: Frac[], ask: Ask): boolean {
  if (fs.length < 3) return false
  if (mode === 'same-numerator') return fs.every((f) => f.num === fs[0].num)
  if (mode === 'same-denominator') return fs.every((f) => f.den === fs[0].den)
  if (mode === 'one-equivalent-pair') return equivalentPairParts(fs) !== null
  // benchmark-half: exactly one option on the winning side of 1/2, nobody sitting
  // ON it, and the set must not secretly be a same-top or same-bottom set (that
  // would make the stem name a weaker rule than the one really in play).
  if (fs.some((f) => halfSide(f) === 0)) return false
  const winSide = ask === 'smallest' ? -1 : 1
  if (fs.filter((f) => halfSide(f) === winSide).length !== 1) return false
  if (new Set(fs.map((f) => f.den)).size === 1) return false
  return new Set(fs.map((f) => f.num)).size !== 1
}

const paramsSchema = z
  .object({
    mode: z.enum(MODES),
    fractions: z
      .array(
        z.object({
          num: z.number().int().min(1).max(11),
          den: z.number().int().min(2).max(12),
        }),
      )
      .min(3)
      .max(4),
    ask: z.enum(ASKS),
  })
  // Proper fractions only. Everything below one whole is what makes
  // "closest to one whole" the same option as "largest", and that bridge is
  // stated out loud in the hints rather than assumed.
  .refine((v) => v.fractions.every((f) => f.num < f.den), {
    message: 'every option must be a proper fraction (top smaller than bottom)',
  })
  // THE rule that keeps the key honest: two options that name the same number
  // would both be right.
  .refine((v) => allDistinctValues(v.fractions), {
    message: 'no two options may be the same number',
  })
  .refine((v) => !(v.mode === 'benchmark-half' && v.ask === 'closest-to-one'), {
    message: 'the one-half benchmark cannot decide which fraction is nearest a whole',
  })
  .refine((v) => modeHolds(v.mode, v.fractions, v.ask), {
    message: 'the stated comparison rule must actually settle this set',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'compare-fractions',
  name_en: 'Compare fractions',
  name_id: 'Bandingkan besar pecahan',
  grades: [3] as const,
  description_id:
    'Pilih pecahan terbesar, terkecil, atau yang paling dekat ke satu utuh dengan aturan pembilang sama, penyebut sama, pecahan senilai, atau patokan setengah.',
} as const

// ── Solving ──────────────────────────────────────────────────────────────────

export interface Solution {
  texts: string[]
  labels: string[]
  /** Options ordered biggest first. Strict — no two options are equal. */
  orderDesc: number[]
  answerIndex: number
  answer: string
  answerText: string
  /** Only for `one-equivalent-pair`. */
  common: { commonDen: number; oddIndex: number; factor: number; scaled: Frac[] } | null
  /** The tempting wrong option, or null when this set has no honest trap. */
  trapIndex: number | null
}

export function solve(params: Params): Solution {
  const { fractions, mode, ask } = params
  if (!modeHolds(mode, fractions, ask)) {
    throw new Error(
      `compare-fractions: mode "${mode}" does not hold for ${fractions.map(fracText).join(', ')} with ask "${ask}"`,
    )
  }
  if (!allDistinctValues(fractions)) {
    throw new Error(
      `compare-fractions: two options name the same number in ${fractions.map(fracText).join(', ')}`,
    )
  }

  const texts = fractions.map(fracText)
  const labels = fractions.map((_, i) => LABELS[i])
  const orderDesc = fractions.map((_, i) => i).sort((i, j) => cmp(fractions[j], fractions[i]))
  // Every option is a proper fraction, so the nearest one to a whole is simply
  // the biggest one. The hints say so before they use it.
  const answerIndex = ask === 'smallest' ? orderDesc[orderDesc.length - 1] : orderDesc[0]

  const common = mode === 'one-equivalent-pair' ? equivalentPairParts(fractions) : null

  return {
    texts,
    labels,
    orderDesc,
    answerIndex,
    answer: LABELS[answerIndex],
    answerText: texts[answerIndex],
    common,
    trapIndex: findTrap(params, answerIndex, common),
  }
}

/**
 * The classic fraction misconception: reading the numbers as whole numbers.
 * With the same top number, a child grabs the biggest bottom number for
 * "largest"; after an equivalent-fraction rewrite, a child who never rewrote
 * compares raw top numbers. Only these two are real traps — a same-bottom set or
 * a one-half split has no comparably tempting wrong option, so those get `null`.
 */
function findTrap(
  params: Params,
  answerIndex: number,
  common: Solution['common'],
): number | null {
  const { fractions, mode, ask } = params
  const wantBig = ask !== 'smallest'

  if (mode === 'same-numerator') {
    const dens = fractions.map((f) => f.den)
    // "Bigger bottom number = bigger fraction" picks the largest denominator
    // when hunting the largest, and the smallest denominator when hunting the
    // smallest. Backwards both times.
    const target = wantBig ? Math.max(...dens) : Math.min(...dens)
    if (dens.filter((d) => d === target).length !== 1) return null
    const at = dens.indexOf(target)
    return at === answerIndex ? null : at
  }

  if (mode === 'one-equivalent-pair' && common !== null) {
    const nums = fractions.map((f) => f.num)
    const target = wantBig ? Math.max(...nums) : Math.min(...nums)
    if (nums.filter((n) => n === target).length !== 1) return null
    const at = nums.indexOf(target)
    return at === answerIndex ? null : at
  }

  return null
}

// ── Generation ───────────────────────────────────────────────────────────────

function range(lo: number, hi: number): number[] {
  const out: number[] = []
  for (let n = lo; n <= hi; n++) out.push(n)
  return out
}

function draftSameNumerator(rng: Rng): Frac[] | null {
  const num = rng.int(1, 3)
  const want = rng.int(3, 4)
  const pool = range(num + 1, 12)
  if (pool.length < want) return null
  return rng
    .shuffle(pool)
    .slice(0, want)
    .map((den) => ({ num, den }))
}

function draftSameDenominator(rng: Rng): Frac[] | null {
  const den = rng.int(4, 12)
  const want = rng.int(3, 4)
  const pool = range(1, den - 1)
  if (pool.length < want) return null
  return rng
    .shuffle(pool)
    .slice(0, want)
    .map((num) => ({ num, den }))
}

function draftEquivalentPair(rng: Rng): Frac[] | null {
  const commonDen = rng.pick([4, 6, 8, 9, 10, 12])
  const divisors = range(2, commonDen - 1).filter((d) => commonDen % d === 0)
  if (divisors.length === 0) return null
  const oddDen = rng.pick(divisors)
  const factor = commonDen / oddDen
  const oddNum = rng.int(1, oddDen - 1)
  const scaledNum = oddNum * factor
  const want = rng.int(3, 4)
  // Never offer the odd fraction's own rewrite as a separate option: it would be
  // the same number twice, and both would be right.
  const pool = range(1, commonDen - 1).filter((n) => n !== scaledNum)
  if (pool.length < want - 1) return null
  const others = rng.shuffle(pool).slice(0, want - 1)
  return [{ num: oddNum, den: oddDen }, ...others.map((num) => ({ num, den: commonDen }))]
}

function draftBenchmarkHalf(rng: Rng, ask: Ask): Frac[] | null {
  const winSide = ask === 'smallest' ? -1 : 1
  const all: Frac[] = []
  for (let den = 3; den <= 12; den++) {
    for (let num = 1; num < den; num++) {
      if (2 * num !== den) all.push({ num, den })
    }
  }
  const winners = all.filter((f) => halfSide(f) === winSide)
  const losers = all.filter((f) => halfSide(f) === -winSide)

  for (let tries = 0; tries < 40; tries++) {
    const want = rng.int(3, 4)
    if (losers.length < want - 1) return null
    const set = [rng.pick(winners), ...rng.shuffle(losers).slice(0, want - 1)]
    if (!allDistinctValues(set)) continue
    if (new Set(set.map((f) => f.den)).size === 1) continue
    if (new Set(set.map((f) => f.num)).size === 1) continue
    return set
  }
  return null
}

/** A hand-built set that satisfies every rule, for the (unreachable) miss case. */
const FALLBACK: Params = {
  mode: 'same-numerator',
  fractions: [
    { num: 1, den: 3 },
    { num: 1, den: 8 },
    { num: 1, den: 5 },
    { num: 1, den: 4 },
  ],
  ask: 'largest',
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 200; attempt++) {
    const mode = rng.pick(MODES)
    // The one-half benchmark tells you which side of a half a fraction is on; it
    // says nothing about which one is nearest a whole, so that pairing is never
    // drafted.
    const asks: readonly Ask[] = mode === 'benchmark-half' ? ['largest', 'smallest'] : ASKS
    const ask = rng.pick(asks)

    const fractions =
      mode === 'same-numerator'
        ? draftSameNumerator(rng)
        : mode === 'same-denominator'
          ? draftSameDenominator(rng)
          : mode === 'one-equivalent-pair'
            ? draftEquivalentPair(rng)
            : draftBenchmarkHalf(rng, ask)
    if (fractions === null) continue

    // Shuffled so the right answer is not pinned to one label across the pool.
    const candidate: Params = { mode, fractions: rng.shuffle(fractions), ask }
    if (paramsSchema.safeParse(candidate).success) return candidate
  }
  return FALLBACK
}

// ── Wording (shared with breakdown.ts so every phrase stays a real substring) ─

export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** The sentence naming the comparison rule, with no trailing full stop. */
export function modeClause(params: Params, lang: 'en' | 'id'): string {
  const { mode, fractions } = params
  if (mode === 'same-numerator') {
    const n = fractions[0].num
    return lang === 'id'
      ? `Semuanya punya pembilang yang sama, yaitu ${n}`
      : `They all have the same top number, ${n}`
  }
  if (mode === 'same-denominator') {
    const d = fractions[0].den
    return lang === 'id'
      ? `Semuanya punya penyebut yang sama, yaitu ${d}`
      : `They all have the same bottom number, ${d}`
  }
  if (mode === 'one-equivalent-pair') {
    const parts = equivalentPairParts(fractions)
    const d = parts?.commonDen ?? fractions[0].den
    return lang === 'id'
      ? `Semuanya berpenyebut ${d}, kecuali satu`
      : `They all have the bottom number ${d} except one`
  }
  return lang === 'id'
    ? `Ada yang lebih dari setengah dan ada yang kurang dari setengah`
    : `Some of them are more than one half and some are less than one half`
}

/** The question sentence, ending in "?". */
export function askClause(ask: Ask, lang: 'en' | 'id'): string {
  if (ask === 'largest') return lang === 'id' ? 'Manakah yang paling besar?' : 'Which one is the largest?'
  if (ask === 'smallest') return lang === 'id' ? 'Manakah yang paling kecil?' : 'Which one is the smallest?'
  return lang === 'id'
    ? 'Manakah yang paling dekat ke satu utuh?'
    : 'Which one is closest to one whole?'
}

// ── Rendering ────────────────────────────────────────────────────────────────

export function render(params: Params): Rendered {
  const { fractions, mode, ask } = params
  const s = solve(params)
  const wantBig = ask !== 'smallest'
  const answer = fractions[s.answerIndex]

  const choices: WmiChoice[] = fractions.map((f, i) => ({ label: LABELS[i], text: fracText(f) }))

  const body_en = `Look at these fractions: ${listEn(s.texts)}. ${modeClause(params, 'en')}. Find: ${askClause(ask, 'en')}`
  const body_id = `Perhatikan pecahan berikut: ${listId(s.texts)}. ${modeClause(params, 'id')}. Cari: ${askClause(ask, 'id')}`

  // ── hint_steps. Each mode names its rule FIRST, then applies that rule to
  // these exact numbers, and only then lands on a label. Nothing is asserted
  // that the previous line has not already earned.
  const steps_en: string[] = []
  const steps_id: string[] = []

  if (ask === 'closest-to-one') {
    steps_en.push(
      `Every fraction here is smaller than one whole, because each top number is smaller than its bottom number. So the one that gets closest to a whole is simply the biggest one of them.`,
    )
    steps_id.push(
      `Setiap pecahan di sini lebih kecil dari satu utuh, karena pembilangnya lebih kecil dari penyebutnya. Jadi yang paling dekat ke satu utuh berarti yang paling besar di antara mereka.`,
    )
  }

  if (mode === 'same-numerator') {
    const n = fractions[0].num
    const dens = fractions.map((f) => f.den)
    steps_en.push(
      `Every fraction here takes ${n} piece${n === 1 ? '' : 's'}, so the only thing that changes is how big one piece is. The more pieces a whole is cut into, the smaller each piece gets — so a smaller bottom number makes a bigger fraction.`,
    )
    steps_id.push(
      `Setiap pecahan di sini mengambil ${n} bagian, jadi yang berbeda hanya besar satu bagiannya. Makin banyak sebuah utuh dipotong, makin kecil tiap potongannya — jadi penyebut yang lebih kecil membuat pecahan lebih besar.`,
    )
    const pick = wantBig ? Math.min(...dens) : Math.max(...dens)
    steps_en.push(
      wantBig
        ? `The bottom numbers are ${listEn(dens.map(String))}. The smallest of those is ${pick}, so ${s.answerText} is cut into the fewest pieces and its pieces are the biggest.`
        : `The bottom numbers are ${listEn(dens.map(String))}. The biggest of those is ${pick}, so ${s.answerText} is cut into the most pieces and its pieces are the tiniest.`,
    )
    steps_id.push(
      wantBig
        ? `Penyebutnya adalah ${listId(dens.map(String))}. Yang paling kecil adalah ${pick}, jadi ${s.answerText} dipotong paling sedikit sehingga potongannya paling besar.`
        : `Penyebutnya adalah ${listId(dens.map(String))}. Yang paling besar adalah ${pick}, jadi ${s.answerText} dipotong paling banyak sehingga potongannya paling kecil.`,
    )
  } else if (mode === 'same-denominator') {
    const d = fractions[0].den
    const nums = fractions.map((f) => f.num)
    steps_en.push(
      `Every fraction here is cut into ${d} equal pieces, so all the pieces are exactly the same size. Then whoever takes more of those pieces is bigger.`,
    )
    steps_id.push(
      `Setiap pecahan di sini dipotong menjadi ${d} bagian sama besar, jadi semua potongannya sama besar. Maka yang mengambil lebih banyak potongan itulah yang lebih besar.`,
    )
    const pick = wantBig ? Math.max(...nums) : Math.min(...nums)
    steps_en.push(
      wantBig
        ? `The top numbers are ${listEn(nums.map(String))}. The biggest is ${pick}, so ${s.answerText} takes the most pieces.`
        : `The top numbers are ${listEn(nums.map(String))}. The smallest is ${pick}, so ${s.answerText} takes the fewest pieces.`,
    )
    steps_id.push(
      wantBig
        ? `Pembilangnya adalah ${listId(nums.map(String))}. Yang paling besar adalah ${pick}, jadi ${s.answerText} mengambil paling banyak potongan.`
        : `Pembilangnya adalah ${listId(nums.map(String))}. Yang paling kecil adalah ${pick}, jadi ${s.answerText} mengambil paling sedikit potongan.`,
    )
  } else if (mode === 'one-equivalent-pair' && s.common !== null) {
    const { commonDen, oddIndex, factor, scaled } = s.common
    const odd = fractions[oddIndex]
    const oddScaled = fracText(scaled[oddIndex])
    steps_en.push(
      `${fracText(odd)} is the odd one out: its whole is cut into ${odd.den} pieces while the others are cut into ${commonDen}. Cut each of those ${odd.den} pieces into ${factor}, and nothing gets bigger or smaller — ${fracText(odd)} is the same amount as ${oddScaled}.`,
    )
    steps_id.push(
      `${fracText(odd)} berbeda sendiri: utuhnya dipotong menjadi ${odd.den} bagian, sedangkan yang lain menjadi ${commonDen}. Potong lagi tiap ${odd.den} bagian itu menjadi ${factor}, besarnya tidak berubah — ${fracText(odd)} sama banyak dengan ${oddScaled}.`,
    )
    const scaledNums = scaled.map((f) => f.num)
    const pick = wantBig ? Math.max(...scaledNums) : Math.min(...scaledNums)
    const answerScaled = fracText(scaled[s.answerIndex])
    steps_en.push(
      `Now every one is counted in pieces of 1/${commonDen}: ${listEn(scaled.map(fracText))}. All the pieces are the same size, so the top numbers can be compared straight away — the ${wantBig ? 'biggest' : 'smallest'} is ${pick}, which is ${answerScaled}.`,
    )
    steps_id.push(
      `Sekarang semuanya dihitung dalam potongan 1/${commonDen}: ${listId(scaled.map(fracText))}. Semua potongannya sama besar, jadi pembilangnya bisa langsung dibandingkan — yang paling ${wantBig ? 'besar' : 'kecil'} adalah ${pick}, yaitu ${answerScaled}.`,
    )
  } else {
    steps_en.push(
      `A fraction is exactly one half when its top number is exactly half of its bottom number. So double the top number and compare it with the bottom: bigger than the bottom means more than one half, smaller means less than one half.`,
    )
    steps_id.push(
      `Sebuah pecahan tepat setengah kalau pembilangnya persis separuh dari penyebutnya. Jadi kalikan dua pembilangnya lalu bandingkan dengan penyebutnya: lebih besar berarti lebih dari setengah, lebih kecil berarti kurang dari setengah.`,
    )
    steps_en.push(
      fractions
        .map((f) => {
          const over = halfSide(f) > 0
          return `${fracText(f)}: 2 × ${f.num} = ${2 * f.num}, which is ${over ? 'more' : 'less'} than ${f.den}, so ${fracText(f)} is ${over ? 'more' : 'less'} than one half.`
        })
        .join(' '),
    )
    steps_id.push(
      fractions
        .map((f) => {
          const over = halfSide(f) > 0
          return `${fracText(f)}: 2 × ${f.num} = ${2 * f.num}, ${over ? 'lebih besar' : 'lebih kecil'} dari ${f.den}, jadi ${fracText(f)} ${over ? 'lebih dari' : 'kurang dari'} setengah.`
        })
        .join(' '),
    )
    steps_en.push(
      wantBig
        ? `Only ${s.answerText} is more than one half and all the others are less, and nothing below a half can beat something above a half.`
        : `Only ${s.answerText} is less than one half and all the others are more, and nothing above a half can be smaller than something below a half.`,
    )
    steps_id.push(
      wantBig
        ? `Hanya ${s.answerText} yang lebih dari setengah dan yang lain semuanya kurang dari setengah, dan yang kurang dari setengah tidak mungkin mengalahkan yang lebih dari setengah.`
        : `Hanya ${s.answerText} yang kurang dari setengah dan yang lain semuanya lebih dari setengah, dan yang lebih dari setengah tidak mungkin lebih kecil daripada yang kurang dari setengah.`,
    )
  }

  const gap = answer.den - answer.num
  if (ask === 'closest-to-one') {
    steps_en.push(
      `So ${s.answerText} is the biggest, and it is only ${gap} piece${gap === 1 ? '' : 's'} short of all ${answer.den} — the answer is ${s.answer}.`,
    )
    steps_id.push(
      `Jadi ${s.answerText} yang paling besar, dan hanya kurang ${gap} bagian dari ${answer.den} bagian — jawabannya ${s.answer}.`,
    )
  } else if (ask === 'largest') {
    steps_en.push(`So the largest is ${s.answerText} — the answer is ${s.answer}.`)
    steps_id.push(`Jadi yang paling besar adalah ${s.answerText} — jawabannya ${s.answer}.`)
  } else {
    steps_en.push(`So the smallest is ${s.answerText} — the answer is ${s.answer}.`)
    steps_id.push(`Jadi yang paling kecil adalah ${s.answerText} — jawabannya ${s.answer}.`)
  }

  const hint_en =
    mode === 'same-numerator'
      ? 'The top numbers are all the same, so only the piece size differs: fewer pieces means bigger pieces.'
      : mode === 'same-denominator'
        ? 'The pieces are all the same size, so just count how many pieces each one takes.'
        : mode === 'one-equivalent-pair'
          ? 'Rewrite the odd fraction so every fraction is counted in the same size pieces, then compare the top numbers.'
          : 'Check each fraction against one half first: double the top number and compare it with the bottom.'
  const hint_id =
    mode === 'same-numerator'
      ? 'Pembilangnya sama semua, jadi yang berbeda hanya besar potongannya: makin sedikit potongan, makin besar tiap potongan.'
      : mode === 'same-denominator'
        ? 'Semua potongannya sama besar, jadi tinggal hitung berapa potongan yang diambil masing-masing.'
        : mode === 'one-equivalent-pair'
          ? 'Ubah pecahan yang berbeda sendiri agar semuanya dihitung dalam potongan yang sama besar, lalu bandingkan pembilangnya.'
          : 'Periksa dulu tiap pecahan terhadap setengah: kalikan dua pembilangnya lalu bandingkan dengan penyebutnya.'

  return {
    body_en,
    body_id,
    answer_type: 'multiple_choice',
    choices_en: choices,
    choices_id: choices,
    answer: s.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown: buildCompareFractionsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
