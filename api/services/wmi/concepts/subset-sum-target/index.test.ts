import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  FALLBACKS,
  OPTION_LABELS,
  cutChoices,
  derive,
  midCut,
  type Ask,
  type Params,
} from './index.js'

const SEEDS = 340

/**
 * Independent oracle #1 — EVERY non-empty subset of the pool, of every size,
 * that adds to `target`. Written straight from "pick the items that add to the
 * target"; it shares no code with the generator's own `subsetsHitting`. If this
 * ever returns two sets the question has two right answers and is unanswerable,
 * which is the failure this concept is most prone to.
 */
function hittingSubsets(values: readonly number[], target: number): number[][] {
  const out: number[][] = []
  const idx: number[] = []
  const walk = (i: number, total: number): void => {
    if (i === values.length) {
      if (idx.length > 0 && total === target) out.push(idx.slice())
      return
    }
    walk(i + 1, total)
    idx.push(i)
    walk(i + 1, total + values[i])
    idx.pop()
  }
  walk(0, 0)
  return out
}

/**
 * Independent oracle #2 — every cut position that splits the row into two parts
 * with the same total, found by adding both sides up from scratch rather than
 * by reading a prefix table.
 */
function balancedCuts(values: readonly number[]): number[] {
  const add = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0)
  const out: number[] = []
  for (let cut = 1; cut < values.length; cut++) {
    if (add(values.slice(0, cut)) === add(values.slice(cut))) out.push(cut)
  }
  return out
}

const total = (values: readonly number[], idx: readonly number[]): number =>
  idx.reduce((sum, i) => sum + values[i], 0)

const key = (idx: readonly number[]): string => [...idx].sort((a, b) => a - b).join('-')

