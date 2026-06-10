// api/__tests__/notifications/dispatch.test.ts
//
// runDailyNotifications against a real Postgres (TEST_DATABASE_URL, skip
// convention — see api/__tests__/setup.ts). Requires migration 0043
// (users.notify_email + notification_log) applied to the test database.
//
// Covers: streak-at-risk selection, notification_log idempotency (same-day
// re-run sends nothing), the notify_email opt-out, the Monday-only weekly
// digest with last-week aggregates, the zero-activity digest skip, and the
// never-throw posture on a failing provider.
//
// The dispatcher scans the WHOLE database, and vitest runs suite files in
// parallel against the same test DB — so every assertion here is scoped to
// THIS test's fixture parent (mail filtered by recipient, log rows by
// user_id) instead of asserting global counts that a concurrently-running
// suite's fixtures could inflate.

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne, withTransaction } from '../../db.js'
import { wibDateString, wibWeek } from '../../lib/wib.js'
import { ensureProfile } from '../../services/gamification/profileUpdater.js'
import { runDailyNotifications } from '../../services/notifications/dispatch.js'
import type { NotificationProvider } from '../../services/notifications/provider.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)
const DAY_MS = 24 * 60 * 60 * 1000

interface SentMail {
  to: string
  subject: string
  html: string
}

function captureProvider(sent: SentMail[]): NotificationProvider {
  return {
    async send(to, subject, html) {
      sent.push({ to, subject, html })
    },
  }
}

