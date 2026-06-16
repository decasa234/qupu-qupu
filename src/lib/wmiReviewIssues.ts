import api from './api'

export type IssuePart =
  | 'stem' | 'answer' | 'choices' | 'hint' | 'breakdown' | 'illustration'
  | 'steps' | 'animation' | 'trap' | 'meta' | 'other'
export type IssueStatus = 'open' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix'
export type IssueSeverity = 'blocker' | 'warning' | 'nit'
export type IssueTargetType = 'paper' | 'paper_question' | 'concept'

export const PAPER_QUICKFIX_PARTS: IssuePart[] = ['stem', 'answer', 'choices', 'hint']

// Parts offered in the "Add flag" type dropdown.
export const FLAGGABLE_PARTS: IssuePart[] = [
  'stem', 'answer', 'choices', 'hint', 'breakdown', 'illustration',
  'steps', 'animation', 'trap', 'meta', 'other',
]

export const PART_LABELS: Record<IssuePart, string> = {
  stem: 'Question text (stem)',
  answer: 'Answer',
  choices: 'Choices',
  hint: 'Hint',
  breakdown: 'Breakdown',
  illustration: 'Illustration',
  steps: 'Step-by-step',
  animation: 'Animation',
  trap: 'Trap',
  meta: 'Metadata',
  other: 'Other',
}

export interface ReviewIssue {
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

export interface IssueCounts {
  byConcept: Record<string, number>
  byPaper: Record<string, number>
  fixedByConcept: Record<string, number>
  fixedByPaper: Record<string, number>
}

export type IssueTarget =
  | { target_type: 'concept'; concept_slug: string }
  | { target_type: 'paper'; paper_id: string }
  | { target_type: 'paper_question'; paper_id: string; question_id: string }

type ListParams = Partial<{
  status: IssueStatus
  ai_actionable: boolean
  target_type: IssueTargetType
  concept_slug: string
  paper_id: string
  question_id: string
  part: IssuePart
  severity: IssueSeverity
}>

export async function listIssues(params: ListParams = {}): Promise<ReviewIssue[]> {
  const { data } = await api.get('/admin/wmi/issues', { params })
  return data.data.issues
}

export async function fetchIssueCounts(): Promise<IssueCounts> {
  const { data } = await api.get('/admin/wmi/issues/counts')
  return data.data
}

export async function createIssue(
  input: IssueTarget & {
    part: IssuePart
    title: string
    detail?: string
    severity?: IssueSeverity
    ai_actionable?: boolean
  },
): Promise<ReviewIssue> {
  const { data } = await api.post('/admin/wmi/issues', input)
  return data.data.issue
}

export async function patchIssue(
  id: string,
  patch: Partial<{
    status: IssueStatus
    fix_note: string
    severity: IssueSeverity
    ai_actionable: boolean
    title: string
    detail: string
  }>,
): Promise<ReviewIssue> {
  const { data } = await api.patch(`/admin/wmi/issues/${id}`, patch)
  return data.data.issue
}

// PURE - suggested (never auto-applied) item verdict. Mirrors the server helper.
export function suggestVerdictClient(issues: ReviewIssue[]): 'pending' | 'approved' | 'needs_changes' {
  if (issues.length === 0) return 'pending'
  return issues.some((i) => i.status !== 'verified' && i.status !== 'wont_fix') ? 'needs_changes' : 'approved'
}

// PURE - build a markdown block the human pastes into a Claude Code session.
// Only ai_actionable issues are included (human-only issues stay out of Claude's queue).
export function serializeIssuesForClaude(
  issues: ReviewIssue[],
  questionMeta: Record<string, { code?: string; number: number }> = {},
): string {
  const lines: string[] = ['# WMI review issues to fix', '']
  for (const i of issues) {
    if (!i.ai_actionable) continue
    let target: string
    if (i.target_type === 'concept') {
      target = `concept \`${i.concept_slug}\``
    } else if (i.target_type === 'paper_question') {
      const m = i.question_id ? questionMeta[i.question_id] : undefined
      target = `paper ${m?.code ?? i.paper_id}${m ? ` Q${m.number}` : ''}`
    } else {
      target = `paper ${i.paper_id}`
    }
    lines.push(`- [ ] **${target}** · part: \`${i.part}\` · ${i.severity}`)
    lines.push(`  - ${i.title}`)
    if (i.detail.trim()) lines.push(`  - ${i.detail.trim()}`)
    lines.push(`  - issue id: \`${i.id}\` (PATCH /api/admin/wmi/issues/${i.id} -> status=fixed with a fix_note when done)`)
  }
  return lines.join('\n')
}
