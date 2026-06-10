// Crash/refresh resilience for the 20-question Konsep session.
// Storage is keyed BY childId AND subjectKey so concurrent sessions in
// different subsections never clobber each other — and sibling A's
// interrupted snapshot survives sibling B playing the same subsection in the
// same tab. sessionStorage scope (per-tab, survives refresh) matches the
// all-or-nothing session semantics.

const STORAGE_PREFIX = 'qupu_konsep_session:'
const SESSION_TTL_MS = 2 * 60 * 60 * 1000 // 2h — older records are stale

export interface SavedKonsepAnswer {
  concept_instance_id: string
  selected_answer: string
}

export interface SavedKonsepSession {
  childId: string
  subjectKey: string
  // Idempotency key for /konsep/commit, generated when the session STARTS.
  // A resumed session retries the commit with the SAME id, so the server
  // returns the stored result instead of re-banking 20 attempts. Snapshots
  // saved before this field existed fail validation and start fresh.
  sessionId: string
  planSlugs: string[]
  answers: SavedKonsepAnswer[]
  idx: number
  startedAt: number
}

// UUID v4 for the commit idempotency key. crypto.randomUUID is unavailable
// in non-secure contexts (e.g. LAN-IP dev on http), so fall back to
// getRandomValues with the v4 version/variant bits set.
export function generateKonsepSessionId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined
  if (c?.randomUUID) return c.randomUUID()
  const bytes = new Uint8Array(16)
  if (c?.getRandomValues) {
    c.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage ?? null
  } catch {
    return null
  }
}

function storageKey(subjectKey: string, childId: string): string {
  return `${STORAGE_PREFIX}${childId}:${subjectKey}`
}

export function saveKonsepSession(session: SavedKonsepSession): void {
  try {
    getStorage()?.setItem(
      storageKey(session.subjectKey, session.childId),
      JSON.stringify(session),
    )
  } catch {
    // Persistence is best-effort — never let a blocked storage break the session.
  }
}

export function readKonsepSession(subjectKey: string, childId: string): SavedKonsepSession | null {
  let raw: string | null = null
  try {
    raw = getStorage()?.getItem(storageKey(subjectKey, childId)) ?? null
  } catch {
    return null
  }
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    clearKonsepSession(subjectKey, childId)
    return null
  }

  // The key is already child-scoped, so an embedded subjectKey/childId that
  // disagrees with the key means a corrupt record — never resumable. Other
  // children's snapshots live under their own keys and are never touched.
  if (!isSavedKonsepSession(parsed) || parsed.subjectKey !== subjectKey || parsed.childId !== childId) {
    clearKonsepSession(subjectKey, childId)
    return null
  }

  if (Date.now() - parsed.startedAt > SESSION_TTL_MS) {
    clearKonsepSession(subjectKey, childId)
    return null
  }

  return parsed
}

export function clearKonsepSession(subjectKey: string, childId: string): void {
  try {
    getStorage()?.removeItem(storageKey(subjectKey, childId))
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
    typeof v.sessionId === 'string' &&
    v.sessionId.length > 0 &&
    Array.isArray(v.planSlugs) &&
    v.planSlugs.every((slug) => typeof slug === 'string') &&
    Array.isArray(v.answers) &&
    v.answers.every(isSavedKonsepAnswer) &&
    typeof v.idx === 'number' &&
    typeof v.startedAt === 'number'
  )
}
