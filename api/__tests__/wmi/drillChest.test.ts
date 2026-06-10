// Chapter chests on the drill path (P2 review item 2) + the 0044 backfill.
//
// The contract under test:
//   - a single-answer drill attempt (mode=concept) that crosses a concept to
//     Mahir evaluates the chapter's chests and pays through the SAME
//     deterministic ledger keys as the session-commit path (no double-pay);
//   - migration 0044 heals (child, subject) pairs already past a threshold:
//     inserts the deterministic CHAPTER_CHEST_XP rows and credits profiles
//     for the rows that actually appended — idempotently on re-run.
//
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, test, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pool, query, queryOne } from '../../db.js'
import { deterministicUuid } from '../../lib/deterministicUuid.js'
import { submitWmiAttempt } from '../../services/wmi/attempts.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

const MIGRATION_PATH = fileURLToPath(
  new URL('../../../db/migrations/0044_chest_backfill.sql', import.meta.url),
)

;(runIntegration ? describe : describe.skip)('drill-path chapter chests + 0044 backfill', () => {
  let parentUserId: string
  let childId: string
  const createdUserIds: string[] = []
  const createdSubjectKeys: string[] = []

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`drill-chest-${tag}@example.com`, `DrillChest Test ${tag}`],
    )
    parentUserId = user!.id
    createdUserIds.push(parentUserId)
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
  })

  afterEach(async () => {
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
    createdUserIds.length = 0
    // Synthetic chapters: concepts/instances cascade from the concept delete.
    for (const subjectKey of createdSubjectKeys) {
      await query(`DELETE FROM wmi_concepts WHERE subject_key = $1`, [subjectKey])
      await query(`DELETE FROM wmi_subjects WHERE subject_key = $1`, [subjectKey])
    }
    createdSubjectKeys.length = 0
  })

  afterAll(async () => {
    await pool.end()
  })

  // One-concept chapter: a single Mahir crossing takes it 0% -> 100% grown,
  // so BOTH thresholds (50 and 100) become due at once.
  async function createSyntheticChapter() {
    const tag = randomUUID().slice(0, 8)
    const subjectKey = `g1-chest-${tag}`
    await query(
      `INSERT INTO wmi_subjects (subject_key, grade, name_id, name_en, color_hex, icon_key, sort_order)
       VALUES ($1, 1, 'Bab Peti', 'Chest Chapter', '#654321', 'box', 997)`,
      [subjectKey],
    )
    createdSubjectKeys.push(subjectKey)
    const slug = `chest-${tag}`
    await query(
      `INSERT INTO wmi_concepts (slug, name_en, name_id, grades, enabled, subject_key, difficulty, sort_order)
       VALUES ($1, 'Chest', 'Peti', ARRAY[1]::smallint[], TRUE, $2, 1, 1)`,
      [slug, subjectKey],
    )
    const inst = await queryOne<{ id: string }>(
      `INSERT INTO wmi_concept_instances
         (concept_slug, params, body_en, body_id, answer_type, answer)
       VALUES ($1, $2::jsonb, 'What is 3+4?', 'Berapa 3+4?', 'fill_in', '7')
       RETURNING id`,
      [slug, JSON.stringify({ tag })],
    )
    return { subjectKey, slug, instanceId: inst!.id }
  }

  async function chestRows(forChildId: string, subjectKey: string) {
    return query<{ source_id: string; xp_delta: string; coin_delta: string; metadata: { threshold: number } }>(
      `SELECT source_id, xp_delta::text, coin_delta::text, metadata
         FROM reward_ledger
        WHERE child_id = $1 AND reward_type = 'CHAPTER_CHEST_XP'
          AND metadata->>'subjectKey' = $2
        ORDER BY (metadata->>'threshold')::int`,
      [forChildId, subjectKey],
    )
  }

  async function profileBalances(forChildId: string) {
    const row = await queryOne<{ total_xp: string; coin_balance: string }>(
      `SELECT total_xp::text, coin_balance::text FROM gamification_profiles WHERE child_id = $1`,
      [forChildId],
    )
    return { xp: Number(row?.total_xp ?? 0), coins: Number(row?.coin_balance ?? 0) }
  }

  // Progress one correct answer away from Mahir: attempts=5, correct=5,
  // recent all-true. The next correct makes correct=6 (>= C_MAHIR) with 6 of
  // the last 7 recent correct (>= MAHIR_RECENT) -> tier 3, from best_tier 2.
  async function seedAlmostMahir(forChildId: string, slug: string) {
    await query(
      `INSERT INTO wmi_concept_progress
         (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct)
       VALUES ($1, $2, 5, 5, 5, '[true,true,true,true,true]'::jsonb, 2, 60)`,
      [forChildId, slug],
    )
  }

  test('a drill answer crossing Mahir grants the chapter chests once', async () => {
    const { subjectKey, slug, instanceId } = await createSyntheticChapter()
    await seedAlmostMahir(childId, slug)

    const result = await submitWmiAttempt(parentUserId, {
      childId,
      conceptInstanceId: instanceId,
      mode: 'concept',
      selectedAnswer: '7',
    })
    expect(result.is_correct).toBe(true)
    expect(result.gamification?.tierUp?.toTier).toBe(3)

    // Both thresholds due (1/1 concept grown = 100%), deterministic keys.
    const chests = await chestRows(childId, subjectKey)
    expect(chests).toHaveLength(2)
    expect(chests[0].source_id).toBe(deterministicUuid(`chest:${childId}:${subjectKey}:50`))
    expect(Number(chests[0].coin_delta)).toBe(15)
    expect(Number(chests[0].xp_delta)).toBe(0)
    expect(chests[1].source_id).toBe(deterministicUuid(`chest:${childId}:${subjectKey}:100`))
    expect(Number(chests[1].coin_delta)).toBe(40)
    expect(Number(chests[1].xp_delta)).toBe(20)

    // The gamification payload folds the chests in: 4 XP (tier-2-priced
    // correct) + 20 (tier-3 bonus) + 20 (100% chest) = 44 XP; 1 coin + 5
    // (tier-3 bonus) + 15 + 40 (chests) = 61 coins.
    expect(result.gamification?.xpEarned).toBe(44)
    expect(result.gamification?.coinsEarned).toBe(61)

    // Cached balances reconcile with the full ledger and the payload.
    const ledgerSum = await queryOne<{ xp: string; coins: string }>(
      `SELECT COALESCE(SUM(xp_delta), 0)::text AS xp, COALESCE(SUM(coin_delta), 0)::text AS coins
         FROM reward_ledger WHERE child_id = $1`,
      [childId],
    )
    const balances = await profileBalances(childId)
    expect(balances.xp).toBe(Number(ledgerSum!.xp))
    expect(balances.coins).toBe(Number(ledgerSum!.coins))
    expect(result.gamification?.coinBalance).toBe(balances.coins)
    expect(result.gamification?.totalXp).toBe(balances.xp)

    // A repeat of the same instance neither re-crosses nor re-grants.
    const replay = await submitWmiAttempt(parentUserId, {
      childId,
      conceptInstanceId: instanceId,
      mode: 'concept',
      selectedAnswer: '7',
    })
    expect(replay.gamification?.tierUp).toBeNull()
    expect(await chestRows(childId, subjectKey)).toHaveLength(2)
  })

  test('0044 backfill heals already-grown chapters idempotently', async () => {
    const { subjectKey, slug } = await createSyntheticChapter()
    // Drift state: chapter fully grown but no chest was ever paid (the
    // pre-fix drill path). No profile row either — the migration creates it.
    await query(
      `INSERT INTO wmi_concept_progress
         (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct)
       VALUES ($1, $2, 8, 7, 4, '[true,true,true,true]'::jsonb, 3, 75)`,
      [childId, slug],
    )

    const migrationSql = readFileSync(MIGRATION_PATH, 'utf8')
    await pool.query(migrationSql)

    const chests = await chestRows(childId, subjectKey)
    expect(chests).toHaveLength(2)
    expect(chests[0].source_id).toBe(deterministicUuid(`chest:${childId}:${subjectKey}:50`))
    expect(chests[1].source_id).toBe(deterministicUuid(`chest:${childId}:${subjectKey}:100`))

    // Profile credited with exactly the inserted amounts: 15+40 coins, 20 XP.
    const after = await profileBalances(childId)
    expect(after.coins).toBe(55)
    expect(after.xp).toBe(20)

    // Re-running the migration credits nothing twice.
    await pool.query(migrationSql)
    expect(await chestRows(childId, subjectKey)).toHaveLength(2)
    const rerun = await profileBalances(childId)
    expect(rerun.coins).toBe(55)
    expect(rerun.xp).toBe(20)
  })

  test('backfill skips chapters the live path already paid', async () => {
    const { subjectKey, slug, instanceId } = await createSyntheticChapter()
    await seedAlmostMahir(childId, slug)
    // Live drill path pays the chests…
    await submitWmiAttempt(parentUserId, {
      childId,
      conceptInstanceId: instanceId,
      mode: 'concept',
      selectedAnswer: '7',
    })
    const before = await profileBalances(childId)

    // …so the backfill collides on every key and credits nothing.
    await pool.query(readFileSync(MIGRATION_PATH, 'utf8'))
    expect(await chestRows(childId, subjectKey)).toHaveLength(2)
    const after = await profileBalances(childId)
    expect(after).toEqual(before)
  })
})
