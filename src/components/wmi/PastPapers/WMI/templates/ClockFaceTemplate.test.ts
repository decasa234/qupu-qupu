import { describe, test, expect } from 'vitest'
import { paramsSchema, meta } from './ClockFaceTemplate'

describe('clock-face template', () => {
  test('meta is a valid figure template', () => {
    expect(meta.id).toBe('clock-face')
    expect(meta.status).toBe('template')
    expect(meta.paramsSchema).toBeDefined()
  })

  test('paramsSchema accepts a valid time and rejects out-of-range values', () => {
    expect(paramsSchema.safeParse({ hour: 12, minute: 30 }).success).toBe(true)
    expect(paramsSchema.safeParse({ hour: 1, minute: 0 }).success).toBe(true)
    expect(paramsSchema.safeParse({ hour: 0, minute: 30 }).success).toBe(false) // hour < 1
    expect(paramsSchema.safeParse({ hour: 13, minute: 0 }).success).toBe(false) // hour > 12
    expect(paramsSchema.safeParse({ hour: 6, minute: 60 }).success).toBe(false) // minute > 59
    expect(paramsSchema.safeParse({ hour: 6 }).success).toBe(false) // minute missing
  })
})
