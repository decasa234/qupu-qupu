import { describe, test, expect } from 'vitest'
import { paramsSchema, meta } from './CountOneByOneTemplate'

describe('count-one-by-one template', () => {
  test('meta is a valid template', () => {
    expect(meta.id).toBe('count-one-by-one')
    expect(meta.status).toBe('template')
    expect(meta.paramsSchema).toBeDefined()
  })

  test('paramsSchema accepts a non-empty item set and rejects empty', () => {
    expect(paramsSchema.safeParse({ items: [{ x: 1, y: 1, shape: 'dot' }] }).success).toBe(true)
    expect(paramsSchema.safeParse({ items: [] }).success).toBe(false)
    expect(paramsSchema.safeParse({ items: [{ x: 1, y: 1, shape: 'hex' }] }).success).toBe(false)
  })
})
