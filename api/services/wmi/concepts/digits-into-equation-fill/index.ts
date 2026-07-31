import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildDigitsIntoEquationFillBreakdown } from './breakdown.js'

// `digits-into-equation-fill`. A pile of number cards and an equation with empty
// boxes: drop the cards in so the equation comes out true. Every ask below is a
// different door into the same habit — you do not guess an arrangement, you read
// ONE column (or one divisor, or one place value), and let it rule arrangements
// out until a single one is left.
//
// Mined from real WMI grade-3 papers:
//   2020-final-g3 #12      → `which-card-used`      (□ ÷ □ = □ from a long card list)
//   2024-final-g3 #16      → `largest-quotient`     (□□□ ÷ □, biggest exact answer)
//   2025-semifinal-g3 #23  → `the-result`           (fill the boxes, name the result)
//   2020-final-g3 #25      → `minimise-largest-term`(make the biggest term as small as it can be)
//
// FAIRNESS IS STRUCTURAL, NOT HOPED FOR. Every card set this file can emit comes
// out of an exhaustively enumerated catalogue that has already checked the puzzle
// has exactly one answer; `paramsSchema` re-checks the same property, so a params
// row that drifted in from anywhere else is rejected rather than served.
//
// HINT STEPS ARE COMPLETE CASE ANALYSES. Each ask's steps sweep *every* candidate
// the stated rule admits and mark each one ✓/✗ — never a truncated "…and so on"
// that lands on the answer by assertion. The one place a rule is applied without
// spelling out the arithmetic (the addition sweep) states the rule first and
// prints the exact numbers it is applied to, so the reader can redo every line.
export const ASKS = [
  'which-card-used',
  'the-result',
  'largest-quotient',
  'minimise-largest-term',
] as const
export type Ask = (typeof ASKS)[number]

export const SKELETONS = [
  'two-plus-one', // □□ + □ = □□
  'two-plus-two', // □□ + □□ = □□
  'div-triple', // □ ÷ □ = □
  'three-by-one', // □□□ ÷ □
  'three-two-digit-sum', // □□ + □□ + □□
] as const
export type Skeleton = (typeof SKELETONS)[number]

/** The empty-box picture the child fills in, shown verbatim inside the stem. */
export const FRAME: Record<Skeleton, string> = {
  'two-plus-one': '□□ + □ = □□',
  'two-plus-two': '□□ + □□ = □□',
  'div-triple': '□ ÷ □ = □',
  'three-by-one': '□□□ ÷ □',
  'three-two-digit-sum': '□□ + □□ + □□',
}

const SKELETONS_BY_ASK: Record<Ask, readonly Skeleton[]> = {
  'which-card-used': ['div-triple'],
  'the-result': ['two-plus-one', 'two-plus-two'],
  'largest-quotient': ['three-by-one'],
  'minimise-largest-term': ['three-two-digit-sum'],
}

const CARD_COUNT: Record<Skeleton, number> = {
  'two-plus-one': 5,
  'two-plus-two': 6,
  'div-triple': 8,
  'three-by-one': 4,
  'three-two-digit-sum': 6,
}

export type AdditionSkeleton = 'two-plus-one' | 'two-plus-two'

export const meta = {
  slug: 'digits-into-equation-fill',
  name_en: 'Place the digit cards into the equation',
  name_id: 'Susun kartu angka pada kotak persamaan',
  grades: [2, 3] as const,
  description_id:
    'Menaruh kartu angka ke kotak-kotak persamaan: baca satu kolom atau satu pembagi dulu, lalu coret susunan yang tidak mungkin.',
} as const

const CHECK = '✓'
const CROSS = '✗'

// ───────────────────────────── card list formatting ─────────────────────────

export function cardList(cards: readonly number[], lang: 'en' | 'id'): string {
  const join = lang === 'id' ? ' dan ' : ' and '
  if (cards.length === 1) return String(cards[0])
  return cards.slice(0, -1).join(', ') + join + cards[cards.length - 1]
}

// ───────────────────────────── addition skeletons ───────────────────────────
//
// □□ + □ = □□ and □□ + □□ = □□ share one shape once you look at them by column:
//
//   units column:  two cards p, q meet; they write down (p+q) mod 10, which must
//                  itself still be a free card; they carry c = (p+q >= 10).
//   tens column:   the cards NOT used by the units column are exactly the tens —
//                  the addends' tens plus the answer's tens — and they satisfy
//                  (sum of addend tens) + c = (answer tens).
//
// Write S for the sum of those leftover cards and e for the answer's tens. The
// addend tens add to e − c, so S = (e − c) + e = 2e − c, i.e.
//
//                            e = (S + c) / 2.
//
// That single formula decides every candidate in both skeletons: halve the
// leftover total plus the carry, and the result must land exactly on one of the
// leftover cards. It is what `additionCandidates` computes and, word for word,
// what the hint steps narrate — so the steps can never reach the right answer by
// a route that does not actually pin it.
export interface AddSolution {
  /** first addend `ab` = 10a + b */
  a: number
  b: number
  /** second addend: `cd` = 10c + d, or the bare single digit `c` when d is null */
  c: number
  d: number | null
  /** result `ef` = 10e + f */
  e: number
  f: number
  carry: 0 | 1
  result: number
}

/**
 * One choice for the units column: the two cards that meet there. Everything
 * downstream (carry, tens column, whether it survives at all) follows from it.
 */
export interface UnitsCandidate {
  p: number
  q: number
  sum: number
  /** the digit the column writes down */
  unit: number
  carry: 0 | 1
  /** `unit` is still sitting on a free card (a hard requirement) */
  unitIsFreeCard: boolean
  /** cards left over once p, q and the units card are spoken for — the tens */
  leftover: number[]
  /** total of `leftover` */
  leftoverSum: number
  /** (leftoverSum + carry) / 2 — the only value the answer's tens can take */
  halved: number | null
  solutions: AddSolution[]
}

