import { describe, test, expect } from 'vitest'
import { stripSectionLabels } from '../../../../../src/lib/wmiBreakdown'
import { mulberry32 } from '../rng.js'
import concept, { LABELS, derive, generate, type Params } from './index.js'

// The breakdown highlighter finds each phrase by substring on the DISPLAYED
// body — i.e. after stripSectionLabels has removed "Cari:" / "Find:" and
// collapsed the blank line. A phrase that is not found silently renders as
// plain text with no colour and no note, so every seed is checked against the
// real function rather than against body_id/body_en raw.
function display(text: string): string {
  return stripSectionLabels(text)
}

const ALL_ASKS = [
  'measure-one',
  'longest',
  'difference',
  'nth-longest',
  'order-all',
  'sum-two',
  'relative-from-known',
] as const

const SEEDS = 900

function lengths(p: Params): number[] {
  return p.items.map((it) => it.length)
}

function allDistinct(values: number[]): boolean {
  return new Set(values).size === values.length
}

/** Ranking straight off the figure data — never off derive(). */
function expectedRank(p: Params): number[] {
  return p.items
    .map((_, i) => i)
    .sort((i, j) => p.items[j].length - p.items[i].length || i - j)
}

const generated: Params[] = []
for (let seed = 1; seed <= SEEDS; seed++) generated.push(generate(mulberry32(seed)))

describe('length-measure-compare — generate', () => {
  test('deterministic for a given seed', () => {
    expect(generate(mulberry32(31))).toEqual(generate(mulberry32(31)))
  })

  test(`${SEEDS} seeds: every ask is reachable and every params object parses`, () => {
    const seen = new Set<string>()
    for (const p of generated) {
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      seen.add(p.ask)
    }
    expect(seen).toEqual(new Set(ALL_ASKS))
  })

  test('the figure is always drawable: bars fit on the ruler, lengths are whole and positive', () => {
    for (const p of generated) {
      for (const it of p.items) {
        expect(Number.isInteger(it.start)).toBe(true)
        expect(Number.isInteger(it.length)).toBe(true)
        expect(it.length).toBeGreaterThan(0)
        expect(it.start).toBeGreaterThanOrEqual(0)
        if (p.medium !== 'unit-chain') expect(it.start + it.length).toBeLessThanOrEqual(p.rulerMax)
      }
      expect(p.unitLabel).toBe(p.medium === 'unit-chain' ? 'petak' : 'cm')
      expect(p.focusA).toBeLessThan(p.items.length)
      expect(p.focusB).toBeLessThan(p.items.length)
    }
  })

  test('the ranking asks never ship a tie — otherwise "second longest" has two answers', () => {
    const ranking = generated.filter(
      (p) => p.ask === 'nth-longest' || p.ask === 'order-all' || p.ask === 'relative-from-known',
    )
    expect(ranking.length).toBeGreaterThan(0)
    for (const p of ranking) expect(allDistinct(lengths(p))).toBe(true)
  })

  test('nth-longest: nth is 2 or 3 and always names a rank that exists', () => {
    const rows = generated.filter((p) => p.ask === 'nth-longest')
    expect(rows.length).toBeGreaterThan(0)
    for (const p of rows) {
      expect(p.nth).toBeDefined()
      expect([2, 3]).toContain(p.nth)
      expect(p.nth as number).toBeLessThan(p.items.length)
    }
  })

  test('order-all: at least 3 bars, and 4 bars do occur', () => {
    const rows = generated.filter((p) => p.ask === 'order-all')
    expect(rows.length).toBeGreaterThan(0)
    for (const p of rows) expect(p.items.length).toBeGreaterThanOrEqual(3)
    expect(rows.some((p) => p.items.length === 4)).toBe(true)
  })

  test('sum-two: exactly two bars, and the first one never stops on the total', () => {
    const rows = generated.filter((p) => p.ask === 'sum-two')
    expect(rows.length).toBeGreaterThan(0)
    for (const p of rows) {
      expect(p.items).toHaveLength(2)
      // The explainer flags the first bar's right-end reading as the trap, so
      // that reading must not coincide with the answer.
      expect(p.items[0].start + p.items[0].length).not.toBe(
        p.items[0].length + p.items[1].length,
      )
    }
  })

  test('relative-from-known: three bars on the offset ruler, focus = longest / shortest', () => {
    const rows = generated.filter((p) => p.ask === 'relative-from-known')
    expect(rows.length).toBeGreaterThan(0)
    for (const p of rows) {
      expect(p.medium).toBe('offset-ruler')
      expect(p.items).toHaveLength(3)
      const rank = expectedRank(p)
      expect(p.focusA).toBe(rank[0])
      expect(p.focusB).toBe(rank[rank.length - 1])
      // The statement is only interesting when the bar does NOT start at 0.
      for (const it of p.items) expect(it.start).toBeGreaterThan(0)
    }
  })

  test('every ask still reaches every medium it is allowed to use', () => {
    const media = new Map<string, Set<string>>()
    for (const p of generated) {
      if (!media.has(p.ask)) media.set(p.ask, new Set())
      media.get(p.ask)!.add(p.medium)
    }
    for (const ask of ALL_ASKS) {
      const seen = media.get(ask)!
      if (ask === 'relative-from-known') expect(seen).toEqual(new Set(['offset-ruler']))
      else expect(seen).toEqual(new Set(['ruler', 'offset-ruler', 'unit-chain']))
    }
  })
})

