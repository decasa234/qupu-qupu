import type { Lang } from './makeTenSteps'

// C8 `count-numbers-from-digits`. The concept is a METHOD, so the storyboard is
// the method being carried out: lock the first digit, look at everything that
// can follow it, keep the ones that obey the rule, tally, move to the next first
// digit. Nothing is ever asserted — the running tally is built branch by branch
// in front of the child, and the final beat only adds up numbers already on
// screen. Beat 2 exists purely for the rule everyone forgets: a k-digit number
// can never start with 0, so "058" is not a 3-digit number at all.

export type CountAsk = 'how-many' | 'the-nth' | 'gap-between-nth-and-mth'
export type CountEnd = 'smallest' | 'largest'
export type CountPhase = 'setup' | 'zero' | 'branch' | 'order' | 'result'

export type CountFilter =
  | { kind: 'even' }
  | { kind: 'odd' }
  | { kind: 'div-by'; m: number }
  | { kind: 'in-range'; lo: number; hi: number }
  | { kind: 'first-bigger' }
  | { kind: 'digit-sum'; v: number }

/** Mirrors the generator's params (api/services/wmi/concepts/count-numbers-from-digits). */
export interface CountParams {
  digits: number[]
  length: number
  repeats: boolean
  filter: CountFilter
  ask: CountAsk
  from: CountEnd
  nth: number
  mth: number
}

export type ChipState = 'kept' | 'dropped' | 'answer' | 'more'

export interface CountChip {
  /** Stable identity so a chip animates from its branch row into the final list. */
  key: string
  label: string
  state: ChipState
}

