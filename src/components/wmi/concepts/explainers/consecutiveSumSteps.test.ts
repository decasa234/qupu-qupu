import { describe, test, expect } from 'vitest'
import {
  buildConsecutiveSumSteps,
  consecutiveSumOptions,
  type ConsecutiveSumParams,
} from './consecutiveSumSteps'

const ASKS = ['smallest', 'largest'] as const
const NEIGHBOURS = ['low', 'high'] as const

function everyParam(fn: (p: Required<ConsecutiveSumParams>) => void) {
  for (let n = 3; n <= 6; n++) {
    for (let start = 2; start <= 30; start++) {
      for (const ask of ASKS) {
        for (const neighbour of NEIGHBOURS) fn({ n, start, ask, neighbour })
      }
    }
  }
}

describe('buildConsecutiveSumSteps', () => {
  test('odd run: balances on a single middle, total = count × middle', () => {
    const sb = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'id')
    expect(sb.sum).toBe(50)
    expect(sb.run).toEqual([8, 9, 10, 11, 12])
    expect(sb.isOdd).toBe(true)
    expect(sb.middle).toBe(10)
    expect(sb.middles).toBeNull()
    expect(sb.sum).toBe(sb.n * (sb.middle as number))
    expect(sb.centerIndexes).toEqual([2])
    expect(sb.pairCount).toBe(2)
    expect(sb.pairSum).toBe(20)
    expect(sb.steps.map((s) => s.id)).toEqual([
      'intro',
      'ladder',
      'pair',
      'pair',
      'balance',
      'divide',
      'spread',
      'ends',
      'answer',
    ])
    // the middle is deduced first, then the run opens outward symmetrically
    expect(sb.steps.map((s) => s.revealed)).toEqual([
      [],
      [],
      [],
      [],
      [],
      [2],
      [1, 2, 3],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
    ])
    expect(sb.steps[5].equation).toBe('50 ÷ 5 = 10')
    expect(sb.steps[7].equation).toBe('8 + 9 + 10 + 11 + 12 = 50')
  })

  test('even run: no lone middle — equal pairs, then the two middles', () => {
    const sb = buildConsecutiveSumSteps({ n: 4, start: 7, ask: 'largest', neighbour: 'high' }, 'id')
    expect(sb.sum).toBe(34)
    expect(sb.run).toEqual([7, 8, 9, 10])
    expect(sb.isOdd).toBe(false)
    expect(sb.middle).toBeNull()
    expect(sb.middles).toEqual([8, 9])
    expect(sb.pairCount).toBe(2)
    expect(sb.pairSum).toBe(17)
    expect(sb.sum).toBe(sb.pairCount * sb.pairSum)
    expect(sb.centerIndexes).toEqual([1, 2])
    expect(sb.steps.map((s) => s.id)).toEqual([
      'intro',
      'ladder',
      'pair',
      'pair',
      'balance',
      'divide',
      'middles',
      'ends',
      'answer',
    ])
    expect(sb.steps[5].equation).toBe('34 ÷ 2 = 17')
    expect(sb.steps[6].equation).toBe('8 + 9 = 17')
    expect(sb.steps[6].revealed).toEqual([1, 2])
    // the pair sum is only written on the arcs once it has been worked out
    expect(sb.steps.slice(0, 5).every((s) => s.arcLabel === null)).toBe(true)
    expect(sb.steps[5].arcLabel).toBe(17)
  })

  test('shortest run (n=3): one pair, one step out to the ends', () => {
    const sb = buildConsecutiveSumSteps({ n: 3, start: 4, ask: 'smallest', neighbour: 'low' }, 'id')
    expect(sb.sum).toBe(15)
    expect(sb.pairCount).toBe(1)
    expect(sb.rings).toBe(1)
    expect(sb.steps.map((s) => s.id)).toEqual([
      'intro',
      'ladder',
      'pair',
      'balance',
      'divide',
      'ends',
      'answer',
    ])
    expect(sb.steps[5].caption).toContain('Satu langkah keluar')
  })

  test('longest run (n=6): three pairs, two rings out', () => {
    const sb = buildConsecutiveSumSteps({ n: 6, start: 25, ask: 'largest', neighbour: 'low' }, 'id')
    expect(sb.sum).toBe(165)
    expect(sb.run).toEqual([25, 26, 27, 28, 29, 30])
    expect(sb.pairCount).toBe(3)
    expect(sb.pairSum).toBe(55)
    expect(sb.sum).toBe(sb.pairCount * sb.pairSum)
    expect(sb.rings).toBe(2)
    expect(sb.steps.map((s) => s.id)).toEqual([
      'intro',
      'ladder',
      'pair',
      'pair',
      'balance',
      'divide',
      'middles',
      'spread',
      'ends',
      'answer',
    ])
    expect(sb.steps.length).toBeLessThanOrEqual(12) // stays on the dot carousel
  })

  test('the asked end drives the landing beat', () => {
    const small = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'id')
    expect(small.answer).toBe(8)
    expect(small.answerIndex).toBe(0)
    expect(small.steps[small.finalIndex].caption).toContain('Yang terkecil 8')

    const big = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'largest', neighbour: 'low' }, 'id')
    expect(big.answer).toBe(12)
    expect(big.answerIndex).toBe(4)
    expect(big.steps[big.finalIndex].caption).toContain('Yang terbesar 12')
  })

  test('only the last beat lands the answer', () => {
    everyParam((p) => {
      const sb = buildConsecutiveSumSteps(p, 'id')
      const last = sb.steps[sb.finalIndex]
      expect(last.result).toBe(true)
      expect(last.answerLabel).not.toBeNull()
      expect(last.answerIndex).toBe(sb.answerIndex)
      expect(last.hold).toBe(0)
      for (const s of sb.steps.slice(0, -1)) {
        expect(s.result).toBe(false)
        expect(s.answerLabel).toBeNull()
        expect(s.answerIndex).toBeNull()
        // no earlier beat announces an end of the run
        expect(s.caption).not.toMatch(/terkecil|terbesar|Jawabannya/)
      }
    })
  })

  test('every param combination: the run is real and every claim holds', () => {
    everyParam((p) => {
      const sb = buildConsecutiveSumSteps(p, 'id')
      // the run the board shows is genuinely consecutive and sums to the total
      expect(sb.run).toHaveLength(p.n)
      for (let i = 1; i < sb.run.length; i++) expect(sb.run[i]).toBe(sb.run[i - 1] + 1)
      expect(sb.run.reduce((a, b) => a + b, 0)).toBe(sb.sum)
      // pairing claim: outermost-inward pairs all add to the same amount
      for (let k = 0; k < sb.pairCount; k++) {
        expect(sb.run[k] + sb.run[sb.n - 1 - k]).toBe(sb.pairSum)
      }
      if (sb.isOdd) {
        expect(sb.sum).toBe(sb.n * (sb.middle as number))
        expect(sb.pairSum).toBe(2 * (sb.middle as number))
      } else {
        expect(sb.sum).toBe(sb.pairCount * sb.pairSum)
        const [m1, m2] = sb.middles as [number, number]
        expect(m2).toBe(m1 + 1)
        expect(m1 + m2).toBe(sb.pairSum)
      }
      // the reveal walks outward symmetrically and ends with the whole row
      const revealSizes = sb.steps.map((s) => s.revealed.length)
      for (let i = 1; i < revealSizes.length; i++) {
        expect(revealSizes[i]).toBeGreaterThanOrEqual(revealSizes[i - 1])
      }
      expect(sb.steps[sb.finalIndex].revealed).toHaveLength(p.n)
      for (const s of sb.steps) {
        for (const i of s.revealed) {
          const mirror = p.n - 1 - i
          expect(s.revealed.includes(mirror) || sb.centerIndexes.includes(i)).toBe(true)
        }
      }
      // the label points at the option carrying the asked end
      const options = consecutiveSumOptions(p.n, p.start, p.neighbour)
      expect(new Set(options).size).toBe(4)
      expect(options).toEqual([...options].sort((a, b) => a - b))
      const label = sb.answerLabel as string
      expect(['A', 'B', 'C', 'D']).toContain(label)
      expect(options['ABCD'.indexOf(label)]).toBe(sb.answer)
    })
  })

  test('a valid option letter from the question wins over the recomputed one', () => {
    const sb = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'id', 'C')
    expect(sb.answerLabel).toBe('C')
    // a stale fill-in answer is ignored — the label is recomputed from params
    const stale = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'id', '8')
    expect(stale.answerLabel).toBe('B')
  })

  test('pooled rows with no ask/neighbour still play (smallest, low)', () => {
    const sb = buildConsecutiveSumSteps({ n: 4, start: 7 } as ConsecutiveSumParams, 'id')
    expect(sb.ask).toBe('smallest')
    expect(sb.answer).toBe(7)
    expect(sb.answerLabel).toBe('B')
  })

  test('language switch: id and en captions both read', () => {
    const id = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'id')
    const en = buildConsecutiveSumSteps({ n: 5, start: 8, ask: 'smallest', neighbour: 'low' }, 'en')
    expect(id.steps[0].caption).toBe('5 bilangan berurutan. Jumlahnya 50.')
    expect(en.steps[0].caption).toBe('5 numbers in a row. Together they make 50.')
    expect(id.steps[1].caption).toContain('naik 1')
    expect(en.steps[1].caption).toContain('1 more')
    expect(en.steps[en.finalIndex].caption).toBe('The smallest is 8. That is B.')
    // the storyboard data is language-independent
    expect(id.steps.map((s) => s.revealed)).toEqual(en.steps.map((s) => s.revealed))
  })

  test('deterministic: same params build the same storyboard', () => {
    const a = buildConsecutiveSumSteps({ n: 6, start: 13, ask: 'largest', neighbour: 'high' }, 'id')
    const b = buildConsecutiveSumSteps({ n: 6, start: 13, ask: 'largest', neighbour: 'high' }, 'id')
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