describe('length-measure-compare — render', () => {
  test(`${SEEDS} seeds: nothing renders as undefined / NaN`, () => {
    for (const p of generated) {
      const r = concept.render(p)
      const blobs = [
        r.body_id,
        r.body_en,
        r.answer,
        r.hint_id ?? '',
        r.hint_en ?? '',
        ...(r.hint_steps_id ?? []),
        ...(r.hint_steps_en ?? []),
        ...(r.choices_id ?? []).flatMap((c) => [c.label, c.text]),
        ...(r.choices_en ?? []).flatMap((c) => [c.label, c.text]),
        JSON.stringify(r.breakdown),
      ]
      for (const s of blobs) {
        expect(s).toBeTruthy()
        expect(s).not.toMatch(/undefined|NaN|\[object Object\]/)
      }
      expect(r.hint_steps_id).toHaveLength(3)
      expect(r.hint_steps_en).toHaveLength(3)
    }
  })

  test('the answer is always derivable from the figure data alone', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const rank = expectedRank(p)
      const len = (i: number) => p.items[i].length
      switch (p.ask) {
        case 'measure-one':
          expect(r.answer).toBe(String(len(p.focusA)))
          break
        case 'longest':
          expect(r.answer).toBe(LABELS[rank[0]])
          break
        case 'difference':
          expect(r.answer).toBe(String(len(p.focusA) - len(p.focusB)))
          break
        case 'nth-longest':
          expect(r.answer).toBe(LABELS[rank[(p.nth as number) - 1]])
          break
        case 'order-all': {
          const correct = (r.choices_id ?? []).find((c) => c.label === r.answer)
          expect(correct).toBeDefined()
          expect(correct!.text).toBe(
            rank.map((i) => derive(p).infos[i].NameId).join(', '),
          )
          break
        }
        case 'sum-two':
          expect(r.answer).toBe(String(len(0) + len(1)))
          break
        case 'relative-from-known':
          expect(r.answer).toBe(String(len(rank[rank.length - 1])))
          break
      }
    }
  })

  test('choice asks offer choices, fill-in asks do not', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const isChoice = p.ask === 'longest' || p.ask === 'nth-longest' || p.ask === 'order-all'
      expect(r.answer_type).toBe(isChoice ? 'multiple_choice' : 'fill_in')
      if (!isChoice) {
        expect(r.choices_id).toBeNull()
        expect(r.choices_en).toBeNull()
        // Fill-in answers are bare non-negative whole numbers a child can type.
        expect(r.answer).toMatch(/^\d+$/)
        continue
      }
      const labels = (r.choices_id ?? []).map((c) => c.label)
      expect(labels).toEqual((r.choices_en ?? []).map((c) => c.label))
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
    }
  })

  test('order-all: 4 distinct options, the right one moves around, no letter soup', () => {
    const rows = generated.filter((p) => p.ask === 'order-all')
    const slots = new Set<string>()
    for (const p of rows) {
      const r = concept.render(p)
      const texts = (r.choices_id ?? []).map((c) => c.text)
      expect(texts).toHaveLength(4)
      expect(new Set(texts).size).toBe(4)
      // Every option must be a permutation of the same objects.
      const names = derive(p).infos.map((it) => it.NameId).sort()
      for (const text of texts) expect(text.split(', ').sort()).toEqual(names)
      slots.add(r.answer)
      // Deterministic: same params in, same option layout out.
      expect(concept.render(p).choices_id).toEqual(r.choices_id)
    }
    expect(slots.size).toBeGreaterThan(1)
  })

  test('relative-from-known is the only ask that states a length in words', () => {
    for (const p of generated) {
      const d = derive(p)
      if (p.ask === 'relative-from-known') {
        expect(d.stated).not.toBeNull()
        expect(d.body_id).toContain(`panjangnya ${d.a.length} cm`)
        expect(d.body_en).toContain(`is ${d.a.length} cm long`)
      } else {
        expect(d.stated).toBeNull()
        // No other stem ever hands over a length; the only numbers it may carry
        // are ruler readings ("Ujung kirinya di angka 3"), which are labels on
        // the picture rather than a measurement.
        expect(display(d.body_id)).not.toMatch(/panjangnya \d/)
        expect(display(d.body_en)).not.toMatch(/is \d+ cm long/)
      }
    }
  })

  test('the stated length is the length of the longest bar, and it is true', () => {
    for (const p of generated.filter((q) => q.ask === 'relative-from-known')) {
      const d = derive(p)
      const rank = expectedRank(p)
      expect(d.a).toBe(d.infos[rank[0]])
      expect(d.b).toBe(d.infos[rank[rank.length - 1]])
      expect(d.a.end - d.a.start).toBe(d.a.length)
      expect(d.a.length).toBeGreaterThan(d.b.length)
    }
  })
})

