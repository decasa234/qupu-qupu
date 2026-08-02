import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  answerOf,
  buildPuzzle,
  columnTrace,
  solutions,
  type Params,
} from './index.js'

const IS_LETTER = /[A-Z]/

/**
 * A second, deliberately different uniqueness check: instead of enumerating
 * letter -> digit assignments (what `solutions` does), walk every real number of
 * the right length, multiply it, and keep the ones whose digits agree with every
 * character the mask leaves visible. Both must land on exactly one puzzle.
 */
function countByNumberSearch(p: Params): number {
  const z = buildPuzzle(p)
  const topLen = z.topStr.length
  const lo = 10 ** (topLen - 1)
  const hi = 10 ** topLen - 1
  let count = 0
  for (let t = lo; t <= hi; t++) {
    const s = t * p.multiplier
    const ts = String(t)
    const ss = String(s)
    if (ss.length !== z.prodStr.length) continue
    let ok = true
    for (let i = 0; i < ts.length && ok; i++) {
      if (!IS_LETTER.test(z.topMask[i]) && ts[i] !== z.topMask[i]) ok = false
    }
    for (let k = 0; k < ss.length && ok; k++) {
      if (!IS_LETTER.test(z.prodMask[k]) && ss[k] !== z.prodMask[k]) ok = false
    }
    if (ok) count++
  }
  return count
}

const clean = (s: string) => !/undefined|NaN/.test(s)

