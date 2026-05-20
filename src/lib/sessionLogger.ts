// src/lib/sessionLogger.ts
//
// Best-effort frontend session logger. POSTs to /api/me/sessions/event
// fire-and-forget — never throws, never blocks UI. The backend swallows
// DB errors after logging; this helper swallows network errors.
//
// Usage:
//   logEvent('dashboard_open', { childId })
//   logEvent('video_open', { childId, videoId })
//   logEvent('video_close', { childId, videoId, durationMs })
//   logEvent('quiz_submit', { childId, videoId })
//
// The Plan 5a screen-time computation uses 'video_close' events with a
// duration_ms; events without one are still recorded for analytics but
// don't count toward screen-time. The useVideoSessionTimer hook in this
// module bundles the open/close pair so callers don't have to track
// durations manually.

import { useEffect, useRef } from 'react'
import api from './api'

export type SessionEventKind =
  | 'video_open'
  | 'video_close'
  | 'quiz_start'
  | 'quiz_submit'
  | 'dashboard_open'

interface LogPayload {
  childId: string
  eventKind: SessionEventKind
  videoId?: string | null
  durationMs?: number | null
  metadata?: Record<string, unknown>
}

export function logSessionEvent(payload: LogPayload): void {
  // Fire-and-forget. We don't await; we don't surface errors.
  void api.post('/me/sessions/event', payload).catch((err) => {
    // Keep this in dev console only; not user-actionable.
    if (import.meta.env.DEV) {
      console.debug('[sessionLogger] suppressed error', err)
    }
  })
}

/**
 * Pairs `video_open` on mount with `video_close` on unmount,
 * automatically computing duration_ms. No-op if childId or videoId
 * is falsy (e.g., anonymous visitor or video not loaded yet).
 */
export function useVideoSessionTimer(
  childId: string | null | undefined,
  videoId: string | null | undefined,
): void {
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!childId || !videoId) return

    const startedAt = Date.now()
    startedAtRef.current = startedAt
    logSessionEvent({ childId, eventKind: 'video_open', videoId })

    return () => {
      const elapsed = Date.now() - (startedAtRef.current ?? startedAt)
      // Clamp to a reasonable upper bound — tabs left open overnight
      // shouldn't count as one giant session.
      const durationMs = Math.min(elapsed, 4 * 60 * 60 * 1000)
      logSessionEvent({
        childId,
        eventKind: 'video_close',
        videoId,
        durationMs,
      })
    }
  }, [childId, videoId])
}
