import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Figure, {
  SORT_COUNT_HUE,
  buildSortCountItems,
  sortCountAriaLabel,
  sortCountFill,
  sortCountGlyph,
  sortCountHash as figureHash,
} from '../sort-count-by-attribute'
import Explainer from './SortCountByAttributeExplainer'
import { buildSortCountSteps, buildPile, sortCountHash, type SortCountParams } from './sortCountSteps'

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

// --- one source of truth for the objects ------------------------------------
// The explainer replays the pile the question drew. It used to hold its own copy
// of the glyphs, the colour map, the hash and the pile builder — and a review
// that redrew the banana and the orange only touched the figure, so the two
// surfaces silently disagreed. These tests fail loudly if a copy ever comes back.

const POOLS: Record<string, string[]> = {
  shape: ['circle', 'triangle', 'square', 'star'],
  colour: ['red', 'blue', 'orange', 'green', 'yellow'],
  fruit: ['apple', 'banana', 'orange', 'grape'],
}

/** Every drawn tag with its fill, e.g. `path #D64545` — order preserved. */
const shapeSig = (markup: string): string[] =>
  (markup.match(/<(?:path|circle|ellipse|polygon|rect)[^>]*>/g) ?? []).map((tag) => {
    const name = tag.match(/^<(\w+)/)![1]
    return `${name} ${tag.match(/fill="([^"]*)"/)?.[1] ?? 'none'}`
  })

describe('sort-count-by-attribute — the figure owns the objects', () => {
  test('the pile builder and the hash are the figure’s, not a second copy', () => {
    expect(buildPile).toBe(buildSortCountItems)
    expect(sortCountHash).toBe(figureHash)
  })

  test('the storyboard pile is exactly the pile the figure lays out', () => {
    const params: Array<Partial<SortCountParams>> = [
      { counts: [6, 4, 5], seed: 7 },
      { counts: [12, 3, 3, 9], categories: ['circle', 'triangle', 'star', 'square'], seed: 0 },
      { counts: [3, 3, 3], seed: 999 },
      { attribute: 'fruit', categories: ['apple', 'banana', 'grape'], counts: [8, 5, 11], seed: 314 },
    ]
    for (const over of params) {
      const sb = build(over)
      expect(sb.pile).toEqual(buildSortCountItems(sb.counts, sb.seed))
    }
  })

  test('both surfaces colour every kind from the one shared map', () => {
    for (const [attribute, keys] of Object.entries(POOLS)) {
      for (const key of keys) {
        const hue = SORT_COUNT_HUE[`${attribute}:${key}`]
        expect(hue, `${attribute}:${key} has no hue`).toBeDefined()
        expect(sortCountFill(attribute as 'shape', key)).toBe(hue)

        const p = { attribute, categories: [key, key], counts: [2, 2], layout: 'grid', ask: 'most', askIndices: [], seed: 3 }
        const figure = renderToStaticMarkup(createElement(Figure, { params: p }))
        const explainer = renderToStaticMarkup(createElement(Explainer, { params: p, lang: 'id' } as never))
        expect(figure, `figure lost ${attribute}:${key}`).toContain(`fill="${hue}"`)
        expect(explainer, `explainer lost ${attribute}:${key}`).toContain(`fill="${hue}"`)
        // same parts with the same fills on both surfaces — the explainer adds
        // chrome (the crown, the trap cross), so the figure's set must be inside it
        const inExplainer = new Set(shapeSig(explainer))
        for (const part of new Set(shapeSig(figure))) {
          expect(inExplainer.has(part), `explainer missing "${part}" for ${attribute}:${key}`).toBe(true)
        }
      }
    }
  })

  test('the explainer draws the figure’s glyph, byte for byte', () => {
    for (const [attribute, keys] of Object.entries(POOLS)) {
      for (const key of keys) {
        const markup = renderToStaticMarkup(
          createElement(Explainer, {
            params: { attribute, categories: [key, key, key], counts: [3, 3, 3], layout: 'grid', ask: 'most', askIndices: [], seed: 1 },
            lang: 'id',
          } as never),
        )
        // Each object is its own square <svg>; the explainer sizes the glyph at
        // half-extent `size / 2.3` (see buildGeometry). Rebuild the same call
        // and require an exact match of the rendered SVG children.
        const box = markup.match(/<svg viewBox="0 0 (\d+) \1"[^>]*role="presentation">(.*?)<\/svg>/)
        expect(box, `no item svg for ${attribute}:${key}`).not.toBeNull()
        const size = Number(box![1])
        const expected = renderToStaticMarkup(
          createElement(
            'svg',
            null,
            sortCountGlyph(attribute as 'shape', key, size / 2, size / 2, size / 2.3, sortCountFill(attribute as 'shape', key)),
          ),
        ).replace(/^<svg>|<\/svg>$/g, '')
        expect(box![2], `${attribute}:${key} drifted from the figure`).toBe(expected)
      }
    }
  })
})