describe('cryptarithmetic-multiplication', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  // Brute-forces every hidden-digit assignment (plus a second, independent
  // number search) for 120 seeds. Slow on purpose: proving the puzzle has
  // EXACTLY one solution is the whole point, so it gets a longer budget rather
  // than fewer seeds.
  test('120 seeds: unique solution, sound arithmetic, forced column chain', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const z = buildPuzzle(p)
      // The written multiplication is real arithmetic, drawn at the right width.
      expect(z.top * z.multiplier).toBe(z.product)
      expect(z.topMask).toHaveLength(z.topStr.length)
      expect(z.prodMask).toHaveLength(z.prodStr.length)
      expect(z.slots.length).toBeGreaterThanOrEqual(2)
      expect(z.slots.length).toBeLessThanOrEqual(3)

      // No column hides both its top digit and its product digit — otherwise the
      // right-to-left chain the hints teach would stall at that column.
      const topCols = z.slots.filter((s) => s.row === 'top').map((s) => s.col)
      const prodCols = z.slots.filter((s) => s.row === 'product').map((s) => s.col)
      for (const c of topCols) expect(prodCols).not.toContain(c)

      // Letters are handed out A, B, C in reading order and each covers its digit.
      z.slots.forEach((s, i) => {
        expect(s.letter).toBe(String.fromCharCode(65 + i))
        const row = s.row === 'top' ? z.topStr : z.prodStr
        expect(s.digit).toBe(Number(row[s.index]))
      })

      // Exactly one assignment works — proven twice, two different ways.
      const sols = solutions(p)
      expect(sols.length).toBe(1)
      expect(countByNumberSearch(p)).toBe(1)
      for (const s of z.slots) expect(sols[0][s.letter]).toBe(s.digit)

      // The column walk reproduces the product digit for digit, ending clean.
      const trace = columnTrace(p)
      expect(trace).toHaveLength(z.prodStr.length)
      expect(trace[0].carryIn).toBe(0)
      expect(trace[trace.length - 1].carryOut).toBe(0)
      for (const c of trace) {
        expect(c.prodDigit).toBe(Number(z.prodStr[z.prodStr.length - 1 - c.col]))
        expect(c.raw).toBe(c.topDigit * p.multiplier + c.carryIn)
      }
      // A hidden top digit is only ever placed under a multiplier coprime with
      // 10, so its column pins it outright instead of leaving two candidates.
      if (topCols.length > 0) expect([3, 7, 9]).toContain(p.multiplier)
      for (const c of trace) {
        if (!c.topLetter) continue
        const fits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
          (d) => (d * p.multiplier + c.carryIn) % 10 === c.prodDigit,
        )
        expect(fits).toEqual([c.topDigit])
      }

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(answerOf(p))
      expect(r.answer).toMatch(/^\d+$/)
      if (p.ask === 'the-product') expect(r.answer).toBe(String(z.product))
      if (p.ask === 'sum-of-hidden-digits')
        expect(r.answer).toBe(String(z.slots.reduce((a, s) => a + s.digit, 0)))
      if (p.ask === 'one-named-digit') expect(r.answer).toBe(String(z.askedSlot.digit))

      // Nothing leaks a hole into the child's view.
      for (const s of [r.body_en, r.body_id, r.hint_en!, r.hint_id!]) expect(clean(s)).toBe(true)
      expect(r.hint_steps_en!.length).toBeGreaterThanOrEqual(3)
      expect(r.hint_steps_en!.length).toBeLessThanOrEqual(5)
      expect(r.hint_steps_en!.length).toBe(r.hint_steps_id!.length)
      // The chain always opens on the ones column and never leans on a carry it
      // has not worked out: every emitted carry is consumed by the next line.
      expect(r.hint_steps_en![0].startsWith('Ones column:')).toBe(true)
      expect(r.hint_steps_id![0].startsWith('Kolom satuan:')).toBe(true)
      const named = r.hint_steps_id!.filter((s) => s.startsWith('Kolom ')).length
      const needed = trace.filter(
        (c) => c.col === 0 || c.topLetter || c.prodLetter || c.carryOut > 0,
      ).filter((c) => c.col <= Math.max(...z.slots.map((s) => s.col))).length
      expect(named).toBe(needed)
      for (const s of [...r.hint_steps_en!, ...r.hint_steps_id!]) {
        expect(clean(s)).toBe(true)
        expect(s.trim()).toBe(s)
      }
      // The last hint step lands the actual answer.
      expect(r.hint_steps_en!.at(-1)).toContain(r.answer)
      expect(r.hint_steps_id!.at(-1)).toContain(r.answer)
      // The equation is rendered on its own, with no stray label glued to it.
      expect(r.body_en).toContain(`  ${z.topMask} × ${z.multiplier} = ${z.prodMask}\n`)
      expect(r.body_id).toContain(`  ${z.topMask} × ${z.multiplier} = ${z.prodMask}\n`)

      const bd = r.breakdown!
      expect(bd.answer.value).toBe(r.answer)
      for (const h of bd.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
        // Display collapses runs of whitespace, so a phrase may never carry one.
        expect(h.phrase_en).not.toMatch(/\s{2,}/)
        expect(h.phrase_id).not.toMatch(/\s{2,}/)
      }
      expect(bd.highlights.some((h) => h.category === 'question')).toBe(true)
      if (bd.trap) expect(bd.trap.wrong).not.toBe(r.answer)
    }
  }, 30_000)

  test('worked example: 2A × 3 = B2 forces A = 4 and B = 7', () => {
    const p: Params = {
      top: 24,
      multiplier: 3,
      hiddenTop: [1],
      hiddenProduct: [0],
      ask: 'one-named-digit',
      askSlot: 1,
    }
    const z = buildPuzzle(p)
    expect(z.topMask).toBe('2A')
    expect(z.prodMask).toBe('B2')
    expect(solutions(p)).toEqual([{ A: 4, B: 7 }])
    expect(countByNumberSearch(p)).toBe(1)

    const r = concept.render(p)
    expect(r.body_en).toContain('2A × 3 = B2')
    expect(r.answer).toBe('7')
    // Units column first: it pins A before B is ever mentioned.
    expect(r.hint_steps_en[0]).toContain('Ones column: A × 3 has to end in 2')
    expect(r.hint_steps_en[0]).toContain('only 4 does, so A = 4')
    expect(r.hint_steps_en[1]).toContain('Tens column: 2 × 3 = 6, plus the carried 1 makes 7, so B = 7')
    expect(r.hint_steps_id[0]).toContain('Kolom satuan: A × 3 harus berakhir angka 2')
    // …and the carry trap is the tempting wrong digit.
    expect(r.breakdown!.trap?.wrong).toBe('6')
  })

  test('sum-of-hidden-digits adds every covered digit', () => {
    const p: Params = {
      top: 24,
      multiplier: 3,
      hiddenTop: [1],
      hiddenProduct: [0],
      ask: 'sum-of-hidden-digits',
      askSlot: 0,
    }
    expect(concept.render(p).answer).toBe('11')
    expect(concept.render(p).body_id).toContain('Berapa jumlah semua angka yang tertutup huruf?')
  })

  test('a column may not hide its top and product digit at once', () => {
    // Both slots sit in the ones column; the product one is dropped.
    const z = buildPuzzle({
      top: 24,
      multiplier: 3,
      hiddenTop: [1],
      hiddenProduct: [1],
      ask: 'one-named-digit',
      askSlot: 0,
    })
    expect(z.topMask).toBe('2A')
    expect(z.prodMask).toBe('72')
    expect(z.slots).toHaveLength(1)
  })
})
