// Integration tests for the idempotent batched konsep commit (P1.5)
// plus the P2.2 reward loop (chapter chests, quest claim ritual, session
// drop). Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).
//
// The contract under test:
//   - same session_id POSTed twice → second returns the STORED result
//     verbatim, with NO new attempts / events / progress / ledger rows;
//   - a different child replaying the same session_id is rejected (409)
//     without leaking the stored result;
//   - quest completion pays NOTHING at commit — balances move only on
//     POST /me/quests/:id/claim, exactly once, and pre-ritual auto-paid
//     instances can never be claimed again;
//   - chapter chests grant once per (child, chapter, threshold) across
//     replays; every commit rolls a 2-6 coin session drop exactly once.

import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { signToken } from '../../lib/jwt.js'
import { pool, query, queryOne } from '../../db.js'
import app from '../../app.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../../services/wmi/concepts/bootstrap.js'
import { commitKonsepSession } from '../../services/wmi/concepts/session.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('WMI konsep commit idempotency', () => {
  let parentUserId: string
  let childId: string
  let siblingId: string
  let token: string
  const createdSubjectKeys: string[] = []

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  // Synthetic chapters MUST be removed: they are enabled grade-1 concepts
  // with no registered generator, so a leaked row breaks any other suite
  // whose random concept pick lands on it (engine/konsep "tidak bisa
  // membuat soal" flakes).
  afterEach(async () => {
    for (const subjectKey of createdSubjectKeys) {
      await query(`DELETE FROM wmi_concepts WHERE subject_key = $1`, [subjectKey])
      await query(`DELETE FROM wmi_subjects WHERE subject_key = $1`, [subjectKey])
    }
    createdSubjectKeys.length = 0
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`konsep-commit-${tag}@example.com`, `Commit Test ${tag}`],
    )
    parentUserId = user!.id
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
    const sibling = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Sibling ${tag}`],
    )
    siblingId = sibling!.id
    token = signToken(
      { id: parentUserId, email: `konsep-commit-${tag}@example.com`, role: 'parent' },
      { expiresIn: '7d' },
    )
  })

  afterAll(async () => {
    await pool.end()
  })

  async function pickConcept() {
    const concept = await queryOne<{ slug: string; subject_key: string }>(
      `SELECT slug, subject_key FROM wmi_concepts
       WHERE subject_key IS NOT NULL AND enabled AND 1 = ANY(grades)
       ORDER BY slug LIMIT 1`,
      [],
    )
    expect(concept).toBeTruthy()
    return concept!
  }

  // /konsep/next never re-serves an instance the child has attempted, so a
  // follow-up call after a commit yields a FRESH instance of the concept.
  async function fetchInstance(forChildId: string, slug: string) {
    const next = await request(app)
      .get('/api/me/wmi/konsep/next')
      .query({ childId: forChildId, grade: 1, concept: slug })
      .set('Authorization', `Bearer ${token}`)
    expect(next.status).toBe(200)
    const id: string = next.body.data.question.concept_instance_id
    const row = await queryOne<{ answer: string }>(
      'SELECT answer FROM wmi_concept_instances WHERE id = $1',
      [id],
    )
    return { id, answer: row!.answer }
  }

  // A 20-answer payload reusing one real instance of a subject-linked
  // concept: the commit accepts repeated instances (the ledger dedupes), and
  // this keeps the fixture independent of generator randomness.
  async function buildSessionPayload(forChildId: string) {
    const concept = await pickConcept()
    const instance = await fetchInstance(forChildId, concept.slug)
    return {
      subjectKey: concept.subject_key,
      answers: Array.from({ length: 20 }, () => ({
        concept_instance_id: instance.id,
        selected_answer: '0',
      })),
    }
  }

  async function tierUpRows(forChildId: string) {
    const rows = await query<{ xp_delta: string; coin_delta: string }>(
      `SELECT xp_delta::text, coin_delta::text FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_TIER_UP_XP'
       ORDER BY xp_delta::int`,
      [forChildId],
    )
    return rows.map((r) => [Number(r.xp_delta), Number(r.coin_delta)])
  }

  async function baseXpFor(forChildId: string, instanceId: string) {
    const row = await queryOne<{ xp_delta: string; coin_delta: string }>(
      `SELECT xp_delta::text, coin_delta::text FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_COMPLETION_XP'
         AND source_type = 'concept_attempt' AND source_id = $2`,
      [forChildId, instanceId],
    )
    expect(row).toBeTruthy()
    return { xp: Number(row!.xp_delta), coins: Number(row!.coin_delta) }
  }

  async function counts(forChildId: string) {
    const row = await queryOne<{ attempts: string; events: string; ledger: string; progress_attempts: string | null }>(
      `SELECT
         (SELECT COUNT(*) FROM wmi_attempts WHERE child_id = $1)::text AS attempts,
         (SELECT COUNT(*) FROM gamification_events WHERE child_id = $1)::text AS events,
         (SELECT COUNT(*) FROM reward_ledger WHERE child_id = $1)::text AS ledger,
         (SELECT SUM(attempts) FROM wmi_concept_progress WHERE child_id = $1)::text AS progress_attempts`,
      [forChildId],
    )
    return {
      attempts: Number(row!.attempts),
      events: Number(row!.events),
      ledger: Number(row!.ledger),
      progressAttempts: Number(row!.progress_attempts ?? 0),
    }
  }

  test('commit requires session_id', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const res = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, answers })
    expect(res.status).toBe(400)
  })

  test('replay with the same session_id returns the stored result and writes nothing', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const sessionId = randomUUID()

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(first.status).toBe(201)
    expect(first.body.data.total).toBe(20)

    const after1 = await counts(childId)
    expect(after1.attempts).toBe(20)
    expect(after1.progressAttempts).toBe(20)

    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(second.status).toBe(201)
    // Stored result verbatim, straight from the cache table — plus the
    // replay marker the FE uses to skip celebration analytics.
    expect(second.body.data).toEqual({ ...first.body.data, replayed: true })

    // NO new attempts / events / ledger rows / comprehension counts.
    expect(await counts(childId)).toEqual(after1)
  })

  test('a different child replaying the session_id is rejected without the result', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)
    const sessionId = randomUUID()

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: sessionId, answers })
    expect(first.status).toBe(201)

    const siblingPayload = await buildSessionPayload(siblingId)
    const res = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId: siblingId,
        subject_key: siblingPayload.subjectKey,
        session_id: sessionId,
        answers: siblingPayload.answers,
      })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
    expect(JSON.stringify(res.body)).not.toContain('xpEarned')

    // The sibling banked nothing.
    const siblingCounts = await counts(siblingId)
    expect(siblingCounts.attempts).toBe(0)
  })

  test('fresh session_ids commit independently and earn ledger rewards once per instance', async () => {
    const { subjectKey, answers } = await buildSessionPayload(childId)

    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: randomUUID(), answers })
    expect(first.status).toBe(201)

    // Same instance, NEW session id: attempts append again (a real second
    // session), but the per-instance CONCEPT_COMPLETION_XP ledger key blocks
    // double XP for the same instance — xpEarned reflects only appended rows.
    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({ childId, subject_key: subjectKey, session_id: randomUUID(), answers })
    expect(second.status).toBe(201)

    const after = await counts(childId)
    expect(after.attempts).toBe(40)
    const conceptLedger = await queryOne<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CONCEPT_COMPLETION_XP'`,
      [childId],
    )
    // One distinct instance in both sessions → at most one concept XP row.
    expect(Number(conceptLedger!.n)).toBeLessThanOrEqual(1)
  })

  test('session path: mastery-scaled base XP + one-time tier-up bonuses (P2.1)', async () => {
    const concept = await pickConcept()
    const instanceA = await fetchInstance(childId, concept.slug)

    // 20 straight CORRECT answers on a fresh concept fold best_tier 0 → 4 in
    // one commit, crossing Berlatih, Mahir, and Dikuasai at once.
    const first = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        subject_key: concept.subject_key,
        session_id: randomUUID(),
        answers: Array.from({ length: 20 }, () => ({
          concept_instance_id: instanceA.id,
          selected_answer: instanceA.answer,
        })),
      })
    expect(first.status).toBe(201)
    expect(first.body.data.correct).toBe(20)

    // Growth beat data: the grown entry carries the summed crossed bonuses.
    const grown = first.body.data.conceptsGrown.find(
      (g: { slug: string }) => g.slug === concept.slug,
    )
    expect(grown).toMatchObject({ fromTier: 0, toTier: 4, bonusXp: 65 })

    // Base XP priced at the PRE-session tier (0 → 5 XP), coins stay 1.
    expect(await baseXpFor(childId, instanceA.id)).toEqual({ xp: 5, coins: 1 })

    // Exactly the three spec bonuses: Berlatih +5, Mahir +20/+5, Dikuasai +40/+10.
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])

    // Second session on the SAME (now Dikuasai) concept with a FRESH
    // instance: base XP drops to the tier-4 rate (1 XP) and the tier-up
    // bonuses do NOT grant again — they are once-ever per (child, concept, tier).
    const instanceB = await fetchInstance(childId, concept.slug)
    expect(instanceB.id).not.toBe(instanceA.id)
    const second = await request(app)
      .post('/api/me/wmi/konsep/commit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        subject_key: concept.subject_key,
        session_id: randomUUID(),
        answers: Array.from({ length: 20 }, () => ({
          concept_instance_id: instanceB.id,
          selected_answer: instanceB.answer,
        })),
      })
    expect(second.status).toBe(201)
    expect(second.body.data.conceptsGrown).toEqual([])
    expect(await baseXpFor(childId, instanceB.id)).toEqual({ xp: 1, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])
  })

  test('drill path: tier-up bonuses grant once and Dikuasai answers pay 1 XP (P2.1)', async () => {
    const concept = await pickConcept()
    const instance = await fetchInstance(childId, concept.slug)

    // 10 correct drill answers walk the concept 0 → 4 (tier 2 at the 3rd,
    // tier 3 at the 6th, tier 4 at the 10th). Base XP lands only once (the
    // per-instance ledger key dedupes repeats of the same instance); each
    // crossing's bonus surfaces on that answer's response exactly once.
    const tierUpsSeen: Array<{ toTier: number; bonusXp: number } | null> = []
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/me/wmi/attempts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          childId,
          mode: 'concept',
          concept_instance_id: instance.id,
          selected_answer: instance.answer,
        })
      expect(res.status).toBe(201)
      expect(res.body.data.is_correct).toBe(true)
      tierUpsSeen.push(res.body.data.gamification.tierUp ?? null)
    }
    expect(tierUpsSeen[2]).toMatchObject({ toTier: 2, bonusXp: 5 })
    expect(tierUpsSeen[5]).toMatchObject({ toTier: 3, bonusXp: 20 })
    expect(tierUpsSeen[9]).toMatchObject({ toTier: 4, bonusXp: 40 })
    expect(tierUpsSeen.filter(Boolean)).toHaveLength(3)

    expect(await baseXpFor(childId, instance.id)).toEqual({ xp: 5, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])

    // A fresh instance answered at Dikuasai pays the same 1-XP rate the
    // session path charges for tier 4 — the two paths price identically.
    const fresh = await fetchInstance(childId, concept.slug)
    expect(fresh.id).not.toBe(instance.id)
    const res = await request(app)
      .post('/api/me/wmi/attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        childId,
        mode: 'concept',
        concept_instance_id: fresh.id,
        selected_answer: fresh.answer,
      })
    expect(res.status).toBe(201)
    expect(res.body.data.gamification.tierUp ?? null).toBeNull()
    expect(await baseXpFor(childId, fresh.id)).toEqual({ xp: 1, coins: 1 })
    expect(await tierUpRows(childId)).toEqual([
      [5, 0],
      [20, 5],
      [40, 10],
    ])
  })

  // ── P2.2: quest claim ritual + chapter chests + session drop ──────────

  async function profileTotals(forChildId: string) {
    const row = await queryOne<{ total_xp: string; coin_balance: string }>(
      'SELECT total_xp::text, coin_balance::text FROM gamification_profiles WHERE child_id = $1',
      [forChildId],
    )
    return {
      totalXp: Number(row?.total_xp ?? 0),
      coinBalance: Number(row?.coin_balance ?? 0),
    }
  }

  async function ledgerCount(forChildId: string, rewardType: string) {
    const row = await queryOne<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM reward_ledger
       WHERE child_id = $1 AND reward_type = $2`,
      [forChildId, rewardType],
    )
    return Number(row!.n)
  }

  async function listQuests(forChildId: string) {
    const res = await request(app)
      .get('/api/me/quests')
      .query({ childId: forChildId })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    return res.body.data.quests as Array<{
      id: string
      rewardXp: number
      rewardCoins: number
      completed: boolean
      claimedAt: string | null
    }>
  }

  // Synthetic 2-concept chapter so answers AND the grown share are fully
  // deterministic: growing one concept = exactly 50%, both = 100%.
  async function createSyntheticChapter() {
    const tag = randomUUID().slice(0, 8)
    const subjectKey = `g1-chest-${tag}`
    createdSubjectKeys.push(subjectKey)
    await query(
      `INSERT INTO wmi_subjects (subject_key, grade, name_id, name_en, color_hex, icon_key, sort_order)
       VALUES ($1, 1, 'Bab Peti', 'Chest Chapter', '#123456', 'star', 999)`,
      [subjectKey],
    )
    const instances: { id: string; answer: string }[] = []
    for (const n of [1, 2]) {
      const slug = `chest-${tag}-${n}`
      await query(
        `INSERT INTO wmi_concepts (slug, name_en, name_id, grades, enabled, subject_key, difficulty, sort_order)
         VALUES ($1, $2, $3, ARRAY[1]::smallint[], TRUE, $4, 1, $5)`,
        [slug, `Chest ${n}`, `Peti ${n}`, subjectKey, n],
      )
      const inst = await queryOne<{ id: string }>(
        `INSERT INTO wmi_concept_instances
           (concept_slug, params, body_en, body_id, answer_type, answer)
         VALUES ($1, $2::jsonb, 'What is 3+4?', 'Berapa 3+4?', 'fill_in', '7')
         RETURNING id`,
        [slug, JSON.stringify({ tag, n })],
      )
      instances.push({ id: inst!.id, answer: '7' })
    }
    return { subjectKey, instances }
  }

  // The commit route's Joi schema allowlists the real curriculum's
  // WMI_SUBJECT_KEYS, so synthetic-chapter sessions commit through the
  // service directly (the exact code the route delegates to). HTTP coverage
  // of the route itself lives in the replay/conflict tests above.
  function answersFor(instanceId: string, selected: string) {
    return Array.from({ length: 20 }, () => ({
      conceptInstanceId: instanceId,
      selectedAnswer: selected,
    }))
  }

  test('quest completion pays nothing at commit; claim pays once; double-claim no-ops (P2.2)', async () => {
    // 20 deliberately WRONG answers: completes the whole konsep trio
    // (answers_10, session_1, and grow_1 — any attempt lifts a fresh concept
    // to tier 1 "Baru belajar") while earning ZERO concept XP and no tier-up
    // bonuses (those start at tier 2) — isolating the quest economy.
    const { subjectKey, instances } = await createSyntheticChapter()
    const commit = await commitKonsepSession(
      parentUserId,
      childId,
      subjectKey,
      randomUUID(),
      answersFor(instances[0].id, '999'),
    )

    // The all-wrong session completes konsep_answers_10 + konsep_session_1 —
    // both surfaced as CLAIMABLE, with ZERO folded into the commit totals.
    const completed = commit.completedQuests
    expect(completed.length).toBeGreaterThanOrEqual(2)
    expect(commit.xpEarned).toBe(0) // no correct answers, no quest pay
    expect(commit.coinsEarned).toBe(commit.sessionDrop)
    expect(await ledgerCount(childId, 'DAILY_QUEST_XP')).toBe(0)

    // Completed quests are claimable (claimed_at NULL) on the panel read.
    const quests = await listQuests(childId)
    const claimable = quests.filter((q) => q.completed && !q.claimedAt)
    expect(claimable.length).toBe(completed.length)
    const target = claimable[0]

    const before = await profileTotals(childId)
    const claim = await request(app)
      .post(`/api/me/quests/${target.id}/claim`)
      .set('Authorization', `Bearer ${token}`)
    expect(claim.status).toBe(200)
    expect(claim.body.data.claimed).toBe(true)
    expect(claim.body.data.xp).toBe(target.rewardXp)
    expect(claim.body.data.coins).toBe(target.rewardCoins)
    expect(claim.body.data.totalXp).toBe(before.totalXp + target.rewardXp)
    expect(claim.body.data.coinBalance).toBe(before.coinBalance + target.rewardCoins)
    expect(await ledgerCount(childId, 'DAILY_QUEST_XP')).toBe(1)

    // Double-claim: alreadyClaimed, nothing paid, balances unchanged.
    const again = await request(app)
      .post(`/api/me/quests/${target.id}/claim`)
      .set('Authorization', `Bearer ${token}`)
    expect(again.status).toBe(200)
    expect(again.body.data.claimed).toBe(false)
    expect(again.body.data.alreadyClaimed).toBe(true)
    expect(again.body.data.xp).toBe(0)
    expect(again.body.data.coinBalance).toBe(before.coinBalance + target.rewardCoins)
    expect(await ledgerCount(childId, 'DAILY_QUEST_XP')).toBe(1)
    expect(await profileTotals(childId)).toEqual({
      totalXp: before.totalXp + target.rewardXp,
      coinBalance: before.coinBalance + target.rewardCoins,
    })

    // An ACTIVE (not-yet-completed) quest is not claimable. Synthetic
    // instance on a past window so it can't collide with today's slots.
    const activeTemplate = await queryOne<{ id: string }>(
      `SELECT id FROM quest_templates WHERE code = 'konsep_grow_1'`,
      [],
    )
    const activeInstance = await queryOne<{ id: string }>(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end, status,
          progress_value, target_value, title_rendered)
       VALUES ($1, $2, '2020-03-01', '2020-03-01', 'active', 0, 1, 'Tumbuhkan 1 tanaman')
       RETURNING id`,
      [childId, activeTemplate!.id],
    )
    const early = await request(app)
      .post(`/api/me/quests/${activeInstance!.id}/claim`)
      .set('Authorization', `Bearer ${token}`)
    expect(early.status).toBe(400)

    // Another parent cannot claim this account's quest.
    const tag = randomUUID().slice(0, 8)
    const stranger = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`stranger-${tag}@example.com`, `Stranger ${tag}`],
    )
    const strangerToken = signToken(
      { id: stranger!.id, email: `stranger-${tag}@example.com`, role: 'parent' },
      { expiresIn: '7d' },
    )
    const claimables = claimable.filter((q) => q.id !== target.id)
    const theft = await request(app)
      .post(`/api/me/quests/${claimables[0].id}/claim`)
      .set('Authorization', `Bearer ${strangerToken}`)
    expect(theft.status).toBe(404)
    expect(await ledgerCount(childId, 'DAILY_QUEST_XP')).toBe(1)
  })

  test('pre-backfill completed quests are never claimable again (P2.2)', async () => {
    const template = await queryOne<{ id: string; xp_reward: number; coin_reward: number }>(
      `SELECT id, xp_reward, coin_reward FROM quest_templates WHERE code = 'konsep_session_1'`,
      [],
    )
    expect(template).toBeTruthy()

    // State after migration 0040's backfill: completed long ago, auto-paid
    // by the old evaluator (ledger row exists), claimed_at backfilled.
    const backfilled = await queryOne<{ id: string }>(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end, status,
          progress_value, target_value, title_rendered, completed_at, claimed_at)
       VALUES ($1, $2, '2020-01-01', '2020-01-01', 'completed',
               1, 1, 'Selesaikan 1 sesi latihan', '2020-01-01T10:00:00Z', '2020-01-01T10:00:00Z')
       RETURNING id`,
      [childId, template!.id],
    )
    await query(
      `INSERT INTO reward_ledger
         (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
       VALUES ($1, 'DAILY_QUEST_XP', 'child_quest_instance', $2, $3, $4, '{}'::jsonb)`,
      [childId, backfilled!.id, template!.xp_reward, template!.coin_reward],
    )

    const before = await profileTotals(childId)
    const res = await request(app)
      .post(`/api/me/quests/${backfilled!.id}/claim`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.claimed).toBe(false)
    expect(res.body.data.alreadyClaimed).toBe(true)
    expect(res.body.data.xp).toBe(0)
    expect(await profileTotals(childId)).toEqual(before)

    // Belt-and-braces: an auto-paid instance that somehow MISSED the
    // backfill (claimed_at NULL, ledger row present) still pays nothing —
    // the claim collides on the same ledger key the auto-grant used.
    const missed = await queryOne<{ id: string }>(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end, status,
          progress_value, target_value, title_rendered, completed_at)
       VALUES ($1, $2, '2020-01-02', '2020-01-02', 'completed',
               1, 1, 'Selesaikan 1 sesi latihan', '2020-01-02T10:00:00Z')
       RETURNING id`,
      [childId, template!.id],
    )
    await query(
      `INSERT INTO reward_ledger
         (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
       VALUES ($1, 'DAILY_QUEST_XP', 'child_quest_instance', $2, $3, $4, '{}'::jsonb)`,
      [childId, missed!.id, template!.xp_reward, template!.coin_reward],
    )
    const res2 = await request(app)
      .post(`/api/me/quests/${missed!.id}/claim`)
      .set('Authorization', `Bearer ${token}`)
    expect(res2.status).toBe(200)
    expect(res2.body.data.claimed).toBe(false)
    expect(res2.body.data.alreadyClaimed).toBe(true)
    expect(await profileTotals(childId)).toEqual(before)
    // ...and the miss is healed: claimed_at is now stamped.
    const healed = await queryOne<{ claimed_at: string | null }>(
      'SELECT claimed_at FROM child_quest_instances WHERE id = $1',
      [missed!.id],
    )
    expect(healed!.claimed_at).not.toBeNull()
  })

  async function chestRows(forChildId: string) {
    const rows = await query<{ threshold: number; xp_delta: string; coin_delta: string }>(
      `SELECT (metadata->>'threshold')::int AS threshold, xp_delta::text, coin_delta::text
       FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'CHAPTER_CHEST_XP'
       ORDER BY threshold`,
      [forChildId],
    )
    return rows.map((r) => ({
      threshold: Number(r.threshold),
      xp: Number(r.xp_delta),
      coins: Number(r.coin_delta),
    }))
  }

  test('chapter chests grant once per threshold across sessions and replays (P2.2)', async () => {
    const { subjectKey, instances } = await createSyntheticChapter()

    // Session 1 grows concept 1 to Dikuasai → 1/2 grown = 50% chest.
    const sessionId = randomUUID()
    const first = await commitKonsepSession(
      parentUserId, childId, subjectKey, sessionId, answersFor(instances[0].id, '7'),
    )
    expect(first.chests).toEqual([{ threshold: 50, coins: 15, xp: 0 }])
    expect(await chestRows(childId)).toEqual([{ threshold: 50, xp: 0, coins: 15 }])

    // Session drop: rolled once, 2-6 coins, mirrored in the ledger.
    expect(first.sessionDrop).toBeGreaterThanOrEqual(2)
    expect(first.sessionDrop).toBeLessThanOrEqual(6)
    expect(await ledgerCount(childId, 'SESSION_DROP_COIN')).toBe(1)

    // Replay of session 1: stored result verbatim, NO new chest/drop rows.
    const replay = await commitKonsepSession(
      parentUserId, childId, subjectKey, sessionId, answersFor(instances[0].id, '7'),
    )
    expect(replay).toEqual({ ...first, replayed: true })
    expect(await chestRows(childId)).toEqual([{ threshold: 50, xp: 0, coins: 15 }])
    expect(await ledgerCount(childId, 'SESSION_DROP_COIN')).toBe(1)

    // Session 2 grows concept 2 → 2/2 = 100% chest. The 50 threshold is
    // re-attempted (self-heal semantics) but collides on the ledger key.
    const second = await commitKonsepSession(
      parentUserId, childId, subjectKey, randomUUID(), answersFor(instances[1].id, '7'),
    )
    expect(second.chests).toEqual([{ threshold: 100, coins: 40, xp: 20 }])
    expect(await chestRows(childId)).toEqual([
      { threshold: 50, xp: 0, coins: 15 },
      { threshold: 100, xp: 20, coins: 40 },
    ])
    expect(await ledgerCount(childId, 'SESSION_DROP_COIN')).toBe(2)

    // Chest exactly once per (child, chapter, threshold) — and the cached
    // balance still reconciles with the ledger after everything above.
    const totals = await profileTotals(childId)
    const sums = await queryOne<{ xp: string; coins: string }>(
      `SELECT COALESCE(SUM(xp_delta), 0)::text AS xp, COALESCE(SUM(coin_delta), 0)::text AS coins
       FROM reward_ledger WHERE child_id = $1`,
      [childId],
    )
    expect(totals.totalXp).toBe(Number(sums!.xp))
    expect(totals.coinBalance).toBe(Number(sums!.coins))
  })
})
