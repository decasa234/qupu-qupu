import { useCallback, useEffect, useState } from 'react'
import {
  createIssue,
  listIssues,
  patchIssue,
  type IssueTarget,
  type ReviewIssue,
} from '../lib/wmiReviewIssues'

function targetKey(t: IssueTarget | null): string {
  if (!t) return ''
  if (t.target_type === 'concept') return `c:${t.concept_slug}`
  if (t.target_type === 'paper') return `p:${t.paper_id}`
  return `pq:${t.paper_id}:${t.question_id}`
}

// For papers we load ALL issues of the paper (so the UI can scope "this question"
// vs "whole paper"); for concepts we load the concept's issues.
export function useReviewIssues(target: IssueTarget | null) {
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const key = targetKey(target)

  const reload = useCallback(async () => {
    if (!target) {
      setIssues([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params =
        target.target_type === 'concept'
          ? { concept_slug: target.concept_slug }
          : { paper_id: target.paper_id }
      setIssues(await listIssues(params))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat issues')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    reload()
  }, [reload])

  const add = useCallback(async (input: Parameters<typeof createIssue>[0]) => {
    const created = await createIssue(input)
    setIssues((xs) => [created, ...xs])
    return created
  }, [])

  const update = useCallback(async (id: string, patch: Parameters<typeof patchIssue>[1]) => {
    const updated = await patchIssue(id, patch)
    setIssues((xs) => xs.map((x) => (x.id === id ? updated : x)))
    return updated
  }, [])

  return { issues, loading, error, reload, add, update }
}