// --- aria-label policy ------------------------------------------------------
// Describe the picture richly enough to attempt the question, but never state
// anything that IS the answer to this ask.

describe('sort-count-by-attribute — the figure’s aria-label', () => {
  const label = (over: Record<string, unknown>) =>
    renderToStaticMarkup(
      createElement(Figure, {
        params: { attribute: 'fruit', categories: ['apple', 'banana', 'grape'], counts: [7, 4, 9], layout: 'grid', seed: 5, ...over },
      }),
    ).match(/aria-label="([^"]*)"/)![1]

  test('no ask ever states a count, a total, or any digit', () => {
    for (const ask of ['count-one', 'most', 'difference', 'how-many-kinds', undefined]) {
      const l = label({ ask, askIndices: ask === 'difference' ? [2, 1] : [0] })
      expect(l, `${ask}: ${l}`).not.toMatch(/\d/)
      expect(l).not.toContain('20') // the total
    }
  })

  test('count-one, difference and most name the kinds — that is not the answer', () => {
    for (const ask of ['count-one', 'difference', 'most']) {
      const l = label({ ask, askIndices: ask === 'difference' ? [2, 1] : [0] })
      expect(l).toContain('apel')
      expect(l).toContain('pisang')
      expect(l).toContain('anggur')
      // never singles out a winner
      expect(l).not.toMatch(/paling|terbanyak|terbesar/)
    }
  })

  test('how-many-kinds neither lists nor counts the kinds', () => {
    const l = label({ ask: 'how-many-kinds', askIndices: [] })
    expect(l).toBe(
      'Gambar berisi beberapa jenis buah yang tercampur jadi satu. Kelompokkan yang sama, lalu hitung sendiri ada berapa jenisnya.',
    )
    for (const kind of ['apel', 'pisang', 'anggur', 'jeruk']) expect(l).not.toContain(kind)
    expect(l.replace(/jadi satu/g, '')).not.toMatch(/\b(satu|dua|tiga|empat|lima)\b/)
  })

  test('an unknown ask is treated as the guarded one, because it might be', () => {
    expect(sortCountAriaLabel('fruit', ['apple', 'banana'], null)).toBe(
      sortCountAriaLabel('fruit', ['apple', 'banana'], 'how-many-kinds'),
    )
    expect(label({ ask: 'nonsense' })).toBe(label({ ask: 'how-many-kinds' }))
  })

  test('each scene keeps its own words for a kind', () => {
    expect(sortCountAriaLabel('colour', [], 'how-many-kinds')).toContain('beberapa warna balon')
    expect(sortCountAriaLabel('shape', [], 'how-many-kinds')).toContain('beberapa jenis bentuk')
    expect(sortCountAriaLabel('fruit', [], 'how-many-kinds')).toContain('beberapa jenis buah')
    expect(sortCountAriaLabel('shape', ['circle', 'star'], 'most')).toBe(
      'Gambar berisi bentuk yang tercampur jadi satu: lingkaran, bintang. Kelompokkan yang sama, lalu hitung sendiri tiap kelompoknya.',
    )
  })
})
