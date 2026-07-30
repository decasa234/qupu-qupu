import { describe, test, expect } from 'vitest'
import { buildCryptarithmeticSteps, type CryptaStoryboard } from './cryptarithmeticSteps'
import { buildCryptaMapping } from '../cryptarithmetic-addition'

// The generator only ever emits puzzles with a unique solution and 3-4 distinct
// digits; these five cover every shape it can produce — a doubled ones column,
// a same-letter repeat, a four-letter puzzle, one that needs try-and-eliminate,
// and the hard-coded fallback puzzle.
const CASES: Array<[number, number, number]> = [
  [11, 89, 8],
  [15, 85, 5],
  [90, 10, 0],
  [99, 99, 8],
  [51, 65, 5],
]

/** The digit each letter really stands for. */
function truthOf(a: number, b: number): Record<string, number> {
  const m = buildCryptaMapping(a, b)
  const out: Record<string, number> = {}
  for (const [digit, letter] of Object.entries(m.digitToLetter)) out[letter] = Number(digit)
  return out
}

function story(a: number, b: number, d: number, lang: 'en' | 'id' = 'id'): CryptaStoryboard {
  return buildCryptarithmeticSteps({ addend1: a, addend2: b, askDigit: d }, lang)
}

describe('buildCryptarithmeticSteps', () => {
  test('every puzzle gets at least four beats, ending on the answer', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      expect(sb.steps.length).toBeGreaterThanOrEqual(4)
      expect(sb.finalIndex).toBe(sb.steps.length - 1)
      const last = sb.steps[sb.finalIndex]
      expect(last.result).toBe(true)
      expect(last.answer).toBe(d)
      expect(last.hold).toBe(0)
      expect(last.caption).toContain(`${sb.askLetter} = ${d}`)
    }
  })

  test('no beat before the last one resolves the asked letter', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      for (const step of sb.steps.slice(0, -1)) {
        expect(step.answer).toBeNull()
        expect(step.result).toBe(false)
        const asked = step.domains.find((dom) => dom.asked)
        // Still more than one candidate standing, so the answer is not on screen.
        expect(asked?.alive.length ?? 0).toBeGreaterThan(1)
        expect(asked?.settled).toBeNull()
      }
    }
  })

  test('candidate sets never drop the digit the letter really stands for', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      const truth = truthOf(a, b)
      for (const step of sb.steps) {
        for (const dom of step.domains) {
          expect(dom.alive).toContain(truth[dom.letter])
        }
        // A digit crossed out on this beat is never the true one.
        for (const dom of step.domains) {
          expect(dom.cut).not.toContain(truth[dom.letter])
        }
      }
    }
  })

  test('a settled letter always shows the digit it really stands for', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      const truth = truthOf(a, b)
      for (const step of sb.steps) {
        for (const dom of step.domains) {
          if (dom.settled !== null) expect(dom.settled).toBe(truth[dom.letter])
        }
      }
    }
  })

  test('carries shown on a beat are the real carries of the real sum', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      // Real carry INTO column j, worked out from the actual addition.
      const real: number[] = [0]
      const da = String(a).split('').reverse().map(Number)
      const db = String(b).split('').reverse().map(Number)
      for (let j = 0; j < sb.columnCount; j++) {
        real.push(Math.floor(((da[j] ?? 0) + (db[j] ?? 0) + real[j]) / 10))
      }
      for (const step of sb.steps) {
        expect(step.carries.length).toBe(sb.columnCount + 1)
        step.carries.forEach((c, j) => {
          if (c !== null) expect(c).toBe(real[j])
        })
      }
    }
  })

  test('column work starts at the ones column and every column beat names a real column', () => {
    for (const [a, b, d] of CASES) {
      const sb = story(a, b, d)
      const cols = sb.steps.filter((s) => s.focus !== null && s.kind === 'column')
      expect(cols.length).toBeGreaterThan(0)
      expect(cols[0].focus).toBe(0)
      for (const step of sb.steps) {
        if (step.focus !== null) {
          expect(step.focus).toBeGreaterThanOrEqual(0)
          expect(step.focus).toBeLessThan(sb.columnCount)
        }
      }
    }
  })

  test('a rejected candidate is genuinely impossible (51 + 65 needs try-and-eliminate)', () => {
    const sb = story(51, 65, 5)
    const trial = sb.steps.find((s) => s.kind === 'trial')
    expect(trial).toBeDefined()
    expect(trial?.caption).toContain('Coba A =')
    // The trial beat crosses exactly the candidate it names, and never the truth.
    const asked = trial?.domains.find((dom) => dom.asked)
    expect(asked?.cut.length).toBe(1)
    expect(asked?.cut).not.toContain(5)
    // 2 + 3 = 5 while B = 1 — the arithmetic the beat shows is real.
    expect(trial?.work).toBe('2 + 3 = 5')
  })

  test('doubling a letter is called out as even or odd, and only when true', () => {
    const sb = story(15, 85, 5) // AB + CB = ADD, ones column is B + B = D
    const parity = sb.steps.find((s) => s.workSub === 'D pasti genap')
    expect(parity).toBeDefined()
    // B + B with no carry in really is even, and D really is even.
    expect((5 + 5) % 2).toBe(0)
    expect(truthOf(15, 85)['D'] % 2).toBe(0)
  })

  test('language switch: id and en tell the same story in different words', () => {
    const id = story(15, 85, 5, 'id')
    const en = story(15, 85, 5, 'en')
    expect(id.steps.length).toBe(en.steps.length)
    expect(id.steps[0].caption).toContain('Susun menurun')
    expect(en.steps[0].caption).toContain('Stack it in columns')
    expect(id.steps[id.finalIndex].caption).toBe('Jadi B = 5.')
    expect(en.steps[en.finalIndex].caption).toBe('So B = 5.')
    // The deduction itself is language-free: same beats, same eliminations, in
    // the same order — only the wording changes.
    expect(id.steps.map((s) => s.kind)).toEqual(en.steps.map((s) => s.kind))
    expect(id.steps.map((s) => s.focus)).toEqual(en.steps.map((s) => s.focus))
    expect(id.steps.map((s) => JSON.stringify(s.domains))).toEqual(
      en.steps.map((s) => JSON.stringify(s.domains)),
    )
    expect(id.steps.map((s) => JSON.stringify(s.carries))).toEqual(
      en.steps.map((s) => JSON.stringify(s.carries)),
    )
  })

  test('malformed params fall back to the sample puzzle instead of throwing', () => {
    const sb = buildCryptarithmeticSteps({ addend1: 'x', addend2: null, askDigit: 99 }, 'id')
    expect(sb.wordA).toBe('AA')
    expect(sb.wordB).toBe('BC')
    expect(sb.wordS).toBe('ADD')
    expect(sb.steps.length).toBeGreaterThanOrEqual(4)
    expect(sb.steps[sb.finalIndex].result).toBe(true)
  })

  test('the storyboard is a pure function of its inputs', () => {
    const a = story(11, 89, 8)
    const b = story(11, 89, 8)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
