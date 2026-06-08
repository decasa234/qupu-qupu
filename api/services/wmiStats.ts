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
        -- Grade range reflects the learning CONTENT (concepts span 0-3),
        -- which matches the "Kelas 0-3" copy. Papers only cover 1-3 so far.
        (SELECT MIN(g)::int FROM wmi_concepts c, unnest(c.grades) g
           WHERE c.enabled = TRUE)                                    AS grade_min,
        (SELECT MAX(g)::int FROM wmi_concepts c, unnest(c.grades) g
           WHERE c.enabled = TRUE)                                    AS grade_max
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
