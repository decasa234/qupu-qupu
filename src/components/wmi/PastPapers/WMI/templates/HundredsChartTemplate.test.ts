import { describe, test, expect } from 'vitest'
import { paramsSchema, meta } from './HundredsChartTemplate'

describe('hundreds-chart template', () => {
  test('meta is a valid figure template', () => {
    expect(meta.id).toBe('hundreds-chart')
    expect(meta.status).toBe('template')
    expect(meta.paramsSchema).toBeDefined()
  })

  test('paramsSchema applies defaults and requires at least one highlight', () => {
    const parsed = paramsSchema.safeParse({ rows: 3, highlights: [2, 4, 6] })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.start).toBe(1) // default
      expect(parsed.data.cols).toBe(10) // default
    }
    expect(paramsSchema.safeParse({ rows: 3, highlights: [] }).success).toBe(false) // empty highlights
    expect(paramsSchema.safeParse({ highlights: [2] }).success).toBe(false) // rows missing
    expect(paramsSchema.safeParse({ rows: 11, highlights: [2] }).success).toBe(false) // rows > 10
  })
})
