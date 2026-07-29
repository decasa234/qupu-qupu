import { describe, test, expect } from 'vitest'
import { buildSortCountSteps, type SortCountParams } from './sortCountSteps'

const base: SortCountParams = {
  attribute: 'shape',
  categories: ['circle', 'triangle', 'star'],
  counts: [6, 4, 5],
  layout: 'scatter',
  ask: 'most',
  askIndices: [],
  seed: 7,
}

const build = (over: Partial<SortCountParams> = {}, lang: 'en' | 'id' = 'en') =>
  buildSortCountSteps({ ...base, ...over }, lang)

describe('buildSortCountSteps — the pile', () => {
  test('every object is in exactly one group, and the groups match the counts', () => {
    const sb = build({ counts: [7, 3, 12], ask: 'count-one', askIndices: [2] })
    expect(sb.pile).toHaveLength(22)
    expect(sb.itemsByGroup.map((g) => g.length)).toEqual([7, 3, 12])
    const seen = new Set(sb.itemsByGroup.flat())
    expect(seen.size).toBe(22)
    expect(Math.max(...seen)).toBe(21)
    expect(sb.total).toBe(22)
  })

  test('the pile is jumbled but deterministic for a seed', () => {
    const a = build({ counts: [5, 5, 5] })
    const b = build({ counts: [5, 5, 5] })
    expect(a.pile).toEqual(b.pile)
    // a jumbled pile is not simply group 0, then 1, then 2
    expect(a.pile).not.toEqual([...a.pile].sort((x, y) => x - y))
  })
})

describe('buildSortCountSteps — shared opening', () => {
  test('beat 1 is the untouched pile and beat 2 is the sort into groups', () => {
    const sb = build()
    expect(sb.steps[0].phase).toBe('mixed')
    expect(sb.steps[0].grouped).toBe(false)
    expect(sb.steps[0].groups).toEqual([])
    expect(sb.steps[1].phase).toBe('sort')
    expect(sb.steps[1].grouped).toBe(true)
    expect(sb.steps[1].groups).toHaveLength(3)
    // the sort beat groups but does NOT count
    expect(sb.steps[1].groups.every((g) => g.tally === null)).toBe(true)
  })

  test('every ask form produces at least three beats and lands the answer last only', () => {
    const asks = [
      build({ ask: 'count-one', askIndices: [1] }),
      build({ ask: 'most' }),
      build({ ask: 'difference', askIndices: [0, 1] }),
      build({ ask: 'how-many-kinds' }),
    ]
    for (const sb of asks) {
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.finalIndex).toBe(sb.steps.length - 1)
      const last = sb.steps[sb.finalIndex]
      expect(last.result).toBe(true)
      expect(last.answer).toBe(sb.answer)
      expect(last.caption).toContain(sb.answer)
      expect(last.hold).toBe(0)
      const earlier = sb.steps.slice(0, -1)
      expect(earlier.every((s) => !s.result && s.answer === null)).toBe(true)
      expect(earlier.every((s) => s.hold > 0)).toBe(true)
    }
  })
})

describe('buildSortCountSteps — count-one', () => {
  test('narrows to the asked kind and only then counts it', () => {
    const sb = build({ ask: 'count-one', askIndices: [1] })
    expect(sb.answer).toBe('4')
    expect(sb.steps.map((s) => s.phase)).toEqual(['mixed', 'sort', 'trap', 'focus', 'result'])
    const focus = sb.steps[3]
    expect(focus.groups.filter((g) => g.state === 'focus').map((g) => g.index)).toEqual([1])
    expect(focus.groups.filter((g) => g.state === 'dim').map((g) => g.index)).toEqual([0, 2])
    // the asked group's tally is withheld until the final beat
    expect(sb.steps.slice(0, -1).every((s) => s.groups.every((g) => g.tally === null))).toBe(true)
    expect(sb.steps[4].groups[1].tally).toBe(4)
  })

  test('the whole pile is named as the tempting wrong count, never as the answer', () => {
    const sb = build({ ask: 'count-one', askIndices: [1] })
    const trap = sb.steps[2]
    expect(trap.phase).toBe('trap')
    expect(trap.trapLabel).toContain('15')
    expect(trap.caption).toContain('15')
    expect(sb.answer).not.toBe('15')
  })
})

describe('buildSortCountSteps — most', () => {
  test('counts group by group, compares, then crowns the biggest', () => {
    const sb = build({ ask: 'most' })
    expect(sb.winner).toBe(0)
    expect(sb.answer).toBe('A')
    // 6 vs 5 is close, so the runner-up gets its own "do not guess" beat
    expect(sb.steps.map((s) => s.phase)).toEqual([
      'mixed',
      'sort',
      'trap',
      'count',
      'count',
      'count',
      'compare',
      'result',
    ])
    expect(sb.steps[2].trapLabel).toBe('stars')
    // tallies accumulate, one group per count beat
    expect(sb.steps[3].groups.map((g) => g.tally)).toEqual([6, null, null])
    expect(sb.steps[4].groups.map((g) => g.tally)).toEqual([6, 4, null])
    expect(sb.steps[5].groups.map((g) => g.tally)).toEqual([6, 4, 5])
    expect(sb.steps[6].compareLabel).toBe('6 > 5 > 4')
    const last = sb.steps[sb.finalIndex]
    expect(last.groups.filter((g) => g.state === 'win').map((g) => g.index)).toEqual([0])
  })

  test('a clear leader gets no runner-up trap beat', () => {
    const sb = build({ ask: 'most', counts: [11, 4, 3] })
    expect(sb.steps.some((s) => s.phase === 'trap')).toBe(false)
    expect(sb.steps[sb.finalIndex].caption).toContain('11')
  })

  test('the choice letter follows the group order', () => {
    const sb = build({ ask: 'most', counts: [3, 9, 4] })
    expect(sb.winner).toBe(1)
    expect(sb.answer).toBe('B')
  })
})

