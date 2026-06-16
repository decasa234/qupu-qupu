// Idempotent seeder for the Fundamentals course. Upserts modules then lessons
// from content.ts, validating each lesson's blocks against the shared schema so
// a malformed authoring mistake fails the seed instead of reaching the DB.
//
//   npm run seed:fundamentals

import dotenv from 'dotenv'
import { Pool } from 'pg'
import { lessonBlocksSchema } from '../../../api/services/fundamentals/blocks.js'
import { LESSONS, MODULES } from './content.js'

dotenv.config()

const ssl =
  process.env.DATABASE_SSL === 'verify'
    ? { rejectUnauthorized: true }
    : process.env.DATABASE_SSL === 'require'
      ? { rejectUnauthorized: false }
      : false

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl })

async function main() {
  // Validate everything up front — never seed a malformed lesson.
  for (const lesson of LESSONS) {
    const parsed = lessonBlocksSchema.safeParse(lesson.blocks)
    if (!parsed.success) {
      throw new Error(
        `Lesson "${lesson.slug}" has invalid blocks:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
      )
    }
  }

  let modules = 0
  let lessons = 0

  for (const m of MODULES) {
    await pool.query(
      `
      INSERT INTO fundamentals_modules
        (slug, title_en, title_id, summary_en, summary_id, sort_order, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (slug) DO UPDATE SET
        title_en = EXCLUDED.title_en, title_id = EXCLUDED.title_id,
        summary_en = EXCLUDED.summary_en, summary_id = EXCLUDED.summary_id,
        sort_order = EXCLUDED.sort_order, status = EXCLUDED.status,
        updated_at = NOW()
      `,
      [m.slug, m.title_en, m.title_id, m.summary_en, m.summary_id, m.sort_order, m.status],
    )
    modules += 1
  }

  for (const l of LESSONS) {
    await pool.query(
      `
      INSERT INTO fundamentals_lessons
        (slug, module_slug, brand, title_en, title_id, summary_en, summary_id,
         est_minutes, sort_order, status, blocks)
      VALUES ($1,$2,NULL,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
      ON CONFLICT (slug) DO UPDATE SET
        module_slug = EXCLUDED.module_slug,
        title_en = EXCLUDED.title_en, title_id = EXCLUDED.title_id,
        summary_en = EXCLUDED.summary_en, summary_id = EXCLUDED.summary_id,
        est_minutes = EXCLUDED.est_minutes, sort_order = EXCLUDED.sort_order,
        status = EXCLUDED.status, blocks = EXCLUDED.blocks,
        updated_at = NOW()
      `,
      [
        l.slug,
        l.module_slug,
        l.title_en,
        l.title_id,
        l.summary_en,
        l.summary_id,
        l.est_minutes,
        l.sort_order,
        l.status,
        JSON.stringify(l.blocks),
      ],
    )
    lessons += 1
  }

  console.log(`Seeded ${modules} modules, ${lessons} lessons.`)
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
