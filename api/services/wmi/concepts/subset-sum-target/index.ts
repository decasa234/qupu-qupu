import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildSubsetSumTargetBreakdown } from './breakdown.js'

// One idea sits under all three ask forms: a total is only "hit" when the parts
// add up EXACTLY. Close is wrong. Children reach for the biggest-looking pieces
// or split by how MANY pieces there are; both are wrecked here on purpose.
export const ASKS = ['which-subset', 'which-cut-line', 'balance-the-seesaw'] as const
export type Ask = (typeof ASKS)[number]

export const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

const NAMES = ['Budi', 'Siti', 'Ayu', 'Rian', 'Dewi', 'Tono', 'Nadia', 'Fajar'] as const

export type Lang = 'en' | 'id'

// ── pure combinatorics (shared by the generator, the schema and render) ──────

export function sumAt(values: readonly number[], idx: readonly number[]): number {
  let total = 0
  for (const i of idx) total += values[i]
  return total
}

/** Every index set of exactly `size` items, in lexicographic order. */
export function combinations(n: number, size: number): number[][] {
  const out: number[][] = []
  const pick: number[] = []
  const walk = (start: number) => {
    if (pick.length === size) {
      out.push(pick.slice())
      return
    }
    for (let i = start; i < n; i++) {
      pick.push(i)
      walk(i + 1)
      pick.pop()
    }
  }
  walk(0)
  return out
}

/**
 * Brute force: EVERY non-empty subset of `values` whose total is `target`.
 * The generator rejects any pool where this does not return exactly one set, so
 * a child can never find a second, equally-correct group of cards. Pools are at
 * most 8 items, so this is 255 masks — cheap enough to run inside the schema.
 */
export function subsetsHitting(values: readonly number[], target: number): number[][] {
  const out: number[][] = []
  const n = values.length
  for (let mask = 1; mask < 1 << n; mask++) {
    let total = 0
    const idx: number[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        total += values[i]
        idx.push(i)
      }
    }
    if (total === target) out.push(idx)
  }
  return out
}

const setKey = (idx: readonly number[]): string => idx.slice().sort((a, b) => a - b).join('-')

/** Running totals of the row, read left to right: prefix[k] = first k cards. */
export function prefixSums(values: readonly number[]): number[] {
  const out: number[] = [0]
  for (const v of values) out.push(out[out.length - 1] + v)
  return out
}

/** The tempting cut: straight down the middle by COUNT, ignoring the totals. */
export function midCut(n: number): number {
  return n / 2
}

// ── params ──────────────────────────────────────────────────────────────────

