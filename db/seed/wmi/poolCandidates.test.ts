import { describe, test, expect } from 'vitest'
import { clusterBespoke } from './poolCandidates'
import type { PoolEntry } from './poolCatalog'

const mk = (id: string, tag: string, status: 'template' | 'bespoke' = 'bespoke'): PoolEntry => ({
  id,
  file: id,
  title: id,
  summary: '',
  useWhen: '',
  tags: [tag],
  grades: [],
  status,
  usedBy: [],
})

describe('clusterBespoke', () => {
  test('excludes tags already covered by a template, and clusters below the threshold', () => {
    const entries = [
      mk('a', 'count'),
      mk('b', 'count'),
      mk('c', 'count'),
      mk('t', 'count', 'template'), // a template covers "count" → excluded
      mk('d', 'balance'),
      mk('e', 'balance'), // only 2 → below min
    ]
    expect(clusterBespoke(entries, 3)).toEqual([])
  })

  test('flags a 3+ bespoke cluster with no template, sorted by count desc', () => {
    const entries = [
      mk('a', 'maze'),
      mk('b', 'maze'),
      mk('c', 'maze'),
      mk('d', 'fold'),
      mk('e', 'fold'),
      mk('f', 'fold'),
      mk('g', 'fold'),
      mk('h', 'solo'),
    ]
    expect(clusterBespoke(entries, 3)).toEqual([
      { tag: 'fold', count: 4, ids: ['d', 'e', 'f', 'g'] },
      { tag: 'maze', count: 3, ids: ['a', 'b', 'c'] },
    ])
  })
})
