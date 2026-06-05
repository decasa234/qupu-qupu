import { useEffect, useRef, type ReactNode } from 'react'

export function Drawer({
  open,
  onClose,
  title,
  footer,
  children,
  width = 'lg',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  footer?: ReactNode
  children: ReactNode
  width?: 'md' | 'lg'
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const widthCls = width === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-admin-ink/30 backdrop-blur-[1px]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex h-full w-full ${widthCls} flex-col bg-admin-bg shadow-2xl outline-none`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-admin-line bg-admin-card px-4 py-3">
          <div className="font-display text-base font-extrabold text-qupu-brand-blue">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-admin-edge bg-white text-admin-ink hover:bg-admin-sunk"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-admin-line bg-admin-card px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
