import { query, queryOne } from '../../../db.js'

export type ReviewStatus = 'pending' | 'approved' | 'needs_changes'

// Object-literal type alias (not interface) so it satisfies pg's QueryResultRow.
export type ConceptReview = {
  concept_slug: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  wmi_refined: boolean
  updated_at: string
}

export async function getConceptReview(slug: string): Promise<ConceptReview | null> {
  return queryOne<ConceptReview>(
    `SELECT concept_slug, status, notes, reviewed_by, wmi_refined, updated_at
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

// Slugs flagged as WMI-refined (question wording + breakdown + hint_steps
// polished to WMI/olympiad style). Independent of the review status.
export async function listWmiRefinedSlugs(): Promise<Set<string>> {
  const rows = await query<{ concept_slug: string }>(
    `SELECT concept_slug FROM wmi_concept_reviews WHERE wmi_refined = TRUE`,
  )
  return new Set(rows.map((r) => r.concept_slug))
}

export async function setWmiRefined(slug: string, value: boolean): Promise<void> {
  await query(
    `INSERT INTO wmi_concept_reviews (concept_slug, wmi_refined, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (concept_slug) DO UPDATE SET wmi_refined = EXCLUDED.wmi_refined`,
    [slug, value],
  )
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
