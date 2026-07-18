// src/components/wmi/path/BossSheet.tsx
//
// Bottom sheet shown when a Tes Bab boss node is tapped — the boss now behaves
// like every other node: first tap spotlights it and opens this sheet; the
// test only starts from the explicit "Mulai" button. Same no-scrim overlay
// pattern as ConceptSheet, so the trail stays live behind it.

import { useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSheetDrag } from './useSheetDrag'
import type { WmiGardenChapter } from '../../../types/wmi'

interface Props {
  chapter: WmiGardenChapter
  onStart: () => void
  onClose: () => void
}

function bossLine(chapter: WmiGardenChapter): string {
  if (!chapter.unlocked) return 'Lulus tes ini untuk membuka bab!'
  if (chapter.testedOut) return 'Sudah lulus — ulangi untuk latihan!'
  return 'Tantangan akhir bab — tunjukkan kemampuanmu!'
}

export default function BossSheet({ chapter, onStart, onClose }: Props) {
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)

  // Focus the tapped boss node: scroll it to the centre of the visible band
  // above the sheet (between the sticky top stat strip and the sheet's top).
  useLayoutEffect(() => {
    const panel = panelRef.current
    const node = document.querySelector<HTMLElement>(
      `[data-node-slug="boss-${chapter.subjectKey}"]`,
    )
    if (!panel || !node) return
    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const topbar = document.querySelector('[data-app-topbar]')
    const stripBottom = topbar ? topbar.getBoundingClientRect().bottom : 56
    const sheetTop = panel.getBoundingClientRect().top
    const band = sheetTop - stripBottom
    if (band < 80) return
    const nodeRect = node.getBoundingClientRect()
    const delta = nodeRect.top + nodeRect.height / 2 - (stripBottom + band / 2)
    if (Math.abs(delta) < 4) return
    window.scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
  }, [chapter.subjectKey, panelRef])

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
        aria-label={`Tes Bab — ${chapter.nameId}`}
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
              {chapter.nameId}
            </p>
            <h2 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
              <i className="fa-solid fa-flag-checkered me-2" aria-hidden="true" />
              Tes Bab
            </h2>
            <p className="mt-1.5 text-sm font-bold text-qupu-muted">{bossLine(chapter)}</p>
          </div>
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
