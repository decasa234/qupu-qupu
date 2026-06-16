import { describe, test, expect } from 'vitest'
import { buildPoolOutputs, type PoolEntry } from './poolCatalog'

const entries: PoolEntry[] = [
  {
    id: 'cube-layer-count',
    file: 'CubeLayerCountTemplate',
    title: 'Cube layer count',
    summary: 'Counts cubes layer by layer.',
    useWhen: 'How many cubes in a pile.',
    tags: ['counting', '3d'],
    grades: [1, 2, 3],
    status: 'template',
    paramsExample: '{ "layers": [8,7,4] }',
    usedBy: ['WMI-19P1A-Q4'],
  },
  {
    id: 'apple-add19-p1',
    file: 'AppleAdd19P1Illustration',
    title: 'Apple make-a-ten',
    summary: 'Two apple boxes, make a ten then add.',
    useWhen: 'Add two one-digit groups.',
    tags: ['arithmetic'],
    grades: [1],
    status: 'bespoke',
    usedBy: ['WMI-19P1A-Q8'],
  },
]

describe('buildPoolOutputs', () => {
  test('templates render rich, bespoke render one-liners grouped by tag', () => {
    const { md, json } = buildPoolOutputs(entries)
    expect(md).toContain('## Templates')
    expect(md).toContain('cube-layer-count')
    expect(md).toContain('"layers"') // example shown for templates
    expect(md).toContain('## Bespoke (copy-adapt)')
    expect(md).toContain('apple-add19-p1')

    const parsed = JSON.parse(json) as PoolEntry[]
    expect(parsed.find((e) => e.id === 'cube-layer-count')!.status).toBe('template')
    expect(parsed).toHaveLength(2)
  })
})
