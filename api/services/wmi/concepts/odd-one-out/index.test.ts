import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { LABELS, SHAPES, itemText, type Params } from './index.js'

const SEEDS = 320

/**
 * INDEPENDENT ORACLE — written from the definition of the puzzle, not from the
 * generator's code. Where `singledOut` groups the four options by a labelling
 * function and looks for a group of three, this asks the question the other way
 * round, once per option: "is there a property the OTHER THREE all have and this
 * one lacks (or the other way round)?" Same promise, different shape of code, so
 * a bug in one is unlikely to be mirrored in the other.
 *
 * A set that hands back two indices is the classic defect this concept exists to
 * avoid: two children reason correctly, reach different options, and one is
 * marked wrong.
 */
function arguableOut(domain: string, items: string[]): number[] {
  // Sorting rules: "three of them are in class C and I am not". Every class of
  // every rule is listed, so a group of three is caught whichever class it sits
  // in. The reverse ("only I am in class C") is NOT an argument here — the other
  // three could each be in three different classes and share nothing at all.
  const classProps: ((item: string) => boolean)[] = []
  // Yes/no rules, where "not it" is itself a group a child would name.
  const binaryProps: ((item: string) => boolean)[] = []

  if (domain === 'number-sequence') {
    const n = (it: string) => Number(it)
    for (let k = 2; k <= 12; k++) {
      for (let r = 0; r < k; r++) classProps.push((it) => n(it) % k === r)
    }
    for (let d = 1; d <= 2; d++) classProps.push((it) => it.length === d)
    for (let d = 0; d <= 9; d++) classProps.push((it) => n(it) % 10 === d)
    for (let d = 0; d <= 9; d++) classProps.push((it) => Math.floor(n(it) / 10) % 10 === d)
    for (let s = 1; s <= 18; s++) {
      classProps.push((it) => it.split('').reduce((acc, c) => acc + Number(c), 0) === s)
    }
    binaryProps.push((it) => Number.isInteger(Math.sqrt(n(it))))
    binaryProps.push((it) => Math.round(Math.cbrt(n(it))) ** 3 === n(it))
    binaryProps.push((it) => (n(it) & (n(it) - 1)) === 0)
    binaryProps.push((it) => new Set(it.split('')).size === 1)
  } else {
    const at = (it: string) => SHAPES.find((s) => s.key === it)
    for (const sides of [0, 3, 4, 5, 6]) classProps.push((it) => at(it)?.sides === sides)
    for (const eq of ['yes', 'no', 'varies', 'none']) {
      classProps.push((it) => at(it)?.equalSides === eq)
    }
    for (const ra of ['four', 'none', 'varies']) classProps.push((it) => at(it)?.rightAngles === ra)
    for (const s of SHAPES) {
      const idWord = s.id.split(' ')[0]
      const enWord = s.en.split(' ')[0]
      classProps.push((it) => (at(it)?.id ?? '').split(' ')[0] === idWord)
      classProps.push((it) => (at(it)?.en ?? '').split(' ')[0] === enWord)
    }
    binaryProps.push((it) => at(it)?.curved === true)
  }

  const out: number[] = []
  for (let i = 0; i < 4; i++) {
    const rest = items.filter((_, j) => j !== i)
    const mine = items[i]
    const beaten =
      classProps.some((p) => rest.every(p) && !p(mine)) ||
      binaryProps.some((p) => (rest.every(p) && !p(mine)) || (rest.every((it) => !p(it)) && p(mine)))
    // "The other three count up in equal jumps" — a property of the trio rather
    // than of any single option, so it cannot be written as a predicate above.
    const jumps = (() => {
      if (domain !== 'number-sequence') return false
      const sorted = rest.map(Number).sort((a, b) => a - b)
      const gap = sorted[1] - sorted[0]
      return gap > 0 && sorted[2] - sorted[1] === gap
    })()
    if (beaten || jumps) out.push(i)
  }
  return out
}

