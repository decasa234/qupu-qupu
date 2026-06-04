import { query, queryOne } from '../../../db.js'

export type ReviewStatus = 'pending' | 'approved' | 'needs_changes'

// Object-literal type alias (not interface) so it satisfies pg's QueryResultRow.
export type ConceptReview = {
  concept_slug: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string
}

export async function getConceptReview(slug: string): Promise<ConceptReview | null> {
  return queryOne<ConceptReview>(
    `SELECT concept_slug, status, notes, reviewed_by, updated_at
     FROM wmi_concept_reviews
     WHERE concept_slug = $1`,
    [slug],
  )
}

export async function listConceptReviewStatuses(): Promise<Record<string, ReviewStatus>> {
  const rows = await query<{ concept_slug: string; status: ReviewStatus }>(
    `SELECT concept_slug, status FROM wmi_concept_reviews`,
  )
  return Object.fromEntries(rows.map((r) => [r.concept_slug, r.status]))
}

export async function upsertConceptReview(
  slug: string,
  status: ReviewStatus,
  notes: string,
  reviewedBy: string | null,
): Promise<ConceptReview> {
  const row = await queryOne<ConceptReview>(
    `INSERT INTO wmi_concept_reviews (concept_slug, status, notes, reviewed_by, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (concept_slug) DO UPDATE
       SET status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           reviewed_by = EXCLUDED.reviewed_by,
           updated_at = NOW()
     RETURNING concept_slug, status, notes, reviewed_by, updated_at`,
    [slug, status, notes, reviewedBy],
  )
  return row as ConceptReview
}