export function additionCandidates(
  cards: readonly number[],
  skeleton: AdditionSkeleton,
): UnitsCandidate[] {
  const out: UnitsCandidate[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const p = cards[i]
      const q = cards[j]
      const sum = p + q
      const unit = sum % 10
      const carry: 0 | 1 = sum >= 10 ? 1 : 0
      const rest = cards.filter((_, k) => k !== i && k !== j)
      const ui = rest.indexOf(unit)
      const leftover = ui < 0 ? rest : rest.filter((_, k) => k !== ui)
      const leftoverSum = leftover.reduce((s, c) => s + c, 0)
      const doubled = leftoverSum + carry
      const halved = doubled % 2 === 0 ? doubled / 2 : null
      const solutions: AddSolution[] = []

      // A pair only reaches the tens column if the digit it writes down is still
      // a free card, and only survives it if (S + carry) / 2 is a leftover card.
      if (ui >= 0 && halved !== null && leftover.includes(halved)) {
        const ee = halved
        const addendTens = leftover.filter((c) => c !== ee)
        if (skeleton === 'two-plus-one') {
          const aa = addendTens[0]
          // p and q can play "units of the 2-digit number" and "the 1-digit
          // addend" either way round; both are real, both give one result.
          solutions.push({ a: aa, b: p, c: q, d: null, e: ee, f: unit, carry, result: 10 * ee + unit })
          solutions.push({ a: aa, b: q, c: p, d: null, e: ee, f: unit, carry, result: 10 * ee + unit })
        } else {
          for (const [aa, cc] of [
            [addendTens[0], addendTens[1]],
            [addendTens[1], addendTens[0]],
          ]) {
            solutions.push({ a: aa, b: p, c: cc, d: q, e: ee, f: unit, carry, result: 10 * ee + unit })
            solutions.push({ a: aa, b: q, c: cc, d: p, e: ee, f: unit, carry, result: 10 * ee + unit })
          }
        }
      }

      out.push({
        p,
        q,
        sum,
        unit,
        carry,
        unitIsFreeCard: ui >= 0,
        leftover,
        leftoverSum,
        halved,
        solutions,
      })
    }
  }
  return out
}

export function additionSolutions(
  cards: readonly number[],
  skeleton: AdditionSkeleton,
): AddSolution[] {
  return additionCandidates(cards, skeleton).flatMap((c) => c.solutions)
}

/** Every distinct value the result boxes can end up holding. Fair ⇔ length 1. */
export function additionResults(cards: readonly number[], skeleton: AdditionSkeleton): number[] {
  return [...new Set(additionSolutions(cards, skeleton).map((s) => s.result))].sort((x, y) => x - y)
}

/** The candidates that survive the units test — the ones the steps sweep. */
export function additionLiveCandidates(
  cards: readonly number[],
  skeleton: AdditionSkeleton,
): UnitsCandidate[] {
  return additionCandidates(cards, skeleton).filter((c) => c.unitIsFreeCard)
}

// ───────────────────────────── □□□ ÷ □ ──────────────────────────────────────

export interface QuotientArrangement {
  digits: [number, number, number]
  dividend: number
  divisor: number
  quotient: number
}

/** One line of the hint's exhaustive sweep: "if THIS card is the divisor…". */
export interface DivisorProbe {
  divisor: number
  others: number[]
  /** biggest dividend from `others` that divides exactly — null when none does */
  best: QuotientArrangement | null
}

const THREE_DIGIT_ORDERS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]

export function quotientArrangements(cards: readonly number[]): QuotientArrangement[] {
  const out: QuotientArrangement[] = []
  for (let i = 0; i < cards.length; i++) {
    const divisor = cards[i]
    if (divisor === 0) continue
    const others = cards.filter((_, k) => k !== i)
    for (const [x, y, z] of THREE_DIGIT_ORDERS) {
      const digits: [number, number, number] = [others[x], others[y], others[z]]
      if (digits[0] === 0) continue
      const dividend = 100 * digits[0] + 10 * digits[1] + digits[2]
      if (dividend % divisor !== 0) continue
      out.push({ digits, dividend, divisor, quotient: dividend / divisor })
    }
  }
  return out
}

/** One probe per card: the biggest exact dividend that card can divide. */
export function divisorProbes(cards: readonly number[]): DivisorProbe[] {
  const probes: DivisorProbe[] = []
  for (let i = 0; i < cards.length; i++) {
    const divisor = cards[i]
    if (divisor === 0) continue
    const others = cards.filter((_, k) => k !== i)
    let best: QuotientArrangement | null = null
    for (const a of quotientArrangements(cards)) {
      if (a.divisor !== divisor) continue
      if (!best || a.dividend > best.dividend) best = a
    }
    probes.push({ divisor, others, best })
  }
  return probes.sort((m, n) => m.divisor - n.divisor)
}

/** Biggest 3-digit number the three biggest cards can spell, over the smallest. */
export function greedyBait(cards: readonly number[]): { dividend: number; divisor: number } {
  const desc = [...cards].sort((m, n) => n - m)
  return { dividend: 100 * desc[0] + 10 * desc[1] + desc[2], divisor: desc[3] }
}

// ───────────────────────── □□ + □□ + □□ = total ─────────────────────────────

export interface TensOption {
  /** the three cards standing in the tens boxes, biggest first */
  tens: number[]
  /** the three cards standing in the units boxes, smallest first */
  units: number[]
  /** the biggest of the three 2-digit numbers this tens-set can be forced down to */
  largest: number
  /** the concrete arrangement that reaches `largest` */
  numbers: number[]
}

/**
 * A card in a tens box is worth 10, in a units box 1. So
 * `total = 10·(tens sum) + (units sum) = 9·(tens sum) + (all cards)`,
 * which pins the tens sum exactly — the search is only "which three cards add
 * to it". Inside one tens set the biggest number always carries the biggest
 * tens card (10·t₁ + u > 10·t₂ + w whenever t₁ > t₂, because 10 > w − u for
 * single digits), so the only way to shrink it is to hand it the smallest units
 * card, and no arrangement can beat 10·t₁ + u₁.
 */