const paramsSchema = z
  .object({
    ask: z.enum(ASKS),
    /** The numbers on the cards / the weights of the blocks. Always all different. */
    values: z.array(z.number().int().min(1).max(50)).min(4).max(8),
    /** Choice asks: the total to hit. `which-cut-line`: half of the row total. */
    target: z.number().int().min(2).max(120),
    /** Choice asks: how many items to take. `which-cut-line`: cards left of the cut. */
    size: z.number().int().min(1).max(6),
    /** Choice asks only: the four offered index sets, already in display order. */
    options: z.array(z.array(z.number().int().min(0).max(7))),
    /** Choice asks only: which slot of `options` is the right one. */
    answerIndex: z.number().int().min(0).max(3),
    actor: z.string().min(1),
  })
  .refine((v) => new Set(v.values).size === v.values.length, {
    message: 'every card must show a different number, or the answer is ambiguous',
  })
  // ── the choice asks ───────────────────────────────────────────────────────
  .refine((v) => v.ask === 'which-cut-line' || v.options.length === 4, {
    message: 'the choice asks always offer exactly four options',
  })
  .refine((v) => v.ask === 'which-cut-line' || v.size === 2 || v.size === 3, {
    message: 'a child picks two or three cards, never more',
  })
  .refine(
    (v) =>
      v.ask === 'which-cut-line' ||
      v.options.every((o) => o.length === v.size && o.every((i) => i < v.values.length)),
    { message: 'every option must name `size` real cards' },
  )
  .refine(
    (v) => v.ask === 'which-cut-line' || new Set(v.options.map(setKey)).size === v.options.length,
    { message: 'two options may never be the same group of cards' },
  )
  .refine(
    (v) => v.ask === 'which-cut-line' || sumAt(v.values, v.options[v.answerIndex] ?? []) === v.target,
    { message: 'the marked option must actually add up to the target' },
  )
  .refine(
    (v) =>
      v.ask === 'which-cut-line' ||
      v.options.every((o, i) => i === v.answerIndex || sumAt(v.values, o) !== v.target),
    { message: 'only one option may reach the target' },
  )
  // The fairness contract: across the WHOLE pool, of every size, exactly one
  // group of cards adds to the target. Two winning pairs would make the
  // question unanswerable — this is the bug this concept is most prone to.
  .refine((v) => v.ask === 'which-cut-line' || subsetsHitting(v.values, v.target).length === 1, {
    message: 'exactly one group of cards in the pool may reach the target',
  })
  .refine((v) => v.ask !== 'balance-the-seesaw' || v.size === 2, {
    message: 'the scale always takes two blocks on the right pan',
  })
  // ── the cut-line ask ──────────────────────────────────────────────────────
  .refine((v) => v.ask !== 'which-cut-line' || v.values.length % 2 === 0, {
    message: 'the cut-line row has an even number of cards so "cut in the middle" is a real trap',
  })
  .refine((v) => v.ask !== 'which-cut-line' || (v.size >= 1 && v.size < v.values.length), {
    message: 'the cut must leave at least one card on each side',
  })
  .refine((v) => v.ask !== 'which-cut-line' || prefixSums(v.values)[v.size] === v.target, {
    message: 'the cards left of the cut must add up to exactly half the row',
  })
  .refine(
    (v) => v.ask !== 'which-cut-line' || v.values.reduce((a, b) => a + b, 0) === 2 * v.target,
    { message: 'the two halves of the row must add up to the same total' },
  )
  .refine((v) => v.ask !== 'which-cut-line' || v.size !== midCut(v.values.length), {
    message: 'the equal-sum cut must not sit at the middle by count — that is the trap',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'subset-sum-target',
  name_en: 'Pick the items that add to the target',
  name_id: 'Pilih yang jumlahnya tepat',
  grades: [1, 2, 3] as const,
  description_id:
    'Memilih kelompok benda yang jumlahnya tepat sama dengan target, atau memotong deretan jadi dua bagian yang jumlahnya sama.',
} as const

// ── derivation: everything render / breakdown / steps read ───────────────────

export interface OptionInfo {
  label: string
  idx: number[]
  values: number[]
  sum: number
  /** sum − target: negative = too light, positive = too heavy, 0 = exact. */
  delta: number
}

export interface Derived {
  ask: Ask
  n: number
  /** Choice asks: the four offered groups. Empty for `which-cut-line`. */
  options: OptionInfo[]
  answerLabel: string
  /** The winning group's values, ascending. */
  winner: number[]
  /**
   * Choice asks: the wrong option closest to the target — the one a child who
   * rounds "close enough" would take. Null when every wrong option is far off.
   */
  trapOption: OptionInfo | null
  // cut-line
  total: number
  half: number
  cut: number
  /** Running totals left to right, index 0 = 0 (nothing taken yet). */
  prefix: number[]
  /** The tempting middle-by-count cut, and the card it would stop on. */
  trapCut: number
  trapCutLeft: number
  trapCutRight: number
  trapCard: number
  answer: string
}

export function derive(params: Params): Derived {
  const { ask, values, target, size, options, answerIndex } = params
  const n = values.length

  if (ask === 'which-cut-line') {
    const prefix = prefixSums(values)
    const total = prefix[n]
    const trapCut = midCut(n)
    return {
      ask,
      n,
      options: [],
      answerLabel: '',
      winner: values.slice(0, size),
      trapOption: null,
      total,
      half: target,
      cut: size,
      prefix,
      trapCut,
      trapCutLeft: prefix[trapCut],
      trapCutRight: total - prefix[trapCut],
      trapCard: values[trapCut - 1],
      answer: String(values[size - 1]),
    }
  }

  const infos: OptionInfo[] = options.map((idx, i) => {
    const vals = idx.map((j) => values[j]).sort((a, b) => a - b)
    const sum = vals.reduce((a, b) => a + b, 0)
    return { label: OPTION_LABELS[i], idx, values: vals, sum, delta: sum - target }
  })
  const wrong = infos.filter((_, i) => i !== answerIndex)
  const trapOption =
    wrong.length === 0
      ? null
      : wrong.reduce((best, o) => (Math.abs(o.delta) < Math.abs(best.delta) ? o : best))

  return {
    ask,
    n,
    options: infos,
    answerLabel: OPTION_LABELS[answerIndex],
    winner: infos[answerIndex].values,
    trapOption,
    total: values.reduce((a, b) => a + b, 0),
    half: target,
    cut: size,
    prefix: prefixSums(values),
    trapCut: 0,
    trapCutLeft: 0,
    trapCutRight: 0,
    trapCard: 0,
    answer: OPTION_LABELS[answerIndex],
  }
}

// ── wording helpers ─────────────────────────────────────────────────────────

export function listOf(items: readonly (string | number)[], lang: Lang): string {
  const parts = items.map(String)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  const conj = lang === 'id' ? 'dan' : 'and'
  const last = parts[parts.length - 1]
  const head = parts.slice(0, -1)
  return parts.length === 2 ? `${head[0]} ${conj} ${last}` : `${head.join(', ')}, ${conj} ${last}`
}

/** "17 (tepat)" / "18 (lebih 1)" — how far an option lands from the target. */
export function deltaText(delta: number, lang: Lang): string {
  if (delta === 0) return lang === 'id' ? 'tepat' : 'exact'
  if (delta > 0) return lang === 'id' ? `lebih ${delta}` : `${delta} over`
  return lang === 'id' ? `kurang ${-delta}` : `${-delta} short`
}

// ── generation ──────────────────────────────────────────────────────────────

/** Random distinct values, drawn without replacement from `lo…hi`. */
function drawDistinct(rng: Rng, count: number, lo: number, hi: number, used: Set<number>): number[] | null {
  const out: number[] = []
  for (let guard = 0; out.length < count && guard < 200; guard++) {
    const v = rng.int(lo, hi)
    if (used.has(v)) continue
    used.add(v)
    out.push(v)
  }
  return out.length === count ? out : null
}

/**
 * Builds a pool where a chosen group hits `target` and a couple of OTHER groups
 * miss it by only 1–3 — the near-miss distractors that make the question worth
 * asking. Returns null when the draw collides; the caller just retries.
 */
function tryPool(rng: Rng, ask: Ask, size: number, actor: string): Params | null {
  const used = new Set<number>()
  let winner: number[]

  if (size === 2) {
    const a = rng.int(3, 20)
    const b = rng.int(a + 2, Math.min(29, a + 18))
    if (a === b) return null
    winner = [a, b]
  } else {
    const a = rng.int(2, 7)
    const b = rng.int(a + 1, a + 5)
    const c = rng.int(b + 1, b + 6)
    winner = [a, b, c]
  }
  for (const v of winner) used.add(v)
  const target = winner.reduce((x, y) => x + y, 0)

  const values = [...winner]
  const nearPairs = rng.int(1, 2)

  for (let k = 0; k < nearPairs; k++) {
    // A group that misses by delta: swap ONE member of the winner for a value
    // shifted by delta (pairs get a whole fresh pair, so both stay in range).
    const delta = rng.pick([-3, -2, -1, 1, 2, 3])
    if (size === 2) {
      const lo = 2
      const hi = Math.floor((target + delta - 1) / 2)
      if (hi < lo) return null
      const c = rng.int(lo, hi)
      const d = target + delta - c
      if (c === d || d < 1 || d > 50 || used.has(c) || used.has(d)) return null
      used.add(c)
      used.add(d)
      values.push(c, d)
    } else {
      const swapAt = rng.int(0, 2)
      const replacement = winner[swapAt] + delta
      if (replacement < 1 || replacement > 50 || used.has(replacement)) return null
      used.add(replacement)
      values.push(replacement)
    }
  }

  // Optional filler card so the pool size is not a giveaway of the structure.
  if (rng.int(0, 1) === 1) {
    const extra = drawDistinct(rng, 1, 2, size === 2 ? 30 : 20, used)
    if (extra) values.push(extra[0])
  }
  if (values.length < 4 || values.length > 8) return null

  values.sort((a, b) => a - b)

  // Fairness gate: exactly ONE group of cards, of any size, reaches the target.
  const hits = subsetsHitting(values, target)
  if (hits.length !== 1) return null
  const winnerIdx = hits[0]
  if (winnerIdx.length !== size) return null

  // Distractors = the three wrong groups of the right size that land closest to
  // the target, so every offered option is a genuine near miss, never filler.
  const winnerKey = setKey(winnerIdx)
  const wrong = combinations(values.length, size)
    .filter((c) => setKey(c) !== winnerKey)
    .map((c) => ({ c, sum: sumAt(values, c) }))
    .sort(
      (x, y) =>
        Math.abs(x.sum - target) - Math.abs(y.sum - target) ||
        x.sum - y.sum ||
        setKey(x.c).localeCompare(setKey(y.c)),
    )
  if (wrong.length < 3) return null

  const answerIndex = rng.int(0, 3)
  const options = wrong.slice(0, 3).map((w) => w.c)
  options.splice(answerIndex, 0, winnerIdx)

  return { ask, values, target, size, options, answerIndex, actor }
}

const triangular = (k: number): number => (k * (k + 1)) / 2

/**
 * `k` different whole numbers, all ≤ maxV, none in `exclude`, adding to exactly
 * `total`. Starts from 1,2,…,k and bumps a trailing run by 1 `bumps` times: a
 * run of length r adds exactly r to the sum, keeps the values strictly
 * increasing (so never equal), and lifts the largest value by exactly 1. That
 * last fact is what lets us pick `bumps` up front and stay under `maxV`.
 */
function distinctSetWithSum(
  rng: Rng,
  k: number,
  total: number,
  maxV: number,
  exclude: Set<number>,
): number[] | null {
  const need = total - triangular(k)
  if (need < 0) return null
  const minBumps = Math.ceil(need / k)
  const maxBumps = Math.min(need, maxV - k)
  if (need > 0 && minBumps > maxBumps) return null

  for (let attempt = 0; attempt < 80; attempt++) {
    const vals = Array.from({ length: k }, (_, i) => i + 1)
    if (need > 0) {
      const bumps = rng.int(minBumps, maxBumps)
      let rest = need
      let ok = true
      for (let i = 0; i < bumps; i++) {
        const after = bumps - i - 1
        const lo = Math.max(1, rest - after * k)
        const hi = Math.min(k, rest - after)
        if (hi < lo) {
          ok = false
          break
        }
        const run = rng.int(lo, hi)
        for (let j = k - run; j < k; j++) vals[j] += 1
        rest -= run
      }
      if (!ok || rest !== 0) continue
    }
    if (vals[k - 1] > maxV) continue
    if (vals.some((v) => exclude.has(v))) continue
    return vals
  }
  return null
}

const CUT_MAX_VALUE = 18

/** Cut positions that leave both sides non-empty and are NOT the middle by count. */
export function cutChoices(n: number): number[] {
  const out: number[] = []
  const lo = n <= 4 ? 1 : 2
  const hi = n <= 4 ? n - 1 : n - 2
  for (let c = lo; c <= hi; c++) if (c !== midCut(n)) out.push(c)
  return out
}

function tryCutLine(rng: Rng, actor: string): Params | null {
  const n = rng.pick([4, 6, 8])
  const cuts = cutChoices(n)
  if (cuts.length === 0) return null
  const cut = rng.pick(cuts)
  const leftCount = cut
  const rightCount = n - cut

  // The biggest total k different values ≤ CUT_MAX_VALUE can reach.
  const cap = (k: number) => k * CUT_MAX_VALUE - triangular(k - 1)
  const minHalf = Math.max(triangular(leftCount), triangular(rightCount))
  const maxHalf = Math.min(cap(leftCount), cap(rightCount))
  if (minHalf > maxHalf) return null
  const half = rng.int(minHalf, Math.min(maxHalf, minHalf + 12))

  const used = new Set<number>()
  const left = distinctSetWithSum(rng, leftCount, half, CUT_MAX_VALUE, used)
  if (!left) return null
  for (const v of left) used.add(v)
  const right = distinctSetWithSum(rng, rightCount, half, CUT_MAX_VALUE, used)
  if (!right) return null

  const values = [...rng.shuffle(left), ...rng.shuffle(right)]
  if (new Set(values).size !== values.length) return null
  // Belt and braces: the cut we built must be the cut the row actually has.
  if (prefixSums(values)[cut] !== half) return null

  return { ask: 'which-cut-line', values, target: half, size: cut, options: [], answerIndex: 0, actor }
}

// A verified pool per ask, used only if 120 draws in a row all collide. Every
// one satisfies the schema (asserted in index.test.ts), so `generate` can never
// hand back params that fail to parse.
export const FALLBACKS: Record<Ask, Params> = {
  'which-subset': {
    ask: 'which-subset',
    values: [4, 6, 12, 13],
    target: 17,
    size: 2,
    options: [
      [0, 2],
      [1, 2],
      [0, 3],
      [2, 3],
    ],
    answerIndex: 2,
    actor: 'Nadia',
  },
  'balance-the-seesaw': {
    ask: 'balance-the-seesaw',
    values: [5, 7, 9, 14],
    target: 19,
    size: 2,
    options: [
      [1, 2],
      [0, 3],
      [2, 3],
      [1, 3],
    ],
    answerIndex: 1,
    actor: 'Budi',
  },
  'which-cut-line': {
    ask: 'which-cut-line',
    values: [9, 8, 2, 3, 5, 7],
    target: 17,
    size: 2,
    options: [],
    answerIndex: 0,
    actor: 'Ayu',
  },
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const actor = rng.pick(NAMES)

  if (ask === 'which-cut-line') {
    for (let attempt = 0; attempt < 120; attempt++) {
      const cand = tryCutLine(rng, actor)
      if (cand) return cand
    }
    return { ...FALLBACKS['which-cut-line'], actor }
  }

  const size = ask === 'balance-the-seesaw' ? 2 : rng.int(2, 3)
  let first: Params | null = null
  for (let attempt = 0; attempt < 120; attempt++) {
    const cand = tryPool(rng, ask, size, actor)
    if (!cand) continue
    if (!first) first = cand
    // Prefer a pool where at least two wrong options are only 1–3 away: those
    // are the ones that punish "close enough" instead of rewarding a glance.
    const near = derive(cand).options.filter((o) => o.delta !== 0 && Math.abs(o.delta) <= 3).length
    if (near >= 2) return cand
  }
  if (first) return first
  return { ...FALLBACKS[ask], actor }
}

// ── render ──────────────────────────────────────────────────────────────────

function choicesFor(d: Derived, lang: Lang): WmiChoice[] {
  return d.options.map((o) => ({ label: o.label, text: listOf(o.values, lang) }))
}

export function render(params: Params): Rendered {
  const { ask, values, target, size, actor } = params
  const d = derive(params)
  const breakdown = buildSubsetSumTargetBreakdown(params)
  const listId = listOf(values, 'id')
  const listEn = listOf(values, 'en')

  if (ask === 'which-cut-line') {
    const n = d.n
    // Running totals up to (but not past) the last possible cut.
    const runId = d.prefix.slice(1, n).join(', ')
    const rightRest = d.total - d.half
    return {
      body_en:
        `${n} number cards are lined up from left to right. They show ${listEn}. ` +
        `One cut line goes between two cards so that the left part and the right part have the same total.\n\n` +
        `Find: Which number is on the card just before the cut?`,
      body_id:
        `${n} kartu angka disusun berjajar dari kiri ke kanan. Angkanya ${listId}. ` +
        `Satu garis potong dipasang di antara dua kartu supaya jumlah bagian kiri sama dengan jumlah bagian kanan.\n\n` +
        `Cari: Angka berapa yang ada di kartu tepat sebelum garis potong?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: d.answer,
      hint_en: `Cut by TOTAL, not by how many cards. Halve the whole row first, then add from the left until you land on that half.`,
      hint_id: `Potong berdasarkan JUMLAH, bukan banyak kartu. Bagi dua dulu total seluruh kartu, lalu jumlahkan dari kiri sampai pas setengahnya.`,
      hint_steps_en: [
        `All ${n} cards together: ${values.join(' + ')} = ${d.total}. The two parts are equal, so each part must be ${d.total} ÷ 2 = ${d.half}.`,
        `Add from the left and watch the running total: ${runId}. It climbs, so it passes ${d.half} exactly once — after card ${d.cut}.`,
        `Card ${d.cut} shows ${d.answer}, so the cut goes right after ${d.answer}. Check: left = ${d.half} and right = ${rightRest}.`,
      ],
      hint_steps_id: [
        `Semua ${n} kartu dijumlah: ${values.join(' + ')} = ${d.total}. Dua bagian harus sama, jadi tiap bagian ${d.total} ÷ 2 = ${d.half}.`,
        `Jumlahkan dari kiri sambil dicatat: ${runId}. Angkanya selalu naik, jadi ${d.half} hanya lewat sekali — setelah kartu ke-${d.cut}.`,
        `Kartu ke-${d.cut} bertuliskan ${d.answer}, jadi garisnya tepat setelah ${d.answer}. Cek: kiri = ${d.half} dan kanan = ${rightRest}.`,
      ],
      breakdown,
    }
  }

  const scanId = d.options.map((o) => `${o.label} ${o.values.join(' + ')} = ${o.sum} (${deltaText(o.delta, 'id')})`).join('; ')
  const scanEn = d.options.map((o) => `${o.label} ${o.values.join(' + ')} = ${o.sum} (${deltaText(o.delta, 'en')})`).join('; ')

  if (ask === 'balance-the-seesaw') {
    const other = values.length
    return {
      body_en:
        `A balance scale is level only when both sides weigh the same. The left pan holds one block of ${target} kg. ` +
        `${actor} has ${other} other blocks weighing ${listEn} kg. ${actor} will put ${size} blocks on the right pan.\n\n` +
        `Find: Which blocks make the scale balance?`,
      body_id:
        `Timbangan hanya seimbang kalau berat kedua sisinya sama. Piring kiri berisi satu balok ${target} kg. ` +
        `${actor} punya ${other} balok lain dengan berat ${listId} kg. ${actor} akan menaruh ${size} balok di piring kanan.\n\n` +
        `Cari: Balok mana yang membuat timbangan seimbang?`,
      answer_type: 'multiple_choice',
      choices_en: choicesFor(d, 'en'),
      choices_id: choicesFor(d, 'id'),
      answer: d.answer,
      hint_en: `Weigh every option. Only ${target} kg exactly keeps the beam level — 1 kg off still tips it.`,
      hint_id: `Timbang tiap pilihan. Hanya ${target} kg persis yang membuat lengannya datar — meleset 1 kg pun tetap miring.`,
      hint_steps_en: [
        `The left pan is fixed at ${target} kg, and each option puts ${size} blocks on the right, so add up each option and compare it with ${target}.`,
        `${scanEn}.`,
        `Every other option tips the beam, so ${d.answerLabel} (${d.winner.join(' + ')} = ${target}) is the only one that balances.`,
      ],
      hint_steps_id: [
        `Piring kiri tetap ${target} kg, dan tiap pilihan menaruh ${size} balok di kanan, jadi jumlahkan tiap pilihan lalu bandingkan dengan ${target}.`,
        `${scanId}.`,
        `Pilihan lain membuat lengannya miring, jadi ${d.answerLabel} (${d.winner.join(' + ')} = ${target}) satu-satunya yang seimbang.`,
      ],
      breakdown,
    }
  }

  // which-subset
  return {
    body_en:
      `${actor} has ${values.length} number cards. They show ${listEn}. ` +
      `${actor} wants to take exactly ${size} cards that add up to ${target}.\n\n` +
      `Find: Which cards should ${actor} take?`,
    body_id:
      `${actor} punya ${values.length} kartu angka. Angkanya ${listId}. ` +
      `${actor} mau mengambil tepat ${size} kartu yang jumlahnya ${target}.\n\n` +
      `Cari: Kartu mana yang harus ${actor} ambil?`,
    answer_type: 'multiple_choice',
    choices_en: choicesFor(d, 'en'),
    choices_id: choicesFor(d, 'id'),
    answer: d.answer,
    hint_en: `Add each option up. "Nearly ${target}" is still wrong — only the exact total counts.`,
    hint_id: `Jumlahkan tiap pilihan. "Hampir ${target}" tetap salah — hanya jumlah yang persis yang benar.`,
    hint_steps_en: [
      `Every option already holds ${size} cards, so the only job left is to add each one up and compare it with ${target}.`,
      `${scanEn}.`,
      `Only ${d.answerLabel} lands on ${target} exactly (${d.winner.join(' + ')} = ${target}), so the answer is ${d.answerLabel}.`,
    ],
    hint_steps_id: [
      `Tiap pilihan sudah berisi ${size} kartu, jadi tinggal jumlahkan satu per satu lalu bandingkan dengan ${target}.`,
      `${scanId}.`,
      `Hanya ${d.answerLabel} yang pas ${target} (${d.winner.join(' + ')} = ${target}), jadi jawabannya ${d.answerLabel}.`,
    ],
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
