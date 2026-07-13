// api/services/notifications/dispatch.ts
//
// The daily parent-notification run (Mythos P2.5), invoked by
// GET /api/cron/notifications every evening (18:00 WIB).
//
// Two legs:
//   (a) streak-at-risk — every evening: children with a streak worth saving
//       (current_streak_days >= 3) whose last_activity_date is YESTERDAY in
//       WIB, i.e. the streak survives but no activity has happened yet
//       today. One email per parent listing all their at-risk children.
//   (b) weekly digest — Mondays only: last WIB week's XP / sessions /
//       concepts-grown per child, one email per parent. Parents whose
//       children had zero activity are skipped (no empty digests).
//
// Idempotency: notification_log (user_id, kind, wib_date) UNIQUE. Each send
// is gated on INSERT ... ON CONFLICT DO NOTHING RETURNING — only the run
// that actually appends the row sends, so a same-day cron re-run (or two
// overlapping serverless invocations) sends nothing twice.
//
// Failure posture: a failed send is logged and counted as skipped — one
// broken mailbox never aborts the rest of the run. The log row stays, so
// the parent is not retried until the next day (notifications are nice-to-
// have, not transactional).

import { query, queryOne } from '../../db.js'
import { wibDateString, wibWeek } from '../../lib/wib.js'
import { resendProvider, type NotificationProvider } from './provider.js'
import { streakAtRisk, weeklyDigest, type AtRiskChild, type DigestRow } from './templates.js'

const DAY_MS = 24 * 60 * 60 * 1000
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

export interface NotificationRunResult {
  atRiskSent: number
  digestSent: number
  skipped: number
}

function isMondayWib(now: Date): boolean {
  return new Date(now.getTime() + WIB_OFFSET_MS).getUTCDay() === 1
}

