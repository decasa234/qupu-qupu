import { Panel, SectionHeading } from '../ui'
import { serializeIssuesForClaude, type IssueStatus, type ReviewIssue } from '../../../lib/wmiReviewIssues'

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

export default function IssuesPanel({
  issues,
  title = 'Issues',
  questionMeta = {},
  onUpdate,
}: {
  issues: ReviewIssue[]
  title?: string
  questionMeta?: Record<string, { code?: string; number: number }>
  onUpdate: (id: string, patch: Partial<{ status: IssueStatus }>) => Promise<unknown>
}) {
  const open = issues.filter((i) => i.status !== 'verified' && i.status !== 'wont_fix')
  const copy = () => navigator.clipboard.writeText(serializeIssuesForClaude(issues, questionMeta))

  return (
    <Panel>
      <div className="flex items-center justify-between gap-2">
        <SectionHeading>
          {title} · {open.length} open
        </SectionHeading>
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-qupu-brand-orange px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
        >
          📋 Copy issues for Claude
        </button>
      </div>
      {issues.length === 0 ? (
        <p className="mt-2 text-sm text-admin-faint">No issues filed. Use ⚑ on a part to flag one.</p>
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
