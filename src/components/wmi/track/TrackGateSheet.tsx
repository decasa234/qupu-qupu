// src/components/wmi/track/TrackGateSheet.tsx
//
// Bottom sheet shown when a Tes Bab gate node on the track map is tapped —
// the track twin of src/components/wmi/path/BossSheet.tsx. Confirm-first: the
// test only starts from the explicit "Mulai". A gate is attemptable as soon
// as its unit is open (test-out) — passing it unlocks the next unit, so the
// copy sells the jump. `requires` names are shown as guidance chips.

import { useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSheetDrag } from '../path/useSheetDrag'
import type { TrackGateNodeState, TrackUnitState } from '../../../types/wmi'

interface Props {
  node: TrackGateNodeState
  unit: TrackUnitState
  /** Display names of the gate's `requires` concepts, in spine order. */
  requireNames: string[]
  onStart: () => void
  onClose: () => void
}

export default function TrackGateSheet({ node, unit, requireNames, onStart, onClose }: Props) {
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)

  useLayoutEffect(() => {
    const panel = panelRef.current
    const el = document.querySelector<HTMLElement>(`[data-node-key="gate:${node.key}"]`)
    if (!panel || !el) return
    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const topbar = document.querySelector('[data-app-topbar]')
    const stripBottom = topbar ? topbar.getBoundingClientRect().bottom : 56
    const sheetTop = panel.getBoundingClientRect().top
    const band = sheetTop - stripBottom
    if (band < 80) return
    const rect = el.getBoundingClientRect()
    const delta = rect.top + rect.height / 2 - (stripBottom + band / 2)
    if (Math.abs(delta) < 4) return
    window.scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
  }, [node.key, panelRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={`Tes Bab — ${unit.nameId}`}
        style={sheetStyle}
        className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto w-full max-w-[28.75rem] animate-rise rounded-t-[2rem] bg-white p-5 pb-[max(env(safe-area-inset-bottom),1.75rem)] shadow-[0_-6px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-qupu-shell text-qupu-muted ring-1 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div {...dragHandlers} className="cursor-grab touch-none select-none active:cursor-grabbing">
          <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />
          <div className="mt-3 text-center">
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              {unit.nameId}
            </p>
            <h2 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
              <i className="fa-solid fa-flag-checkered me-2" aria-hidden="true" />
              Tes Bab
            </h2>
            <p className="mt-1.5 text-sm font-bold text-qupu-muted">
              {node.cleared
                ? 'Sudah lulus — ulangi untuk latihan!'
                : 'Satu soal olimpiade sungguhan. Lulus untuk membuka bab berikutnya!'}
            </p>
          </div>
        </div>

        {requireNames.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-qupu-muted">
              Soal ini memakai
            </p>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
              {requireNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-qupu-shell px-2.5 py-1 text-[0.6875rem] font-black text-qupu-brand-blue ring-1 ring-[#FFE3CC]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onStart}
          className="tap-press mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
            <i className="fa-solid fa-play" aria-hidden="true" />
          </span>
          Mulai
        </button>
      </div>
    </div>,
    document.body,
  )
}
