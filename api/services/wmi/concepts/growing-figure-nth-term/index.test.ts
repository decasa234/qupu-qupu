import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  candidateRules,
  closedForm,
  countAt,
  figureCells,
  MAX_COUNT,
  SHAPES,
  SHAPE_KIND,
  solve,
  type Params,
} from './index.js'

const SEEDS = 320

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

describe('growing-figure-nth-term', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('the drawn figure IS the count: cells never disagree with the closed form', () => {
    for (const shape of SHAPES) {
      const heights = shape === 'bar-rows' ? [2, 3] : [1]
      for (const height of heights) {
        for (let n = 1; n <= 20; n++) {
          const cells = figureCells(shape, height, n)
          const where = `${shape} h=${height} n=${n}`
          // No cell is drawn twice, none escapes the top-left quadrant.
          expect(new Set(cells.map(([r, c]) => `${r},${c}`)).size, where).toBe(cells.length)
          for (const [r, c] of cells) {
            expect(Number.isInteger(r) && r >= 0, where).toBe(true)
            expect(Number.isInteger(c) && c >= 0, where).toBe(true)
          }
          // The picture and the arithmetic are the same number.
          expect(cells.length, where).toBe(closedForm(shape, height, n))
          expect(countAt(shape, height, n), where).toBe(cells.length)
          // Every picture is strictly bigger than the one before it — the
          // "which picture has C squares" ask needs exactly one answer.
          if (n > 1) {
            expect(countAt(shape, height, n), where).toBeGreaterThan(
              countAt(shape, height, n - 1),
            )
          }
        }
        // Picture n really is picture n − 1 grown, never rebuilt: every cell of
        // the earlier picture survives into the later one for the block shapes.
        if (shape === 'square-block' || shape === 'oblong' || shape === 'staircase' || shape === 'bar-rows') {
          const before = new Set(figureCells(shape, height, 4).map(([r, c]) => `${r},${c}`))
          const after = new Set(figureCells(shape, height, 5).map(([r, c]) => `${r},${c}`))
          for (const key of before) expect(after.has(key), `${shape} grows by adding`).toBe(true)
        }
      }
    }
  })

  test('three pictures of a triangular pattern do NOT pin the rule down', () => {
    // 1, 3, 6 is a staircase — and it is equally "add 2, add 3, add 2, add 3…".
    // The two disagree at picture 10, so a three-picture staircase must be
    // rejected outright; the same puzzle with a fourth picture is fine.
    const three: Params = {
      shape: 'staircase',
      height: 1,
      shownCount: 3,
      ask: 'count-at-n',
      targetIndex: 10,
      secondIndex: 0,
    }
    const rivals = solve(three).rivals
    expect(rivals).toContain('alternating-difference')
    expect(() => concept.paramsSchema.parse(three)).toThrow()

    const four: Params = { ...three, shownCount: 4 }
    expect(solve(four).rivals).toEqual([])
    expect(() => concept.paramsSchema.parse(four)).not.toThrow()
    expect(solve(four).answer).toBe('55')
  })

  test('the alternative rules really are fitted to the drawn pictures', () => {
    const rules = candidateRules([1, 3, 6, 10])
    const byKey = Object.fromEntries(rules.map((r) => [r.key, r]))
    // The quadratic through 1, 3, 6 reproduces 10 as well — it is the staircase.
    expect([1, 2, 3, 4, 10].map((n) => byKey['constant-second-difference'].at(n))).toEqual([
      1, 3, 6, 10, 55,
    ])
    // Alternating jumps reproduce 1, 3, 6 but break at 10.
    expect([1, 2, 3, 4].map((n) => byKey['alternating-difference'].at(n))).toEqual([1, 3, 6, 8])
    // "Keep adding the last jump" walks backwards wrong too.
    expect([1, 2, 3, 4, 10].map((n) => byKey['keep-adding-the-last-jump'].at(n))).toEqual([
      -2, 2, 6, 10, 34,
    ])
    expect(byKey['constant-difference'].at(4)).toBe(7)
  })

  test('a fixed-jump pattern has no trap, a growing-jump one does', () => {
    const corner: Params = {
      shape: 'l-corner',
      height: 1,
      shownCount: 3,
      ask: 'count-at-n',
      targetIndex: 20,
      secondIndex: 0,
    }
    expect(() => concept.paramsSchema.parse(corner)).not.toThrow()
    const cs = solve(corner)
    expect(cs.shown).toEqual([1, 3, 5])
    expect(cs.answer).toBe('39')
    expect(cs.trap).toBeNull()

    const block: Params = {
      shape: 'square-block',
      height: 1,
      shownCount: 4,
      ask: 'count-at-n',
      targetIndex: 12,
      secondIndex: 0,
    }
    const bs = solve(block)
    expect(bs.shown).toEqual([1, 4, 9, 16])
    expect(bs.answer).toBe('144')
    // 16 + 7 × 8 = 72 — the child who keeps adding the last jump of 7.
    expect(bs.trap).toBe('72')
  })

  test(`${SEEDS} seeds: unique rule, clean render, exact breakdown phrases`, () => {
    const seenAsk = new Set<string>()
    const seenShape = new Set<string>()
    const seenShown = new Set<number>()
    let seenTraps = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenShape.add(p.shape)
      seenShown.add(p.shownCount)

      // ── Shape sanity ────────────────────────────────────────────────────
      expect(SHAPES, where).toContain(p.shape)
      expect(ASKS, where).toContain(p.ask)
      expect(p.height, where).toBe(p.shape === 'bar-rows' ? p.height : 1)
      if (p.shape === 'bar-rows') expect([2, 3], where).toContain(p.height)
      expect(p.targetIndex, where).toBeGreaterThanOrEqual(p.shownCount + 3)
      if (p.ask === 'difference-between-two') {
        expect(p.secondIndex, where).toBeGreaterThanOrEqual(p.shownCount + 2)
        expect(p.secondIndex, where).toBeLessThanOrEqual(p.targetIndex - 2)
      } else {
        expect(p.secondIndex, where).toBe(0)
      }

      const s = solve(p)

      // ── The drawn pictures ARE what the rule says ───────────────────────
      expect(s.shown.length, where).toBe(p.shownCount)
      for (let i = 0; i < p.shownCount; i++) {
        const drawn = figureCells(p.shape, p.height, i + 1)
        expect(drawn.length, `${where}: picture ${i + 1} drawn vs counted`).toBe(s.shown[i])
        expect(drawn.length, `${where}: picture ${i + 1} drawn vs rule`).toBe(
          closedForm(p.shape, p.height, i + 1),
        )
      }
      expect(s.shown[s.shown.length - 1], where).toBeLessThanOrEqual(20)
      expect(s.jumps, where).toEqual(s.shown.slice(1).map((v, i) => v - s.shown[i]))
      expect(s.sameJump, where).toBe(SHAPE_KIND[p.shape] === 'linear')

      // ── NO other plausible rule fits the drawings and changes the answer ─
      expect(s.rivals, `${where}: a second rule fits the drawn pictures`).toEqual([])
      // …and the true rule is itself one of the candidates, so the family the
      // check runs over is not vacuous.
      const fitting = candidateRules(s.shown).filter((rule) =>
        s.shown.every((v, i) => rule.at(i + 1) === v),
      )
      expect(fitting.length, `${where}: no candidate reproduced the drawings`).toBeGreaterThan(0)
      for (const rule of fitting) {
        if (p.ask === 'count-at-n') {
          expect(rule.at(p.targetIndex), `${where}: ${rule.key} disagrees`).toBe(s.targetCount)
        } else if (p.ask === 'difference-between-two') {
          expect(
            rule.at(p.targetIndex) - rule.at(p.secondIndex),
            `${where}: ${rule.key} disagrees`,
          ).toBe(s.targetCount - s.secondCount)
        }
      }

      // ── The answer is the rule at the target ────────────────────────────
      expect(s.targetCount, where).toBe(closedForm(p.shape, p.height, p.targetIndex))
      expect(s.targetCount, where).toBeLessThanOrEqual(MAX_COUNT)
      if (p.ask === 'count-at-n') {
        expect(s.answer, where).toBe(String(s.targetCount))
      } else if (p.ask === 'n-where-count-is') {
        expect(s.answer, where).toBe(String(p.targetIndex))
        // Exactly one picture holds that many squares.
        const hits: number[] = []
        for (let n = 1; n <= p.targetIndex + 5; n++) {
          if (countAt(p.shape, p.height, n) === s.targetCount) hits.push(n)
        }
        expect(hits, where).toEqual([p.targetIndex])
      } else {
        expect(s.secondCount, where).toBe(closedForm(p.shape, p.height, p.secondIndex))
        expect(s.answer, where).toBe(String(s.targetCount - s.secondCount))
        expect(Number(s.answer), where).toBeGreaterThanOrEqual(5)
      }

      // ── Rendering ───────────────────────────────────────────────────────
      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

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

      // Steps must WALK to the answer: count every drawn picture, name every
      // jump, quote the rule, then land on the answer in the last line.
      const stepsEn = r.hint_steps_en ?? []
      const stepsId = r.hint_steps_id ?? []
      expect(stepsEn.length, where).toBe(stepsId.length)
      expect(stepsEn.length, where).toBe(s.trap === null ? 4 : 5)
      for (const v of s.shown) {
        expect(stepsEn[0], `${where}: step 1 must count ${v}`).toContain(String(v))
        expect(stepsId[0], `${where}: step 1 must count ${v}`).toContain(String(v))
      }
      for (const j of s.jumps) {
        expect(stepsEn[1], `${where}: step 2 must name jump ${j}`).toContain(String(j))
        expect(stepsId[1], `${where}: step 2 must name jump ${j}`).toContain(String(j))
      }
      // Step 3 states the build AND checks it against the drawings.
      expect(stepsEn[2], where).toContain(String(s.shown[0]))
      expect(stepsEn[2], where).toContain(String(s.shown[s.shown.length - 1]))
      expect(stepsId[2], where).toContain(String(s.shown[s.shown.length - 1]))
      expect(stepsEn.at(-1) as string, where).toContain(s.answer)
      expect(stepsId.at(-1) as string, where).toContain(s.answer)
      // The answer is never simply announced in the opening line.
      expect(stepsEn[0], where).not.toContain(`picture ${p.targetIndex}`)

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.highlights.length, where).toBe(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      // The stem must never leak the answer — not as a picture number, not as a
      // count the child could copy straight back out.
      const leak = new RegExp(`\\b${s.answer}\\b`)
      expect(leak.test(display_en), `${where}: body_en leaks ${s.answer}`).toBe(false)
      expect(leak.test(display_id), `${where}: body_id leaks ${s.answer}`).toBe(false)

      // The trap, when there is one, is genuinely wrong and wrong in the one way
      // this pattern invites: keeping the last jump going forever.
      expect(bd.trap?.wrong ?? null, where).toBe(s.trap)
      if (s.trap !== null) {
        seenTraps += 1
        expect(SHAPE_KIND[p.shape], where).toBe('quadratic')
        expect(s.trap, where).not.toBe(s.answer)
      } else {
        expect(bd.trap, where).toBeNull()
      }
    }

    expect([...seenAsk].sort()).toEqual([
      'count-at-n',
      'difference-between-two',
      'n-where-count-is',
    ])
    expect([...seenShape].sort()).toEqual([...SHAPES].sort())
    expect([...seenShown].sort()).toEqual([3, 4])
    expect(seenTraps).toBeGreaterThan(20)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      shape: 'square-block',
      height: 1,
      shownCount: 4,
      ask: 'count-at-n',
      targetIndex: 12,
      secondIndex: 0,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // asking about a picture that is drawn (or nearly) is not a pattern question
    expect(() => concept.paramsSchema.parse({ ...ok, targetIndex: 5 })).toThrow()
    // an answer no small child could count
    expect(() => concept.paramsSchema.parse({ ...ok, targetIndex: 20 })).toThrow()
    // a height on a shape that has none
    expect(() => concept.paramsSchema.parse({ ...ok, height: 2 })).toThrow()
    // bar-rows without one
    expect(() =>
      concept.paramsSchema.parse({ ...ok, shape: 'bar-rows', height: 1, targetIndex: 12 }),
    ).toThrow()
    // a stray second index on a single-picture ask
    expect(() => concept.paramsSchema.parse({ ...ok, secondIndex: 7 })).toThrow()
    // a difference whose two pictures are too close together
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'difference-between-two',
        targetIndex: 12,
        secondIndex: 11,
      }),
    ).toThrow()
    // a difference against a picture that is drawn on the card
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'difference-between-two',
        targetIndex: 12,
        secondIndex: 3,
      }),
    ).toThrow()
    // three drawn pictures never pin a growing-jump pattern down
    expect(() => concept.paramsSchema.parse({ ...ok, shownCount: 3, targetIndex: 12 })).toThrow()
  })
})
