// src/components/wmi/path/ConceptSheet.tsx
//
// Bottom sheet shown when a concept node on the Belajar path is tapped. By
// design there is NO dimming scrim AND no full-screen click-catcher — the
// overlay is pointer-events-none except for the panel itself, so the trail
// stays live: tapping another node switches the sheet to it without closing
// first, and tapping the open node again (handled by the parent) toggles it
// shut. The tapped node is scrolled into the band between the top stat strip
// and the sheet, so the kid stays focused on the very node they picked.
// Closing is explicit: the × button or Escape. The sheet shows an animated
// proficiency display (ConceptProgress) and one "Mulai" button that starts a
// focused session. Boss (Tes Bab) taps never open this sheet.

import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ConceptProgress from './ConceptProgress'
import type { WmiGardenChapter, WmiGardenConcept } from '../../../types/wmi'

interface Props {
  concept: WmiGardenConcept
  chapter: WmiGardenChapter
  onStart: () => void
  onClose: () => void
}

export default function ConceptSheet({ concept, chapter, onStart, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Focus the tapped node: scroll it to the centre of the visible band above
  // the sheet (between the sticky top stat strip and the sheet's top edge).
  useLayoutEffect(() => {
    const panel = panelRef.current
    const node = document.querySelector<HTMLElement>(`[data-node-slug="${concept.slug}"]`)
    if (!panel || !node) return
    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const topbar = document.querySelector('[data-app-topbar]')
    const stripBottom = topbar ? topbar.getBoundingClientRect().bottom : 56
    const sheetTop = panel.getBoundingClientRect().top
    const band = sheetTop - stripBottom
    if (band < 80) return // too little room to bother centring
    const nodeRect = node.getBoundingClientRect()
    const nodeCenterY = nodeRect.top + nodeRect.height / 2
    const desiredY = stripBottom + band / 2
    const delta = nodeCenterY - desiredY
    if (Math.abs(delta) < 4) return
    window.scrollBy({ top: delta, behavior: reduce ? 'auto' : 'smooth' })
  }, [concept.slug])

  // Escape closes the sheet (the trail has no catcher to tap).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Portaled to <body>: AppShell's content column is a `relative z-10`
  // stacking context, so an in-tree z-50 would still paint (and hit-test)
  // BELOW the sibling BottomTabBar (z-30). At the root level z-50 wins, so
  // the sheet — and its "Mulai" button — sits fully above the tab bar.
  // The wrapper is pointer-events-none so the trail behind stays tappable;
  // only the panel re-enables pointer events.
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={concept.nameId}
        className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto w-full max-w-[460px] animate-rise rounded-t-[2rem] bg-white p-5 pb-[max(env(safe-area-inset-bottom),1.75rem)] shadow-[0_-6px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
      >
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />

        {/* Explicit close — the only way out besides Escape / tapping the open node. */}
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-qupu-shell text-qupu-muted ring-1 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="mt-3 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
            {chapter.nameId}
          </p>
          <h2 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
            {concept.nameId}
          </h2>
        </div>

        <div className="mt-4">
          <ConceptProgress concept={concept} />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
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
