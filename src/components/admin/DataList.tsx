import type { ReactNode } from 'react'
import { EmptyState, Skeleton } from './ui'

export type DataListColumn<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /**
   * On mobile cards, which slot this column fills. When omitted the column
   * renders as a meta cell (header shown as a small label beside the value).
   * This is intentional — every column appears on mobile so no admin data or
   * actions are ever hidden on a phone. Explicitly tag a column `role: 'meta'`
   * (or omit `role`) for meta cells; use 'title', 'subtitle', or 'actions'
   * for the other named slots.
   */
  role?: 'title' | 'subtitle' | 'meta' | 'actions'
  align?: 'left' | 'right'
  thClassName?: string
  tdClassName?: string
  /** Hide this column in the desktop table below a breakpoint. */
  hideBelow?: 'sm' | 'md'
}

const HIDE: Record<'sm' | 'md', string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
}

export function DataList<T>({
  columns,
  rows,
  rowKey,
  empty,
  loading = false,
  skeletonRows = 4,
}: {
  columns: DataListColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
  loading?: boolean
  skeletonRows?: number
}) {
  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) {
    return <>{empty ?? <EmptyState title="Belum ada data" />}</>
  }

  const title = columns.find((c) => c.role === 'title')
  const subtitle = columns.find((c) => c.role === 'subtitle')
  const metas = columns.filter((c) => c.role === 'meta' || c.role === undefined)
  const actions = columns.find((c) => c.role === 'actions')

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-admin-line text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`pb-2 pr-4 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-admin-muted ${
                    c.align === 'right' ? 'text-right' : ''
                  } ${c.hideBelow ? HIDE[c.hideBelow] : ''} ${c.thClassName ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-admin-line/70 transition-colors hover:bg-admin-sunk">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-3 pr-4 align-middle ${c.align === 'right' ? 'text-right' : ''} ${
                      c.hideBelow ? HIDE[c.hideBelow] : ''
                    } ${c.tdClassName ?? ''}`}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-3 sm:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-xl border border-admin-line bg-admin-card p-3 shadow-admin-soft">
            {title && <div className="font-semibold text-admin-ink">{title.cell(row)}</div>}
            {subtitle && <div className="mt-0.5 text-xs text-admin-muted">{subtitle.cell(row)}</div>}
            {metas.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-admin-muted">
                {metas.map((c) => (
                  <span key={c.key} className="inline-flex items-center gap-1">
                    <span className="text-[0.625rem] font-bold uppercase tracking-wide text-admin-faint">{c.header}</span>
                    {c.cell(row)}
                  </span>
                ))}
              </div>
            )}
            {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions.cell(row)}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
