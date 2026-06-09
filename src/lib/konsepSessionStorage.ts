// Crash/refresh resilience for the 20-question Konsep session.
// Storage is keyed BY subjectKey so concurrent sessions in different
// subsections never clobber each other. sessionStorage scope (per-tab,
// survives refresh) matches the all-or-nothing session semantics.

const STORAGE_PREFIX = 'qupu_konsep_session:'
const SESSION_TTL_MS = 2 * 60 * 60 * 1000 // 2h — older records are stale

export interface SavedKonsepAnswer {
  concept_instance_id: string
  selected_answer: string
}

export interface SavedKonsepSession {
  childId: string
  subjectKey: string
  planSlugs: string[]
  answers: SavedKonsepAnswer[]
  idx: number
  startedAt: number
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage ?? null
  } catch {
    return null
  }
}

function storageKey(subjectKey: string): string {
  return `${STORAGE_PREFIX}${subjectKey}`
}

export function saveKonsepSession(session: SavedKonsepSession): void {
  try {
    getStorage()?.setItem(storageKey(session.subjectKey), JSON.stringify(session))
  } catch {
    // Persistence is best-effort — never let a blocked storage break the session.
  }
}

export function readKonsepSession(subjectKey: string, childId: string): SavedKonsepSession | null {
  let raw: string | null = null
  try {
    raw = getStorage()?.getItem(storageKey(subjectKey)) ?? null
  } catch {
    return null
  }
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    clearKonsepSession(subjectKey)
    return null
  }

  if (!isSavedKonsepSession(parsed) || parsed.subjectKey !== subjectKey || parsed.childId !== childId) {
    // Corrupt record, or a different child's answers — never resumable.
    clearKonsepSession(subjectKey)
    return null
  }

  if (Date.now() - parsed.startedAt > SESSION_TTL_MS) {
    clearKonsepSession(subjectKey)
    return null
  }

  return parsed
}

export function clearKonsepSession(subjectKey: string): void {
  try {
    getStorage()?.removeItem(storageKey(subjectKey))
  } catch {
    // ignore
  }
}

function isSavedKonsepAnswer(value: unknown): value is SavedKonsepAnswer {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.concept_instance_id === 'string' && typeof v.selected_answer === 'string'
}

function isSavedKonsepSession(value: unknown): value is SavedKonsepSession {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.childId === 'string' &&
    typeof v.subjectKey === 'string' &&
    Array.isArray(v.planSlugs) &&
    v.planSlugs.every((slug) => typeof slug === 'string') &&
    Array.isArray(v.answers) &&
    v.answers.every(isSavedKonsepAnswer) &&
    typeof v.idx === 'number' &&
    typeof v.startedAt === 'number'
  )
}
