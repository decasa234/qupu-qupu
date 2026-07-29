// src/components/wmi/track/TrackConceptSheet.tsx
//
// Bottom sheet shown when a concept node on the track map is tapped — a
// copy-adaptation of src/components/wmi/path/ConceptSheet.tsx for the track
// engine's 5-level ladder (level segments instead of plant tiers). Same
// no-scrim overlay: the trail stays live behind the sheet; closing is drag,
// ×, or Escape. "Mulai" is the ONLY way into the lesson.

import { useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSheetDrag } from '../path/useSheetDrag'
import type { TrackThemePack } from './themes'
import type { TrackConceptNodeState, TrackUnitState } from '../../../types/wmi'

interface Props {
  node: TrackConceptNodeState
  unit: TrackUnitState
  theme: TrackThemePack
  onStart: () => void
  onClose: () => void
}

export default function TrackConceptSheet({ node, unit, theme, onStart, onClose }: Props) {
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)
  const stage = theme.stages[Math.min(node.level, 5)]

  // Focus the tapped node: scroll it to the centre of the visible band above
  // the sheet (between the sticky top stat strip and the sheet's top edge).
  useLayoutEffect(() => {
    const panel = panelRef.current
    const el = document.querySelector<HTMLElement>(`[data-node-key="${node.slug}"]`)
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
  }, [node.slug, panelRef])

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
        aria-label={node.nameId}
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
              {node.nameId}
            </h2>
            <span
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-black"
              style={{ background: stage.bg, color: stage.fg }}
            >
              <i className={`${stage.iconPrefix} ${stage.icon}`} aria-hidden="true" />
              {stage.labelId}
            </span>
          </div>
        </div>

        {/* Level phases — mirrors /belajar's ConceptProgress ladder, on the
            theme's 0→5 growth stages: a big current-stage showcase, then the
            5 growth phases with the current level ringed and reached ones
            filled. Gives the same "how far along am I" read as the garden. */}
        <div className="mt-4 flex flex-col items-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] motion-safe:animate-plant-bob"
            style={{ background: stage.bg, color: stage.fg }}
          >
            {stage.forest ? (
              <span className="relative flex items-end" aria-hidden="true">
                <i className="fa-solid fa-tree text-[0.75rem] opacity-75" />
                <i className="fa-solid fa-tree -ml-[0.25rem] text-[1.15rem]" />
                <i className="fa-solid fa-tree -ml-[0.25rem] text-[0.65rem] opacity-75" />
              </span>
            ) : (
              <i className={`${stage.iconPrefix} ${stage.icon}`} aria-hidden="true" />
            )}
          </span>

          <div className="mt-4 flex items-end gap-2" aria-hidden="true">
            {theme.stages.slice(1).map((s, i) => {
              const level = i + 1
              const reached = level <= node.level
              const isCurrent = level === node.level
              return (
                <span
                  key={level}
                  className={`flex items-center justify-center rounded-full transition-transform ${
                    isCurrent ? 'h-9 w-9 text-[1rem] ring-2 ring-qupu-brand-orange' : 'h-7 w-7 text-[0.75rem]'
                  } ${reached ? '' : 'opacity-35 grayscale'}`}
                  style={{ background: s.bg, color: s.fg }}
                >
                  <i className={`${s.iconPrefix} ${s.icon}`} />
                </span>
              )
            })}
          </div>

          <p className="mt-3 text-center text-xs font-bold text-qupu-muted">
            {node.gold ? 'Emas — sudah dikuasai!' : `Level ${node.level}/5 menuju emas`}
          </p>
        </div>

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
