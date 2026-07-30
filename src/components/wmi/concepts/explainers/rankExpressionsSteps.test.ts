import { describe, test, expect } from 'vitest'
import { buildRankExpressionsSteps, type RankExpr, type RankOp } from './rankExpressionsSteps'

// Independent evaluator, written longhand so it cannot share a bug with the
// storyboard's own `evalRankExpr`. A wrong value is the worst failure this
// explainer can ship, so every number it draws is checked against this.
function truth(e: RankExpr): number {
  if (e.op === '+') {
    let n = 0
    for (let k = 0; k < e.b; k++) n += 1
    return e.a + n
  }
  if (e.op === '-') {
    let n = e.a
    for (let k = 0; k < e.b; k++) n -= 1
    return n
  }
  let n = 0
  for (let k = 0; k < e.b; k++) n += e.a
  return n
}

const P = (exprs: RankExpr[]) => ({ exprs })

// 8 × 9 = 72 wins; 20 + 5 = 25 has the fattest-looking operands and loses.
const TRAPPY: RankExpr[] = [
  { a: 12, op: '+', b: 7 },
  { a: 20, op: '+', b: 5 },
  { a: 8, op: '×', b: 9 },
  { a: 15, op: '-', b: 7 },
]

// The biggest-looking option really is the winner, so there is no trap to teach.
const HONEST: RankExpr[] = [
  { a: 3, op: '+', b: 2 },
  { a: 4, op: '×', b: 2 },
  { a: 28, op: '+', b: 11 },
  { a: 9, op: '-', b: 4 },
]

