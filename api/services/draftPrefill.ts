import { query, withTransaction } from '../db.js'

/*
 * Title-pattern prefill rules: map a video title to its subject, age group,
 * question count, and (via the subject's default template) badge ranges. Used
 * both when bulk-importing from YouTube (youtubeChannelImport) and by the admin
 * "auto-complete drafts" action below.
 *
 * Lives in its own module so it can be shared by both youtubeChannelImport.ts
 * (which imports videos.ts) and the catalog tooling without an import cycle.
 */

export interface BadgeRangeJson {
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

export interface PrefillRule {
  pattern: RegExp
  subjectSlug: string
  ageGroupName: string
  numberOfQuestions: number
}

// Order matters: aljabar must be checked before matematika because aljabar
// titles often contain "Kuis Matematika" in parentheses.
//
// Slugs and age-group names below match the live DB. Lookups are whitespace-
// tolerant (see resolvePrefill / loadPrefillContext), so stray spaces in the
// stored values won't break a match.
export const PREFILL_RULES: PrefillRule[] = [
  {
    pattern: /beda/i,
    subjectSlug: 'odd-one-out',
    ageGroupName: 'Semua Usia',
    numberOfQuestions: 60,
  },
  {
    pattern: /aljabar/i,
    subjectSlug: 'aljabar-1',
    ageGroupName: 'Usia 5-8 ( TK-2SD )',
    numberOfQuestions: 30,
  },
  {
    pattern: /matematika/i,
    subjectSlug: 'matematika-1',
    ageGroupName: 'Usia 5-8 ( TK-2SD )',
    numberOfQuestions: 20,
  },
]

export interface PrefillContext {
  subjectsBySlug: Map<string, { id: string; defaultBadgeRanges: BadgeRangeJson[] }>
  ageGroupsByName: Map<string, string>
}

export interface ResolvedPrefill {
  subjectId: string
  ageGroupId: string
  numberOfQuestions: number
  badgeRanges: BadgeRangeJson[]
}

export async function loadPrefillContext(): Promise<PrefillContext> {
  const [subjects, ageGroups] = await Promise.all([
    query<{ id: string; slug: string; default_badge_ranges: unknown }>(
      'SELECT id, slug, default_badge_ranges FROM subjects',
    ),
    query<{ id: string; name: string }>('SELECT id, name FROM age_groups'),
  ])

  const subjectsBySlug = new Map<string, { id: string; defaultBadgeRanges: BadgeRangeJson[] }>()
  for (const subject of subjects) {
    subjectsBySlug.set(subject.slug, {
      id: subject.id,
      defaultBadgeRanges: Array.isArray(subject.default_badge_ranges)
        ? (subject.default_badge_ranges as BadgeRangeJson[])
        : [],
    })
  }

  // Key by trimmed name: some age-group rows carry stray trailing whitespace
  // (e.g. "Semua Usia "), which would otherwise break the exact-match lookup.
  const ageGroupsByName = new Map<string, string>()
  for (const ageGroup of ageGroups) {
    ageGroupsByName.set(ageGroup.name.trim(), ageGroup.id)
  }

  return { subjectsBySlug, ageGroupsByName }
}

export function resolvePrefill(title: string, context: PrefillContext): ResolvedPrefill | null {
  for (const rule of PREFILL_RULES) {
    if (!rule.pattern.test(title)) continue
    const subject = context.subjectsBySlug.get(rule.subjectSlug.trim())
    const ageGroupId = context.ageGroupsByName.get(rule.ageGroupName.trim())
    if (!subject || !ageGroupId) {
      console.warn(
        `Prefill skipped for "${title}" — missing subject "${rule.subjectSlug}" or age group "${rule.ageGroupName}" in DB`,
      )
      return null
    }
    return {
      subjectId: subject.id,
      ageGroupId,
      numberOfQuestions: rule.numberOfQuestions,
      badgeRanges: subject.defaultBadgeRanges,
    }
  }
  return null
}

// Apply prefill rules to every incomplete draft (not published, missing subject
// / age group / question count). Fills the ones whose title matches a rule and
// leaves them as drafts for review — never auto-publishes. Returns how many of
// the incomplete drafts were completed.
export async function autocompleteDrafts(): Promise<{ total: number; completed: number }> {
  const context = await loadPrefillContext()

  const drafts = await query<{ id: string; title: string }>(`
    SELECT id, title
    FROM videos
    WHERE is_published = false
      AND deleted_at IS NULL
      AND (subject_id IS NULL OR age_group_id IS NULL OR number_of_questions IS NULL)
    ORDER BY created_at DESC
  `)

  let completed = 0
  for (const draft of drafts) {
    const prefill = resolvePrefill(draft.title, context)
    if (!prefill) continue

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE videos
         SET subject_id = $2, age_group_id = $3, number_of_questions = $4, updated_at = NOW()
         WHERE id = $1 AND is_published = false`,
        [draft.id, prefill.subjectId, prefill.ageGroupId, prefill.numberOfQuestions],
      )
      await client.query('DELETE FROM video_badge_rules WHERE video_id = $1', [draft.id])
      for (const range of prefill.badgeRanges) {
        await client.query(
          'INSERT INTO video_badge_rules (video_id, min_correct, max_correct, badge_count) VALUES ($1, $2, $3, $4)',
          [draft.id, range.minCorrect, range.maxCorrect, range.badgeCount],
        )
      }
    })
    completed += 1
  }

  return { total: drafts.length, completed }
}
