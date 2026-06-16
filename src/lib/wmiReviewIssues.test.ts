import { describe, it, expect } from 'vitest'
import { serializeIssuesForClaude, suggestVerdictClient, type ReviewIssue } from './wmiReviewIssues'

const base: ReviewIssue = {
  id: '1', target_type: 'concept', paper_id: null, question_id: null, concept_slug: 'budget-selection',
  part: 'illustration', severity: 'blocker', title: 'Triangle overlaps label', detail: 'At large N the label clips.',
  status: 'open', ai_actionable: true, fix_note: null, created_by: 'a@b.com', resolved_by: null,
  created_at: '', updated_at: '', resolved_at: null,
}

describe('serializeIssuesForClaude', () => {
  it('renders a concept issue with slug, part, severity, detail', () => {
    const md = serializeIssuesForClaude([base])
    expect(md).toContain('concept `budget-selection`')
    expect(md).toContain('illustration')
    expect(md).toContain('blocker')
    expect(md).toContain('At large N the label clips.')
  })
  it('renders a paper-question issue with code + question number when provided', () => {
    const md = serializeIssuesForClaude(
      [{ ...base, target_type: 'paper_question', concept_slug: null, paper_id: 'p1', question_id: 'q1', part: 'breakdown', title: 'Highlight wrong' }],
      { q1: { code: 'WMI-23F2A', number: 3 } },
    )
    expect(md).toContain('WMI-23F2A')
    expect(md).toContain('Q3')
    expect(md).toContain('breakdown')
  })
  it('skips issues that are not ai_actionable', () => {
    const md = serializeIssuesForClaude([{ ...base, ai_actionable: false }])
    expect(md).not.toContain('Triangle overlaps')
  })
})

describe('suggestVerdictClient', () => {
  it('mirrors server rules', () => {
    expect(suggestVerdictClient([])).toBe('pending')
    expect(suggestVerdictClient([{ ...base, status: 'verified' }])).toBe('approved')
    expect(suggestVerdictClient([{ ...base, status: 'open' }])).toBe('needs_changes')
  })
})
