import type { ReactNode } from 'react'
import AdminPageHeader from './AdminPageHeader'

export function PageScaffold({
  eyebrow,
  title,
  description,
  actions,
  children,
  /** Narrow + centered content column (use for small single-card pages). */
  narrow = false,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <div className="flex min-h-[60vh] flex-col gap-5">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <div className={narrow ? 'mx-auto w-full max-w-2xl' : 'w-full'}>{children}</div>
    </div>
  )
}
