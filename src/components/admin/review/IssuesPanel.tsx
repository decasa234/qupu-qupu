import { useState } from 'react'
import { Button, Input, Panel, SectionHeading, Select, Textarea } from '../ui'
import {
  PART_LABELS,
  serializeIssuesForClaude,
  type IssuePart,
  type IssueSeverity,
  type IssueStatus,
  type ReviewIssue,
} from '../../../lib/wmiReviewIssues'

const SEV_DOT: Record<string, string> = {
  blocker: 'bg-rose-600',
  warning: 'bg-amber-500',
  nit: 'bg-admin-edge',
}

const STATUS_CHIP: Record<IssueStatus, { cls: string; label: string }> = {
  open: { cls: 'bg-rose-100 text-rose-700', label: 'open' },
  in_progress: { cls: 'bg-yellow-100 text-yellow-800', label: 'in progress' },
  fixed: { cls: 'bg-blue-100 text-blue-700', label: 'fixed — re-review' },
  verified: { cls: 'bg-emerald-100 text-emerald-700', label: 'verified' },
  wont_fix: { cls: 'bg-admin-sunk text-admin-muted', label: "won't fix" },
}

export type NewFlag = {
  part: IssuePart
  title: string
  detail: string
  severity: IssueSeverity
  ai_actionable: boolean
}

export default function IssuesPanel({
  issues,
  title = 'Issues',
  questionMeta = {},
  parts,
  onCreate,
  onUpdate,
}: {
  issues: ReviewIssue[]
  title?: string
  questionMeta?: Record<string, { code?: string; number: number }>
  parts?: IssuePart[]
  onCreate?: (i: NewFlag) => Promise<unknown>
  onUpdate: (id: string, patch: Partial<{ status: IssueStatus }>) => Promise<unknown>
}) {
  const open = issues.filter((i) => i.status !== 'verified' && i.status !== 'wont_fix')
  const copy = () => navigator.clipboard.writeText(serializeIssuesForClaude(issues, questionMeta))
  const canAdd = Boolean(onCreate && parts && parts.length > 0)

  const [adding, setAdding] = useState(false)
  const [part, setPart] = useState<IssuePart>(parts?.[0] ?? 'other')
  const [flagTitle, setFlagTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [severity, setSeverity] = useState<IssueSeverity>('warning')
  const [aiActionable, setAiActionable] = useState(true)
  const [saving, setSaving] = useState(false)

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionHeading>
          {title} · {open.length} open
        </SectionHeading>
        <div className="flex items-center gap-2">
          {canAdd && (
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="rounded-md border border-qupu-brand-orange px-2.5 py-1 text-xs font-bold text-qupu-brand-orange hover:bg-orange-50"
            >
              + Add flag
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            className="rounded-md bg-qupu-brand-orange px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
          >
            📋 Copy issues for Claude
          </button>
        </div>
      </div>

      {adding && canAdd && (
        <div className="mt-3 grid gap-2 rounded-lg border border-qupu-brand-orange bg-orange-50/50 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="font-bold text-admin-muted">Flag type</label>
            <Select value={part} onChange={(e) => setPart(e.target.value as IssuePart)} aria-label="Flag type">
              {parts!.map((p) => (
                <option key={p} value={p}>
                  {PART_LABELS[p]}
                </option>
              ))}
            </Select>
            <Select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} aria-label="Severity">
              <option value="blocker">Blocker</option>
              <option value="warning">Warning</option>
              <option value="nit">Nit</option>
            </Select>
            <label className="inline-flex items-center gap-1 font-semibold text-admin-muted">
              <input type="checkbox" checked={aiActionable} onChange={(e) => setAiActionable(e.target.checked)} />
              AI-actionable
            </label>
          </div>
          <Input
            value={flagTitle}
            onChange={(e) => setFlagTitle(e.target.value)}
            placeholder="What's wrong?"
            aria-label="Issue title"
          />
          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={2}
            placeholder="Detail / suggested fix (Claude reads this)"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={!flagTitle.trim() || saving}
              loading={saving}
              onClick={async () => {
                if (!onCreate) return
                setSaving(true)
                try {
                  await onCreate({ part, title: flagTitle.trim(), detail: detail.trim(), severity, ai_actionable: aiActionable })
                  setAdding(false)
                  setFlagTitle('')
                  setDetail('')
                } finally {
                  setSaving(false)
                }
              }}
            >
              Add flag
            </Button>
            <button type="button" className="text-xs text-admin-faint" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {issues.length === 0 ? (
        <p className="mt-2 text-sm text-admin-faint">No issues filed yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-admin-line">
          {issues.map((i) => {
            const chip = STATUS_CHIP[i.status]
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="rounded bg-admin-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {i.part}
                </span>
                <span className={`h-2 w-2 rounded-full ${SEV_DOT[i.severity]}`} title={i.severity} />
                <span className="min-w-0 flex-1 truncate" title={i.detail}>
                  {i.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${chip.cls}`}>{chip.label}</span>
                {i.status === 'open' && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-admin-muted hover:text-admin-ink"
                    onClick={() => onUpdate(i.id, { status: 'in_progress' })}
                  >
                    Claim
                  </button>
                )}
                {i.status === 'fixed' && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-700"
                    onClick={() => onUpdate(i.id, { status: 'verified' })}
                  >
                    Verify ✓
                  </button>
                )}
                {(i.status === 'fixed' || i.status === 'verified') && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-admin-faint hover:text-admin-ink"
                    onClick={() => onUpdate(i.id, { status: 'open' })}
                  >
                    Reopen
                  </button>
                )}
                {(i.status === 'open' || i.status === 'in_progress') && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-admin-faint hover:text-admin-ink"
                    onClick={() => onUpdate(i.id, { status: 'wont_fix' })}
                  >
                    Won't fix
                  </button>
                )}
                {i.status === 'fixed' && i.fix_note && (
                  <span className="w-full pl-7 text-xs italic text-blue-700">fix: {i.fix_note}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
