import { useState } from 'react'
import { Button, Input, Select, Textarea } from '../ui'
import type { IssuePart, IssueSeverity } from '../../../lib/wmiReviewIssues'

export default function FlagButton({
  part,
  onCreate,
}: {
  part: IssuePart
  onCreate: (i: {
    part: IssuePart
    title: string
    detail: string
    severity: IssueSeverity
    ai_actionable: boolean
  }) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [severity, setSeverity] = useState<IssueSeverity>('warning')
  const [aiActionable, setAiActionable] = useState(true)
  const [saving, setSaving] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-qupu-brand-orange px-2 py-0.5 text-[10px] font-bold text-qupu-brand-orange hover:bg-orange-50"
      >
        ⚑ flag {part}
      </button>
    )
  }
  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-qupu-brand-orange bg-orange-50/50 p-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`What's wrong with the ${part}?`}
        aria-label="Issue title"
      />
      <Textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        rows={2}
        placeholder="Detail / suggested fix (Claude reads this)"
      />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
          aria-label="Severity"
        >
          <option value="blocker">Blocker</option>
          <option value="warning">Warning</option>
          <option value="nit">Nit</option>
        </Select>
        <label className="inline-flex items-center gap-1 font-semibold text-admin-muted">
          <input
            type="checkbox"
            checked={aiActionable}
            onChange={(e) => setAiActionable(e.target.checked)}
          />
          AI-actionable
        </label>
        <Button
          type="button"
          disabled={!title.trim() || saving}
          loading={saving}
          onClick={async () => {
            setSaving(true)
            try {
              await onCreate({ part, title: title.trim(), detail: detail.trim(), severity, ai_actionable: aiActionable })
              setOpen(false)
              setTitle('')
              setDetail('')
            } finally {
              setSaving(false)
            }
          }}
        >
          Add issue
        </Button>
        <button type="button" className="text-xs text-admin-faint" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
