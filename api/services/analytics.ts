import { query, queryOne } from '../db.js'

export interface LogEventInput {
  eventName: string
  sessionId?: string | null
  userId?: string | null
  path?: string | null
  metadata?: Record<string, unknown> | null
}

const KNOWN_EVENTS = new Set([
  'page_view',
  'register_button_click',
  'login_button_click',
  'google_button_click',
  'score_submit_attempt_anon',
  'score_submit_attempt',
  'register_completed',
  'login_completed',
  'google_login_completed',
])

export async function logEvent(input: LogEventInput): Promise<void> {
  if (!KNOWN_EVENTS.has(input.eventName)) {
    return
  }

  await query(
    `
      INSERT INTO analytics_events (event_name, session_id, user_id, path, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      input.eventName,
      input.sessionId ?? null,
      input.userId ?? null,
      input.path ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  )
}

export interface AnalyticsRange {
  days: number
}

export async function getAnalyticsOverview(range: AnalyticsRange) {
  const days = Math.max(1, Math.min(range.days, 90))

  const [counts, funnel, eventBreakdown, recentEvents, traffic] = await Promise.all([
    queryOne<{
      visitors: string
      page_views: string
      registrations: string
      logins: string
      score_attempts: string
    }>(
      `
        SELECT
          (SELECT COUNT(DISTINCT session_id)
           FROM analytics_events
           WHERE event_name = 'page_view'
             AND session_id IS NOT NULL
             AND created_at >= NOW() - ($1::INT || ' days')::INTERVAL) AS visitors,
          (SELECT COUNT(*) FROM analytics_events
           WHERE event_name = 'page_view'
             AND created_at >= NOW() - ($1::INT || ' days')::INTERVAL) AS page_views,
          (SELECT COUNT(*) FROM analytics_events
           WHERE event_name IN ('register_completed', 'google_login_completed')
             AND created_at >= NOW() - ($1::INT || ' days')::INTERVAL) AS registrations,
          (SELECT COUNT(*) FROM analytics_events
           WHERE event_name IN ('login_completed', 'google_login_completed')
             AND created_at >= NOW() - ($1::INT || ' days')::INTERVAL) AS logins,
          (SELECT COUNT(*) FROM analytics_events
           WHERE event_name IN ('score_submit_attempt', 'score_submit_attempt_anon')
             AND created_at >= NOW() - ($1::INT || ' days')::INTERVAL) AS score_attempts
      `,
      [days],
    ),
    queryOne<{
      anon_score_sessions: string
      anon_score_then_registered: string
      register_clicks: string
      register_clicks_then_registered: string
    }>(
      `
        WITH recent AS (
          SELECT *
          FROM analytics_events
          WHERE created_at >= NOW() - ($1::INT || ' days')::INTERVAL
            AND session_id IS NOT NULL
        ),
        anon_score AS (
          SELECT DISTINCT session_id
          FROM recent
          WHERE event_name = 'score_submit_attempt_anon'
        ),
        anon_score_converted AS (
          SELECT DISTINCT a.session_id
          FROM anon_score a
          JOIN recent r ON r.session_id = a.session_id
          WHERE r.event_name IN ('register_completed', 'google_login_completed')
        ),
        register_clicks AS (
          SELECT DISTINCT session_id
          FROM recent
          WHERE event_name = 'register_button_click'
        ),
        register_clicks_converted AS (
          SELECT DISTINCT a.session_id
          FROM register_clicks a
          JOIN recent r ON r.session_id = a.session_id
          WHERE r.event_name IN ('register_completed', 'google_login_completed')
        )
        SELECT
          (SELECT COUNT(*) FROM anon_score) AS anon_score_sessions,
          (SELECT COUNT(*) FROM anon_score_converted) AS anon_score_then_registered,
          (SELECT COUNT(*) FROM register_clicks) AS register_clicks,
          (SELECT COUNT(*) FROM register_clicks_converted) AS register_clicks_then_registered
      `,
      [days],
    ),
    query<{ event_name: string; total: string }>(
      `
        SELECT event_name, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= NOW() - ($1::INT || ' days')::INTERVAL
        GROUP BY event_name
        ORDER BY total DESC
      `,
      [days],
    ),
    query<{
      id: string
      event_name: string
      session_id: string | null
      user_id: string | null
      path: string | null
      metadata: unknown
      created_at: string
    }>(
      `
        SELECT id, event_name, session_id, user_id, path, metadata, created_at
        FROM analytics_events
        WHERE created_at >= NOW() - ($1::INT || ' days')::INTERVAL
        ORDER BY created_at DESC
        LIMIT 25
      `,
      [days],
    ),
    query<{ day: string; visitors: string; page_views: string }>(
      `
        SELECT
          DATE_TRUNC('day', created_at)::DATE AS day,
          COUNT(DISTINCT session_id) AS visitors,
          COUNT(*) FILTER (WHERE event_name = 'page_view') AS page_views
        FROM analytics_events
        WHERE created_at >= NOW() - ($1::INT || ' days')::INTERVAL
        GROUP BY day
        ORDER BY day ASC
      `,
      [days],
    ),
  ])

  return {
    rangeDays: days,
    counts: {
      visitors: Number(counts?.visitors ?? 0),
      pageViews: Number(counts?.page_views ?? 0),
      registrations: Number(counts?.registrations ?? 0),
      logins: Number(counts?.logins ?? 0),
      scoreAttempts: Number(counts?.score_attempts ?? 0),
    },
    funnel: {
      anonScoreSessions: Number(funnel?.anon_score_sessions ?? 0),
      anonScoreThenRegistered: Number(funnel?.anon_score_then_registered ?? 0),
      registerClicks: Number(funnel?.register_clicks ?? 0),
      registerClicksThenRegistered: Number(funnel?.register_clicks_then_registered ?? 0),
    },
    eventBreakdown: eventBreakdown.map((row) => ({
      eventName: row.event_name,
      total: Number(row.total),
    })),
    recentEvents: recentEvents.map((row) => ({
      id: row.id,
      eventName: row.event_name,
      sessionId: row.session_id,
      userId: row.user_id,
      path: row.path,
      metadata: row.metadata,
      createdAt: row.created_at,
    })),
    traffic: traffic.map((row) => ({
      day: row.day,
      visitors: Number(row.visitors),
      pageViews: Number(row.page_views),
    })),
  }
}
