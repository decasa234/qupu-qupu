import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { query, queryOne } from '../../db.js'
import { getPaperReview, upsertPaperReview, listPapersForAdmin } from './paperReviews.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('paperReviews', () => {
  let paperId: string

  beforeAll(async () => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO wmi_papers (year, grade, level_code, level_sort, round, variant, title, recommended_duration_min, question_count)
       VALUES (2099, 0, 'g0', 0, 'final', 'A', 'TEST paper', 60, 0)
       RETURNING id`,
    )
    paperId = row!.id
  })

  afterAll(async () => {
    await query(`DELETE FROM wmi_papers WHERE id = $1`, [paperId])
  })

  it('starts with no review, then upserts and reads back', async () => {
    expect(await getPaperReview(paperId)).toBeNull()
    const r = await upsertPaperReview(paperId, 'approved', 'looks good', 'admin@test')
    expect(r.status).toBe('approved')
    expect(r.notes).toBe('looks good')
    expect((await getPaperReview(paperId))?.status).toBe('approved')
  })

  it('upserts in place (updates the same row)', async () => {
    const r2 = await upsertPaperReview(paperId, 'needs_changes', 'fix q1', 'admin@test')
    expect(r2.status).toBe('needs_changes')
    expect((await getPaperReview(paperId))?.notes).toBe('fix q1')
  })

  it('lists the paper with its current status', async () => {
    const mine = (await listPapersForAdmin()).find((p) => p.id === paperId)
    expect(mine?.status).toBe('needs_changes')
  })
})