describe('buildSortCountSteps — difference', () => {
  test('counts both groups, parks the tempting number, lines them up, then subtracts', () => {
    const sb = build({ ask: 'difference', askIndices: [0, 1] })
    expect(sb.answer).toBe('2')
    expect(sb.steps.map((s) => s.phase)).toEqual([
      'mixed',
      'sort',
      'count',
      'count',
      'trap',
      'lineup',
      'result',
    ])
    // the trap is the size of the bigger group, not the gap
    expect(sb.steps[4].trapLabel).toBe('6')
    // the line-up shows only the two compared groups, bigger first
    const lineup = sb.steps[5]
    expect(lineup.groups.map((g) => g.index)).toEqual([0, 1])
    expect(lineup.groups[0].extraFrom).toBe(4)
    expect(lineup.groups[1].extraFrom).toBeNull()
    expect(sb.steps[sb.finalIndex].caption).toContain('6 - 4 = 2')
  })

  test('the extras stick out of whichever group is bigger', () => {
    const sb = build({ ask: 'difference', askIndices: [2, 0], counts: [4, 3, 9] })
    expect(sb.answer).toBe('5')
    const lineup = sb.steps.find((s) => s.phase === 'lineup')!
    expect(lineup.groups.map((g) => g.index)).toEqual([2, 0])
    expect(lineup.groups[0].extraFrom).toBe(4)
    expect(lineup.groups[0].count - (lineup.groups[0].extraFrom ?? 0)).toBe(5)
  })
})

describe('buildSortCountSteps — how-many-kinds', () => {
  test('counts the groups, never the objects', () => {
    const sb = build({ ask: 'how-many-kinds' })
    expect(sb.answer).toBe('3')
    expect(sb.steps.map((s) => s.phase)).toEqual(['mixed', 'sort', 'trap', 'kinds', 'result'])
    // no item tally is ever shown — that is the whole point
    expect(sb.steps.every((s) => s.groups.every((g) => g.tally === null))).toBe(true)
    // the trap is the object count, and it gets its own beat
    expect(sb.steps[2].trapLabel).toContain('15')
    // the groups are numbered only on the beat that answers
    expect(sb.steps[3].groups.every((g) => g.ordinal === null)).toBe(true)
    expect(sb.steps[4].groups.map((g) => g.ordinal)).toEqual([1, 2, 3])
  })

  test('four kinds answers four', () => {
    const sb = build({ ask: 'how-many-kinds', categories: ['circle', 'triangle', 'star', 'square'], counts: [3, 4, 5, 6] })
    expect(sb.answer).toBe('4')
    expect(sb.steps[sb.finalIndex].groups.map((g) => g.ordinal)).toEqual([1, 2, 3, 4])
  })
})

describe('buildSortCountSteps — language and robustness', () => {
  test('id and en carry the same numbers in their own words', () => {
    const en = build({ ask: 'count-one', askIndices: [0] }, 'en')
    const id = build({ ask: 'count-one', askIndices: [0] }, 'id')
    expect(en.steps[1].caption).toBe('Sort the same ones together first.')
    expect(id.steps[1].caption).toBe('Kelompokkan dulu yang sama.')
    expect(en.steps[en.finalIndex].caption).toContain('circles')
    expect(id.steps[id.finalIndex].caption).toContain('lingkaran')
    expect(en.answer).toBe(id.answer)
  })

  test('every attribute keeps its own scene words', () => {
    const balloons = build({ attribute: 'colour', categories: ['red', 'blue', 'green'], ask: 'how-many-kinds' }, 'id')
    expect(balloons.steps[2].caption).toContain('warna')
    expect(balloons.steps[balloons.finalIndex].caption).toContain('balon merah')
    const fruit = build({ attribute: 'fruit', categories: ['apple', 'banana', 'grape'], ask: 'how-many-kinds' }, 'id')
    expect(fruit.steps[fruit.finalIndex].caption).toContain('jenis')
  })

  test('broken params fall back to a working sample instead of throwing', () => {
    for (const bad of [null, undefined, {}, { attribute: 'nope' }, { attribute: 'shape', counts: [1] }]) {
      const sb = buildSortCountSteps(bad, 'id')
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.steps[sb.finalIndex].answer).toBe(sb.answer)
      expect(sb.pile.length).toBe(sb.total)
    }
  })

  test('out-of-range ask indices are clamped rather than producing NaN', () => {
    const sb = build({ ask: 'difference', askIndices: [9, 9] })
    expect(Number.isNaN(Number(sb.answer))).toBe(false)
    const lineup = sb.steps.find((s) => s.phase === 'lineup')!
    expect(new Set(lineup.groups.map((g) => g.index)).size).toBe(2)
  })
})
