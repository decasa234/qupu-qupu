// src/components/shop/BottomSheet.tsx
//
// Mobile-first bottom sheet primitive. Backdrop click + Escape close.
// No drag-to-dismiss in v1 — keeps the kid from accidentally dropping
// it mid-purchase. Animation via CSS transitions on transform.
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-qupu-peach" aria-hidden="true" />
        <div className="px-5 pb-6">{children}</div>
      </div>
    </>
  )
}
