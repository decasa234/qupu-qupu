import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  analyse,
  additionCandidates,
  divNearMisses,
  divTripleUsedSets,
  productProbes,
  type Params,
} from './index.js'

const SEEDS = 340

// ── Independent oracles ──────────────────────────────────────────────────────
//
// Nothing below reuses the generator's column reasoning. Every puzzle is re-
// solved by shoving the cards into the boxes every possible way and reading the
// equation, which is literally what the question asks a child to imagine doing.

function permutations(items: readonly number[]): number[][] {
  if (items.length <= 1) return [[...items]]
  const out: number[][] = []
  for (let i = 0; i < items.length; i++) {
    const rest = items.filter((_, k) => k !== i)
    for (const tail of permutations(rest)) out.push([items[i], ...tail])
  }
  return out
}

/** □□ + □ = □□ : every filling that reads as a true sum, by its result. */
function bruteTwoPlusOne(cards: readonly number[]): number[] {
  const results: number[] = []
  for (const [a, b, c, e, f] of permutations(cards)) {
    if (a === 0 || e === 0) continue
    if (10 * a + b + c === 10 * e + f) results.push(10 * e + f)
  }
  return [...new Set(results)].sort((x, y) => x - y)
}

/** □□ + □□ = □□ : same, with a two-digit second addend. */
function bruteTwoPlusTwo(cards: readonly number[]): number[] {
  const results: number[] = []
  for (const [a, b, c, d, e, f] of permutations(cards)) {
    if (a === 0 || c === 0 || e === 0) continue
    if (10 * a + b + (10 * c + d) === 10 * e + f) results.push(10 * e + f)
  }
  return [...new Set(results)].sort((x, y) => x - y)
}

interface BruteQuotient {
  dividend: number
  divisor: number
  quotient: number
}

/** □□□ ÷ □ : every filling that divides exactly. */
function bruteQuotients(cards: readonly number[]): BruteQuotient[] {
  const out: BruteQuotient[] = []
  for (const [x, y, z, v] of permutations(cards)) {
    if (x === 0 || v === 0) continue
    const dividend = 100 * x + 10 * y + z
    if (dividend % v !== 0) continue
    out.push({ dividend, divisor: v, quotient: dividend / v })
  }
  return out
}

/** □□ + □□ + □□ = total : the biggest term of every filling that hits `total`. */
function bruteThreeTermLargest(cards: readonly number[], total: number): number[] {
  const out: number[] = []
  for (const [a, b, c, d, e, f] of permutations(cards)) {
    if (a === 0 || c === 0 || e === 0) continue
    const n1 = 10 * a + b
    const n2 = 10 * c + d
    const n3 = 10 * e + f
    if (n1 + n2 + n3 !== total) continue
    out.push(Math.max(n1, n2, n3))
  }
  return [...new Set(out)].sort((x, y) => x - y)
}

