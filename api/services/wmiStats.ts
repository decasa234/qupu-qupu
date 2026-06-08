import { queryOne } from '../db.js'

export interface WmiPublicStats {
  concepts: number
  papers: number
  videos: number
  gradeMin: number | null
  gradeMax: number | null
}

export async function getWmiPublicStats(): Promise<WmiPublicStats> {
  const row = await queryOne<{
    concepts: number
    papers: number
    videos: number
    grade_min: number | null
    grade_max: number | null
  }>(
    `
      SELECT
        (SELECT COUNT(*)::int FROM wmi_concepts WHERE enabled = TRUE) AS concepts,
        (SELECT COUNT(*)::int FROM wmi_papers)                        AS papers,
        (SELECT COUNT(*)::int FROM videos
           WHERE is_published = TRUE AND deleted_at IS NULL)          AS videos,
        -- Grade range reflects the practice papers (Kelas 1-3).
        (SELECT MIN(grade)::int FROM wmi_papers)                      AS grade_min,
        (SELECT MAX(grade)::int FROM wmi_papers)                      AS grade_max
    `,
    [],
  )

  return {
    concepts: row?.concepts ?? 0,
    papers: row?.papers ?? 0,
    videos: row?.videos ?? 0,
    gradeMin: row?.grade_min ?? null,
    gradeMax: row?.grade_max ?? null,
  }
}