describe('buildRankExpressionsSteps', () => {
  test('every row value is the honest evaluation of its expression', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'id')
    expect(sb.rows.map((r) => r.value)).toEqual(TRAPPY.map(truth))
    expect(sb.rows.map((r) => r.value)).toEqual([19, 25, 72, 8])
    expect(sb.rows.map((r) => r.text)).toEqual(['12 + 7', '20 + 5', '8 × 9', '15 - 7'])
    expect(sb.rows.map((r) => r.label)).toEqual(['A', 'B', 'C', 'D'])
  })

  test('the winner is the greatest computed value, not the biggest-looking one', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'id')
    expect(sb.answerIndex).toBe(2)
    expect(sb.answer).toBe('C')
    expect(sb.maxValue).toBe(72)
    // the option with the largest operands is a different one — that is the lesson
    expect(sb.trapIndex).toBe(1)
  })

  test('one eval beat per expression, in choice order, each carrying the right value', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'id')
    const evals = sb.steps.filter((s) => s.phase === 'eval')
    expect(evals).toHaveLength(4)
    evals.forEach((s, i) => {
      expect(s.focus).toBe(i)
      expect(s.caption).toBe(`${sb.rows[i].label}) ${sb.rows[i].text} = ${truth(TRAPPY[i])}`)
      // reveal is cumulative: exactly the rows worked out so far
      expect(s.revealed).toEqual([...Array(i + 1).keys()])
      // nothing may be lined up before every value exists
      expect(s.chain).toBeNull()
    })
  })

  test('nothing is compared until every expression has a value', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'en')
    const compareIdx = sb.steps.findIndex((s) => s.chain !== null)
    const lastEvalIdx = sb.steps.map((s) => s.phase).lastIndexOf('eval')
    expect(compareIdx).toBe(lastEvalIdx + 1)
    sb.steps.slice(0, compareIdx).forEach((s) => expect(s.chain).toBeNull())
    // and the intro shows no values at all
    expect(sb.steps[0].revealed).toEqual([])
    expect(sb.steps[0].order).toEqual([0, 1, 2, 3])
  })

  test('the compare beat lines the values up biggest first and reorders the rows', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'id')
    const compare = sb.steps.find((s) => s.phase === 'compare')!
    expect(compare.order).toEqual([2, 1, 0, 3])
    expect(compare.chain).toEqual([72, 25, 19, 8])
    expect(compare.revealed).toEqual([0, 1, 2, 3])
    // the chain really is sorted, and really is the row values
    expect(compare.chain).toEqual([...sb.rows.map((r) => r.value)].sort((a, b) => b - a))
  })

  test('the surface-shape trap gets its own beat, right before the answer', () => {
    const sb = buildRankExpressionsSteps(P(TRAPPY), 'id')
    const trap = sb.steps.find((s) => s.phase === 'trap')!
    expect(trap.trap).toBe(1)
    expect(trap.caption).toBe('B) 20 + 5 terlihat besar, hasilnya hanya 25.')
    expect(sb.steps.indexOf(trap)).toBe(sb.finalIndex - 1)
    // it must not give the winner away
    expect(trap.answer).toBeNull()
    expect(trap.caption).not.toContain('72')
    expect(trap.win).toBeNull()

    const en = buildRankExpressionsSteps(P(TRAPPY), 'en')
    expect(en.steps.find((s) => s.phase === 'trap')!.caption).toBe('B) 20 + 5 looks big, but it only makes 25.')
  })

  test('no trap beat when the biggest-looking expression really is the biggest', () => {
    const sb = buildRankExpressionsSteps(P(HONEST), 'id')
    expect(sb.rows.map((r) => r.value)).toEqual(HONEST.map(truth))
    expect(sb.answer).toBe('C')
    expect(sb.trapIndex).toBeNull()
    expect(sb.steps.some((s) => s.phase === 'trap')).toBe(false)
    expect(sb.steps).toHaveLength(7)
  })

  test('only the final beat carries the answer, and it is the only result beat', () => {
    for (const exprs of [TRAPPY, HONEST]) {
      for (const lang of ['en', 'id'] as const) {
        const sb = buildRankExpressionsSteps(P(exprs), lang)
        expect(sb.steps.length).toBeGreaterThanOrEqual(3)
        expect(sb.finalIndex).toBe(sb.steps.length - 1)
        sb.steps.forEach((s, i) => {
          expect(s.answer === null).toBe(i !== sb.finalIndex)
          expect(s.result).toBe(i === sb.finalIndex)
          expect(s.win === null).toBe(i !== sb.finalIndex)
        })
        const last = sb.steps[sb.finalIndex]
        expect(last.answer).toBe(sb.answer)
        expect(last.win).toBe(sb.answerIndex)
        expect(last.caption).toContain(sb.answer)
        expect(last.caption).toContain(String(sb.rows[sb.answerIndex].value))
        expect(last.hold).toBe(0)
      }
    }
  })

  test('captions follow lang but the beat structure does not', () => {
    const en = buildRankExpressionsSteps(P(TRAPPY), 'en')
    const id = buildRankExpressionsSteps(P(TRAPPY), 'id')
    expect(en.steps.length).toBe(id.steps.length)
    expect(en.steps.map((s) => s.phase)).toEqual(id.steps.map((s) => s.phase))
    expect(en.steps[0].caption).toBe('They look different. Work them out one at a time.')
    expect(id.steps[0].caption).toBe('Bentuknya beda-beda. Hitung dulu satu per satu.')
    expect(en.steps[en.finalIndex].caption).toBe('The largest value is 72, so the answer is C.')
    expect(id.steps[id.finalIndex].caption).toBe('Nilai terbesar adalah 72, jadi jawabannya C.')
    // the numeric eval beats are language-neutral
    expect(en.steps[1].caption).toBe(id.steps[1].caption)
  })

  test('malformed params degrade instead of throwing', () => {
    for (const bad of [null, undefined, {}, { exprs: 'nope' }, { exprs: [] }, { exprs: [null, 3] }]) {
      const sb = buildRankExpressionsSteps(bad, 'id')
      expect(sb.rows).toEqual([])
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.maxValue).toBe(1)
      expect(sb.finalIndex).toBe(sb.steps.length - 1)
      sb.steps.forEach((s) => expect(s.caption).not.toMatch(/undefined|NaN/))
    }
  })

  test('unexpected operand shapes are dropped, valid siblings survive', () => {
    const sb = buildRankExpressionsSteps(
      { exprs: [{ a: 5, op: '+', b: 4 }, { a: 'x', op: '+', b: 2 }, { a: 3, op: '×', b: 3 }] },
      'id',
    )
    expect(sb.rows.map((r) => r.text)).toEqual(['5 + 4', '3 × 3'])
    expect(sb.rows.map((r) => r.value)).toEqual([9, 9])
    // equal values keep choice order, so the first one stays the winner
    expect(sb.answer).toBe('A')
    expect(sb.steps.find((s) => s.phase === 'compare')!.order).toEqual([0, 1])
  })

  test('alternate minus and times glyphs normalise to the generator ops', () => {
    const sb = buildRankExpressionsSteps({ exprs: [{ a: 9, op: '−', b: 4 }, { a: 3, op: '*', b: 5 }] }, 'en')
    expect(sb.rows.map((r) => r.op)).toEqual<RankOp[]>(['-', '×'])
    expect(sb.rows.map((r) => r.value)).toEqual([5, 15])
    expect(sb.answer).toBe('B')
  })

  test('sweep: invariants hold across many generated boards', () => {
    // Deterministic LCG so the sweep is reproducible.
    let seed = 20260730
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
    const gen = (): RankExpr => {
      const op = (['+', '-', '×'] as const)[int(0, 2)]
      if (op === '-') {
        const b = int(1, 12)
        return { a: int(b + 1, 30), op, b }
      }
      if (op === '×') return { a: int(1, 12), op, b: int(1, 12) }
      return { a: int(1, 30), op, b: int(1, 12) }
    }

    let trapSeen = 0
    let noTrapSeen = 0
    for (let n = 0; n < 400; n++) {
      const exprs = [gen(), gen(), gen(), gen()]
      const values = exprs.map(truth)
      if (new Set(values).size !== values.length) continue // generator forbids ties
      const sb = buildRankExpressionsSteps(P(exprs), n % 2 ? 'id' : 'en')

      expect(sb.rows.map((r) => r.value)).toEqual(values)
      const maxV = Math.max(...values)
      expect(sb.answer).toBe(['A', 'B', 'C', 'D'][values.indexOf(maxV)])
      expect(sb.maxValue).toBe(maxV)
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)

      // the line-up is a true descending sort of exactly those four values
      const chain = sb.steps[sb.finalIndex].chain!
      expect(chain).toEqual([...values].sort((a, b) => b - a))
      expect(sb.steps[sb.finalIndex].order.map((i) => values[i])).toEqual(chain)

      // no beat before the last may name the answer
      sb.steps.slice(0, sb.finalIndex).forEach((s) => {
        expect(s.answer).toBeNull()
        expect(s.win).toBeNull()
        expect(s.caption).not.toMatch(/undefined|NaN/)
      })

      // trap presence exactly matches "biggest operands is not the winner"
      const sums = exprs.map((e) => e.a + e.b)
      const bigIdx = sums.indexOf(Math.max(...sums))
      const expectTrap = bigIdx !== values.indexOf(maxV)
      expect(sb.trapIndex).toBe(expectTrap ? bigIdx : null)
      const trapBeat = sb.steps.find((s) => s.phase === 'trap')
      expect(!!trapBeat).toBe(expectTrap)
      if (trapBeat) {
        trapSeen++
        expect(trapBeat.caption).toContain(String(values[bigIdx]))
      } else {
        noTrapSeen++
      }
    }
    // the sweep genuinely exercised both branches
    expect(trapSeen).toBeGreaterThan(20)
    expect(noTrapSeen).toBeGreaterThan(20)
  })
})
