import { describe, it, expect } from 'vitest'
import { suggestVerdict, resolutionFor, PAPER_QUICKFIX_PARTS } from './reviewIssues.js'

describe('reviewIssues pure helpers', () => {
  it('suggestVerdict: no issues -> pending', () => {
    expect(suggestVerdict([])).toBe('pending')
  })
  it('suggestVerdict: any non-closed issue -> needs_changes', () => {
    expect(suggestVerdict([{ status: 'open', severity: 'nit' }])).toBe('needs_changes')
    expect(suggestVerdict([{ status: 'fixed', severity: 'warning' }])).toBe('needs_changes')
  })
  it('suggestVerdict: all closed -> approved', () => {
    expect(
      suggestVerdict([
        { status: 'verified', severity: 'blocker' },
        { status: 'wont_fix', severity: 'warning' },
      ]),
    ).toBe('approved')
  })
  it('resolutionFor: terminal statuses set resolver + timestamp', () => {
    expect(resolutionFor('fixed', 'claude-code')).toEqual({ resolved_by: 'claude-code', setResolvedAt: true })
    expect(resolutionFor('verified', 'a@b.com')).toEqual({ resolved_by: 'a@b.com', setResolvedAt: true })
    expect(resolutionFor('wont_fix', 'a@b.com')).toEqual({ resolved_by: 'a@b.com', setResolvedAt: true })
  })
  it('resolutionFor: open/in_progress clear resolver', () => {
    expect(resolutionFor('open', 'x')).toEqual({ resolved_by: null, setResolvedAt: false })
    expect(resolutionFor('in_progress', 'x')).toEqual({ resolved_by: null, setResolvedAt: false })
  })
  it('PAPER_QUICKFIX_PARTS are the simple text parts only', () => {
    expect(PAPER_QUICKFIX_PARTS).toEqual(['stem', 'answer', 'choices', 'hint'])
  })
})
