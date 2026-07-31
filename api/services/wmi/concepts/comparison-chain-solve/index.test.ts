import { describe, expect, test } from 'vitest'
import { stripSectionLabels } from '@/lib/wmiBreakdown'
import { parseWmiMarkup } from '@/lib/wmiMarkup'
import { mulberry32 } from '../rng.js'
import concept, { type ChainLink, type Params } from './index.js'
import { buildComparisonChainBreakdown } from './breakdown.js'

const SEEDS = 320

/**
 * The text the child actually sees, reproduced the way WmiAuthoredBreakdown
 * reproduces it: section labels dropped, glossary markup resolved, whitespace
 * collapsed. A highlight phrase that is not a substring of THIS silently fails
 * to light up, so it is the only string worth asserting against.
 */
function displayBody(body: string): string {
  return parseWmiMarkup(stripSectionLabels(body))
    .map((s) => s.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * A second, deliberately independent implementation of the chain. It reads the
 * link kinds straight off the params rather than reusing anything the generator
 * exports, so an answer that agrees with it agrees with the story, not with a
 * shared helper that could be wrong in both places.
 */
function recomputeValues(params: Params): number[] {
  const out = [params.start]
  for (const link of params.links) {
    const prev = out[out.length - 1]
    if (link.kind === 'more') out.push(prev + link.k)
    else if (link.kind === 'fewer') out.push(prev - link.k)
    else if (link.kind === 'times') out.push(prev * link.m)
    else out.push(prev * link.m + link.k)
  }
  return out
}

function recomputeAnswer(params: Params, values: number[]): string {
  switch (params.ask) {
    case 'value':
      return String(values[params.targetIndex])
    case 'total':
      return String(values.reduce((s, v) => s + v, 0))
    case 'difference':
      return String(Math.abs(values[params.cmpA] - values[params.cmpB]))
    case 'rank': {
      const best = params.rankMode === 'most' ? Math.max(...values) : Math.min(...values)
      return params.names[values.indexOf(best)]
    }
  }
}

/** Undo one link, the way a child walking backwards has to. */
function undoLink(next: number, link: ChainLink): number {
  if (link.kind === 'more') return next - link.k
  if (link.kind === 'fewer') return next + link.k
  if (link.kind === 'times') return next / link.m
  return (next - link.k) / link.m
}

const seeds = Array.from({ length: SEEDS }, (_, i) => i + 1)
const samples = seeds.map((seed) => {
  const params = concept.generate(mulberry32(seed))
  return { seed, params, rendered: concept.render(params) }
})

describe('comparison-chain-solve', () => {
  test('every generated params object passes its own schema', () => {
    for (const { seed, params } of samples) {
      expect(() => concept.paramsSchema.parse(params), `seed ${seed}`).not.toThrow()
    }
  })

  test('the chain never leaves whole, non-negative counts', () => {
    for (const { seed, params } of samples) {
      const values = recomputeValues(params)
      expect(values.length, `seed ${seed}`).toBe(params.names.length)
      for (const v of values) {
        expect(Number.isInteger(v), `seed ${seed}: ${v} is not whole`).toBe(true)
        expect(v, `seed ${seed}`).toBeGreaterThanOrEqual(0)
        expect(v, `seed ${seed}`).toBeLessThanOrEqual(120)
      }
    }
  })

  test('a backwards walk can undo every link exactly, with no fractions', () => {
    for (const { seed, params } of samples) {
      if (params.givenIndex === 0) continue
      const values = recomputeValues(params)
      let cursor = values[values.length - 1]
      for (let i = params.links.length - 1; i >= 0; i--) {
        cursor = undoLink(cursor, params.links[i])
        expect(Number.isInteger(cursor), `seed ${seed}: undoing link ${i} gave ${cursor}`).toBe(true)
      }
      expect(cursor, `seed ${seed}`).toBe(values[0])
    }
  })

  test('the stated count sits at one end and every child has their own name', () => {
    for (const { seed, params } of samples) {
      expect([0, params.names.length - 1], `seed ${seed}`).toContain(params.givenIndex)
      expect(new Set(params.names).size, `seed ${seed}`).toBe(params.names.length)
      if (params.givenIndex !== 0) {
        expect(params.links.some((l) => l.kind === 'times-plus'), `seed ${seed}`).toBe(false)
      }
    }
  })

  test('the answer matches an independent walk of the chain', () => {
    for (const { seed, params, rendered } of samples) {
      const values = recomputeValues(params)
      expect(rendered.answer, `seed ${seed} (${params.ask})`).toBe(recomputeAnswer(params, values))
    }
  })

  test('nothing renders as undefined, NaN or null', () => {
    for (const { seed, params, rendered } of samples) {
      const bd = buildComparisonChainBreakdown(params)
      const blobs = [
        rendered.body_en,
        rendered.body_id,
        rendered.hint_en ?? '',
        rendered.hint_id ?? '',
        ...(rendered.hint_steps_en ?? []),
        ...(rendered.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        ...(bd.trap ? [bd.trap.wrong, bd.trap.why_en, bd.trap.why_id] : []),
      ]
      for (const blob of blobs) {
        expect(blob, `seed ${seed}`).not.toMatch(/undefined|NaN|\bnull\b/)
        expect(blob.length, `seed ${seed}`).toBeGreaterThan(0)
      }
    }
  })

  test('every breakdown phrase is an exact substring of the displayed body, in both languages', () => {
    for (const { seed, params, rendered } of samples) {
      const bd = buildComparisonChainBreakdown(params)
      const en = displayBody(rendered.body_en)
      const id = displayBody(rendered.body_id)
      for (const hl of bd.highlights) {
        expect(en.includes(hl.phrase_en), `seed ${seed}: EN "${hl.phrase_en}" not in "${en}"`).toBe(true)
        expect(id.includes(hl.phrase_id), `seed ${seed}: ID "${hl.phrase_id}" not in "${id}"`).toBe(true)
      }
      // One highlight per sentence of the problem plus the question.
      expect(bd.highlights.length, `seed ${seed}`).toBe(params.names.length + 1)
    }
  })

  test('breakdown answer, quantities and render agree', () => {
    for (const { seed, params, rendered } of samples) {
      const bd = buildComparisonChainBreakdown(params)
      const values = recomputeValues(params)
      expect(bd.answer.value, `seed ${seed}`).toBe(rendered.answer)
      expect(rendered.breakdown?.answer.value, `seed ${seed}`).toBe(rendered.answer)
      values.forEach((v, i) => {
        expect(bd.quantities[i].value, `seed ${seed}: quantity ${i}`).toBe(String(v))
      })
      expect(bd.quantities[bd.quantities.length - 1].value, `seed ${seed}`).toBe(rendered.answer)
    }
  })

  test('the trap is never the right answer', () => {
    for (const { seed, params, rendered } of samples) {
      const trap = buildComparisonChainBreakdown(params).trap
      if (!trap) continue
      expect(trap.wrong, `seed ${seed} (${params.ask})`).not.toBe(rendered.answer)
    }
  })

  test('the steps pin one count per link and land on the answer', () => {
    for (const { seed, params, rendered } of samples) {
      const en = rendered.hint_steps_en ?? []
      const id = rendered.hint_steps_id ?? []
      // Opening line + one line per link, plus a closing line unless the last
      // link already lands on the child being asked about.
      expect(en.length, `seed ${seed}`).toBeGreaterThanOrEqual(params.links.length + 1)
      expect(id.length, `seed ${seed}`).toBe(en.length)
      expect(en[en.length - 1], `seed ${seed}`).toContain(rendered.answer)
      expect(id[id.length - 1], `seed ${seed}`).toContain(rendered.answer)
      // Every intermediate count has to be shown, not skipped over.
      const values = recomputeValues(params)
      const joined = id.join(' ')
      for (const v of values) expect(joined, `seed ${seed}: ${v} never named`).toContain(String(v))
    }
  })

  test('the sweep actually exercises every ask, link kind and walk direction', () => {
    const asks = new Set(samples.map((s) => s.params.ask))
    const kinds = new Set(samples.flatMap((s) => s.params.links.map((l) => l.kind)))
    const givens = new Set(samples.map((s) => (s.params.givenIndex === 0 ? 'forward' : 'backward')))
    const lengths = new Set(samples.map((s) => s.params.names.length))
    expect([...asks].sort()).toEqual(['difference', 'rank', 'total', 'value'])
    expect([...kinds].sort()).toEqual(['fewer', 'more', 'times', 'times-plus'])
    expect([...givens].sort()).toEqual(['backward', 'forward'])
    expect([...lengths].sort()).toEqual([3, 4])
  })

  test('a fixed chain renders the story it solves', () => {
    const params: Params = {
      ask: 'value',
      names: ['Ani', 'Budi', 'Citra'],
      start: 6,
      links: [
        { kind: 'more', k: 4, m: 2 },
        { kind: 'times', k: 2, m: 2 },
      ],
      givenIndex: 0,
      targetIndex: 2,
      cmpA: 0,
      cmpB: 2,
      rankMode: 'most',
      item_en: 'marbles',
      item_one_en: 'marble',
      item_id: 'kelereng',
    }
    const r = concept.render(concept.paramsSchema.parse(params))
    expect(r.body_en).toBe(
      'Ani has 6 marbles. Budi has 4 more marbles than Ani. Citra has 2 times as many marbles as Budi. Find: How many marbles does Citra have?',
    )
    expect(r.body_id).toBe(
      'Ani punya 6 kelereng. Budi punya 4 kelereng lebih banyak daripada Ani. Citra punya kelereng 2 kali lipat dari Budi. Cari: Berapa kelereng yang dimiliki Citra?',
    )
    expect(r.answer).toBe('20')
    // Stopping at Budi is the trap, and it is not 20.
    expect(r.breakdown?.trap?.wrong).toBe('10')
  })

  test('the schema rejects a chain that would run a child below zero', () => {
    const bad = {
      ask: 'value',
      names: ['Ani', 'Budi', 'Citra'],
      start: 3,
      links: [
        { kind: 'fewer', k: 5, m: 2 },
        { kind: 'more', k: 2, m: 2 },
      ],
      givenIndex: 0,
      targetIndex: 2,
      cmpA: 0,
      cmpB: 2,
      rankMode: 'most',
      item_en: 'marbles',
      item_one_en: 'marble',
      item_id: 'kelereng',
    }
    expect(() => concept.paramsSchema.parse(bad)).toThrow()
  })

  test('the schema rejects a backwards walk that would need a two-step undo', () => {
    const bad = {
      ask: 'value',
      names: ['Ani', 'Budi', 'Citra'],
      start: 4,
      links: [
        { kind: 'times-plus', k: 3, m: 2 },
        { kind: 'more', k: 2, m: 2 },
      ],
      givenIndex: 2,
      targetIndex: 0,
      cmpA: 0,
      cmpB: 2,
      rankMode: 'most',
      item_en: 'marbles',
      item_one_en: 'marble',
      item_id: 'kelereng',
    }
    expect(() => concept.paramsSchema.parse(bad)).toThrow()
  })

  test('the schema rejects a rank question that ends in a tie', () => {
    const bad = {
      ask: 'rank',
      names: ['Ani', 'Budi', 'Citra'],
      start: 8,
      links: [
        { kind: 'more', k: 3, m: 2 },
        { kind: 'fewer', k: 3, m: 2 },
      ],
      givenIndex: 0,
      targetIndex: 2,
      cmpA: 0,
      cmpB: 2,
      // Values are 8, 11, 8. Only the MINIMUM is tied, so 'least' is the mode
      // with no unique answer — under 'most' the 11 wins outright and the
      // schema is right to accept it.
      rankMode: 'least',
      item_en: 'marbles',
      item_one_en: 'marble',
      item_id: 'kelereng',
    }
    expect(() => concept.paramsSchema.parse(bad)).toThrow()
  })
})
