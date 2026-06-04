import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  hasAnalyticsConsent,
  setCookieConsent,
} from './cookieConsent'

describe('cookieConsent', () => {
  let storage: Record<string, string>

  beforeEach(() => {
    storage = {}
    vi.restoreAllMocks()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
    })
  })

  test('defaults to undecided and keeps analytics disabled', () => {
    expect(getCookieConsent()).toBe('undecided')
    expect(hasAnalyticsConsent()).toBe(false)
  })

  test('stores accepted consent and enables analytics', () => {
    setCookieConsent('accepted')

    expect(storage[COOKIE_CONSENT_KEY]).toBe('accepted')
    expect(getCookieConsent()).toBe('accepted')
    expect(hasAnalyticsConsent()).toBe(true)
  })

  test('stores declined consent and disables analytics', () => {
    setCookieConsent('declined')

    expect(storage[COOKIE_CONSENT_KEY]).toBe('declined')
    expect(getCookieConsent()).toBe('declined')
    expect(hasAnalyticsConsent()).toBe(false)
  })

  test('safely handles localStorage failures', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('blocked')
      }),
      setItem: vi.fn(() => {
        throw new Error('blocked')
      }),
    })

    expect(getCookieConsent()).toBe('undecided')
    expect(hasAnalyticsConsent()).toBe(false)
    expect(() => setCookieConsent('accepted')).not.toThrow()
  })
})