describe.skipIf(!RUN)('runDailyNotifications', () => {
  let fx: Fixtures
  let fxEmail: string
  const extraUserIds: string[] = []

  beforeEach(async () => {
    fx = await createFixtures()
    const row = await queryOne<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [
      fx.userId,
    ])
    fxEmail = row!.email
  })
  afterEach(async () => {
    await cleanupFixtures(fx)
    while (extraUserIds.length) {
      await query(`DELETE FROM users WHERE id = $1`, [extraUserIds.pop()])
    }
  })
  afterAll(async () => {
    await pool.end()
  })

  async function setStreak(childId: string, streak: number, lastActivityDaysAgo: number) {
    await withTransaction((c) => ensureProfile(c, childId))
    await query(
      `UPDATE gamification_profiles
          SET current_streak_days = $2, last_activity_date = $3
        WHERE child_id = $1`,
      [childId, streak, wibDateString(new Date(Date.now() - lastActivityDaysAgo * DAY_MS))],
    )
  }

  async function logRows(userId: string, kind: string): Promise<number> {
    const rows = await query<{ id: string }>(
      `SELECT id FROM notification_log WHERE user_id = $1 AND kind = $2`,
      [userId, kind],
    )
    return rows.length
  }

  const mine = (sent: SentMail[]) => sent.filter((mail) => mail.to === fxEmail)

  it('sends one streak-at-risk email to the parent and is idempotent on re-run', async () => {
    await setStreak(fx.childId, 5, 1) // streak worth saving, idle today
    const sent: SentMail[] = []

    const first = await runDailyNotifications(new Date(), captureProvider(sent))
    expect(first.atRiskSent).toBeGreaterThanOrEqual(1)
    expect(mine(sent)).toHaveLength(1)
    expect(mine(sent)[0].html).toContain('Streak 5 hari')
    expect(await logRows(fx.userId, 'streak_at_risk')).toBe(1)

    // Same WIB day re-run: the notification_log UNIQUE row blocks the send.
    const second = await runDailyNotifications(new Date(), captureProvider(sent))
    expect(second.skipped).toBeGreaterThanOrEqual(1)
    expect(mine(sent)).toHaveLength(1)
    expect(await logRows(fx.userId, 'streak_at_risk')).toBe(1)
  })

  it('selects nothing for short streaks, today-active kids, or opted-out parents', async () => {
    const sent: SentMail[] = []

    // Streak below 3 — not worth an email yet.
    await setStreak(fx.childId, 2, 1)
    await runDailyNotifications(new Date(), captureProvider(sent))

    // Already active today — nothing at risk.
    await setStreak(fx.childId, 5, 0)
    await runDailyNotifications(new Date(), captureProvider(sent))

    // Opted out — at risk, but the parent said no.
    await setStreak(fx.childId, 5, 1)
    await query(`UPDATE users SET notify_email = FALSE WHERE id = $1`, [fx.userId])
    await runDailyNotifications(new Date(), captureProvider(sent))

    expect(mine(sent)).toHaveLength(0)
    expect(await logRows(fx.userId, 'streak_at_risk')).toBe(0)
  })

  it('a failing provider is logged + skipped, never thrown', async () => {
    await setStreak(fx.childId, 4, 1)
    const failing: NotificationProvider = {
      async send() {
        throw new Error('mailbox on fire')
      },
    }
    const result = await runDailyNotifications(new Date(), failing)
    expect(result.atRiskSent).toBe(0) // every send failed, none counted as sent
    expect(result.skipped).toBeGreaterThanOrEqual(1)
    // The attempt was logged, so the parent is not re-mailed today.
    expect(await logRows(fx.userId, 'streak_at_risk')).toBe(1)
  })

  it('sends the weekly digest on Mondays with last-week aggregates, skipping zero-activity parents', async () => {
    // A guaranteed WIB Monday: noon WIB on this week's Monday.
    const thisWeek = wibWeek(new Date())
    const mondayNoonWib = new Date(`${thisWeek.start}T12:00:00+07:00`)
    const insideLastWeek = new Date(thisWeek.startUtc.getTime() - 3 * DAY_MS)

    // fx child: 25 base XP + TWO tier-up rows for the SAME concept (a
    // multi-tier jump, metadata.conceptSlug as grantTierUpBonuses writes it)
    // + one session, all last week. The digest must count the concept ONCE.
    await query(
      `INSERT INTO reward_ledger
         (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata, created_at)
       VALUES
         ($1, 'CONCEPT_COMPLETION_XP', 'test_grant', $2, 25, 0, '{}'::jsonb, $5),
         ($1, 'CONCEPT_TIER_UP_XP', 'concept_tier_up', $3, 5, 0,
          '{"conceptSlug":"digest-test-concept","tier":2}'::jsonb, $5),
         ($1, 'CONCEPT_TIER_UP_XP', 'concept_tier_up', $4, 15, 0,
          '{"conceptSlug":"digest-test-concept","tier":3}'::jsonb, $5)`,
      [fx.childId, randomUUID(), randomUUID(), randomUUID(), insideLastWeek],
    )
    await query(
      `INSERT INTO wmi_konsep_sessions (session_id, child_id, subject_key, result, created_at)
       VALUES ($1, $2, 'test-subject', '{}'::jsonb, $3)`,
      [randomUUID(), fx.childId, insideLastWeek],
    )

    // A second parent+child with ZERO last-week activity — no digest.
    const tag = randomUUID().slice(0, 8)
    const idleUser = await queryOne<{ id: string; email: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id, email`,
      [`idle-${tag}@example.test`, `Idle Parent ${tag}`],
    )
    extraUserIds.push(idleUser!.id)
    await query(`INSERT INTO children (parent_user_id, name) VALUES ($1, $2)`, [
      idleUser!.id,
      `Idle Child ${tag}`,
    ])

    const sent: SentMail[] = []
    const result = await runDailyNotifications(mondayNoonWib, captureProvider(sent))
    expect(result.digestSent).toBeGreaterThanOrEqual(1)
    expect(mine(sent)).toHaveLength(1)
    expect(mine(sent)[0].html).toContain('45 XP')
    expect(mine(sent)[0].html).toContain('1 sesi')
    expect(mine(sent)[0].html).toContain('1 konsep naik tingkat')
    expect(sent.filter((mail) => mail.to === idleUser!.email)).toHaveLength(0)
    expect(await logRows(idleUser!.id, 'weekly_digest')).toBe(0)

    // Re-run on the same Monday: idempotent.
    await runDailyNotifications(mondayNoonWib, captureProvider(sent))
    expect(mine(sent)).toHaveLength(1)
    expect(await logRows(fx.userId, 'weekly_digest')).toBe(1)

    // Tuesday: the digest leg does not run at all.
    const tuesdayNoonWib = new Date(mondayNoonWib.getTime() + DAY_MS)
    const tuesday = await runDailyNotifications(tuesdayNoonWib, captureProvider(sent))
    expect(tuesday.digestSent).toBe(0)
  })
})
