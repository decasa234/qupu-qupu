// api/services/sessionEvents.ts
//
// Lightweight write service for session_events. Used to back the
// dashboard's screen-time computation (Plan 5a) and future activation
// analytics. The endpoint is best-effort: client failures must NOT
// break the rest of the UX, so the route handler swallows DB errors
// after logging.

import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'

export type SessionEventKind =
  | 'video_open'
  | 'video_close'
  | 'quiz_start'
  | 'quiz_submit'
  | 'dashboard_open'

export interface LogSessionEventInput {
  childId: string
  eventKind: SessionEventKind
  videoId?: string | null
  durationMs?: number | null
  metadata?: Record<string, unknown>
}

async function assertChildOwnership(
  client: PoolClient,
  parentUserId: string,
  childId: string,
): Promise<void> {
  const row = await queryOne<{ id: string }>(
    'SELECT id FROM children WHERE id = $1 AND parent_user_id = $2',
    [childId, parentUserId],
    client,
  )
  if (!row) throw new Error('Child not found')
}

export async function logSessionEvent(
  parentUserId: string,
  input: LogSessionEventInput,
): Promise<void> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, input.childId)
    await client.query(
      `INSERT INTO session_events
         (child_id, event_kind, video_id, duration_ms, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        input.childId,
        input.eventKind,
        input.videoId ?? null,
        input.durationMs ?? null,
        JSON.stringify(input.metadata ?? {}),
      ],
    )
  })
}

/**
 * Total screen-time in minutes for a child on a WIB day. Sums
 * duration_ms from video_close events; ignores events without a
 * duration (events sent on browser unload may lack one). Returns 0
 * for children with no events yet.
 */
export async function fetchScreenTimeMinutes(
  client: PoolClient,
  childId: string,
  wibToday: Date,
): Promise<number> {
  const row = await queryOne<{ ms_total: string }>(
    `SELECT COALESCE(SUM(duration_ms), 0)::text AS ms_total
       FROM session_events
       WHERE child_id = $1
         AND event_kind = 'video_close'
         AND duration_ms IS NOT NULL
         AND occurred_at >= $2`,
    [childId, wibToday],
    client,
  )
  const ms = Number(row?.ms_total ?? 0)
  return Math.round(ms / 60000)
}

// Exposed for /qa or admin tooling — last N events for a child.
export async function listRecentSessionEvents(
  client: PoolClient,
  childId: string,
  limit = 50,
) {
  return query(
    `SELECT id, event_kind, video_id, duration_ms, metadata, occurred_at
       FROM session_events
       WHERE child_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2`,
    [childId, limit],
    client,
  )
}
