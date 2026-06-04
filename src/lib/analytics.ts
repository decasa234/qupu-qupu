import api from './api'
import { hasAnalyticsConsent } from './cookieConsent'

const SESSION_KEY = 'qupu_session_id'

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(SESSION_KEY, fresh)
    return fresh
  } catch {
    return `${Date.now()}`
  }
}

export type AnalyticsEventName =
  | 'page_view'
  | 'register_button_click'
  | 'login_button_click'
  | 'google_button_click'
  | 'score_submit_attempt_anon'
  | 'score_submit_attempt'
  | 'register_completed'
  | 'login_completed'
  | 'google_login_completed'
  | 'demo_quiz_submit'

export function trackEvent(
  eventName: AnalyticsEventName,
  metadata?: Record<string, unknown>,
): void {
  if (!hasAnalyticsConsent()) return

  void postEvent(eventName, metadata)
}

async function postEvent(
  eventName: AnalyticsEventName,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await api.post('/analytics/events', {
      eventName,
      sessionId: getOrCreateSessionId(),
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      metadata: metadata ?? null,
    })
  } catch {
    // analytics is best-effort; never throw
  }
}
