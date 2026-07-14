import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'
import ChildModal from './ChildModal'

export default function ChildSwitcher() {
  const { children, activeChildId, setActiveChild, addChild } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const active = children.find((child) => child.id === activeChildId) ?? null

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
  }

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-qupu-peach bg-qupu-cream px-3 py-1.5 text-sm font-bold text-qupu-brand-blue transition-colors hover:border-qupu-orange"
        >
          <span
            className="h-7 w-7 rounded-full border-2 border-white"
            style={{ backgroundColor: active?.avatarColor ?? '#FB923C' }}
          />
          <span className="hidden sm:inline">{active?.name ?? 'Pilih anak'}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[1.25rem] border border-qupu-peach bg-white p-2 shadow-clay">
            {children.length === 0 && (
              <div className="px-3 py-2 text-xs font-semibold text-qupu-muted">Belum ada profil anak.</div>
            )}
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => {
                  setActiveChild(child.id)
                  setOpen(false)
                }}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-qupu-cream ${
                  child.id === activeChildId ? 'bg-qupu-cream' : ''
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full border border-white"
                  style={{ backgroundColor: child.avatarColor ?? '#FB923C' }}
                />
                <span className="flex-1 text-qupu-ink">{child.name}</span>
                {child.id === activeChildId && (
                  <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-qupu-orange">aktif</span>
                )}
              </button>
            ))}
            <div className="my-1 border-t border-qupu-peach" />
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setModalOpen(true)
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-qupu-orange transition-colors hover:bg-qupu-cream"
            >
              <Plus className="h-4 w-4" />
              Tambah profil anak
            </button>
          </div>
        )}
      </div>

      <ChildModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
