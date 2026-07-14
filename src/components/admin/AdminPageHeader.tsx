import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-admin-line pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-qupu-brand-orange">
          {eyebrow}
        </div>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-admin-muted">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