export function tensOptions(cards: readonly number[], total: number): TensOption[] {
  const sigma = cards.reduce((s, c) => s + c, 0)
  if ((total - sigma) % 9 !== 0) return []
  const tensSum = (total - sigma) / 9
  const out: TensOption[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        const tens = [cards[i], cards[j], cards[k]]
        if (tens[0] + tens[1] + tens[2] !== tensSum) continue
        if (tens.some((t) => t === 0)) continue
        const units = cards.filter((_, m) => m !== i && m !== j && m !== k)
        const tensDesc = [...tens].sort((x, y) => y - x)
        const unitsAsc = [...units].sort((x, y) => x - y)
        const numbers = tensDesc.map((t, m) => 10 * t + unitsAsc[m])
        out.push({ tens: tensDesc, units: unitsAsc, largest: numbers[0], numbers })
      }
    }
  }
  return out.sort((m, n) => m.largest - n.largest)
}

export function tensSumFor(cards: readonly number[], total: number): number {
  const sigma = cards.reduce((s, c) => s + c, 0)
  return (total - sigma) / 9
}

// ───────────────────────────── □ ÷ □ = □ ────────────────────────────────────

export interface DivTriple {
  dividend: number
  divisor: number
  quotient: number
}

/** Every ordered triple of distinct cards with dividend ÷ divisor = quotient. */
export function divTriples(cards: readonly number[]): DivTriple[] {
  const out: DivTriple[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (j === i) continue
      for (let k = 0; k < cards.length; k++) {
        if (k === i || k === j) continue
        const dividend = cards[i]
        const divisor = cards[j]
        const quotient = cards[k]
        if (divisor === 0) continue
        if (dividend === divisor * quotient) out.push({ dividend, divisor, quotient })
      }
    }
  }
  return out
}

/** The set of cards that any valid triple uses. Fair ⇔ exactly one such set. */
export function divTripleUsedSets(cards: readonly number[]): number[][] {
  const seen = new Map<string, number[]>()
  for (const t of divTriples(cards)) {
    const set = [t.dividend, t.divisor, t.quotient].sort((x, y) => x - y)
    seen.set(set.join(','), set)
  }
  return [...seen.values()]
}

/**
 * The multiplication flip that makes the picker ask finitely checkable. A valid
 * □ ÷ □ = □ needs divisor × quotient = dividend with all three on cards, so the
 * two small cards multiply to a third. Any pair whose product already overshoots
 * the biggest card cannot possibly land on one, which leaves this short list —
 * and it is a COMPLETE list, so sweeping it settles the puzzle outright.
 */
export interface ProductProbe {
  x: number
  y: number
  product: number
  /** the product is itself a card — i.e. this pair solves the puzzle */
  hits: boolean
}

export function productProbes(cards: readonly number[]): ProductProbe[] {
  const asc = [...cards].sort((m, n) => m - n)
  const max = asc[asc.length - 1]
  const out: ProductProbe[] = []
  for (let i = 0; i < asc.length; i++) {
    for (let j = i + 1; j < asc.length; j++) {
      const product = asc[i] * asc[j]
      if (product > max) continue
      out.push({ x: asc[i], y: asc[j], product, hits: asc.includes(product) })
    }
  }
  return out
}

/** Card pairs that divide exactly but whose answer is NOT on a card — the bait. */
export function divNearMisses(cards: readonly number[]): DivTriple[] {
  const out: DivTriple[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (j === i) continue
      const dividend = cards[i]
      const divisor = cards[j]
      if (divisor === 0 || divisor === 1 || dividend % divisor !== 0) continue
      const quotient = dividend / divisor
      if (quotient === 1) continue
      if (cards.includes(quotient)) continue
      out.push({ dividend, divisor, quotient })
    }
  }
  return out
}

// ───────────────────────────── params ───────────────────────────────────────

const baseSchema = z.object({
  ask: z.enum(ASKS),
  skeleton: z.enum(SKELETONS),
  /** the cards, in the order they are printed in the stem */
  cards: z.array(z.number().int().min(1).max(99)).min(4).max(10),
  /** `minimise-largest-term` only: what the three 2-digit numbers must add to */
  total: z.number().int().min(20).max(300).nullable(),
  /** `which-card-used` only: the four cards offered as A–D */
  choices: z.array(z.number().int().min(2).max(99)).length(4).nullable(),
  /** `which-card-used` only: the one offered card the solution really uses */
  answerCard: z.number().int().min(2).max(99).nullable(),
})

