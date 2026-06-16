// src/components/app-shell/ModeBadge.tsx
//
// The top-bar gamemode selector. The white "WMI"/Video chip on the left of the
// stat strip; tapping it opens a small dropdown (portaled to <body> so it
// escapes the sticky strip's stacking context) listing the modes. Picking one
// sets wmiStore.learnMode (which re-themes the Home tab) and closes. The Main
// "Pilih Dunia" tab remains the full chooser.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWmiStore } from '../../store/wmiStore'

const MODES = [
  { mode: 'wmi' as const, label: 'WMI', icon: 'fa-solid fa-trophy' },
  { mode: 'video' as const, label: 'Video', icon: 'fa-solid fa-clapperboard' },
]

export default function ModeBadge() {
  const learnMode = useWmiStore((s) => s.learnMode)
  const setLearnMode = useWmiStore((s) => s.setLearnMode)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setPos({ left: r.left, top: r.bottom + 6 })
    setOpen(true)
  }

  const pick = (mode: 'wmi' | 'video') => {
    setLearnMode(mode)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Mode: ${learnMode === 'wmi' ? 'WMI' : 'Video'} — ketuk untuk ganti mode`}
        className="flex h-8 flex-shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-white/20 px-2.5 font-display text-sm font-black text-white ring-1 ring-white/30 transition-transform active:translate-y-0.5"
      >
        {learnMode === 'wmi' ? (
          <span>WMI</span>
        ) : (
          <i className="fa-solid fa-clapperboard text-base" aria-hidden="true" />
        )}
        <i className="fa-solid fa-chevron-down text-[10px] text-white/70" aria-hidden="true" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div className="fixed inset-0 z-[60]">
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-transparent"
            />
            <div
              role="menu"
              aria-label="Pilih mode"
              style={{ left: pos.left, top: pos.top }}
              className="absolute w-44 animate-rise rounded-[16px] bg-white p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            >
              {MODES.map((m) => {
                const active = m.mode === learnMode
                return (
                  <button
                    key={m.mode}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => pick(m.mode)}
                    className={`flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-left font-display text-sm font-black transition-colors ${
                      active
                        ? 'bg-qupu-brand-orange/10 text-qupu-brand-orange'
                        : 'text-qupu-brand-blue hover:bg-qupu-shell'
                    }`}
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-base">
                      <i className={m.icon} aria-hidden="true" />
                    </span>
                    <span className="flex-1">{m.label}</span>
                    {active && <i className="fa-solid fa-check text-xs" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
