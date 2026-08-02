import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  clues,
  codeStr,
  solve,
  trapAnswer,
  type Clue,
  type Params,
} from './index.js'

const SEEDS = 320

/**
 * Independent oracle, part 1: the report, re-derived from the DEFINITION of the
 * game rather than from `score`. "In the right spot" counts slots that agree;
 * "in the wrong spot" counts digits present in both lists that are NOT already
 * counted — written here with maps instead of the production intersection so a
 * bug in one implementation cannot hide in the other.
 */
function oracleReport(guess: number[], code: number[]): { placed: number; present: number } {
  const slots = guess.map((d, i) => (d === code[i] ? 1 : 0)) as number[]
  const placed = slots.reduce((a, b) => a + b, 0)
  let present = 0
  for (let i = 0; i < guess.length; i++) {
    if (slots[i] === 1) continue
    for (let j = 0; j < code.length; j++) {
      if (j === i) continue
      if (code[j] === guess[i]) {
        present += 1
        break
      }
    }
  }
  return { placed, present }
}

/**
 * Independent oracle, part 2: every code that fits every printed report, found
 * by trying all of them. This is the check the whole concept rests on — two
 * survivors and the child has to guess, and either guess is defensible.
 */
function oracleSurvivors(p: Params, reports: Clue[]): string[] {
  const out: string[] = []
  for (let a = 1; a <= p.poolSize; a++) {
    for (let b = 1; b <= p.poolSize; b++) {
      for (let c = 1; c <= p.poolSize; c++) {
        if (a === b || a === c || b === c) continue
        const cand = [a, b, c]
        const fits = reports.every((r) => {
          const f = oracleReport(r.guess, cand)
          return f.placed === r.placed && f.present === r.present
        })
        if (fits) out.push(codeStr(cand))
      }
    }
  }
  return out
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

describe('mastermind-code-deduce', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('the brute-force oracle catches a clue set the schema must reject', () => {
    // Only the "nothing correct" report: the code's digits are known but every
    // one of the six orders still fits, so no child could pick between them.
    const ambiguous: Params = {
      poolSize: 6,
      codeLength: 3,
      code: [4, 1, 3],
      guesses: [
        [2, 5, 6],
        [6, 5, 2],
        [5, 2, 6],
      ],
    }
    expect(oracleSurvivors(ambiguous, clues(ambiguous)).length).toBe(6)
    expect(solve(ambiguous).unique).toBe(false)
    expect(() => concept.paramsSchema.parse(ambiguous)).toThrow()

    // Swap two of those wasted guesses for reports that speak about order and
    // the very same code becomes forced.
    const forced: Params = {
      ...ambiguous,
      guesses: [
        [2, 5, 6],
        [4, 2, 5],
        [2, 1, 5],
      ],
    }
    expect(oracleSurvivors(forced, clues(forced))).toEqual(['413'])
    expect(solve(forced).unique).toBe(true)
    expect(() => concept.paramsSchema.parse(forced)).not.toThrow()
    expect(solve(forced).answer).toBe('413')
  })

  test('the hand-built fallback is unique, and every one of its reports is needed', () => {
    const p: Params = {
      poolSize: 6,
      codeLength: 3,
      code: [4, 1, 3],
      guesses: [
        [2, 5, 6],
        [4, 2, 5],
        [2, 1, 5],
      ],
    }
    const s = solve(p)
    // 120 codes → 6 orders of {1,3,4} → the two starting with 4 → one.
    expect(s.steps.map((st) => st.after.length)).toEqual([6, 2, 1])
    expect(s.steps[0].settledDigits).toEqual([1, 3, 4])
    for (let i = 0; i < p.guesses.length; i++) {
      const without = { ...p, guesses: p.guesses.filter((_, j) => j !== i) }
      expect(
        oracleSurvivors(without, clues(without)).length,
        `report ${i} turned out to be dead weight`,
      ).toBeGreaterThan(1)
    }
  })

  test(`${SEEDS} seeds: exactly one code survives, and the clues are its own reports`, () => {
    const seenGuessCount = new Set<number>()
    const seenPlaced = new Set<number>()
    let seenTraps = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenGuessCount.add(p.guesses.length)

      // ── Shape sanity ────────────────────────────────────────────────────
      expect(p.poolSize, where).toBe(6)
      expect(p.codeLength, where).toBe(3)
      expect(p.code.length, where).toBe(3)
      expect(new Set(p.code).size, where).toBe(3)
      for (const d of p.code) {
        expect(Number.isInteger(d), where).toBe(true)
        expect(d, where).toBeGreaterThanOrEqual(1)
        expect(d, where).toBeLessThanOrEqual(p.poolSize)
      }
      expect(p.guesses.length, where).toBeGreaterThanOrEqual(3)
      expect(p.guesses.length, where).toBeLessThanOrEqual(4)
      expect(new Set(p.guesses.map(codeStr)).size, where).toBe(p.guesses.length)
      for (const g of p.guesses) {
        expect(g.length, where).toBe(3)
        expect(new Set(g).size, where).toBe(3)
        for (const d of g) {
          expect(d, where).toBeGreaterThanOrEqual(1)
          expect(d, where).toBeLessThanOrEqual(p.poolSize)
        }
        expect(codeStr(g), where).not.toBe(codeStr(p.code))
      }

      // ── Every printed report really is that guess scored on the answer ──
      const printed = clues(p)
      expect(printed.length, where).toBe(p.guesses.length)
      for (const c of printed) {
        const oracle = oracleReport(c.guess, p.code)
        expect({ placed: c.placed, present: c.present }, where).toEqual(oracle)
        expect(c.placed + c.present, where).toBeLessThanOrEqual(3)
        // Two digits already in place would hand the puzzle over.
        expect(c.placed, where).toBeLessThanOrEqual(1)
        seenPlaced.add(c.placed)
      }

      // ── EXACTLY ONE code fits, re-checked by full enumeration ───────────
      const s = solve(p)
      const oracleFit = oracleSurvivors(p, printed)
      expect(oracleFit.length, `${where}: more than one code fits every report`).toBe(1)
      expect(oracleFit[0], where).toBe(codeStr(p.code))
      expect(s.unique, where).toBe(true)
      expect(s.candidates.map(codeStr), where).toEqual([codeStr(p.code)])

      // Every report crosses something off at the moment it is read, and the
      // list only ever shrinks — that is what the hint lines argue from.
      expect(s.steps.length, where).toBe(p.guesses.length)
      for (const st of s.steps) {
        expect(st.after.length, `${where}: a report crossed nothing off`).toBeLessThan(
          st.before.length,
        )
        expect(st.after.length, where).toBeGreaterThanOrEqual(1)
        expect(st.killed.length, where).toBe(st.before.length - st.after.length)
        // The answer itself never gets crossed off by its own report.
        expect(st.after.some((c) => codeStr(c) === codeStr(p.code)), where).toBe(true)
        for (const e of st.spotExclusions) {
          expect(st.clue.placed, where).toBe(0)
          expect(p.code[e.spot], where).not.toBe(e.digit)
        }
      }
      // The first report settles WHICH digits are used; six orders remain.
      expect(s.steps[0].settledDigits, where).toEqual([...p.code].sort((a, b) => a - b))
      expect(s.steps[0].after.length, where).toBe(6)
      expect(s.steps[0].ruledOut.length, where).toBe(3)
      for (const d of s.steps[0].ruledOut) expect(p.code.includes(d), where).toBe(false)

      // No decoys: drop any single report and the code stops being pinned down.
      for (let i = 0; i < p.guesses.length; i++) {
        const without = { ...p, guesses: p.guesses.filter((_, j) => j !== i) }
        expect(
          oracleSurvivors(without, clues(without)).length,
          `${where}: report ${i} is dead weight`,
        ).toBeGreaterThan(1)
      }

      // ── Rendering ───────────────────────────────────────────────────────
      const r = concept.render(p)
      expect(r.answer, where).toBe(codeStr(p.code))
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

      // Nothing anywhere may leak an undefined / NaN into a child's screen.
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

      // The body states every report in words, so the puzzle is answerable
      // without the picture — and it never states the answer.
      for (const c of printed) {
        expect(r.body_en, where).toContain(`Guess ${c.guess.join(' ')}:`)
        expect(r.body_id, where).toContain(`Tebakan ${c.guess.join(' ')}:`)
      }

      // Steps must END on the answer, and every line before it must be an
      // elimination rather than an announcement.
      const en = r.hint_steps_en ?? []
      const id = r.hint_steps_id ?? []
      expect(en.length, where).toBe(id.length)
      expect(en.length, where).toBe(p.guesses.length + 2)
      expect(en.at(-1) as string, where).toContain(r.answer)
      expect(id.at(-1) as string, where).toContain(r.answer)
      for (let i = 0; i < s.steps.length; i++) {
        const st = s.steps[i]
        // The line for a report quotes that report and names what it kills.
        expect(en[i + 1], where).toContain(st.clue.guess.join(' '))
        expect(id[i + 1], where).toContain(st.clue.guess.join(' '))
        if (st.settledDigits === null) {
          for (const k of st.killed) {
            expect(en[i + 1], `${where}: step ${i} never says it crosses ${codeStr(k)} off`).toContain(
              codeStr(k),
            )
            expect(id[i + 1], where).toContain(codeStr(k))
          }
        }
      }
      // The opening rule line explains the game without naming the code.
      expect(en[0], where).not.toContain(r.answer)
      expect(id[0], where).not.toContain(r.answer)

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)

      // The trap, when there is one, must be genuinely WRONG and wrong in the
      // one way this puzzle invites: right digits, order never checked.
      const trap = trapAnswer(p, s)
      expect(bd.trap?.wrong ?? null, where).toBe(trap === null ? null : trap.wrong)
      if (trap !== null) {
        seenTraps += 1
        expect(trap.wrong, where).not.toBe(r.answer)
        expect(trap.wrong, where).toBe([...p.code].sort((a, b) => a - b).join(''))
        // It really is refuted by the report the note cites.
        const f = oracleReport(trap.step.clue.guess, trap.wrong.split('').map(Number))
        expect(
          f.placed !== trap.step.clue.placed || f.present !== trap.step.clue.present,
          where,
        ).toBe(true)
      }
    }

    expect([...seenGuessCount].sort()).toEqual([3, 4])
    expect([...seenPlaced].sort()).toEqual([0, 1])
    expect(seenTraps).toBeGreaterThan(SEEDS / 2)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      poolSize: 6,
      codeLength: 3,
      code: [4, 1, 3],
      guesses: [
        [2, 5, 6],
        [4, 2, 5],
        [2, 1, 5],
      ],
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // a repeated digit in the code
    expect(() => concept.paramsSchema.parse({ ...ok, code: [4, 4, 3] })).toThrow()
    // a repeated digit in a guess
    expect(() =>
      concept.paramsSchema.parse({ ...ok, guesses: [[2, 2, 6], [4, 2, 5], [2, 1, 5]] }),
    ).toThrow()
    // a guess that IS the code
    expect(() =>
      concept.paramsSchema.parse({ ...ok, guesses: [[2, 5, 6], [4, 1, 3], [2, 1, 5]] }),
    ).toThrow()
    // the same guess twice
    expect(() =>
      concept.paramsSchema.parse({ ...ok, guesses: [[2, 5, 6], [2, 5, 6], [2, 1, 5]] }),
    ).toThrow()
    // fewer than three reports
    expect(() =>
      concept.paramsSchema.parse({ ...ok, guesses: [[2, 5, 6], [4, 2, 5]] }),
    ).toThrow()
    // three reports that leave two codes standing
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        guesses: [
          [2, 5, 6],
          [6, 5, 2],
          [4, 2, 5],
        ],
      }),
    ).toThrow()
    // a digit outside the pool
    expect(() => concept.paramsSchema.parse({ ...ok, code: [4, 1, 7] })).toThrow()
  })
})