const paramsSchema = baseSchema.superRefine((p, ctx) => {
  const fail = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

  if (!SKELETONS_BY_ASK[p.ask].includes(p.skeleton)) {
    fail('skeleton', `${p.ask} cannot be posed on the ${p.skeleton} frame`)
    return
  }
  if (p.cards.length !== CARD_COUNT[p.skeleton]) {
    fail('cards', `${p.skeleton} needs exactly ${CARD_COUNT[p.skeleton]} cards`)
    return
  }
  if (new Set(p.cards).size !== p.cards.length) {
    fail('cards', 'every card must be different')
    return
  }
  if (p.ask !== 'minimise-largest-term' && p.total !== null) {
    fail('total', 'only minimise-largest-term carries a total')
    return
  }
  if (p.ask !== 'which-card-used' && (p.choices !== null || p.answerCard !== null)) {
    fail('choices', 'only which-card-used carries offered cards')
    return
  }

  if (p.ask === 'the-result') {
    // Digit 0 is barred outright: it is the only source of leading-zero special
    // cases, and without it the "(leftover total + carry) ÷ 2" rule the hint
    // steps lean on is exactly right with no exceptions bolted on.
    if (p.cards.some((c) => c < 1 || c > 9)) {
      fail('cards', 'the addition frames use single digit cards 1…9')
      return
    }
    const winners = additionCandidates(p.cards, p.skeleton as AdditionSkeleton).filter(
      (c) => c.solutions.length > 0,
    )
    const results = [...new Set(winners.flatMap((c) => c.solutions.map((s) => s.result)))]
    if (results.length !== 1) {
      fail('cards', `these cards give ${results.length} possible results, not exactly 1`)
      return
    }
    // The hint steps end on "one units pair is left", so make that literally true.
    if (winners.length !== 1) {
      fail('cards', `${winners.length} different units columns survive, not exactly 1`)
      return
    }
    // With a carry the trap ("forgot to carry the ten") is always available and
    // always lands 10 short of a genuine 2-digit answer.
    if (winners[0].carry !== 1) {
      fail('cards', 'the surviving units column must carry, so the carry trap is real')
    }
    return
  }

  if (p.ask === 'largest-quotient') {
    if (p.cards.some((c) => c < 2 || c > 9)) {
      fail('cards', 'the quotient frame uses single digit cards 2…9')
      return
    }
    const arrangements = quotientArrangements(p.cards)
    if (arrangements.length < 2) {
      fail('cards', 'there must be at least two exact divisions so "largest" is a real choice')
      return
    }
    const top = Math.max(...arrangements.map((a) => a.quotient))
    if (arrangements.filter((a) => a.quotient === top).length !== 1) {
      fail('cards', 'the largest quotient must come from exactly one arrangement')
      return
    }
    const bait = greedyBait(p.cards)
    if (bait.dividend % bait.divisor === 0) {
      fail('cards', 'the greedy "biggest over smallest" must leave a remainder')
      return
    }
    if (Math.floor(bait.dividend / bait.divisor) === top) {
      fail('cards', 'the greedy trap must not coincide with the real answer')
    }
    return
  }

  if (p.ask === 'minimise-largest-term') {
    if (p.total === null) {
      fail('total', 'minimise-largest-term needs a total')
      return
    }
    if (p.cards.some((c) => c < 1 || c > 9)) {
      fail('cards', 'the three-term frame uses single digit cards 1…9')
      return
    }
    const options = tensOptions(p.cards, p.total)
    if (options.length < 2) {
      fail('total', 'there must be at least two tens-sets so "as small as possible" bites')
      return
    }
    const best = options[0].largest
    if (options.filter((o) => o.largest === best).length !== 1) {
      fail('total', 'the smallest possible largest term must come from exactly one tens-set')
    }
    return
  }

  // which-card-used
  if (p.choices === null || p.answerCard === null) {
    fail('choices', 'which-card-used needs four offered cards and the used one')
    return
  }
  if (p.cards.some((c) => c < 2)) {
    fail('cards', 'the division pile uses cards of 2 or more, so no card is a free factor')
    return
  }
  if (new Set(p.choices).size !== 4) {
    fail('choices', 'the four offered cards must be different')
    return
  }
  if (p.choices.some((c) => !p.cards.includes(c))) {
    fail('choices', 'every offered card must come from the card list')
    return
  }
  const used = divTripleUsedSets(p.cards)
  if (used.length !== 1) {
    fail('cards', `these cards allow ${used.length} different triples, not exactly 1`)
    return
  }
  const probes = productProbes(p.cards)
  if (probes.length < 2) {
    fail('cards', 'the multiply sweep must rule at least one pair out, not hand the answer over')
    return
  }
  if (probes.length > 10) {
    fail('cards', 'the multiply sweep must stay short enough to print in full')
    return
  }
  const inSolution = p.choices.filter((c) => used[0].includes(c))
  if (inSolution.length !== 1) {
    fail('choices', 'exactly one of the four offered cards may be part of the solution')
    return
  }
  if (inSolution[0] !== p.answerCard) {
    fail('answerCard', 'answerCard must be the one offered card the solution uses')
  }
})

export type Params = z.infer<typeof baseSchema>

// ───────────────────────────── analysis ─────────────────────────────────────

export interface Analysis {
  ask: Ask
  skeleton: Skeleton
  frame: string
  /** exactly what the child types (or the choice label for the picker ask) */
  answer: string
  /** the number behind `answer` — for the picker ask, the card itself */
  answerValue: number
  /** addition asks */
  candidates: UnitsCandidate[]
  winner: UnitsCandidate | null
  /** quotient ask */
  probes: DivisorProbe[]
  bestProbe: DivisorProbe | null
  /** minimise ask */
  options: TensOption[]
  tensSum: number
  /** picker ask */
  triple: DivTriple | null
  usedCards: number[]
  products: ProductProbe[]
  nearMisses: DivTriple[]
  choices: WmiChoice[] | null
  /** the tempting wrong number — always a real, reachable slip */
  trapValue: number
}

export function analyse(params: Params): Analysis {
  const { ask, skeleton, cards } = params
  const shell = {
    ask,
    skeleton,
    frame: FRAME[skeleton],
    candidates: [] as UnitsCandidate[],
    winner: null as UnitsCandidate | null,
    probes: [] as DivisorProbe[],
    bestProbe: null as DivisorProbe | null,
    options: [] as TensOption[],
    tensSum: 0,
    triple: null as DivTriple | null,
    usedCards: [] as number[],
    products: [] as ProductProbe[],
    nearMisses: [] as DivTriple[],
    choices: null as WmiChoice[] | null,
  }

  if (ask === 'the-result') {
    const candidates = additionCandidates(cards, skeleton as AdditionSkeleton)
    const winner = candidates.find((c) => c.solutions.length > 0) ?? null
    if (!winner) throw new Error('digits-into-equation-fill: the-result cards have no solution')
    const result = winner.solutions[0].result
    // Forgetting to carry the ten is the one real slip here, and it lands exactly
    // 10 short. The schema guarantees the surviving column carries.
    return {
      ...shell,
      candidates,
      winner,
      answer: String(result),
      answerValue: result,
      trapValue: result - 10,
    }
  }

  if (ask === 'largest-quotient') {
    const arrangements = quotientArrangements(cards)
    if (arrangements.length === 0) throw new Error('digits-into-equation-fill: no exact division')
    const top = Math.max(...arrangements.map((a) => a.quotient))
    const probes = divisorProbes(cards)
    const bestProbe = probes.find((p) => p.best !== null && p.best.quotient === top) ?? null
    if (!bestProbe) throw new Error('digits-into-equation-fill: quotient probe disagreement')
    // The bait: grab the biggest top number over the smallest card and shrug the
    // remainder off. It always overshoots, and never equals the real answer.
    const bait = greedyBait(cards)
    return {
      ...shell,
      probes,
      bestProbe,
      answer: String(top),
      answerValue: top,
      trapValue: Math.floor(bait.dividend / bait.divisor),
    }
  }

  if (ask === 'minimise-largest-term') {
    const total = params.total as number
    const options = tensOptions(cards, total)
    if (options.length === 0) throw new Error('digits-into-equation-fill: no tens-set hits the total')
    const best = options[0]
    return {
      ...shell,
      options,
      tensSum: tensSumFor(cards, total),
      answer: String(best.largest),
      answerValue: best.largest,
      // Right three tens cards, but the biggest tens card handed the biggest
      // units card instead of the smallest — the same three numbers, one of
      // them needlessly fat.
      trapValue: 10 * best.tens[0] + best.units[best.units.length - 1],
    }
  }

  // which-card-used
  const choicesRaw = params.choices as number[]
  const answerCard = params.answerCard as number
  const usedCards = divTripleUsedSets(cards)[0] ?? []
  const triple = divTriples(cards)[0] ?? null
  const products = productProbes(cards)
  const nearMisses = divNearMisses(cards)
  const choices: WmiChoice[] = choicesRaw.map((value, i) => ({
    label: String.fromCharCode(65 + i),
    text: String(value),
  }))
  const answer = choices[choicesRaw.indexOf(answerCard)].label
  const wrong = choicesRaw.filter((c) => c !== answerCard)
  // Prefer a card that really does divide by another card — it is the one that
  // looks most like an answer without being one.
  const bait = wrong.find((c) => nearMisses.some((n) => n.dividend === c))
  return {
    ...shell,
    triple,
    usedCards,
    products,
    nearMisses,
    choices,
    answer,
    answerValue: answerCard,
    trapValue: bait ?? wrong[0],
  }
}

