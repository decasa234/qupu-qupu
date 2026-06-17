import { describe, test, expect } from 'vitest'
import { paramsSchema, meta } from './TryEliminateTemplate'

const good = {
  intro_en: 'Check each option.',
  intro_id: 'Periksa tiap pilihan.',
  items: [{ text_en: '21 > 16', text_id: '21 > 16', ok: true }],
  final_en: 'So 21 is largest (B).',
  final_id: 'Jadi 21 terbesar (B).',
  aria_en: 'a',
  aria_id: 'b',
}

describe('try-and-eliminate template', () => {
  test('meta is a valid non-figure template', () => {
    expect(meta.id).toBe('try-and-eliminate')
    expect(meta.status).toBe('template')
    expect(meta.paramsSchema).toBeDefined()
  })

  test('paramsSchema accepts a full story and rejects a missing field', () => {
    expect(paramsSchema.safeParse(good).success).toBe(true)
    const missing: Partial<typeof good> = { ...good }
    delete missing.final_en
    expect(paramsSchema.safeParse(missing).success).toBe(false)
  })
})
