const STORAGE_KEY = 'qupu_pending_score'
const PENDING_SCORE_TTL_MS = 30 * 60 * 1000

export interface PendingScore {
  videoId: string
  slug: string
  correctAnswers: number
  capturedAt: number
}

export function savePendingScore(input: Omit<PendingScore, 'capturedAt'>): void {
  const payload: PendingScore = { ...input, capturedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function readPendingScore(): PendingScore | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  if (!isPendingScore(parsed)) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  if (Date.now() - parsed.capturedAt > PENDING_SCORE_TTL_MS) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  return parsed
}

export function clearPendingScore(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function isPendingScore(value: unknown): value is PendingScore {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.videoId === 'string' &&
    typeof v.slug === 'string' &&
    typeof v.correctAnswers === 'number' &&
    typeof v.capturedAt === 'number'
  )
}