// ───────────────────────────── generate ─────────────────────────────────────

const DIGITS_1_9 = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function combinations(pool: readonly number[], k: number): number[][] {
  if (k === 0) return [[]]
  if (pool.length < k) return []
  const [head, ...rest] = pool
  return [...combinations(rest, k - 1).map((c) => [head, ...c]), ...combinations(rest, k)]
}

// The whole space of fair card sets is tiny, so enumerate it once and let
// `generate` be a lookup. That is what makes fairness structural rather than a
// property we hope rejection sampling preserved.
let additionCatalogue: Record<AdditionSkeleton, number[][]> | null = null
function fairAdditionSets(skeleton: AdditionSkeleton): number[][] {
  if (!additionCatalogue) {
    const build = (s: AdditionSkeleton, size: number) =>
      combinations(DIGITS_1_9, size).filter((cards) => {
        const winners = additionCandidates(cards, s).filter((c) => c.solutions.length > 0)
        if (winners.length !== 1) return false
        if (winners[0].carry !== 1) return false
        return additionResults(cards, s).length === 1
      })
    additionCatalogue = {
      'two-plus-one': build('two-plus-one', 5),
      'two-plus-two': build('two-plus-two', 6),
    }
  }
  return additionCatalogue[skeleton]
}

let quotientCatalogue: number[][] | null = null
function fairQuotientSets(): number[][] {
  if (!quotientCatalogue) {
    quotientCatalogue = combinations([2, 3, 4, 5, 6, 7, 8, 9], 4).filter((cards) => {
      const arrangements = quotientArrangements(cards)
      if (arrangements.length < 2) return false
      const top = Math.max(...arrangements.map((a) => a.quotient))
      if (arrangements.filter((a) => a.quotient === top).length !== 1) return false
      // Keep only the sets where "biggest number over smallest card" fails, so
      // the child cannot stumble onto the answer without checking divisibility.
      const bait = greedyBait(cards)
      if (bait.dividend % bait.divisor === 0) return false
      return Math.floor(bait.dividend / bait.divisor) !== top
    })
  }
  return quotientCatalogue
}

let minimiseCatalogue: { cards: number[]; total: number }[] | null = null
function fairMinimiseSets(): { cards: number[]; total: number }[] {
  if (!minimiseCatalogue) {
    const out: { cards: number[]; total: number }[] = []
    for (const cards of combinations(DIGITS_1_9, 6)) {
      const sigma = cards.reduce((s, c) => s + c, 0)
      const seen = new Set<number>()
      for (const trio of combinations(cards, 3)) {
        const tensSum = trio[0] + trio[1] + trio[2]
        if (seen.has(tensSum)) continue
        seen.add(tensSum)
        const total = 9 * tensSum + sigma
        const options = tensOptions(cards, total)
        if (options.length < 2) continue
        if (options.filter((o) => o.largest === options[0].largest).length !== 1) continue
        out.push({ cards, total })
      }
    }
    minimiseCatalogue = out
  }
  return minimiseCatalogue
}

// Distractor cards for the □ ÷ □ = □ pile: single digits plus every 2-digit
// product of two single digits, so the wrong cards look every bit as promising
// as the right ones (54 ÷ 6 = 9 dies only because 9 is not on a card).
let divDistractorPool: number[] | null = null
function distractorPool(): number[] {
  if (!divDistractorPool) {
    const set = new Set<number>()
    for (let n = 2; n <= 9; n++) set.add(n)
    for (let x = 2; x <= 9; x++) {
      for (let y = 2; y <= 9; y++) {
        const v = x * y
        if (v >= 10 && v <= 99) set.add(v)
      }
    }
    for (const extra of [13, 15, 17, 19, 26, 33, 39, 51, 65, 85, 91, 95]) set.add(extra)
    divDistractorPool = [...set].sort((m, n) => m - n)
  }
  return divDistractorPool
}

/** Everything the picker ask needs of a pile, checked in one place. */
function divPileIsFair(cards: readonly number[]): boolean {
  if (cards.length !== CARD_COUNT['div-triple']) return false
  if (divTripleUsedSets(cards).length !== 1) return false
  const probes = productProbes(cards)
  // Short enough to print in full, long enough that the sweep does real work.
  if (probes.length < 4 || probes.length > 10) return false
  if (probes.filter((x) => x.hits).length !== 1) return false
  const used = divTripleUsedSets(cards)[0]
  const baitDividends = new Set(
    divNearMisses(cards)
      .map((n) => n.dividend)
      .filter((d) => !used.includes(d)),
  )
  return baitDividends.size >= 2
}

/**
 * Deterministic fallback pile, verified in index.test.ts: 2 × 7 = 14 is the only
 * pair of cards whose product is another card, and 12 and 56 are live near
 * misses (12 ÷ 2 = 6 and 56 ÷ 7 = 8, neither answer on a card).
 */
const FALLBACK_DIV_CARDS = [2, 7, 9, 12, 14, 25, 33, 56]