/** Independently re-derived obedience: does this one option keep the stated rule? */
function keepsRule(p: Params, item: string): boolean {
  const n = Number(item)
  const shape = SHAPES.find((s) => s.key === item)
  switch (p.rule.kind) {
    case 'all-even':
      return n % 2 === 0
    case 'all-odd':
      return n % 2 !== 0
    case 'multiples':
      return n % p.rule.k === 0
    case 'squares':
      return Number.isInteger(Math.sqrt(n))
    case 'same-step': {
      const chain = p.items
        .filter((_, i) => i !== p.answerIndex)
        .map(Number)
        .sort((a, b) => a - b)
      return (((n - chain[0]) % p.rule.k) + p.rule.k) % p.rule.k === 0
    }
    case 'same-sides':
      return shape?.sides === p.rule.k
    case 'straight-sides':
      return shape?.curved === false
    case 'equal-sides':
      return shape?.equalSides === 'yes'
    default:
      return false
  }
}

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

describe('odd-one-out', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the oracle catches the two-answer sets the schema must reject', () => {
    // The textbook defect. 12, 15, 18 are multiples of 3 and 20 is not — but 15
    // is also the only odd one, and 12/15/18 count up in jumps of 3. A child who
    // answers 15 has reasoned perfectly and would be marked wrong.
    const twoAnswers: Params = {
      domain: 'number-sequence',
      items: ['12', '15', '18', '20'],
      answerIndex: 3,
      rule: { kind: 'multiples', k: 3 },
    }
    expect(arguableOut('number-sequence', twoAnswers.items).length).toBeGreaterThan(1)
    expect(() => concept.paramsSchema.parse(twoAnswers)).toThrow()

    // 21, 14, 33, 24 fixes the parity clash but breaks another way: 33 is the
    // only option written with two matching digits.
    const repdigit: Params = { ...twoAnswers, items: ['21', '14', '33', '24'], answerIndex: 1 }
    expect(arguableOut('number-sequence', repdigit.items)).toEqual([1, 2])
    expect(() => concept.paramsSchema.parse(repdigit)).toThrow()

    // Same rule again, and now nothing else can be argued out.
    const clean: Params = {
      domain: 'number-sequence',
      items: ['75', '57', '18', '70'],
      answerIndex: 3,
      rule: { kind: 'multiples', k: 3 },
    }
    expect(arguableOut('number-sequence', clean.items)).toEqual([3])
    expect(() => concept.paramsSchema.parse(clean)).not.toThrow()
    expect(concept.render(clean).answer).toBe('D')

    // Shapes have the same failure mode: three shapes with equal sides picks out
    // the parallelogram, but three of them also have exactly four sides, which
    // picks out the pentagon instead.
    const twoShapeAnswers: Params = {
      domain: 'attribute-group',
      items: ['persegi', 'belah-ketupat', 'segi-lima', 'jajar-genjang'],
      answerIndex: 3,
      rule: { kind: 'equal-sides', k: 0 },
    }
    expect(arguableOut('attribute-group', twoShapeAnswers.items).length).toBeGreaterThan(1)
    expect(() => concept.paramsSchema.parse(twoShapeAnswers)).toThrow()
  })

  test(`${SEEDS} seeds: one arguable option, a rule that really holds, clean prose`, () => {
    const seenDomain = new Set<string>()
    const seenRule = new Set<string>()
    const seenAnswerSlot = new Set<number>()
    let seenTraps = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenDomain.add(p.domain)
      seenRule.add(`${p.domain}:${p.rule.kind}`)
      seenAnswerSlot.add(p.answerIndex)

      // ── Shape sanity ────────────────────────────────────────────────────
      expect(p.items.length, where).toBe(4)
      expect(new Set(p.items).size, where).toBe(4)
      if (p.domain === 'number-sequence') {
        for (const it of p.items) {
          expect(it, where).toMatch(/^[1-9][0-9]$/)
          expect(Number.isInteger(Number(it)), where).toBe(true)
        }
      } else {
        for (const it of p.items) {
          expect(
            SHAPES.some((s) => s.key === it),
            where,
          ).toBe(true)
        }
      }

      // ── EXACTLY ONE option may be argued out, and it is the answer ───────
      expect(arguableOut(p.domain, p.items), `${where}: more than one option can be excluded`).toEqual([
        p.answerIndex,
      ])

      // ── The three keepers really do obey the stated rule ─────────────────
      p.items.forEach((item, i) => {
        expect(keepsRule(p, item), `${where}: item ${i} vs rule`).toBe(i !== p.answerIndex)
      })

      // ── Rendering ───────────────────────────────────────────────────────
      const r = concept.render(p)
      expect(r.answer_type, where).toBe('multiple_choice')
      expect(r.answer, where).toBe(LABELS[p.answerIndex])
      expect(r.choices_en?.map((c) => c.label), where).toEqual([...LABELS])
      expect(r.choices_id?.map((c) => c.label), where).toEqual([...LABELS])
      expect(r.choices_en?.map((c) => c.text), where).toEqual(
        p.items.map((it) => itemText(p.domain, it, 'en')),
      )
      expect(r.choices_id?.map((c) => c.text), where).toEqual(
        p.items.map((it) => itemText(p.domain, it, 'id')),
      )
      // The four option texts must be distinct, or "which one" has no meaning.
      expect(new Set(r.choices_id?.map((c) => c.text)).size, where).toBe(4)

      const bd = r.breakdown!
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.strategy.name_en,
        bd.strategy.name_id,
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|\[object|null/)

      // ── hint_steps must FORCE the answer ────────────────────────────────
      // one hunt line + one line checking all three keepers + one line failing
      // the answer + the closing line.
      const en = r.hint_steps_en ?? []
      const id = r.hint_steps_id ?? []
      expect(en.length, where).toBe(4)
      expect(id.length, where).toBe(4)
      const keepers = p.items.filter((_, i) => i !== p.answerIndex)
      for (const keeper of keepers) {
        expect(en[1], `${where}: keeper ${keeper} unchecked (en)`).toContain(
          itemText(p.domain, keeper, 'en'),
        )
        expect(id[1], `${where}: keeper ${keeper} unchecked (id)`).toContain(
          itemText(p.domain, keeper, 'id'),
        )
      }
      // The failing line must name the answer and must NOT be where the answer
      // first appears without a reason: it carries the arithmetic/property too.
      expect(en[2], where).toContain(itemText(p.domain, p.items[p.answerIndex], 'en'))
      expect(id[2], where).toContain(itemText(p.domain, p.items[p.answerIndex], 'id'))
      expect(en[2].length, where).toBeGreaterThan(
        itemText(p.domain, p.items[p.answerIndex], 'en').length + 12,
      )
      expect(en.at(-1) as string, where).toContain(LABELS[p.answerIndex])
      expect(id.at(-1) as string, where).toContain(LABELS[p.answerIndex])
      // The rule the steps state is the rule the params carry.
      if (p.rule.kind === 'multiples') {
        expect(en[1], where).toContain(`multiples of ${p.rule.k}`)
        expect(id[1], where).toContain(`kelipatan ${p.rule.k}`)
      }

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(false)
      expect(bd.answer.form, where).toBe('choice')
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.highlights.length, where).toBe(4)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(
        display_en,
        bd.highlights.map((h) => h.phrase_en),
        where,
      )
      expectNoOverlap(
        display_id,
        bd.highlights.map((h) => h.phrase_id),
        where,
      )
      expect(bd.highlights.filter((h) => h.category === 'question').length, where).toBe(1)

      // The stem must never leak the rule the child is supposed to find.
      expect(display_id.includes('kelipatan'), where).toBe(false)
      expect(display_id.includes('genap'), where).toBe(false)
      expect(display_en.includes('multiple'), where).toBe(false)
      expect(display_en.includes('even'), where).toBe(false)

      // The trap, when there is one, must be a genuinely WRONG but tempting pick:
      // the biggest number, which here passes the rule like the other two.
      if (bd.trap !== null) {
        seenTraps += 1
        expect(p.domain, where).toBe('number-sequence')
        expect(bd.trap.wrong, where).not.toBe(r.answer)
        const at = LABELS.indexOf(bd.trap.wrong as (typeof LABELS)[number])
        expect(at, where).toBeGreaterThanOrEqual(0)
        expect(keepsRule(p, p.items[at]), where).toBe(true)
        expect(Math.max(...p.items.map(Number)), where).toBe(Number(p.items[at]))
      } else if (p.domain === 'number-sequence') {
        // No trap only when the answer really is the biggest option.
        expect(Math.max(...p.items.map(Number)), where).toBe(Number(p.items[p.answerIndex]))
      }
    }

    expect([...seenDomain].sort()).toEqual(['attribute-group', 'number-sequence'])
    expect([...seenRule].sort()).toEqual([
      'attribute-group:equal-sides',
      'attribute-group:same-sides',
      'attribute-group:straight-sides',
      'number-sequence:all-even',
      'number-sequence:all-odd',
      'number-sequence:multiples',
      'number-sequence:same-step',
      'number-sequence:squares',
    ])
    // The answer must not sit in a predictable slot.
    expect([...seenAnswerSlot].sort()).toEqual([0, 1, 2, 3])
    expect(seenTraps).toBeGreaterThan(20)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      domain: 'number-sequence',
      items: ['75', '57', '18', '70'],
      answerIndex: 3,
      rule: { kind: 'multiples', k: 3 },
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // the answer must be the option the rule rejects
    expect(() => concept.paramsSchema.parse({ ...ok, answerIndex: 0 })).toThrow()
    // the stated rule must actually be the one three of them share
    expect(() =>
      concept.paramsSchema.parse({ ...ok, rule: { kind: 'multiples', k: 5 } }),
    ).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, rule: { kind: 'all-even', k: 0 } })).toThrow()
    // duplicate options
    expect(() =>
      concept.paramsSchema.parse({ ...ok, items: ['21', '14', '21', '24'] }),
    ).toThrow()
    // one-digit options are always arguable out on digit count alone
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        items: ['5', '10', '15', '18'],
        answerIndex: 3,
        rule: { kind: 'multiples', k: 5 },
      }),
    ).toThrow()
    // a shape rule applied to numbers, and a number rule applied to shapes
    expect(() => concept.paramsSchema.parse({ ...ok, rule: { kind: 'same-sides', k: 4 } })).toThrow()
    expect(() =>
      concept.paramsSchema.parse({
        domain: 'attribute-group',
        items: ['persegi', 'segitiga', 'belah-ketupat', 'jajar-genjang'],
        answerIndex: 1,
        rule: { kind: 'all-even', k: 0 },
      }),
    ).toThrow()
    // an unknown shape key
    expect(() =>
      concept.paramsSchema.parse({
        domain: 'attribute-group',
        items: ['persegi', 'bintang', 'belah-ketupat', 'jajar-genjang'],
        answerIndex: 1,
        rule: { kind: 'same-sides', k: 4 },
      }),
    ).toThrow()
  })

  test('a shape set is accepted only when the name and the drawing agree', () => {
    const p: Params = {
      domain: 'attribute-group',
      items: ['persegi', 'segitiga', 'belah-ketupat', 'jajar-genjang'],
      answerIndex: 1,
      rule: { kind: 'same-sides', k: 4 },
    }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    const r = concept.render(p)
    expect(r.answer).toBe('B')
    expect(r.choices_id?.map((c) => c.text)).toEqual([
      'persegi',
      'segitiga',
      'belah ketupat',
      'jajar genjang',
    ])
    expect(r.hint_steps_id?.[2]).toContain('segitiga')
    expect(r.breakdown?.trap).toBeNull()
  })
})