export interface CountBeat {
  phase: CountPhase
  caption: string
  /** The digit sitting in the first slot on this beat; null = still empty. */
  lockedFirst: number | null
  chips: CountChip[]
  /** Illegal leading-zero arrangements, shown struck through. */
  struck: string[]
  /** Running tally chip text, already in `lang`. */
  tally: string | null
  trap: boolean
  result: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface CountStoryboard {
  ask: CountAsk
  digits: number[]
  length: number
  repeats: boolean
  firstDigits: number[]
  /** Qualifying numbers, ascending. */
  set: number[]
  /** Every k-digit arrangement, rule ignored. */
  all: number[]
  answer: string
  /** Short rule label for the chip under the pool, already in `lang`. */
  ruleLabel: string
  /** Most chips any one beat shows — lets the chip area reserve height. */
  capacity: number
  steps: CountBeat[]
  finalIndex: number
}

const MAX_CHIPS = 20

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

function readDigits(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [1, 2, 3]
  const out: number[] = []
  for (const d of raw) {
    const n = clampInt(d, 0, 9, -1)
    if (n >= 0 && !out.includes(n)) out.push(n)
  }
  if (!out.some((d) => d !== 0)) return [1, 2, 3]
  return out.sort((a, b) => a - b)
}

function readFilter(raw: unknown): CountFilter {
  const f = (raw ?? {}) as { kind?: unknown; m?: unknown; lo?: unknown; hi?: unknown; v?: unknown }
  switch (f.kind) {
    case 'odd':
      return { kind: 'odd' }
    case 'div-by':
      return { kind: 'div-by', m: clampInt(f.m, 2, 9, 3) }
    case 'in-range': {
      const lo = clampInt(f.lo, 0, 999, 10)
      const hi = clampInt(f.hi, 0, 999, 99)
      return { kind: 'in-range', lo: Math.min(lo, hi), hi: Math.max(lo, hi) }
    }
    case 'first-bigger':
      return { kind: 'first-bigger' }
    case 'digit-sum':
      return { kind: 'digit-sum', v: clampInt(f.v, 0, 27, 9) }
    default:
      return { kind: 'even' }
  }
}

/**
 * The same enumeration the generator runs, re-derived here from `params` alone:
 * every ordered filling of the k places. `allowLeadingZero` is only ever true
 * for the beat that shows WHY those arrangements do not count.
 */
function tuples(digits: number[], length: number, repeats: boolean, allowLeadingZero: boolean): number[][] {
  const out: number[][] = []
  const seen = new Set<string>()
  const current: number[] = []
  const used = digits.map(() => false)

  const walk = (): void => {
    if (current.length === length) {
      const key = current.join('')
      if (!seen.has(key)) {
        seen.add(key)
        out.push(current.slice())
      }
      return
    }
    for (let i = 0; i < digits.length; i++) {
      if (!repeats && used[i]) continue
      const d = digits[i]
      if (current.length === 0 && d === 0 && !allowLeadingZero) continue
      used[i] = true
      current.push(d)
      walk()
      current.pop()
      used[i] = false
    }
  }
  if (length > 0 && digits.length > 0) walk()
  return out
}

const numberOf = (ds: number[]): number => ds.reduce((n, d) => n * 10 + d, 0)

function passes(f: CountFilter, ds: number[], n: number): boolean {
  switch (f.kind) {
    case 'even':
      return n % 2 === 0
    case 'odd':
      return n % 2 !== 0
    case 'div-by':
      return f.m > 0 && n % f.m === 0
    case 'in-range':
      return n >= f.lo && n <= f.hi
    case 'first-bigger':
      return ds[0] > ds[ds.length - 1]
    case 'digit-sum':
      return ds.reduce((a, b) => a + b, 0) === f.v
  }
}

function ruleWords(f: CountFilter, lang: Lang): string {
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  switch (f.kind) {
    case 'even':
      return T('even', 'genap')
    case 'odd':
      return T('odd', 'ganjil')
    case 'div-by':
      return T(`divisible by ${f.m}`, `habis dibagi ${f.m}`)
    case 'in-range':
      return T(`in the range ${f.lo} to ${f.hi}`, `nilainya dari ${f.lo} sampai ${f.hi}`)
    case 'first-bigger':
      return T('bigger in front than at the back', 'angka depannya lebih besar dari angka belakangnya')
    case 'digit-sum':
      return T(`made of digits adding up to ${f.v}`, `jumlah angkanya ${f.v}`)
  }
}

function listWords(values: number[], lang: Lang): string {
  if (values.length <= 1) return values.join('')
  const head = values.slice(0, -1)
  const tail = values[values.length - 1]
  if (lang === 'id') return values.length === 2 ? `${values[0]} dan ${tail}` : `${head.join(', ')}, dan ${tail}`
  return `${head.join(', ')} and ${tail}`
}

function ordEn(n: number): string {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
}

/** Trims a long chip row down to something that still fits a phone. */
function capChips(chips: CountChip[]): CountChip[] {
  if (chips.length <= MAX_CHIPS) return chips
  return [
    ...chips.slice(0, MAX_CHIPS),
    { key: 'more', label: `+${chips.length - MAX_CHIPS}`, state: 'more' as const },
  ]
}

export function buildCountNumbersFromDigitsSteps(raw: unknown, lang: Lang): CountStoryboard {
  const p = (raw ?? {}) as Partial<CountParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const digits = readDigits(p.digits)
  const length = clampInt(p.length, 2, 3, 2)
  const repeats = p.repeats === true
  const filter = readFilter(p.filter)
  const ask: CountAsk =
    p.ask === 'the-nth' || p.ask === 'gap-between-nth-and-mth' ? p.ask : 'how-many'
  const from: CountEnd = p.from === 'largest' ? 'largest' : 'smallest'

  const legal = tuples(digits, length, repeats, false)
  const all = legal.map(numberOf).sort((a, b) => a - b)
  const set = legal
    .filter((ds) => passes(filter, ds, numberOf(ds)))
    .map(numberOf)
    .sort((a, b) => a - b)

  // Clamp the ranks to what the list can actually serve, so a stale stored row
  // can never make the storyboard read a value off the end of the list.
  const nth = clampInt(p.nth, 1, Math.max(1, set.length), 1)
  const mth = clampInt(p.mth, 1, Math.max(1, set.length - nth || 1), 1)

  const firstDigits = digits.filter((d) => d !== 0)
  const rule = ruleWords(filter, lang)
  const phantoms = tuples(digits, length, repeats, true)
    .filter((ds) => ds[0] === 0)
    .map((ds) => ds.join(''))
    .sort()

  const answer =
    ask === 'how-many'
      ? String(set.length)
      : ask === 'the-nth'
        ? String(from === 'smallest' ? set[nth - 1] : set[set.length - nth])
        : String((set[set.length - mth] ?? 0) - (set[nth - 1] ?? 0))

  const steps: CountBeat[] = []
  type Draft = Partial<CountBeat> & { phase: CountPhase; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      lockedFirst: null,
      chips: [],
      struck: [],
      tally: null,
      trap: false,
      result: false,
      reveal: null,
      hold: 2200,
      ...draft,
    })
  }

  const chipOf = (value: number, state: ChipState): CountChip => ({
    key: `n${value}`,
    label: String(value),
    state,
  })

  // ── Beat 1: the raw material and the goal. ─────────────────────────────────
  push({
    phase: 'setup',
    caption: T(
      `We may only use ${listWords(digits, lang)}${repeats ? ', and a digit may come back' : ', each digit at most once'}. We want ${length}-digit numbers that are ${rule}.`,
      `Kita cuma boleh pakai ${listWords(digits, lang)}${repeats ? ', dan satu angka boleh dipakai lagi' : ', tiap angka paling banyak sekali'}. Kita cari bilangan ${length} angka yang ${rule}.`,
    ),
    hold: 2600,
  })

  // ── Beat 2: the rule a child skips. Only when a 0 is actually on the table. ─
  if (digits.includes(0) && phantoms.length > 0) {
    const sample = phantoms[0]
    push({
      phase: 'zero',
      struck: phantoms.slice(0, 4),
      trap: true,
      caption: T(
        `Careful with the 0. "${sample}" reads as ${Number(sample)} — that is not a ${length}-digit number, so it never counts. The first place can only hold ${listWords(firstDigits, lang)}.`,
        `Hati-hati dengan 0. "${sample}" itu terbaca ${Number(sample)} — bukan bilangan ${length} angka, jadi tidak ikut dihitung. Tempat pertama hanya boleh ${listWords(firstDigits, lang)}.`,
      ),
      hold: 3200,
    })
  }

  // ── Beats 3…: one branch per allowed first digit. The tally grows here, and
  // nowhere else, so the final sum is something the child watched happen. ────
  let running = 0
  for (const d of firstDigits) {
    const kept = set.filter((n) => String(n)[0] === String(d))
    const dropped = all.filter((n) => String(n)[0] === String(d) && !kept.includes(n))
    running += kept.length
    push({
      phase: 'branch',
      lockedFirst: d,
      chips: capChips([
        ...kept.map((n) => chipOf(n, 'kept')),
        ...dropped.map((n) => chipOf(n, 'dropped')),
      ]),
      tally: T(`Kept so far: ${running}`, `Terkumpul: ${running}`),
      caption:
        kept.length === 0
          ? T(
              `Lock the first digit at ${d}. Not one of its arrangements is ${rule}, so this branch adds 0.`,
              `Kunci angka pertama di ${d}. Tidak ada satu pun susunannya yang ${rule}, jadi cabang ini menambah 0.`,
            )
          : T(
              `Lock the first digit at ${d}. Of everything that can follow it, ${kept.length} are ${rule}: ${kept.join(', ')}.`,
              `Kunci angka pertama di ${d}. Dari semua yang bisa mengikutinya, ${kept.length} yang ${rule}: ${kept.join(', ')}.`,
            ),
      hold: kept.length === 0 ? 2200 : 2600,
    })
  }

  const allKept = capChips(set.map((n) => chipOf(n, 'kept')))

  if (ask === 'how-many') {
    const sum = firstDigits.map((d) => set.filter((n) => String(n)[0] === String(d)).length).join(' + ')
    push({
      phase: 'result',
      chips: allKept,
      tally: T(`Total: ${answer}`, `Total: ${answer}`),
      result: true,
      reveal: answer,
      caption: T(
        `Every branch is counted, so add them: ${sum} = ${answer}. There are ${answer} such numbers.`,
        `Semua cabang sudah dihitung, tinggal dijumlahkan: ${sum} = ${answer}. Jadi ada ${answer} bilangan.`,
      ),
      hold: 0,
    })
    return finish()
  }

  // ── The two "read the list" asks get the sorted list first, then the pick. ──
  push({
    phase: 'order',
    chips: allKept,
    caption: T(
      `Branch by branch, the ${set.length} numbers came out already in order: ${set.join(', ')}.`,
      `Karena dikerjakan cabang demi cabang, ${set.length} bilangan ini sudah urut: ${set.join(', ')}.`,
    ),
    hold: 2800,
  })

  if (ask === 'the-nth') {
    const ordered = from === 'smallest' ? set : [...set].reverse()
    const walk = ordered
      .slice(0, nth)
      .map((v, i) => `${i + 1}) ${v}`)
      .join(', ')
    const target = Number(answer)
    push({
      phase: 'result',
      chips: capChips(set.map((n) => chipOf(n, n === target ? 'answer' : 'kept'))),
      result: true,
      reveal: answer,
      caption: T(
        `Count in from the ${from}: ${walk} — so the ${from === 'smallest' ? (nth === 1 ? 'smallest' : `${ordEn(nth)} smallest`) : nth === 1 ? 'largest' : `${ordEn(nth)} largest`} is ${answer}.`,
        `Hitung dari yang ${from === 'smallest' ? 'terkecil' : 'terbesar'}: ${walk} — jadi bilangan ${from === 'smallest' ? 'terkecil' : 'terbesar'}${nth === 1 ? '' : ` ke-${nth}`} adalah ${answer}.`,
      ),
      hold: 0,
    })
    return finish()
  }

  const big = set[set.length - mth]
  const small = set[nth - 1]
  push({
    phase: 'result',
    chips: capChips(set.map((n) => chipOf(n, n === big || n === small ? 'answer' : 'kept'))),
    result: true,
    reveal: answer,
    caption: T(
      `The ${mth === 1 ? 'largest' : `${ordEn(mth)} largest`} is ${big} and the ${nth === 1 ? 'smallest' : `${ordEn(nth)} smallest`} is ${small}, so ${big} − ${small} = ${answer}.`,
      `Bilangan terbesar${mth === 1 ? '' : ` ke-${mth}`} adalah ${big} dan bilangan terkecil${nth === 1 ? '' : ` ke-${nth}`} adalah ${small}, jadi ${big} − ${small} = ${answer}.`,
    ),
    hold: 0,
  })
  return finish()

  function finish(): CountStoryboard {
    return {
      ask,
      digits,
      length,
      repeats,
      firstDigits,
      set,
      all,
      answer,
      ruleLabel: rule,
      capacity: steps.reduce((m, s) => Math.max(m, s.chips.length), 1),
      steps,
      finalIndex: steps.length - 1,
    }
  }
}