function buildDivPile(rng: Rng): number[] {
  const pool = distractorPool()
  for (let attempt = 0; attempt < 120; attempt++) {
    const divisor = rng.int(2, 9)
    const quotient = rng.int(2, 9)
    if (divisor === quotient) continue
    const dividend = divisor * quotient
    if (dividend < 12) continue
    const cards = [dividend, divisor, quotient]
    const wanted = [dividend, divisor, quotient].sort((m, n) => m - n).join(',')
    for (const candidate of rng.shuffle(pool)) {
      if (cards.length === CARD_COUNT['div-triple']) break
      if (cards.includes(candidate)) continue
      cards.push(candidate)
      const sets = divTripleUsedSets(cards)
      if (sets.length !== 1 || sets[0].join(',') !== wanted) cards.pop()
    }
    const sorted = [...cards].sort((m, n) => m - n)
    if (divPileIsFair(sorted)) return sorted
  }
  return [...FALLBACK_DIV_CARDS]
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)

  if (ask === 'the-result') {
    const skeleton = rng.pick(SKELETONS_BY_ASK['the-result'])
    const cards = rng.pick(fairAdditionSets(skeleton as AdditionSkeleton))
    return { ask, skeleton, cards: [...cards], total: null, choices: null, answerCard: null }
  }

  if (ask === 'largest-quotient') {
    const cards = rng.pick(fairQuotientSets())
    return {
      ask,
      skeleton: 'three-by-one',
      cards: [...cards],
      total: null,
      choices: null,
      answerCard: null,
    }
  }

  if (ask === 'minimise-largest-term') {
    const set = rng.pick(fairMinimiseSets())
    return {
      ask,
      skeleton: 'three-two-digit-sum',
      cards: [...set.cards],
      total: set.total,
      choices: null,
      answerCard: null,
    }
  }

  // which-card-used — pick the pile, then four cards to offer where exactly one
  // belongs to the solution and at least one is a live near miss.
  const cards = buildDivPile(rng)
  const used = divTripleUsedSets(cards)[0]
  const unused = cards.filter((c) => !used.includes(c))
  const missDividends = divNearMisses(cards).map((n) => n.dividend)
  const bait = unused.filter((c) => missDividends.includes(c))
  const offered = [rng.pick(used), ...(bait.length > 0 ? [rng.pick(bait)] : []), ...rng.shuffle(unused)]
  const chosen: number[] = []
  for (const c of offered) {
    if (chosen.length === 4) break
    if (!chosen.includes(c)) chosen.push(c)
  }
  const answerCard = chosen.find((c) => used.includes(c)) as number
  return {
    ask,
    skeleton: 'div-triple',
    cards,
    total: null,
    choices: rng.shuffle(chosen),
    answerCard,
  }
}

// ───────────────────────────── render ───────────────────────────────────────

/**
 * One line of the addition sweep, applying the "(leftover total + carry) ÷ 2"
 * rule to a single units pair and printing every number it uses. Nothing is
 * asserted here that the reader cannot recompute from the line itself.
 */
function additionProbeLine(c: UnitsCandidate, lang: 'en' | 'id'): string {
  const carryText =
    c.carry === 1
      ? lang === 'id'
        ? `satuan ${c.unit}, simpan 1`
        : `units ${c.unit}, carry 1`
      : lang === 'id'
        ? `satuan ${c.unit}, tanpa simpanan`
        : `units ${c.unit}, no carry`
  const leftText = c.leftover.join(' + ')
  const head = `${c.p} + ${c.q} = ${c.sum} (${carryText}) → ${leftText} = ${c.leftoverSum}`
  if (c.halved === null) {
    return lang === 'id'
      ? `${head}, (${c.leftoverSum} + ${c.carry}) ÷ 2 tidak bulat ${CROSS}`
      : `${head}, (${c.leftoverSum} + ${c.carry}) ÷ 2 is not a whole number ${CROSS}`
  }
  const verdict = c.solutions.length > 0 ? CHECK : CROSS
  const tail =
    c.solutions.length > 0
      ? lang === 'id'
        ? `ada di sisa ${verdict}`
        : `is one of them ${verdict}`
      : lang === 'id'
        ? `bukan kartu sisa ${verdict}`
        : `is not one of them ${verdict}`
  return `${head}, (${c.leftoverSum} + ${c.carry}) ÷ 2 = ${c.halved}, ${tail}`
}

function additionSteps(a: Analysis, params: Params, lang: 'en' | 'id'): string[] {
  const winner = a.winner as UnitsCandidate
  const live = a.candidates.filter((c) => c.unitIsFreeCard)
  const dead = a.candidates.filter((c) => !c.unitIsFreeCard)
  const sol = winner.solutions[0]
  const addend2 = sol.d === null ? String(sol.c) : String(10 * sol.c + sol.d)
  const sentence = `${10 * sol.a + sol.b} + ${addend2} = ${sol.result}`
  const arrangements = [
    ...new Set(
      winner.solutions.map((s) => `${10 * s.a + s.b} + ${s.d === null ? s.c : 10 * s.c + s.d}`),
    ),
  ]
  const alt = arrangements.length > 1 ? arrangements[1] : null
  const sweep = live.map((c) => additionProbeLine(c, lang)).join('; ')
  const addendTens = winner.leftover.filter((c) => c !== sol.e)
  const tensSentence = `${addendTens.join(' + ')} + 1 = ${sol.e}`
  const n = params.cards.length

  if (lang === 'id') {
    return [
      `Semua ${n} kartu masuk ke ${n} kotak pada ${a.frame}, satu kartu satu kotak. Mulai dari kolom satuan: dua kartu bertemu di situ, dan angka satuan yang mereka tulis harus jadi kartu lain yang masih bebas.`,
      `Sekarang kolom puluhan. Kartu yang tersisa persis mengisi kotak-kotak puluhan, dan puluhan penjumlah ditambah simpanan sama dengan puluhan hasil. Jadi kalau semua kartu sisa dijumlahkan, totalnya = 2 × (puluhan hasil) − simpanan. Dibalik: puluhan hasil = (total kartu sisa + simpanan) ÷ 2, dan angka itu wajib ada di antara kartu sisa.`,
      `Uji semua pasangan yang lolos kolom satuan: ${sweep}.${dead.length > 0 ? ' (Pasangan lain sudah gugur sejak awal karena angka satuannya bukan kartu yang masih bebas.)' : ''}`,
      `Cuma satu yang lolos. Puluhan hasilnya ${sol.e}, jadi puluhan penjumlah ${addendTens.join(' dan ')}: ${tensSentence} ${CHECK}. Maka ${sentence}${alt ? ` (boleh juga ${alt})` : ''} — kotak hasil berisi ${a.answer}.`,
    ]
  }
  return [
    `All ${n} cards go into the ${n} boxes of ${a.frame}, one card per box. Start at the units column: two cards meet there, and the units digit they write down must itself be a card that is still free.`,
    `Now the tens column. The leftover cards fill exactly the tens boxes, and the addend tens plus the carry equal the answer's tens. So adding all the leftover cards gives 2 × (the answer's tens) − the carry. Turned around: the answer's tens = (leftover total + carry) ÷ 2, and that number has to be one of the leftover cards.`,
    `Test every pair that got past the units column: ${sweep}.${dead.length > 0 ? ' (The other pairs never got this far — the digit they wrote down was not a free card.)' : ''}`,
    `Only one survives. The answer's tens is ${sol.e}, so the addend tens are ${addendTens.join(' and ')}: ${tensSentence} ${CHECK}. That makes ${sentence}${alt ? ` (or ${alt})` : ''} — the answer boxes hold ${a.answer}.`,
  ]
}