describe('length-measure-compare — breakdown', () => {
  test('every phrase is an exact substring of the displayed body, in both languages', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const bodyId = display(r.body_id)
      const bodyEn = display(r.body_en)
      const bd = r.breakdown
      expect(bd).toBeTruthy()
      for (const h of bd!.highlights) {
        expect(h.phrase_id.length).toBeGreaterThan(0)
        expect(h.phrase_en.length).toBeGreaterThan(0)
        expect(
          bodyId.includes(h.phrase_id),
          `ask=${p.ask} medium=${p.medium}\nphrase_id: ${h.phrase_id}\nbody_id:   ${bodyId}`,
        ).toBe(true)
        expect(
          bodyEn.includes(h.phrase_en),
          `ask=${p.ask} medium=${p.medium}\nphrase_en: ${h.phrase_en}\nbody_en:   ${bodyEn}`,
        ).toBe(true)
        expect(h.note_id).not.toMatch(/undefined|NaN/)
        expect(h.note_en).not.toMatch(/undefined|NaN/)
      }
      // The question is always spotlighted, and so is the object under test.
      expect(bd!.highlights.some((h) => h.category === 'question')).toBe(true)
      expect(bd!.highlights.some((h) => h.category === 'object')).toBe(true)
      expect(bd!.answer.value).toBe(r.answer)
    }
  })

  test('relative-from-known adds the "you were told this" fact highlight', () => {
    for (const p of generated.filter((q) => q.ask === 'relative-from-known')) {
      const bd = concept.render(p).breakdown!
      const stated = bd.highlights.find((h) => h.phrase_en.startsWith('The longest object is'))
      expect(stated).toBeDefined()
      expect(stated!.category).toBe('fact')
    }
  })

  test('a trap, when offered, is never the right answer', () => {
    for (const p of generated) {
      const r = concept.render(p)
      if (r.breakdown?.trap) expect(r.breakdown.trap.wrong).not.toBe(r.answer)
    }
  })

  test('offset-ruler versions of the new asks do produce traps', () => {
    const trapped = new Set<string>()
    for (const p of generated) {
      if (p.medium !== 'offset-ruler') continue
      if (concept.render(p).breakdown?.trap) trapped.add(p.ask)
    }
    expect(trapped).toContain('sum-two')
    expect(trapped).toContain('relative-from-known')
    expect(trapped).toContain('nth-longest')
  })
})

describe('length-measure-compare — the three original asks are untouched', () => {
  // Stored wmi_concept_instances rows carry these exact params. If any of these
  // strings move, live rows re-render differently from the day they were made.
  const MEASURE_ONE: Params = {
    medium: 'offset-ruler',
    unitLabel: 'cm',
    ask: 'measure-one',
    rulerMax: 12,
    items: [{ name: 'pita', start: 3, length: 8 }],
    focusA: 0,
    focusB: 0,
  }
  const LONGEST: Params = {
    medium: 'offset-ruler',
    unitLabel: 'cm',
    ask: 'longest',
    rulerMax: 13,
    items: [
      { name: 'pensil', start: 1, length: 8 },
      { name: 'ranting', start: 6, length: 6 },
    ],
    focusA: 0,
    focusB: 0,
  }
  const DIFFERENCE: Params = {
    medium: 'unit-chain',
    unitLabel: 'petak',
    ask: 'difference',
    rulerMax: 7,
    items: [
      { name: 'tali', start: 0, length: 7 },
      { name: 'krayon', start: 0, length: 4 },
    ],
    focusA: 0,
    focusB: 1,
  }

  test('measure-one on an offset ruler', () => {
    const r = concept.render(MEASURE_ONE)
    expect(r.body_id).toBe(
      'Sehelai pita diletakkan di atas penggaris. Ujung kirinya di angka 3, ujung kanannya di angka 11.\n\nCari: Berapa cm panjang pita itu?',
    )
    expect(r.body_en).toBe(
      'A ribbon is placed on a ruler. Its left end is at 3 and its right end is at 11.\n\nFind: How many cm long is the ribbon?',
    )
    expect(r.answer).toBe('8')
    expect(r.answer_type).toBe('fill_in')
    expect(r.breakdown!.trap!.wrong).toBe('11')
  })

  test('longest still asks the plain superlative and answers with a letter', () => {
    const r = concept.render(LONGEST)
    expect(r.body_id).toBe(
      'Dua benda diletakkan di atas penggaris. Ujung kirinya tidak di angka 0.\n\nCari: Benda mana yang paling panjang?',
    )
    expect(r.answer).toBe('A')
    expect(r.choices_id).toEqual([
      { label: 'A', text: 'Pensil' },
      { label: 'B', text: 'Ranting' },
    ])
  })

  test('difference on a unit chain', () => {
    const r = concept.render(DIFFERENCE)
    expect(r.body_id).toBe(
      'Tali dan krayon diukur memakai petak satuan yang disusun rapat tanpa celah.\n\nCari: Berapa petak tali lebih panjang daripada krayon?',
    )
    expect(r.answer).toBe('3')
    expect(r.breakdown!.trap).toBeNull()
  })
})
