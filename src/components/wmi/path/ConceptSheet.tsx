// src/components/wmi/path/ConceptSheet.tsx
//
// Bottom sheet shown when a concept node on the Belajar path is tapped.
// Minimal by design: plant at tier, concept name, tier-label chip, one
// "Mulai" button that starts a focused session. Boss (Tes Bab) taps never
// open this sheet — they navigate straight to the chapter test.

import PlantIcon from '../PlantIcon'
import { plantForTier } from '../plantTier'
import type { WmiGardenChapter, WmiGardenConcept } from '../../../types/wmi'

interface Props {
  concept: WmiGardenConcept
  chapter: WmiGardenChapter
  onStart: () => void
  onClose: () => void
}

export default function ConceptSheet({ concept, chapter, onStart, onClose }: Props) {
  const plant = plantForTier(concept.tier)
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={concept.nameId}
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[460px] animate-rise rounded-t-[2rem] bg-white p-5 pb-7 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      >
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />
        <div className="mt-4 flex items-center gap-4">
          <span
            className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] border-2 border-black/10 text-[28px]"
            style={{ background: plant.bg, color: plant.color }}
          >
            <PlantIcon tier={concept.tier} />
            {plant.crown && (
              <i
                className="fa-solid fa-crown absolute -right-1.5 -top-2 text-[15px] text-qupu-orange"
                aria-hidden="true"
              />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-qupu-muted">{chapter.nameId}</p>
            <h2 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
              {concept.nameId}
            </h2>
            <span
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black"
              style={{ background: plant.bg, color: plant.color }}
            >
              <i className={plant.icon} aria-hidden="true" />
              {plant.label}
            </span>
          </div>
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
    </div>
  )
}