/** □ ÷ □ = □ : every set of three cards that can fill the three boxes truly. */
function bruteDivSets(cards: readonly number[]): number[][] {
  const seen = new Map<string, number[]>()
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (j === i) continue
      for (let k = 0; k < cards.length; k++) {
        if (k === i || k === j) continue
        if (cards[j] === 0) continue
        if (cards[i] !== cards[j] * cards[k]) continue
        const set = [cards[i], cards[j], cards[k]].sort((x, y) => x - y)
        seen.set(set.join(','), set)
      }
    }
  }
  return [...seen.values()]
}

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text
    .replace(/\b(Find|Cari):\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function expectNoOverlap(text: string, phrases: string[], where: string): void {
  const spans = phrases.map((phrase) => {
    const at = text.indexOf(phrase)
    return { phrase, at, end: at + phrase.length }
  })
  spans.sort((a, b) => a.at - b.at)
  for (let i = 1; i < spans.length; i++) {
    expect(
      spans[i].at >= spans[i - 1].end,
      `${where}: "${spans[i - 1].phrase}" overlaps "${spans[i].phrase}"`,
    ).toBe(true)
  }
}

const count = (text: string, mark: string) => text.split(mark).length - 1

describe('digits-into-equation-fill', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the fallback division pile is a real, unique, baited puzzle', () => {
    // Reached only if 120 randomised builds all miss, so it has to stand alone.
    const cards = [2, 7, 9, 12, 14, 25, 33, 56]
    expect(bruteDivSets(cards)).toEqual([[2, 7, 14]])
    const probes = productProbes(cards)
    expect(probes.filter((p) => p.hits).map((p) => `${p.x}x${p.y}`)).toEqual(['2x7'])
    expect(probes.length).toBeGreaterThanOrEqual(4)
    expect(probes.length).toBeLessThanOrEqual(10)
    const baits = new Set(
      divNearMisses(cards)
        .map((n) => n.dividend)
        .filter((d) => ![2, 7, 14].includes(d)),
    )
    expect(baits.size).toBeGreaterThanOrEqual(2)
  })

  test('hand-checked puzzles', () => {
    // □□ + □ = □□ with 1,2,3,4,7 — only 4+7 carries into a workable tens column.
    expect(bruteTwoPlusOne([1, 2, 3, 4, 7])).toEqual([31])
    const live = additionCandidates([1, 2, 3, 4, 7], 'two-plus-one').filter((c) => c.unitIsFreeCard)
    expect(live.filter((c) => c.solutions.length > 0).map((c) => [c.p, c.q])).toEqual([[4, 7]])

    // □□ + □□ = □□ with 1,2,3,4,6,9 — the only true sum reads 62.
    expect(bruteTwoPlusTwo([1, 2, 3, 4, 6, 9])).toEqual([62])

    // □□□ ÷ □ with 2,5,7,9 — 975 ÷ 2 is the greedy bait and is not even legal.
    const qs = bruteQuotients([2, 5, 7, 9])
    expect(Math.max(...qs.map((q) => q.quotient))).toBe(136)
    expect(qs.filter((q) => q.quotient === 136)).toEqual([{ dividend: 952, divisor: 7, quotient: 136 }])
  })

  test(`${SEEDS} seeds: exactly one answer, proved by brute force`, () => {
    const seenAsk = new Set<string>()
    const seenSkeleton = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p: Params = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenSkeleton.add(p.skeleton)

      expect(new Set(p.cards).size, where).toBe(p.cards.length)
      const a = analyse(p)
      const r = concept.render(p)
      expect(r.answer, where).toBe(a.answer)

      // ── The uniqueness proof, one independent brute force per ask ──────────
      if (p.ask === 'the-result') {
        const results =
          p.skeleton === 'two-plus-one' ? bruteTwoPlusOne(p.cards) : bruteTwoPlusTwo(p.cards)
        expect(results, `${where}: the answer boxes must be forced`).toHaveLength(1)
        expect(String(results[0]), where).toBe(a.answer)
        expect(r.answer_type, where).toBe('fill_in')

        // The steps sweep every pair that survived the units test, and mark
        // exactly one of them ✓ — no truncation, no assertion.
        const liveCount = additionCandidates(p.cards, p.skeleton as 'two-plus-one').filter(
          (c) => c.unitIsFreeCard,
        ).length
        for (const steps of [r.hint_steps_en ?? [], r.hint_steps_id ?? []]) {
          expect(steps.length, where).toBe(4)
          expect(count(steps[2], '✓') + count(steps[2], '✗'), where).toBe(liveCount)
          expect(count(steps[2], '✓'), where).toBe(1)
        }
      } else if (p.ask === 'largest-quotient') {
        const qs = bruteQuotients(p.cards)
        expect(qs.length, where).toBeGreaterThanOrEqual(2)
        const top = Math.max(...qs.map((q) => q.quotient))
        expect(qs.filter((q) => q.quotient === top), `${where}: one top arrangement`).toHaveLength(1)
        expect(String(top), where).toBe(a.answer)
        // The greedy bait really is illegal, so step 1 is telling the truth.
        const desc = [...p.cards].sort((x, y) => y - x)
        const greedy = 100 * desc[0] + 10 * desc[1] + desc[2]
        expect(greedy % desc[3], where).not.toBe(0)
        expect(Math.floor(greedy / desc[3]), where).not.toBe(top)
        // The sweep covers all four cards as divisor.
        for (const steps of [r.hint_steps_en ?? [], r.hint_steps_id ?? []]) {
          expect(steps.length, where).toBe(3)
          expect(count(steps[1], '✓') + count(steps[1], '✗'), where).toBe(4)
        }
      } else if (p.ask === 'minimise-largest-term') {
        const total = p.total as number
        const larges = bruteThreeTermLargest(p.cards, total)
        expect(larges.length, where).toBeGreaterThanOrEqual(2)
        expect(String(larges[0]), `${where}: smallest reachable largest term`).toBe(a.answer)
        // The tens-set that reaches it must be the only one, or "as small as
        // possible" would have two different right pictures.
        expect(
          a.options.filter((o) => o.largest === a.options[0].largest),
          where,
        ).toHaveLength(1)
        // Every option is swept and exactly one wins.
        for (const steps of [r.hint_steps_en ?? [], r.hint_steps_id ?? []]) {
          expect(steps.length, where).toBe(3)
          expect(count(steps[2], '✓') + count(steps[2], '✗'), where).toBe(a.options.length)
          expect(count(steps[2], '✓'), where).toBe(1)
        }
      } else {
        const sets = bruteDivSets(p.cards)
        expect(sets, `${where}: exactly one triple may exist`).toHaveLength(1)
        expect(sets[0], where).toEqual(a.usedCards)
        expect(divTripleUsedSets(p.cards), where).toEqual(sets)
        const offered = p.choices as number[]
        const inSolution = offered.filter((c) => sets[0].includes(c))
        expect(inSolution, `${where}: exactly one offered card is used`).toHaveLength(1)
        expect(inSolution[0], where).toBe(p.answerCard)
        expect(r.answer_type, where).toBe('multiple_choice')
        expect((r.choices_en ?? []).map((c) => c.label), where).toEqual(['A', 'B', 'C', 'D'])
        expect((r.choices_en ?? []).find((c) => c.label === r.answer)?.text, where).toBe(
          String(p.answerCard),
        )
        // The multiply sweep is exhaustive: any pair whose product could be a
        // card is listed, and exactly one of them hits.
        const probes = productProbes(p.cards)
        expect(probes.filter((x) => x.hits), where).toHaveLength(1)
        for (const steps of [r.hint_steps_en ?? [], r.hint_steps_id ?? []]) {
          expect(steps.length, where).toBe(3)
          expect(count(steps[1], '✓') + count(steps[1], '✗'), where).toBe(probes.length)
          expect(count(steps[1], '✓'), where).toBe(1)
        }
      }

      // ── The steps must LAND on the answer, in both languages ───────────────
      const stepsEn = r.hint_steps_en ?? []
      const stepsId = r.hint_steps_id ?? []
      expect(stepsEn.length, where).toBe(stepsId.length)
      const tail = p.ask === 'which-card-used' ? String(a.answerValue) : a.answer
      expect(stepsEn.at(-1) as string, where).toContain(tail)
      expect(stepsId.at(-1) as string, where).toContain(tail)

      // ── Nothing may leak a hole onto a child's screen ──────────────────────
      const bd = r.breakdown!
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...stepsEn,
        ...stepsId,
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.trap!.why_en,
        bd.trap!.why_id,
        bd.strategy.name_en,
        bd.strategy.name_id,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object|Infinity/)

      // ── Breakdown contract ────────────────────────────────────────────────
      const displayEn = stripLabels(r.body_en)
      const displayId = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(false)
      expect(bd.highlights.length, where).toBe(5)
      expect(bd.highlights.map((h) => h.category), where).toContain('question')
      for (const h of bd.highlights) {
        expect(displayEn, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(displayId, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(displayEn, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(displayId, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.answer.value, where).toBe(a.answer)
      expect(bd.answer.form, where).toBe(p.ask === 'which-card-used' ? 'choice' : 'number')
      // The trap must be a genuinely tempting WRONG answer, never the right one.
      expect(bd.trap!.wrong, where).toBe(String(a.trapValue))
      expect(bd.trap!.wrong, where).not.toBe(
        p.ask === 'which-card-used' ? String(a.answerValue) : a.answer,
      )
      expect(bd.strategy.conceptSlug, where).toBe('digits-into-equation-fill')
    }

    expect([...seenAsk].sort()).toEqual([
      'largest-quotient',
      'minimise-largest-term',
      'the-result',
      'which-card-used',
    ])
    expect([...seenSkeleton].sort()).toEqual([
      'div-triple',
      'three-by-one',
      'three-two-digit-sum',
      'two-plus-one',
      'two-plus-two',
    ])
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      ask: 'the-result',
      skeleton: 'two-plus-one',
      cards: [1, 2, 3, 4, 7],
      total: null,
      choices: null,
      answerCard: null,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // an ask on a frame it cannot be posed on
    expect(() => concept.paramsSchema.parse({ ...ok, skeleton: 'div-triple' })).toThrow()
    // wrong number of cards for the frame
    expect(() => concept.paramsSchema.parse({ ...ok, cards: [1, 2, 3, 4] })).toThrow()
    // repeated card
    expect(() => concept.paramsSchema.parse({ ...ok, cards: [1, 2, 3, 4, 4] })).toThrow()
    // a 0 card, which is where every leading-zero special case comes from
    expect(() => concept.paramsSchema.parse({ ...ok, cards: [0, 2, 3, 4, 7] })).toThrow()
    // TWO possible results: 1,2,3,4,5,6 admits several true sums, so it is unfair
    expect(() =>
      concept.paramsSchema.parse({ ...ok, skeleton: 'two-plus-two', cards: [1, 2, 3, 4, 5, 6] }),
    ).toThrow()
    // stray payload on the wrong ask
    expect(() => concept.paramsSchema.parse({ ...ok, total: 100 })).toThrow()

    const quotient: Params = {
      ask: 'largest-quotient',
      skeleton: 'three-by-one',
      cards: [2, 5, 7, 9],
      total: null,
      choices: null,
      answerCard: null,
    }
    expect(() => concept.paramsSchema.parse(quotient)).not.toThrow()
    // 2,4,6,8: 864 ÷ 2 is exact, so the greedy grab is already the answer
    expect(() => concept.paramsSchema.parse({ ...quotient, cards: [2, 4, 6, 8] })).toThrow()

    const minimise: Params = {
      ask: 'minimise-largest-term',
      skeleton: 'three-two-digit-sum',
      cards: [1, 2, 3, 4, 5, 6],
      total: 102,
      choices: null,
      answerCard: null,
    }
    expect(() => concept.paramsSchema.parse(minimise)).not.toThrow()
    // a total no tens-set can reach
    expect(() => concept.paramsSchema.parse({ ...minimise, total: 100 })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...minimise, total: null })).toThrow()

    const picker: Params = {
      ask: 'which-card-used',
      skeleton: 'div-triple',
      cards: [2, 7, 9, 12, 14, 25, 33, 56],
      total: null,
      choices: [14, 9, 25, 56],
      answerCard: 14,
    }
    expect(() => concept.paramsSchema.parse(picker)).not.toThrow()
    // two offered cards inside the solution
    expect(() => concept.paramsSchema.parse({ ...picker, choices: [14, 2, 25, 56] })).toThrow()
    // answerCard that is not the offered card the solution uses
    expect(() => concept.paramsSchema.parse({ ...picker, answerCard: 25 })).toThrow()
    // an offered card that is not even on the table
    expect(() => concept.paramsSchema.parse({ ...picker, choices: [14, 9, 25, 99] })).toThrow()
  })

  test('the rendered bodies show the frame the child has to fill', () => {
    const p: Params = {
      ask: 'minimise-largest-term',
      skeleton: 'three-two-digit-sum',
      cards: [1, 2, 3, 4, 5, 6],
      total: 102,
      choices: null,
      answerCard: null,
    }
    const r = concept.render(p)
    expect(r.body_en).toContain('□□ + □□ + □□')
    expect(r.body_id).toContain('□□ + □□ + □□')
    expect(r.body_en).toContain('add up to 102')
    expect(r.body_id).toContain('berjumlah 102')
    // 102 = 9 × T + 21 → T = 9. Tens sets summing to 9: {1,2,6},{1,3,5},{2,3,4}.
    // Give each set's biggest tens card the smallest units card: 63, 52, 41.
    // 41 wins outright, e.g. 41 + 35 + 26 = 102.
    expect(r.answer).toBe('41')
    expect(bruteThreeTermLargest([1, 2, 3, 4, 5, 6], 102)[0]).toBe(41)
  })
})
