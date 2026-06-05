import type { ReactNode } from 'react'
import { Input } from './ui'

export function Toolbar({
  search,
  filters,
  sort,
  trailing,
}: {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string }
  filters?: ReactNode
  sort?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div className="sticky top-0 z-10 -mx-1 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-admin-line bg-admin-card/95 px-3 py-2 backdrop-blur">
      {search && (
        <div className="relative min-w-[12rem] flex-1">
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-admin-faint"
            aria-hidden="true"
          />
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? 'Cari…'}
            className="pl-8"
          />
        </div>
      )}
      {filters}
      {sort}
      {trailing && <div className="ml-auto text-xs text-admin-muted">{trailing}</div>}
    </div>
  )
}
