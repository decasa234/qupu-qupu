// Level ladder for comparison-chain-solve. Same param schema; every rung builds
// the chain FORWARD with the concept's own `applyLink` / `chainValues`, so every
// count is a whole number inside 2…120 exactly as the schema demands, and only
// offers an ask the chain can actually support (a `difference` needs two children
// two hops apart holding different counts, a `rank` needs a strict winner).
// Difficulty climbs by how much walking the chain costs:
//   L1: 3 children, every link "more" — two additions, forward, ask a count
//   L2: 3 children, "more"/"fewer" — a link can now shrink the pile
//   L3: 3 children, at least one "× times" link — multiplication enters
//   L4: 4 children, "× times" and "× times, plus" — three hops, longest arithmetic
//   L5: 4 children, the stated count is at the END — every hop must be UNDONE
//       (a "× times" link becomes a division), which no forward rung asks for
import { RANK_MODES, applyLink, chainValues, uniqueExtreme } from './index.js'
import type { Ask, ChainLink, LinkKind, Params } from './index.js'
import type { Rng } from '../types.js'

/** Mirrors the concept's own window: nobody holds fewer than 2 or more than 120. */
const MIN_COUNT = 2
const MAX_COUNT = 120

const NAMES = ['Ani', 'Budi', 'Citra', 'Dimas', 'Eka', 'Fitri', 'Galih', 'Hana', 'Intan', 'Joko'] as const

const ITEMS = [
  { item_en: 'marbles', item_one_en: 'marble', item_id: 'kelereng' },
  { item_en: 'stickers', item_one_en: 'sticker', item_id: 'stiker' },
  { item_en: 'candies', item_one_en: 'candy', item_id: 'permen' },
  { item_en: 'pencils', item_one_en: 'pencil', item_id: 'pensil' },
  { item_en: 'story books', item_one_en: 'story book', item_id: 'buku cerita' },
  { item_en: 'balloons', item_one_en: 'balloon', item_id: 'balon' },
] as const

interface Spec {
  n: 3 | 4
  kinds: readonly LinkKind[]
  /** Force at least one multiplicative link, so the rung really is a × rung. */
  needsTimes: boolean
  /** True = the stated count sits at the END and the child rewinds every hop. */
  backward: boolean
  asks: readonly Ask[]
  startLo: number
  startHi: number
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { n: 3, kinds: ['more'], needsTimes: false, backward: false, asks: ['value'], startLo: 3, startHi: 9 },
  2: { n: 3, kinds: ['more', 'fewer'], needsTimes: false, backward: false, asks: ['value', 'total'], startLo: 6, startHi: 14 },
  3: { n: 3, kinds: ['more', 'fewer', 'times'], needsTimes: true, backward: false, asks: ['value', 'total', 'difference'], startLo: 3, startHi: 12 },
  4: { n: 4, kinds: ['more', 'fewer', 'times', 'times-plus'], needsTimes: true, backward: false, asks: ['total', 'difference', 'rank'], startLo: 3, startHi: 10 },
  // A backwards walk must never need "undo × then undo +", so no 'times-plus'.
  5: { n: 4, kinds: ['more', 'fewer', 'times'], needsTimes: true, backward: true, asks: ['value', 'total', 'difference', 'rank'], startLo: 3, startHi: 9 },
}

/** One hop that keeps the running count inside the window, or null if none found. */
function drawLink(rng: Rng, prev: number, kinds: readonly LinkKind[]): ChainLink | null {
  for (let attempt = 0; attempt < 24; attempt++) {
    const kind = rng.pick(kinds)
    const m = rng.int(2, 3)
    const k = kind === 'times-plus' ? rng.int(1, 9) : rng.int(2, 12)
    const next = applyLink(prev, { kind, k, m })
    if (next >= MIN_COUNT && next <= MAX_COUNT) return { kind, k, m }
  }
  return null
}

/** A chain built forward, so every count is whole and inside the window. */
function buildChain(rng: Rng, spec: Spec): { start: number; links: ChainLink[] } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const start = rng.int(spec.startLo, spec.startHi)
    const links: ChainLink[] = []
    let prev = start
    let broke = false
    for (let i = 0; i < spec.n - 1; i++) {
      const link = drawLink(rng, prev, spec.kinds)
      if (!link) {
        broke = true
        break
      }
      links.push(link)
      prev = applyLink(prev, link)
    }
    if (broke) continue
    if (spec.needsTimes && !links.some((l) => l.kind === 'times' || l.kind === 'times-plus')) continue
    return { start, links }
  }
  // Always legal from 3: doubling three times tops out at 24, adding 2 at 9.
  const kind: LinkKind = spec.needsTimes ? 'times' : 'more'
  return { start: 3, links: Array.from({ length: spec.n - 1 }, () => ({ kind, k: 2, m: 2 })) }
}

export function comparisonChainSolveLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  const { start, links } = buildChain(rng, spec)
  const names = rng.shuffle(NAMES).slice(0, spec.n)
  const item = rng.pick(ITEMS)
  const values = chainValues({ start, links })
  const n = spec.n
  const givenIndex = spec.backward ? n - 1 : 0

  // Two children at least two hops apart holding different counts — the only
  // pairs a 'difference' ask may use.
  const pairs: Array<readonly [number, number]> = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 2; b < n; b++) if (values[a] !== values[b]) pairs.push([a, b] as const)
  }
  const modes = RANK_MODES.filter((mode) => uniqueExtreme(values, mode) !== null)

  const asks = spec.asks.filter((ask) =>
    ask === 'difference' ? pairs.length > 0 : ask === 'rank' ? modes.length > 0 : true,
  )
  const ask: Ask = asks.length > 0 ? rng.pick(asks) : 'total'
  const others = names.map((_, i) => i).filter((i) => i !== givenIndex)
  const [cmpA, cmpB] = pairs.length > 0 ? rng.pick(pairs) : ([0, n - 1] as const)

  return {
    ask,
    names,
    start,
    links,
    givenIndex,
    // L1 asks for the child at the far end, so the last hop IS the answer.
    targetIndex: level === 1 ? n - 1 : rng.pick(others),
    cmpA,
    cmpB,
    rankMode: modes.length > 0 ? rng.pick(modes) : 'most',
    ...item,
  }
}
