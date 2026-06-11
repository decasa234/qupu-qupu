import { describe, expect, it } from 'vitest'
import { isValidPin } from './pin.js'

describe('isValidPin', () => {
  it('accepts exactly four ASCII digits', () => {
    expect(isValidPin('0000')).toBe(true)
    expect(isValidPin('0123')).toBe(true) // leading zero survives as string
    expect(isValidPin('9999')).toBe(true)
  })

  it('rejects wrong lengths', () => {
    expect(isValidPin('')).toBe(false)
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
  })

  it('rejects non-digit content', () => {
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('12 4')).toBe(false)
    expect(isValidPin('１２３４')).toBe(false) // full-width digits
    expect(isValidPin('-123')).toBe(false)
  })

  it('rejects non-string values (numbers would drop leading zeros)', () => {
    expect(isValidPin(1234)).toBe(false)
    expect(isValidPin(null)).toBe(false)
    expect(isValidPin(undefined)).toBe(false)
  })
})
