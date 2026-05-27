// api/__tests__/helpers/fixtures.ts
//
// Test fixtures for the gamification integration suites. Builds a complete
// entity graph in the test database:
//
//   age_group ─┐
//   subject ───┼─► video ─► video_badge_rules
//   user ──────┴─► child
//
// Teardown deletes the user (children + score_attempts + gamification rows
// cascade) and the video/subject/age_group (videos RESTRICT-reference
// subjects and age_groups, so the video goes first).

import { randomUUID } from 'node:crypto'
import { query, queryOne } from '../../db.js'

export interface Fixtures {
  userId: string
  childId: string
  videoId: string
  subjectId: string
  ageGroupId: string
  numberOfQuestions: number
}

export async function createFixtures(): Promise<Fixtures> {
  const tag = randomUUID().slice(0, 8)
  const numberOfQuestions = 10

  const ageGroup = await queryOne<{ id: string }>(
    `INSERT INTO age_groups (name, min_age, max_age)
       VALUES ($1, 6, 9) RETURNING id`,
    [`test-age-${tag}`],
  )
  const subject = await queryOne<{ id: string }>(
    `INSERT INTO subjects (name, slug) VALUES ($1, $2) RETURNING id`,
    [`Test Subject ${tag}`, `test-subj-${tag}`],
  )
  const user = await queryOne<{ id: string }>(
    `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
    [`test-${tag}@example.test`, `Test Parent ${tag}`],
  )
  const child = await queryOne<{ id: string }>(
    `INSERT INTO children (parent_user_id, name, age_group_id)
       VALUES ($1, $2, $3) RETURNING id`,
    [user!.id, `Test Child ${tag}`, ageGroup!.id],
  )
  const video = await queryOne<{ id: string }>(
    `INSERT INTO videos
       (slug, title, youtube_url, youtube_video_id,
        subject_id, age_group_id, number_of_questions, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE) RETURNING id`,
    [
      `test-vid-${tag}`,
      `Test Video ${tag}`,
      `https://youtube.com/watch?v=${tag}`,
      `yt-${tag}`,
      subject!.id,
      ageGroup!.id,
      numberOfQuestions,
    ],
  )
  // Badge rules: 0-4 correct → 0 badges, 5-7 → 1, 8-10 → 3.
  await query<{ id: string }>(
    `INSERT INTO video_badge_rules (video_id, min_correct, max_correct, badge_count)
       VALUES ($1, 0, 4, 0), ($1, 5, 7, 1), ($1, 8, 10, 3)`,
    [video!.id],
  )

  return {
    userId: user!.id,
    childId: child!.id,
    videoId: video!.id,
    subjectId: subject!.id,
    ageGroupId: ageGroup!.id,
    numberOfQuestions,
  }
}

export async function cleanupFixtures(f: Fixtures): Promise<void> {
  // users → children → score_attempts and all gamification rows cascade.
  await query<{ id: string }>(`DELETE FROM users WHERE id = $1`, [f.userId])
  // videos → video_badge_rules cascade; subjects and age_groups are
  // RESTRICT-referenced by videos, so the video must go first.
  await query<{ id: string }>(`DELETE FROM videos WHERE id = $1`, [f.videoId])
  await query<{ id: string }>(`DELETE FROM subjects WHERE id = $1`, [f.subjectId])
  await query<{ id: string }>(`DELETE FROM age_groups WHERE id = $1`, [f.ageGroupId])
}
