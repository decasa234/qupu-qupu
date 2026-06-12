import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  clearKonsepSession,
  generateKonsepSessionId,
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
    sessionId: '6f1f5a44-3c86-4e0e-8f3b-1c2d3e4f5a6b',
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

  test('a 10-length focus-session plan round-trips intact', () => {
    const session = makeSession({
      planSlugs: Array.from({ length: 10 }, (_, i) => ((i + 1) % 4 === 0 ? `review-${i}` : 'focus-concept')),
      answers: [
        { concept_instance_id: 'ci-1', selected_answer: 'A' },
        { concept_instance_id: 'ci-2', selected_answer: 'B' },
        { concept_instance_id: 'ci-3', selected_answer: 'C' },
      ],
      idx: 3,
    })
    saveKonsepSession(session)

    const restored = readKonsepSession('g1-add-sub', 'child-1')
    expect(restored).toEqual(session)
    expect(restored?.planSlugs).toHaveLength(10)
  })

  test('reading a different subjectKey returns null and leaves the record alone', () => {
    const session = makeSession()
    saveKonsepSession(session)

    expect(readKonsepSession('g1-geometry', 'child-1')).toBeNull()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('a different child cannot resume — and the original record survives', () => {
    const session = makeSession()
    saveKonsepSession(session)

    expect(readKonsepSession('g1-add-sub', 'child-2')).toBeNull()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('siblings keep independent snapshots for the same subjectKey', () => {
    const sessionA = makeSession()
    const sessionB = makeSession({ childId: 'child-2', idx: 5 })
    saveKonsepSession(sessionA)
    saveKonsepSession(sessionB)

    // B's save + clear never clobbers A's interrupted session.
    clearKonsepSession('g1-add-sub', 'child-2')
    expect(readKonsepSession('g1-add-sub', 'child-2')).toBeNull()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(sessionA)
  })

  test('stale records (>2h) are ignored and cleared', () => {
    saveKonsepSession(makeSession({ startedAt: Date.now() - 3 * 60 * 60 * 1000 }))

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:child-1:g1-add-sub')).toBeNull()
  })

  test('records just under 2h are still resumable', () => {
    const session = makeSession({ startedAt: Date.now() - (2 * 60 * 60 * 1000 - 1000) })
    saveKonsepSession(session)

    expect(readKonsepSession('g1-add-sub', 'child-1')).toEqual(session)
  })

  test('corrupt JSON is cleared and returns null', () => {
    storage.setItem('qupu_konsep_session:child-1:g1-add-sub', '{not json')

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:child-1:g1-add-sub')).toBeNull()
  })

  test('pre-sessionId snapshots (old shape) are invalid — cleared, start fresh', () => {
    const legacy = { ...makeSession() } as Record<string, unknown>
    delete legacy.sessionId
    storage.setItem('qupu_konsep_session:child-1:g1-add-sub', JSON.stringify(legacy))

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:child-1:g1-add-sub')).toBeNull()
  })

  test('generateKonsepSessionId returns unique v4-shaped UUIDs', () => {
    const a = generateKonsepSessionId()
    const b = generateKonsepSessionId()
    const v4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(a).toMatch(v4)
    expect(b).toMatch(v4)
    expect(a).not.toBe(b)
  })

  test('malformed shapes are cleared and return null', () => {
    storage.setItem(
      'qupu_konsep_session:child-1:g1-add-sub',
      JSON.stringify({ subjectKey: 'g1-add-sub', childId: 'child-1', answers: [{ bad: true }], planSlugs: [], idx: 0, startedAt: Date.now() }),
    )

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:child-1:g1-add-sub')).toBeNull()
  })

  test('a record whose embedded childId disagrees with its key is corrupt — cleared', () => {
    storage.setItem(
      'qupu_konsep_session:child-1:g1-add-sub',
      JSON.stringify(makeSession({ childId: 'child-2' })),
    )

    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
    expect(storage.getItem('qupu_konsep_session:child-1:g1-add-sub')).toBeNull()
  })

  test('clearKonsepSession removes only the targeted subjectKey', () => {
    saveKonsepSession(makeSession())
    saveKonsepSession(makeSession({ subjectKey: 'g1-geometry' }))

    clearKonsepSession('g1-add-sub', 'child-1')

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
    expect(() => clearKonsepSession('g1-add-sub', 'child-1')).not.toThrow()
  })

  test('does not throw without a window (SSR safety)', () => {
    delete (globalThis as { window?: unknown }).window

    expect(() => saveKonsepSession(makeSession())).not.toThrow()
    expect(readKonsepSession('g1-add-sub', 'child-1')).toBeNull()
  })
})
