import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { clearClientCache, getCachedValue, makeCacheKey, setCachedValue } from './clientCache'

describe('clientCache', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    vi.useRealTimers()
    clearClientCache()
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.window = originalWindow
  })

  test('makeCacheKey sorts params stably', () => {
    expect(makeCacheKey('/public/videos', { b: '2', a: '1' })).toBe('/public/videos?a=1&b=2')
    expect(makeCacheKey('/public/videos', { a: '1', b: '2' })).toBe('/public/videos?a=1&b=2')
  })

  test('makeCacheKey ignores empty object param values', () => {
    expect(makeCacheKey('/public/videos', { a: '1', empty: '', missing: undefined, none: null })).toBe('/public/videos?a=1')
  })

  test('makeCacheKey ignores empty URLSearchParams values', () => {
    const params = new URLSearchParams([
      ['empty', ''],
      ['a', '1'],
    ])

    expect(makeCacheKey('/public/videos', params)).toBe('/public/videos?a=1')
  })

  test('makeCacheKey filters empty array param items', () => {
    expect(makeCacheKey('/public/videos', { tag: ['', 'math', null, undefined, 'science'] })).toBe('/public/videos?tag=math&tag=science')
  })

  test('returns cached value before ttl expires', () => {
    vi.useFakeTimers()
    setCachedValue('answer', { ok: true }, 1000)
    vi.advanceTimersByTime(999)

    expect(getCachedValue<{ ok: boolean }>('answer')).toEqual({ ok: true })
  })

  test('returns null after ttl expires', () => {
    vi.useFakeTimers()
    setCachedValue('answer', { ok: true }, 1000)
    vi.advanceTimersByTime(1000)

    expect(getCachedValue<{ ok: boolean }>('answer')).toBeNull()
  })

  test('does not throw when sessionStorage getter is blocked', () => {
    globalThis.window = {} as Window & typeof globalThis
    Object.defineProperty(globalThis.window, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked')
      },
    })

    expect(getCachedValue('missing')).toBeNull()
    expect(() => setCachedValue('answer', { ok: true }, 1000)).not.toThrow()
    expect(getCachedValue<{ ok: boolean }>('answer')).toEqual({ ok: true })
    expect(() => clearClientCache()).not.toThrow()
    expect(getCachedValue('answer')).toBeNull()
  })
})
