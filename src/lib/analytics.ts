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
  | 'demo_started'
  | 'demo_grade_selected'
  | 'demo_question_answered'
  | 'demo_badge_earned'
  | 'demo_tour_viewed'
  | 'demo_plan_viewed'
  | 'demo_signup_click'
  | 'demo_skipped'
  | 'onboarding_child_created'
  // Member funnel (konsep session + retention loops)
  | 'session_start'
  | 'session_commit'
  | 'session_commit_failed'
  | 'session_commit_conflict'
  | 'session_resume_offered'
  | 'session_resumed'
  | 'quest_panel_view'
  | 'streak_recovery_shown'
  | 'streak_recovered'
  | 'ceremony_done'
  // Client-side error reports (see reportClientError)
  | 'client_error'

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

// ── Client error reporting ───────────────────────────────────────────────────
// Rides the same consent-gated transport as trackEvent: no consent → silent
// drop (never queued, never sent). Throttled to MAX_ERROR_REPORTS per page
// session and deduplicated by scope+message so a render-loop crash can't
// flood the analytics endpoint.

const MAX_ERROR_REPORTS = 10
const MAX_MESSAGE_CHARS = 500
const MAX_STACK_CHARS = 1024

let errorReportCount = 0
const reportedErrorSignatures = new Set<string>()

export function reportClientError(scope: string, message: string, stack?: string): void {
  if (!hasAnalyticsConsent()) return

  const safeMessage = String(message ?? 'unknown').slice(0, MAX_MESSAGE_CHARS)
  const signature = `${scope}:${safeMessage}`
  if (reportedErrorSignatures.has(signature)) return
  if (errorReportCount >= MAX_ERROR_REPORTS) return
  reportedErrorSignatures.add(signature)
  errorReportCount += 1

  void postEvent('client_error', {
    scope,
    message: safeMessage,
    stack: stack ? String(stack).slice(0, MAX_STACK_CHARS) : null,
  })
}