/** The option text the child reads, rebuilt from the raw indices. */
function optionText(values: readonly number[], idx: readonly number[], lang: 'en' | 'id'): string {
  const parts = idx.map((i) => values[i]).sort((a, b) => a - b).map(String)
  const conj = lang === 'id' ? 'dan' : 'and'
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} ${conj} ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, ${conj} ${parts[parts.length - 1]}`
}

describe('subset-sum-target', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('every fallback pool is legal and has exactly one winning group', () => {
    for (const ask of ASKS) {
      const p = FALLBACKS[ask]
      expect(() => concept.paramsSchema.parse(p), ask).not.toThrow()
      expect(p.ask, ask).toBe(ask)
      if (ask === 'which-cut-line') {
        expect(balancedCuts(p.values), ask).toEqual([p.size])
      } else {
        expect(hittingSubsets(p.values, p.target).map(key), ask).toEqual([key(p.options[p.answerIndex])])
      }
    }
  })

  test(`${SEEDS} seeds: params parse, exactly one group hits the target, render is clean`, () => {
    const seenAsk = new Set<Ask>()
    const seenSize = new Set<number>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p: Params = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)

      const d = derive(p)
      const r = concept.render(p)
      expect(r.answer, where).toBe(d.answer)
      expect(r.breakdown, where).toBeTruthy()
      const bd = r.breakdown!
      expect(bd.answer.value, where).toBe(r.answer)

      if (p.ask === 'which-cut-line') {
        // ── the row splits into two equal halves in exactly ONE place ────────
        expect(r.answer_type, where).toBe('fill_in')
        expect(r.choices_en, where).toBeNull()
        expect(r.choices_id, where).toBeNull()
        expect(p.options, where).toEqual([])

        const cuts = balancedCuts(p.values)
        expect(cuts, where).toEqual([p.size])
        expect(p.values.length % 2, where).toBe(0)
        // The tempting "same number of cards each side" cut is never the real one.
        expect(p.size, where).not.toBe(midCut(p.values.length))
        expect(cutChoices(p.values.length), where).toContain(p.size)
        // Each half really is the stated target, and the answer is the card the cut follows.
        expect(p.values.slice(0, p.size).reduce((a, b) => a + b, 0), where).toBe(p.target)
        expect(p.values.reduce((a, b) => a + b, 0), where).toBe(2 * p.target)
        expect(r.answer, where).toBe(String(p.values[p.size - 1]))
        expect(bd.answer.form, where).toBe('number')

        // The trap is the middle-by-count cut, which is a real card and a real miss.
        expect(bd.trap, where).not.toBeNull()
        const mid = midCut(p.values.length)
        expect(bd.trap!.wrong, where).toBe(String(p.values[mid - 1]))
        expect(bd.trap!.wrong, where).not.toBe(r.answer)
      } else {
        // ── exactly one group in the WHOLE pool reaches the target ───────────
        expect(r.answer_type, where).toBe('multiple_choice')
        const hits = hittingSubsets(p.values, p.target)
        expect(hits.length, `${where}: ${hits.length} groups reach ${p.target}`).toBe(1)
        expect(key(hits[0]), where).toBe(key(p.options[p.answerIndex]))
        expect(hits[0].length, where).toBe(p.size)

        // Four distinct, same-size options; only the marked one adds up.
        expect(p.options.length, where).toBe(4)
        expect(new Set(p.options.map(key)).size, where).toBe(4)
        expect(new Set(p.values).size, where).toBe(p.values.length)
        p.options.forEach((o, i) => {
          expect(o.length, where).toBe(p.size)
          expect(o.every((j) => j >= 0 && j < p.values.length), where).toBe(true)
          if (i === p.answerIndex) expect(total(p.values, o), where).toBe(p.target)
          else expect(total(p.values, o), where).not.toBe(p.target)
        })
        expect(r.answer, where).toBe(OPTION_LABELS[p.answerIndex])
        expect(bd.answer.form, where).toBe('choice')
        if (p.ask === 'balance-the-seesaw') expect(p.size, where).toBe(2)

        // The offered text is the option's own numbers, smallest first.
        expect(r.choices_en!.map((c) => c.label), where).toEqual([...OPTION_LABELS])
        expect(r.choices_id!.map((c) => c.label), where).toEqual([...OPTION_LABELS])
        expect(r.choices_en!.map((c) => c.text), where).toEqual(
          p.options.map((o) => optionText(p.values, o, 'en')),
        )
        expect(r.choices_id!.map((c) => c.text), where).toEqual(
          p.options.map((o) => optionText(p.values, o, 'id')),
        )

        // The trap is a near miss that is genuinely wrong, and never the answer.
        expect(bd.trap, where).not.toBeNull()
        expect(d.trapOption, where).not.toBeNull()
        expect(d.trapOption!.sum, where).not.toBe(p.target)
        expect(d.trapOption!.delta, where).not.toBe(0)
        expect(bd.trap!.wrong, where).not.toBe(r.answer)
        expect(bd.trap!.wrong, where).toBe(d.trapOption!.values.join(' + '))
        // …and it is the CLOSEST wrong option, so "close enough" is what it punishes.
        for (const o of d.options) {
          if (o.label === r.answer) continue
          expect(Math.abs(d.trapOption!.delta) <= Math.abs(o.delta), where).toBe(true)
        }
      }
      seenSize.add(p.size)

      // ── nothing anywhere may leak an undefined / NaN onto a child's screen ─
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...(r.choices_en ?? []).map((c) => c.text),
        ...(r.choices_id ?? []).map((c) => c.text),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.trap!.why_en,
        bd.trap!.why_id,
        bd.strategy.name_en,
        bd.strategy.name_id,
        r.answer,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      // The steps must END on the answer, not merely mention it.
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      const lastEn = (r.hint_steps_en ?? []).at(-1) as string
      const lastId = (r.hint_steps_id ?? []).at(-1) as string
      if (p.ask === 'which-cut-line') {
        expect(lastEn, where).toContain(r.answer)
        expect(lastId, where).toContain(r.answer)
      } else {
        const sum = `${d.winner.join(' + ')} = ${p.target}`
        expect(lastEn, where).toContain(sum)
        expect(lastId, where).toContain(sum)
        expect(lastEn, where).toContain(r.answer)
        expect(lastId, where).toContain(r.answer)
      }

      // ── breakdown phrases are exact, non-overlapping spans of the body ─────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(4)
      expect(bd.highlights.some((h) => h.category === 'question'), where).toBe(true)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.strategy.conceptSlug, where).toBe('subset-sum-target')
    }

    expect([...seenAsk].sort()).toEqual([...ASKS].sort())
    // choice asks take 2 or 3 cards; the cut-line reuses `size` as the cut place.
    expect([...seenSize].every((s) => s >= 1 && s <= 6)).toBe(true)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok = FALLBACKS['which-subset']
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()

    // TWO winning pairs in the pool — 4+13 and 6+11 both make 17. Even though the
    // four OFFERED options contain only one of them, the child can see the other
    // on the table, so the pool itself must be rejected.
    expect(hittingSubsets([4, 6, 11, 13], 17)).toHaveLength(2)
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        values: [4, 6, 11, 13],
        options: [[0, 3], [0, 1], [0, 2], [2, 3]],
        answerIndex: 0,
      }),
    ).toThrow()

    // a repeated card number makes "which cards" ambiguous
    expect(() => concept.paramsSchema.parse({ ...ok, values: [4, 4, 12, 13] })).toThrow()
    // the marked option must really add up
    expect(() => concept.paramsSchema.parse({ ...ok, answerIndex: 0 })).toThrow()
    // two identical options
    expect(() =>
      concept.paramsSchema.parse({ ...ok, options: [[0, 3], [0, 3], [0, 2], [2, 3]], answerIndex: 0 }),
    ).toThrow()
    // the seesaw always puts two blocks on the right pan
    expect(() =>
      concept.paramsSchema.parse({ ...FALLBACKS['balance-the-seesaw'], size: 3 }),
    ).toThrow()

    const cut = FALLBACKS['which-cut-line']
    expect(() => concept.paramsSchema.parse(cut)).not.toThrow()
    // cutting at the middle BY COUNT is the trap, never the answer
    expect(() => concept.paramsSchema.parse({ ...cut, size: 3 })).toThrow()
    // the two halves must be equal
    expect(() => concept.paramsSchema.parse({ ...cut, values: [9, 8, 2, 3, 5, 8] })).toThrow()
    // a cut must leave cards on both sides
    expect(() => concept.paramsSchema.parse({ ...cut, size: 6 })).toThrow()
  })

  test('hand-checked rows', () => {
    // 9 | 8 | 2 3 5 7 → 17 and 17, but the middle-by-count cut gives 19 and 15.
    expect(balancedCuts([9, 8, 2, 3, 5, 7])).toEqual([2])
    const d = derive(FALLBACKS['which-cut-line'])
    expect(d.total).toBe(34)
    expect(d.half).toBe(17)
    expect(d.answer).toBe('8')
    expect(d.trapCutLeft).toBe(19)
    expect(d.trapCutRight).toBe(15)
    expect(d.trapCard).toBe(2)

    // 5 + 14 = 19 balances the pan; 7 + 14 = 21 and 9 + 14 = 23 do not.
    const seesaw = derive(FALLBACKS['balance-the-seesaw'])
    expect(seesaw.winner).toEqual([5, 14])
    expect(seesaw.answer).toBe('B')
    expect(seesaw.options.filter((o) => o.delta === 0)).toHaveLength(1)
  })
})

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text.replace(/\b(Find|Cari):\s*/g, '').replace(/\s{2,}/g, ' ').trim()
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
