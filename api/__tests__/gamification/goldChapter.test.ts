// gold_chapter_first aggregate against a real Postgres (Mythos P2.4).
// Skips unless TEST_DATABASE_URL is set (see api/__tests__/setup.ts).
//
// Exercises the gold_chapters subselect in fetchAchievementState: a chapter
// counts only when EVERY enabled concept of its subject_key sits at
// best_tier >= Mahir for the child — partially-grown, unattempted, and
// disabled-concept cases included.

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, withTransaction } from '../../db.js'
import { __test__ } from '../../services/gamification/achievementEvaluator.js'
import { PROFICIENT_TIER } from '../../services/wmi/concepts/comprehension.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const { fetchAchievementState } = __test__
const RUN = Boolean(process.env.TEST_DATABASE_URL)

interface WmiFixture {
  subjectKey: string
  slugs: string[] // [0..1] enabled, [2] disabled
}

async function createWmiChapter(): Promise<WmiFixture> {
  const tag = randomUUID().slice(0, 8)
  const subjectKey = `test-chapter-${tag}`
  await query(
    `INSERT INTO wmi_subjects (subject_key, grade, name_id, name_en, color_hex, icon_key)
       VALUES ($1, 1, 'Bab Tes', 'Test Chapter', '#FFFFFF', 'star')`,
    [subjectKey],
  )
  const slugs = [0, 1, 2].map((i) => `test-concept-${tag}-${i}`)
  for (const [i, slug] of slugs.entries()) {
    await query(
      `INSERT INTO wmi_concepts (slug, name_en, name_id, grades, enabled, subject_key)
         VALUES ($1, $1, $1, '{1}', $2, $3)`,
      [slug, i < 2, subjectKey], // third concept disabled — must not block gold
    )
  }
  return { subjectKey, slugs }
}

async function cleanupWmiChapter(wmi: WmiFixture): Promise<void> {
  // Concept delete cascades wmi_concept_progress.
  await query(`DELETE FROM wmi_concepts WHERE subject_key = $1`, [wmi.subjectKey])
  await query(`DELETE FROM wmi_subjects WHERE subject_key = $1`, [wmi.subjectKey])
}

async function setProgress(childId: string, slug: string, bestTier: number): Promise<void> {
  await query(
    `INSERT INTO wmi_concept_progress (child_id, concept_slug, best_tier)
       VALUES ($1, $2, $3)
       ON CONFLICT (child_id, concept_slug) DO UPDATE SET best_tier = $3`,
    [childId, slug, bestTier],
  )
}

async function goldChapters(childId: string): Promise<number> {
  const state = await withTransaction((c) => fetchAchievementState(c, childId))
  return state.goldChapters
}

afterAll(async () => {
  if (RUN) await pool.end()
})

describe.skipIf(!RUN)('gold_chapter_first aggregate', () => {
  let fx: Fixtures
  let wmi: WmiFixture

  beforeEach(async () => {
    fx = await createFixtures()
    wmi = await createWmiChapter()
  })

  afterEach(async () => {
    await cleanupWmiChapter(wmi)
    await cleanupFixtures(fx)
  })

  it('does not count a chapter with an unattempted concept', async () => {
    await setProgress(fx.childId, wmi.slugs[0], PROFICIENT_TIER)
    // slugs[1] never attempted — no progress row at all.
    expect(await goldChapters(fx.childId)).toBe(0)
  })

  it('does not count a chapter with a below-Mahir concept', async () => {
    await setProgress(fx.childId, wmi.slugs[0], PROFICIENT_TIER)
    await setProgress(fx.childId, wmi.slugs[1], PROFICIENT_TIER - 1)
    expect(await goldChapters(fx.childId)).toBe(0)
  })

  it('counts the chapter once every ENABLED concept reaches Mahir', async () => {
    await setProgress(fx.childId, wmi.slugs[0], PROFICIENT_TIER)
    await setProgress(fx.childId, wmi.slugs[1], PROFICIENT_TIER)
    // slugs[2] is disabled and still ungrown — it must not block gold.
    expect(await goldChapters(fx.childId)).toBe(1)
  })

  it("another child's progress never leaks into the count", async () => {
    await setProgress(fx.childId, wmi.slugs[0], PROFICIENT_TIER)
    await setProgress(fx.childId, wmi.slugs[1], PROFICIENT_TIER)
    const other = await createFixtures()
    try {
      expect(await goldChapters(other.childId)).toBe(0)
    } finally {
      await cleanupFixtures(other)
    }
  })
})