function quotientSteps(a: Analysis, params: Params, lang: 'en' | 'id'): string[] {
  const best = (a.bestProbe as DivisorProbe).best as QuotientArrangement
  const bait = greedyBait(params.cards)
  const remainder = bait.dividend % bait.divisor
  const sweep = a.probes
    .map((p) =>
      p.best
        ? lang === 'id'
          ? `pembagi ${p.divisor} → paling besar ${p.best.dividend} ÷ ${p.divisor} = ${p.best.quotient} ${CHECK}`
          : `divisor ${p.divisor} → biggest is ${p.best.dividend} ÷ ${p.divisor} = ${p.best.quotient} ${CHECK}`
        : lang === 'id'
          ? `pembagi ${p.divisor} → tidak ada susunan ${p.others.join('/')} yang habis dibagi ${p.divisor} ${CROSS}`
          : `divisor ${p.divisor} → no arrangement of ${p.others.join('/')} divides by ${p.divisor} ${CROSS}`,
    )
    .join('; ')

  if (lang === 'id') {
    return [
      `Godaannya: pakai bilangan atas sebesar mungkin ${bait.dividend} dengan pembagi terkecil ${bait.divisor}. Tapi ${bait.dividend} ÷ ${bait.divisor} bersisa ${remainder}, jadi susunan itu tidak sah — pembagiannya harus habis.`,
      `Cuma ada 4 kartu, jadi coba satu per satu jadi pembagi. Untuk pembagi yang sama, bilangan atas yang lebih besar selalu memberi hasil bagi yang lebih besar, jadi ambil bilangan atas terbesar yang habis dibagi: ${sweep}.`,
      `Keempat kemungkinan sudah dicoba semua, dan yang hasil baginya paling besar adalah ${best.dividend} ÷ ${best.divisor} = ${best.quotient}. Jadi hasil bagi terbesar adalah ${a.answer}.`,
    ]
  }
  return [
    `The temptation: make the top number as big as possible, ${bait.dividend}, over the smallest card ${bait.divisor}. But ${bait.dividend} ÷ ${bait.divisor} leaves ${remainder} over, so that arrangement is not allowed — the division has to come out exactly.`,
    `There are only 4 cards, so try each one as the divisor. For a fixed divisor a bigger top number always gives a bigger answer, so take the biggest top number that divides exactly: ${sweep}.`,
    `That is all four possibilities checked, and the biggest answer among them is ${best.dividend} ÷ ${best.divisor} = ${best.quotient}. So the largest quotient is ${a.answer}.`,
  ]
}

function minimiseSteps(a: Analysis, params: Params, lang: 'en' | 'id'): string[] {
  const total = params.total as number
  const sigma = params.cards.reduce((s, c) => s + c, 0)
  const options = a.options
  const winner = options[0]
  const sweep = options
    .map(
      (o) =>
        `${o.tens.join(' + ')} → ${o.numbers.join(', ')} (${o.largest})` +
        (o.largest === winner.largest ? ` ${CHECK}` : ` ${CROSS}`),
    )
    .join('; ')

  if (lang === 'id') {
    return [
      `Kartu di kotak puluhan bernilai 10 kali dirinya, di kotak satuan bernilai 1 kali. Semua kartu berjumlah ${sigma}, jadi ${total} = 10 × (jumlah kartu puluhan) + (jumlah kartu satuan) = 9 × (jumlah kartu puluhan) + ${sigma}.`,
      `Maka jumlah kartu puluhan sudah pasti: (${total} − ${sigma}) ÷ 9 = ${a.tensSum}. Tiga kartu yang berjumlah ${a.tensSum} cuma ini: ${options.map((o) => o.tens.join(' + ')).join(' dan ')}.`,
      `Di dalam satu pilihan, bilangan yang memakai kartu puluhan terbesar pasti jadi yang terbesar, jadi beri dia kartu satuan terkecil: ${sweep}. Yang paling kecil adalah ${a.answer}, contohnya ${winner.numbers.join(' + ')} = ${total}.`,
    ]
  }
  return [
    `A card in a tens box is worth 10 of itself, in a units box only 1. All the cards add to ${sigma}, so ${total} = 10 × (the tens cards added) + (the units cards added) = 9 × (the tens cards added) + ${sigma}.`,
    `That pins the tens cards down: they add to (${total} − ${sigma}) ÷ 9 = ${a.tensSum}. The only sets of three cards adding to ${a.tensSum} are ${options.map((o) => o.tens.join(' + ')).join(' and ')}.`,
    `Inside one set, the number holding the biggest tens card is always the biggest number, so hand it the smallest units card: ${sweep}. The smallest of those is ${a.answer}, for example ${winner.numbers.join(' + ')} = ${total}.`,
  ]
}

