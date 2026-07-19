// api/services/gamification/events.ts
//
// Idempotent writer for gamification_events. Every event row carries a
// UNIQUE natural key (child_id, event_type, source_type, source_id);
// `emitEvent` uses INSERT ... ON CONFLICT DO NOTHING so HTTP retries,
// double-clicks, and re-runs cannot create duplicate event rows.

import type { PoolClient } from 'pg'
import { queryOne } from '../../db.js'

export type EventType =
  | 'QUIZ_SCORE_SUBMITTED'
  | 'VIDEO_FIRST_COMPLETED'
  | 'SCORE_IMPROVED'
  | 'HIGH_SCORE_REACHED'      // >= 80%
  | 'PERFECT_SCORE_REACHED'   // 100%
  | 'DAILY_ACTIVITY_RECORDED'
  // WMI garden events (migration 0037). gamification_events.event_type is
  // an unconstrained VARCHAR(80), so no DDL change is needed for these.
  | 'KONSEP_SESSION_COMPLETED' // one committed 20-question konsep session
  | 'KONSEP_QUESTION_ANSWERED' // batch marker; metadata.count = answers graded
  | 'KONSEP_CONCEPT_GROWN'     // batch marker; metadata.count = concepts that hit a new tier
  | 'CHAPTER_TEST_PASSED'      // Tes Bab >= 70%
  // QUPU track events (Plan 3 reward parity).
  | 'TRACK_LESSON_LEVEL_UP'    // a lesson session pushed a concept past its previous level
  | 'TRACK_GATE_CLEARED'       // a synthesis gate's FIRST correct clear

export type SourceType =
  | 'score_attempt'
  | 'video_first_complete'
  | 'daily_activity'
  | 'wmi_session'        // anchor = first wmi_attempts row of the committed session
  | 'wmi_chapter_test'   // anchor = wmi_chapter_tests row
  | 'wmi_attempt'        // anchor = a single wmi_attempts row (Latihan Campur concept drill)
  | 'wmi_track_lesson'   // anchor = deterministic id, see tracks/lesson.ts commitLesson
  | 'wmi_gate_clear'     // anchor = deterministic id, see tracks/gates.ts submitGate

export interface EmitEventInput {
  childId: string
  eventType: EventType
  sourceType: SourceType
  sourceId: string
  eventDate: string // YYYY-MM-DD in WIB
  metadata?: Record<string, unknown>
}

export interface EmittedEvent {
  id: string
  emitted: boolean // true if this call inserted; false if no-op (duplicate)
}

export async function emitEvent(
  client: PoolClient,
  input: EmitEventInput,
): Promise<EmittedEvent> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO gamification_events
       (child_id, event_type, source_type, source_id, event_date, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     ON CONFLICT (child_id, event_type, source_type, source_id) DO NOTHING
     RETURNING id`,
    [
      input.childId,
      input.eventType,
      input.sourceType,
      input.sourceId,
      input.eventDate,
      JSON.stringify(input.metadata ?? {}),
    ],
    client,
  )

  if (row) return { id: row.id, emitted: true }

  // On conflict: fetch existing id so callers can chain.
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM gamification_events
       WHERE child_id = $1 AND event_type = $2 AND source_type = $3 AND source_id = $4`,
    [input.childId, input.eventType, input.sourceType, input.sourceId],
    client,
  )
  return { id: existing?.id ?? '', emitted: false }
}
