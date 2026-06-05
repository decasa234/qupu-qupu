import type { TagTone } from '../components/admin/ui'

export type AdminStatus = 'published' | 'draft' | 'needs-review' | (string & {})

const MAP: Record<string, { tone: TagTone; label: string }> = {
  published: { tone: 'success', label: 'Diterbitkan' },
  draft: { tone: 'warn', label: 'Draft' },
  'needs-review': { tone: 'brand', label: 'Perlu ditinjau' },
}

export function statusTone(status: AdminStatus): { tone: TagTone; label: string } {
  return MAP[status] ?? { tone: 'neutral', label: String(status) }
}
