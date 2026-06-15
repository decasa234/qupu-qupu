// src/components/wmi/path/ChapterSheet.tsx
//
// Curriculum-breakdown sheet — opened by tapping a chapter banner on the
// Belajar path. Lists every concept in the chapter with the kid's plant tier
// and proficiency, plus the chapter's Tes Bab boss row. Tapping an unlocked
// concept hands back to the path (onPick) which focuses + opens its
// ConceptSheet; tapping the test row launches Tes Bab. Like ConceptSheet there
// is no dimming scrim — the sheet itself is the focus. Drag the header down (or
// tap outside) to dismiss.

import { createPortal } from 'react-dom'
import PlantIcon from '../PlantIcon'
import { plantForTier } from '../plantTier'
import { bossState } from './pathState'
import { useSheetDrag } from './useSheetDrag'
import type { WmiGardenChapter, WmiGardenConcept } from '../../../types/wmi'

interface Props {
  chapter: WmiGardenChapter
  onPick: (concept: WmiGardenConcept) => void
  onBoss: () => void
  onClose: () => void
}

export default function ChapterSheet({ chapter, onPick, onBoss, onClose }: Props) {
  const boss = bossState(chapter)
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-transparent"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Rincian ${chapter.nameId}`}
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[78vh] w-full max-w-[460px] flex-col animate-rise rounded-t-[2rem] bg-white pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-6px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
      >
        {/* Grab zone: handle + header — drag down to dismiss. The list below
            keeps its own scroll. */}
        <div {...dragHandlers} className="cursor-grab touch-none select-none active:cursor-grabbing">
          <span className="mx-auto mt-3 block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-3">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-lg text-white"
              style={{ background: chapter.unlocked ? chapter.colorHex : '#C3CAD6' }}
            >
              <i className={`fa-solid fa-${chapter.iconKey}`} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-black leading-tight text-qupu-brand-blue">
                {chapter.nameId}
              </h2>
              <p className="text-xs font-bold text-qupu-muted">
                {chapter.grownCount}/{chapter.total} tumbuh · {Math.round(chapter.meanPct)}% paham
              </p>
            </div>
          </div>

          {/* Chapter mean-progress bar */}
          <div className="mx-5 mb-1 h-2 overflow-hidden rounded-full bg-[#EDE4D4]">
            <div
              className="h-full rounded-full bg-[#58A700] transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, Math.round(chapter.meanPct)))}%` }}
            />
          </div>
        </div>

        {/* Concept list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-2">
            {chapter.concepts.map((concept) => {
              const plant = plantForTier(concept.tier)
              const pct = Math.max(0, Math.min(100, Math.round(concept.pct)))
              const row = (
                <>
                  <span
                    className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[20px]"
                    style={{ background: plant.bg, color: plant.color }}
                  >
                    <PlantIcon tier={concept.tier} />
                    {plant.crown && (
                      <i
                        className="fa-solid fa-crown absolute -right-1 -top-1.5 text-[11px] text-qupu-orange"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-black text-qupu-brand-blue">
                      {concept.nameId}
                    </span>
                    <span className="text-[11px] font-bold text-qupu-muted">
                      {plant.label} · {pct}%
                    </span>
                  </span>
                </>
              )
              if (!chapter.unlocked) {
                return (
                  <li
                    key={concept.slug}
                    className="flex items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 opacity-60"
                  >
                    {row}
                    <i className="fa-solid fa-lock flex-shrink-0 text-xs text-qupu-muted" aria-hidden="true" />
                  </li>
                )
              }
              return (
                <li key={concept.slug}>
                  <button
                    type="button"
                    onClick={() => onPick(concept)}
                    className="flex w-full items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 text-left transition-transform active:translate-y-0.5"
                  >
                    {row}
                    <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/70" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Tes Bab row */}
          <button
            type="button"
            onClick={onBoss}
            disabled={boss === 'locked'}
            className={`mt-3 flex w-full items-center gap-3 rounded-[1.25rem] px-3 py-3 text-left transition-transform active:translate-y-0.5 disabled:active:translate-y-0 ${
              boss === 'open'
                ? 'bg-qupu-brand-yellow/30 ring-2 ring-[#E8B400]'
                : boss === 'current'
                  ? 'bg-qupu-brand-orange/10 ring-2 ring-qupu-brand-orange'
                  : 'bg-qupu-shell opacity-70'
            }`}
          >
            <span
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-lg ${
                boss === 'open'
                  ? 'bg-qupu-brand-yellow text-[#8A6400]'
                  : boss === 'current'
                    ? 'bg-white text-qupu-brand-orange ring-2 ring-qupu-brand-orange'
                    : 'bg-[#E7E2D6] text-[#9AA0AC]'
              }`}
            >
              <i
                className={`fa-solid ${boss === 'open' ? 'fa-crown' : 'fa-flag-checkered'}`}
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-black text-qupu-brand-blue">Tes Bab</span>
              <span className="text-[11px] font-bold text-qupu-muted">
                {boss === 'open' ? 'Sudah lulus' : boss === 'current' ? 'Siap diuji' : 'Tumbuhkan dulu konsepnya'}
              </span>
            </span>
            {boss !== 'locked' && (
              <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/70" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