// Append-or-skip gate on notification_log. Returns true only when THIS call
// created the row — the caller may send. ON CONFLICT DO NOTHING RETURNING
// yields zero rows when the (user, kind, date) was already logged.
async function appendNotificationLog(
  userId: string,
  kind: 'streak_at_risk' | 'weekly_digest',
  wibDate: string,
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO notification_log (user_id, kind, wib_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, kind, wib_date) DO NOTHING
       RETURNING id`,
    [userId, kind, wibDate],
  )
  return row !== null
}

interface ParentBucket<T> {
  email: string
  parentName: string
  items: T[]
}

function bucketByParent<R extends { user_id: string; email: string; parent_name: string }, T>(
  rows: R[],
  toItem: (row: R) => T,
): Map<string, ParentBucket<T>> {
  const buckets = new Map<string, ParentBucket<T>>()
  for (const row of rows) {
    let bucket = buckets.get(row.user_id)
    if (!bucket) {
      bucket = { email: row.email, parentName: row.parent_name, items: [] }
      buckets.set(row.user_id, bucket)
    }
    bucket.items.push(toItem(row))
  }
  return buckets
}

export async function runDailyNotifications(
  now: Date = new Date(),
  provider: NotificationProvider = resendProvider(),
): Promise<NotificationRunResult> {
  const result: NotificationRunResult = { atRiskSent: 0, digestSent: 0, skipped: 0 }
  const today = wibDateString(now)

  // ── (a) streak-at-risk ────────────────────────────────────────────
  // last_activity_date = yesterday(WIB) means the streak is intact but
  // nothing has happened TODAY yet — exactly the "few hours left" moment.
  const yesterday = wibDateString(new Date(now.getTime() - DAY_MS))
  const atRiskRows = await query<{
    user_id: string
    email: string
    parent_name: string
    child_name: string
    streak_days: number
    streak_shields: number
  }>(
    `SELECT u.id AS user_id, u.email, u.name AS parent_name,
            c.name AS child_name, gp.current_streak_days AS streak_days,
            gp.streak_shields
       FROM users u
       JOIN children c ON c.parent_user_id = u.id
       JOIN gamification_profiles gp ON gp.child_id = c.id
      WHERE u.notify_email = TRUE
        AND gp.current_streak_days >= 3
        AND gp.last_activity_date = $1
      ORDER BY u.id, gp.current_streak_days DESC, c.name`,
    [yesterday],
  )

  const atRiskByParent = bucketByParent(
    atRiskRows,
    (row): AtRiskChild => ({
      childName: row.child_name,
      streakDays: row.streak_days,
      // A shielded child's streak isn't really about to break — the template
      // softens the copy instead of crying wolf.
      shields: Number(row.streak_shields),
    }),
  )
  for (const [userId, bucket] of atRiskByParent) {
    if (!(await appendNotificationLog(userId, 'streak_at_risk', today))) {
      result.skipped += 1
      continue
    }
    try {
      const tpl = streakAtRisk({ parentName: bucket.parentName, children: bucket.items })
      await provider.send(bucket.email, tpl.subject, tpl.html)
      result.atRiskSent += 1
    } catch (err) {
      console.error(`streak-at-risk send failed for user ${userId}:`, err)
      result.skipped += 1
    }
  }

  // ── (b) weekly digest (Mondays) ───────────────────────────────────
  if (isMondayWib(now)) {
    // Last WIB week = [last Monday 00:00 WIB, this Monday 00:00 WIB).
    const lastWeek = wibWeek(new Date(now.getTime() - 7 * DAY_MS))
    const thisWeek = wibWeek(now)

    const digestRows = await query<{
      user_id: string
      email: string
      parent_name: string
      child_name: string
      xp: number
      sessions: number
      concepts_grown: number
    }>(
      `SELECT u.id AS user_id, u.email, u.name AS parent_name,
              c.name AS child_name,
              COALESCE(SUM(rl.xp_delta), 0)::int AS xp,
              -- DISTINCT on the slug carried in the tier-up metadata
              -- (grantTierUpBonuses): a concept jumping multiple tiers in a
              -- week writes multiple ledger rows but is ONE "konsep naik
              -- tingkat" in the digest.
              COUNT(DISTINCT rl.metadata->>'conceptSlug')
                FILTER (WHERE rl.reward_type = 'CONCEPT_TIER_UP_XP')::int
                AS concepts_grown,
              (SELECT COUNT(*)::int FROM wmi_konsep_sessions ks
                WHERE ks.child_id = c.id
                  AND ks.created_at >= $1 AND ks.created_at < $2) AS sessions
         FROM users u
         JOIN children c ON c.parent_user_id = u.id
         LEFT JOIN reward_ledger rl
           ON rl.child_id = c.id
          AND rl.created_at >= $1 AND rl.created_at < $2
        WHERE u.notify_email = TRUE
        GROUP BY u.id, u.email, u.name, c.id, c.name
        ORDER BY u.id, c.name`,
      [lastWeek.startUtc, thisWeek.startUtc],
    )

    const digestByParent = bucketByParent(
      digestRows,
      (row): DigestRow => ({
        childName: row.child_name,
        xp: row.xp,
        sessions: row.sessions,
        conceptsGrown: row.concepts_grown,
      }),
    )
    for (const [userId, bucket] of digestByParent) {
      // Skip parents with zero activity across every child — an all-zero
      // digest is noise, and noise teaches parents to ignore the channel.
      const active = bucket.items.some(
        (row) => row.xp > 0 || row.sessions > 0 || row.conceptsGrown > 0,
      )
      if (!active) continue

      if (!(await appendNotificationLog(userId, 'weekly_digest', today))) {
        result.skipped += 1
        continue
      }
      try {
        const tpl = weeklyDigest({ parentName: bucket.parentName, rows: bucket.items })
        await provider.send(bucket.email, tpl.subject, tpl.html)
        result.digestSent += 1
      } catch (err) {
        console.error(`weekly-digest send failed for user ${userId}:`, err)
        result.skipped += 1
      }
    }
  }

  return result
}
