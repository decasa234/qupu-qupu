import { describe, expect, it } from 'vitest'
import { statusTone } from './adminStatus'

describe('statusTone', () => {
  it('maps published to success', () => {
    expect(statusTone('published')).toEqual({ tone: 'success', label: 'Diterbitkan' })
  })
  it('maps draft to warn', () => {
    expect(statusTone('draft')).toEqual({ tone: 'warn', label: 'Draft' })
  })
  it('maps needs-review to brand', () => {
    expect(statusTone('needs-review')).toEqual({ tone: 'brand', label: 'Perlu ditinjau' })
  })
  it('falls back to neutral for unknown', () => {
    expect(statusTone('whatever')).toEqual({ tone: 'neutral', label: 'whatever' })
  })
})
