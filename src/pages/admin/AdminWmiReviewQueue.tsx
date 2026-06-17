import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Button, Panel } from '../../components/admin/ui'
import {
  listIssues,
  patchIssue,
  serializeIssuesForClaude,
  type IssueStatus,
  type ReviewIssue,
} from '../../lib/wmiReviewIssues'

function targetLabel(i: ReviewIssue): string {
  if (i.target_type === 'concept') return i.concept_slug ?? '—'
  if (i.target_type === 'paper_question') return `${i.paper_id?.slice(0, 8)}…/Q`
  return i.paper_id?.slice(0, 8) ?? '—'
}

export default function AdminWmiReviewQueue() {
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [aiOnly, setAiOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sel, setSel] = useState<Set<string>>(new Set())

  const reload = () => {
    setError(null)
    listIssues(aiOnly ? { ai_actionable: true } : {})
      .then(setIssues)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat issues'))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reload(), [aiOnly])

  const fixed = useMemo(() => issues.filter((i) => i.status === 'fixed'), [issues])
  const open = useMemo(
    () => issues.filter((i) => i.status === 'open' || i.status === 'in_progress'),
    [issues],
  )

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const copySelected = () =>
    navigator.clipboard.writeText(serializeIssuesForClaude(issues.filter((i) => sel.has(i.id))))
  const bulk = async (status: IssueStatus) => {
    for (const id of sel) await patchIssue(id, { status })
    setSel(new Set())
    reload()
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · WMI"
        title="Review Queue"
        description="Every open issue across concepts & papers — the shared work surface for you and Claude."
      />

      <label className="inline-flex items-center gap-2 text-sm font-semibold text-admin-ink">
        <input type="checkbox" checked={aiOnly} onChange={(e) => setAiOnly(e.target.checked)} />
        AI-actionable only
      </label>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {fixed.length > 0 && (
        <Panel>
          <h3 className="font-display font-extrabold text-blue-700">
            Fixed by Claude — awaiting your re-review ({fixed.length})
          </h3>
          <ul className="mt-2 divide-y divide-admin-line">
            {fixed.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="font-mono text-[11px] text-admin-muted">{targetLabel(i)}</span>
                <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] text-white">{i.part}</span>
                <span className="min-w-0 flex-1 truncate" title={i.detail}>
                  {i.title}
                </span>
                <Button
                  type="button"
                  onClick={async () => {
                    await patchIssue(i.id, { status: 'verified' })
                    reload()
                  }}
                >
                  Verify ✓
                </Button>
                <button
                  type="button"
                  className="text-xs font-semibold text-admin-faint hover:text-admin-ink"
                  onClick={async () => {
                    await patchIssue(i.id, { status: 'open' })
                    reload()
                  }}
                >
                  Reopen
                </button>
                {i.fix_note && <span className="w-full pl-6 text-xs italic text-blue-700">fix: {i.fix_note}</span>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-extrabold text-admin-ink">Open issues ({open.length})</h3>
          {sel.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copySelected}
                className="rounded-md bg-qupu-brand-orange px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
              >
                📋 Copy selected for Claude ({sel.size})
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-admin-muted hover:text-admin-ink"
                onClick={() => bulk('in_progress')}
              >
                Claim
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-admin-muted hover:text-admin-ink"
                onClick={() => bulk('wont_fix')}
              >
                Won't fix
              </button>
            </div>
          )}
        </div>
        {open.length === 0 ? (
          <p className="mt-2 text-sm text-admin-faint">No open issues. 🎉</p>
        ) : (
          <ul className="mt-2 divide-y divide-admin-line">
            {open.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <input type="checkbox" checked={sel.has(i.id)} onChange={() => toggle(i.id)} />
                <span className="font-mono text-[11px] text-admin-muted">{targetLabel(i)}</span>
                <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] text-white">{i.part}</span>
                <span className="min-w-0 flex-1 truncate" title={i.detail}>
                  {i.title}
                </span>
                {i.status === 'in_progress' && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800">
                    in progress
                  </span>
                )}
                {!i.ai_actionable && (
                  <span className="rounded-full bg-admin-sunk px-2 py-0.5 text-[10px] font-bold text-admin-muted">
                    not AI
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