function pickerSteps(a: Analysis, params: Params, lang: 'en' | 'id'): string[] {
  const triple = a.triple as DivTriple
  const max = Math.max(...params.cards)
  const sweep = a.products
    .map((x) => `${x.x} × ${x.y} = ${x.product} ${x.hits ? CHECK : CROSS}`)
    .join('; ')
  const offered = (params.choices as number[]).join(', ')

  if (lang === 'id') {
    return [
      `Cuma 3 kartu yang dipakai, dan bentuknya besar ÷ kecil = kartu lain. Balik saja jadi perkalian: dua kartu dikalikan harus jatuh tepat di kartu ketiga.`,
      `Berarti hasil kalinya tidak boleh lebih dari kartu terbesar, ${max}. Pasangan kartu yang hasil kalinya masih ≤ ${max} cuma ini, dan tinggal dicek hasilnya ada di daftar atau tidak: ${sweep}.`,
      `Hanya ${triple.divisor} × ${triple.quotient} = ${triple.dividend} yang mendarat di kartu, jadi persamaannya ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} dan kartu yang terpakai ${a.usedCards.join(', ')}. Dari pilihan ${offered}, cuma ${a.answerValue} yang ada di situ.`,
    ]
  }
  return [
    `Only 3 cards get used, and the shape is big ÷ small = another card. Flip it into multiplication: two cards multiplied must land exactly on a third card.`,
    `So their product cannot be bigger than the biggest card, ${max}. These are the only pairs whose product is still ≤ ${max}, and all that is left is to check whether the product is on the list: ${sweep}.`,
    `Only ${triple.divisor} × ${triple.quotient} = ${triple.dividend} lands on a card, so the equation is ${triple.dividend} ÷ ${triple.divisor} = ${triple.quotient} and the cards used are ${a.usedCards.join(', ')}. Of the offered ${offered}, only ${a.answerValue} is one of them.`,
  ]
}

export function render(params: Params): Rendered {
  const a = analyse(params)
  const listEn = cardList(params.cards, 'en')
  const listId = cardList(params.cards, 'id')
  const breakdown = buildDigitsIntoEquationFillBreakdown(params)

  if (params.ask === 'the-result') {
    return {
      body_en:
        `The digit cards are ${listEn}. Put every card into one box of ${a.frame} so the equation is true, ` +
        `using each card exactly once. Find: What number ends up in the two answer boxes?`,
      body_id:
        `Kartu angkanya ${listId}. Taruh semua kartu ke kotak-kotak pada ${a.frame} supaya persamaannya benar, ` +
        `setiap kartu dipakai tepat satu kali. Cari: Berapa bilangan yang ada di dua kotak hasil?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: a.answer,
      hint_en: 'Read the units column first — the digit it writes down has to be one of the cards you have left.',
      hint_id: 'Baca kolom satuan dulu — angka satuan yang ditulis harus salah satu kartu yang masih tersisa.',
      hint_steps_en: additionSteps(a, params, 'en'),
      hint_steps_id: additionSteps(a, params, 'id'),
      breakdown,
    }
  }

  if (params.ask === 'largest-quotient') {
    return {
      body_en:
        `The digit cards are ${listEn}. Put every card into one box of ${a.frame} so the division comes out exactly, with nothing left over. ` +
        `Each card is used exactly once. Find: What is the largest quotient you can make?`,
      body_id:
        `Kartu angkanya ${listId}. Taruh semua kartu ke kotak-kotak pada ${a.frame} supaya pembagiannya habis, tanpa sisa. ` +
        `Setiap kartu dipakai tepat satu kali. Cari: Berapa hasil bagi terbesar yang bisa dibuat?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: a.answer,
      hint_en: 'Only 4 cards, so test each one as the divisor — a big top number is useless if it leaves a remainder.',
      hint_id: 'Cuma 4 kartu, jadi coba tiap kartu jadi pembagi — bilangan atas besar percuma kalau bersisa.',
      hint_steps_en: quotientSteps(a, params, 'en'),
      hint_steps_id: quotientSteps(a, params, 'id'),
      breakdown,
    }
  }

  if (params.ask === 'minimise-largest-term') {
    const total = params.total as number
    return {
      body_en:
        `The digit cards are ${listEn}. Put every card into one box of ${a.frame} so the three 2-digit numbers add up to ${total}. ` +
        `Each card is used exactly once. Find: If the largest of the three numbers is made as small as possible, what is that largest number?`,
      body_id:
        `Kartu angkanya ${listId}. Taruh semua kartu ke kotak-kotak pada ${a.frame} supaya ketiga bilangan 2-angka itu berjumlah ${total}. ` +
        `Setiap kartu dipakai tepat satu kali. Cari: Kalau bilangan terbesar di antara ketiganya dibuat sekecil mungkin, berapa bilangan terbesar itu?`,
      answer_type: 'fill_in',
      choices_en: null,
      choices_id: null,
      answer: a.answer,
      hint_en: 'A card in a tens box counts ten times. That alone tells you which three cards must sit in the tens boxes.',
      hint_id: 'Kartu di kotak puluhan bernilai sepuluh kali. Itu saja sudah menentukan tiga kartu mana yang harus jadi puluhan.',
      hint_steps_en: minimiseSteps(a, params, 'en'),
      hint_steps_id: minimiseSteps(a, params, 'id'),
      breakdown,
    }
  }

  const choices = a.choices as WmiChoice[]
  return {
    body_en:
      `The number cards are ${listEn}. Choose three cards and put one on each box of ${a.frame} so the equation is true. ` +
      `Find: Which one of these cards is used?`,
    body_id:
      `Kartu bilangannya ${listId}. Pilih tiga kartu dan taruh satu di tiap kotak pada ${a.frame} supaya persamaannya benar. ` +
      `Cari: Kartu mana yang terpakai?`,
    answer_type: 'multiple_choice',
    choices_en: choices.map((c) => ({ ...c })),
    choices_id: choices.map((c) => ({ ...c })),
    answer: a.answer,
    hint_en: 'Division backwards is multiplication: two small cards multiplied must land exactly on a big card.',
    hint_id: 'Pembagian dibalik jadi perkalian: dua kartu kecil dikalikan harus pas jatuh di kartu besar.',
    hint_steps_en: pickerSteps(a, params, 'en'),
    hint_steps_id: pickerSteps(a, params, 'id'),
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
