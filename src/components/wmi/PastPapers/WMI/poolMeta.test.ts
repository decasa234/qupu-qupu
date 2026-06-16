import { describe, test, expect } from 'vitest'
import { validatePoolMeta } from './poolMeta'

describe('validatePoolMeta', () => {
  test('accepts a complete bespoke meta', () => {
    const errs = validatePoolMeta({
      id: 'cube-layer-count',
      title: 'Cube layer count',
      summary: 'Counts cubes layer by layer.',
      useWhen: 'How many cubes in a pile.',
      tags: ['counting', '3d'],
      grades: [1, 2, 3],
      status: 'bespoke',
    })
    expect(errs).toEqual([])
  })

  test('flags missing id and bad status', () => {
    const errs = validatePoolMeta({
      title: 'x',
      summary: 'y',
      useWhen: 'z',
      tags: [],
      grades: [1],
      status: 'nope',
    } as never)
    expect(errs.some((e) => e.includes('id'))).toBe(true)
    expect(errs.some((e) => e.includes('status'))).toBe(true)
  })

  test('templates must declare a paramsSchema', () => {
    const errs = validatePoolMeta({
      id: 'count-one-by-one',
      title: 'Count',
      summary: 's',
      useWhen: 'u',
      tags: ['counting'],
      grades: [1],
      status: 'template',
    })
    expect(errs.some((e) => e.includes('paramsSchema'))).toBe(true)
  })
})
