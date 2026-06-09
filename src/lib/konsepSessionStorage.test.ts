import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  clearKonsepSession,
  readKonsepSession,
  saveKonsepSession,
  type SavedKonsepSession,
} from './konsepSessionStorage'

function makeFakeStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key)
    },
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}

function makeSession(overrides: Partial<SavedKonsepSession> = {}): SavedKonsepSession {
  return {
    childId: 'child-1',
    subjectKey: 'g1-add-sub',
    planSlugs: Array.from({ length: 20 }, (_, i) => `concept-${i % 4}`),
    answers: [{ concept_instance_id: 'ci-1', selected_answer: 'A' }],
    idx: 1,
    startedAt: Date.now(),
    ...overrides,
  }
}

describe('konsepSessionStorage', () => {
  const originalWindow = globalThis.window
  let storage: Storage

  beforeEach(() => {
    vi.useRealTimers()
    storage = makeFakeStorage()
    globalThis.window = { sessionStorage: storage } as Window & typeof globalThis
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.window = originalWindow
  })

  test('save then read round-trips for matching subjectKey + childId', () => {
    const session = makeSession()
    saveKonsepSession(session)

    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('reading a different subjectKey returns null and leaves the record alone', () => {
    const session = makeSession()
    saveKonsepSession(session)

    expect(readKonsepSession('g1-geometry', 'child-1')).toBeNull()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('a different child cannot resume — record is cleared', () => {
    saveKonsepSession(makeSession())

    expect(readKonsepSession('g1-add-sub', 'child-2')).toBeNull()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
  })

  test('stale records (>2h) are ignored and cleared', () => {
    saveKonsepSession(makeSession({ startedAt: Date.now() - 3 * 60 * 60 * 1000 }))

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:g1-add-sub')).toBeNull()
  })

  test('records just under 2h are still resumable', () => {
    const session = makeSession({ startedAt: Date.now() - (2 * 60 * 60 * 1000 - 1000) })
    saveKonsepSession(session)

    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('corrupt JSON is cleared and returns null', () => {
    storage.setItem('qupu_konsep_session:g1-add-sub', '{not json')

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:g1-add-sub')).toBeNull()
  })

  test('malformed shapes are cleared and return null', () => {
    storage.setItem(
      'qupu_konsep_session:g1-add-sub',
      JSON.stringify({ subjectKey: 'g1-add-sub', childId: 'child-1', answers: [{ bad: true }], planSlugs: [], idx: 0, startedAt: Date.now() }),
    )

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:g1-add-sub')).toBeNull()
  })

  test('clearKonsepSession removes only the targeted subjectKey', () => {
    saveKonsepSession(makeSession())
    saveKonsepSession(makeSession({ subjectKey: 'g1-geometry' }))

    clearKonsepSession('g1-add-sub')

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(readKonsepSession('g1-geometry', 'child-1')).not.toBeNull()
  })

  test('does not throw when sessionStorage is blocked', () => {
    globalThis.window = {} as Window & typeof globalThis
    Object.defineProperty(globalThis.window, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked')
      },
    })

    expect(() => saveKonsepSession(makeSession())).not.toThrow()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(() => clearKonsepSession('g1-add-sub')).not.toThrow()
  })

  test('does not throw without a window (SSR safety)', () => {
    delete (globalThis as { window?: unknown }).window

    expect(() => saveKonsepSession(makeSession())).not.toThrow()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
  })
})
