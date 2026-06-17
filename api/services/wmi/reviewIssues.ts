import { query, queryOne } from '../../db.js'
import type { ReviewStatus } from './concepts/reviews.js'

export const ISSUE_PARTS = [
  'stem', 'answer', 'choices', 'hint', 'breakdown', 'illustration',
  'steps', 'animation', 'trap', 'meta', 'other',
] as const
export type IssuePart = (typeof ISSUE_PARTS)[number]

export const ISSUE_STATUSES = ['open', 'in_progress', 'fixed', 'verified', 'wont_fix'] as const
export type IssueStatus = (typeof ISSUE_STATUSES)[number]

export const ISSUE_SEVERITIES = ['blocker', 'warning', 'nit'] as const
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number]

export type IssueTargetType = 'paper' | 'paper_question' | 'concept'

export type ReviewIssue = {
  id: string
  target_type: IssueTargetType
  paper_id: string | null
  question_id: string | null
  concept_slug: string | null
  part: IssuePart
  severity: IssueSeverity
  title: string
  detail: string
  status: IssueStatus
  ai_actionable: boolean
  fix_note: string | null
  created_by: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

// Simple text parts a paper question can be quick-fixed inline (everything else -> Claude).
export const PAPER_QUICKFIX_PARTS: IssuePart[] = ['stem', 'answer', 'choices', 'hint']

// PURE - a status that means "resolved" (sets resolved_by + resolved_at).
export function resolutionFor(
  status: IssueStatus,
  actor: string | null,
): { resolved_by: string | null; setResolvedAt: boolean } {
  if (status === 'fixed' || status === 'verified' || status === 'wont_fix') {
    return { resolved_by: actor, setResolvedAt: true }
  }
  return { resolved_by: null, setResolvedAt: false }
}

// PURE - suggested (never auto-applied) item verdict from its issues.
export function suggestVerdict(
  issues: Pick<ReviewIssue, 'status' | 'severity'>[],
): ReviewStatus {
  if (issues.length === 0) return 'pending'
  const nonClosed = issues.filter((i) => i.status !== 'verified' && i.status !== 'wont_fix')
  if (nonClosed.length > 0) return 'needs_changes'
  return 'approved'
}

// --- DB access ---

const SELECT = `
  id, target_type, paper_id, question_id, concept_slug, part, severity,
  title, detail, status, ai_actionable, fix_note, created_by, resolved_by,
  created_at, updated_at, resolved_at
`

export type IssueFilter = {
  status?: IssueStatus
  ai_actionable?: boolean
  target_type?: IssueTargetType
  concept_slug?: string
  paper_id?: string
  question_id?: string
  part?: IssuePart
  severity?: IssueSeverity
}

export async function listIssues(f: IssueFilter = {}): Promise<ReviewIssue[]> {
  const where: string[] = []
  const params: unknown[] = []
  const add = (clause: string, val: unknown) => {
    params.push(val)
    where.push(`${clause} $${params.length}`)
  }
  if (f.status) add('status =', f.status)
  if (f.ai_actionable !== undefined) add('ai_actionable =', f.ai_actionable)
  if (f.target_type) add('target_type =', f.target_type)
  if (f.concept_slug) add('concept_slug =', f.concept_slug)
  if (f.paper_id) add('paper_id =', f.paper_id)
  if (f.question_id) add('question_id =', f.question_id)
  if (f.part) add('part =', f.part)
  if (f.severity) add('severity =', f.severity)
  const sql = `SELECT ${SELECT} FROM wmi_review_issues
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY (status IN ('verified','wont_fix')) ASC, created_at DESC`
  return query<ReviewIssue>(sql, params)
}

export type NewIssue = {
  target_type: IssueTargetType
  paper_id?: string | null
  question_id?: string | null
  concept_slug?: string | null
  part: IssuePart
  severity?: IssueSeverity
  title: string
  detail?: string
  ai_actionable?: boolean
}

export async function createIssue(input: NewIssue, createdBy: string | null): Promise<ReviewIssue> {
  const row = await queryOne<ReviewIssue>(
    `INSERT INTO wmi_review_issues
       (target_type, paper_id, question_id, concept_slug, part, severity, title, detail, ai_actionable, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${SELECT}`,
    [
      input.target_type, input.paper_id ?? null, input.question_id ?? null, input.concept_slug ?? null,
      input.part, input.severity ?? 'warning', input.title, input.detail ?? '',
      input.ai_actionable ?? true, createdBy,
    ],
  )
  return row as ReviewIssue
}

export type IssuePatch = {
  status?: IssueStatus
  fix_note?: string
  severity?: IssueSeverity
  ai_actionable?: boolean
  title?: string
  detail?: string
}

export async function updateIssue(
  id: string,
  patch: IssuePatch,
  actor: string | null,
): Promise<ReviewIssue | null> {
  const sets: string[] = ['updated_at = NOW()']
  const params: unknown[] = []
  const set = (col: string, val: unknown) => {
    params.push(val)
    sets.push(`${col} = $${params.length}`)
  }
  if (patch.severity !== undefined) set('severity', patch.severity)
  if (patch.ai_actionable !== undefined) set('ai_actionable', patch.ai_actionable)
  if (patch.title !== undefined) set('title', patch.title)
  if (patch.detail !== undefined) set('detail', patch.detail)
  if (patch.fix_note !== undefined) set('fix_note', patch.fix_note)
  if (patch.status !== undefined) {
    set('status', patch.status)
    const r = resolutionFor(patch.status, actor)
    set('resolved_by', r.resolved_by)
    sets.push(`resolved_at = ${r.setResolvedAt ? 'NOW()' : 'NULL'}`)
  }
  params.push(id)
  const row = await queryOne<ReviewIssue>(
    `UPDATE wmi_review_issues SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${SELECT}`,
    params,
  )
  return row
}

// Open-issue counts per target, for sidebar badges.
export async function getOpenIssueCounts(): Promise<{
  byConcept: Record<string, number>
  byPaper: Record<string, number>
  fixedByConcept: Record<string, number>
  fixedByPaper: Record<string, number>
}> {
  const rows = await query<{
    concept_slug: string | null
    paper_id: string | null
    status: IssueStatus
    n: number
  }>(
    `SELECT concept_slug, paper_id, status, COUNT(*)::int AS n
     FROM wmi_review_issues
     WHERE status IN ('open','in_progress','fixed')
     GROUP BY concept_slug, paper_id, status`,
  )
  const byConcept: Record<string, number> = {}
  const byPaper: Record<string, number> = {}
  const fixedByConcept: Record<string, number> = {}
  const fixedByPaper: Record<string, number> = {}
  for (const r of rows) {
    const n = Number(r.n)
    const openTarget = r.status !== 'fixed'
    if (r.concept_slug) {
      const bucket = openTarget ? byConcept : fixedByConcept
      bucket[r.concept_slug] = (bucket[r.concept_slug] ?? 0) + n
    }
    if (r.paper_id) {
      const bucket = openTarget ? byPaper : fixedByPaper
      bucket[r.paper_id] = (bucket[r.paper_id] ?? 0) + n
    }
  }
  return { byConcept, byPaper, fixedByConcept, fixedByPaper }
}
