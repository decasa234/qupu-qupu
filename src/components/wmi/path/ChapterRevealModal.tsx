// src/components/wmi/path/ChapterRevealModal.tsx
//
// "Bab baru terbuka!" celebration, shown via the CelebrationHost queue when
// a freshly loaded garden contains an unlocked chapter the child hasn't seen
// unlocked before (e.g. right after passing the previous chapter's Tes Bab,
// whether they came back via "Kembali ke Kebun" or landed on Home later).
// Reveals the chapter, its topic list (staggered rise-in) and the chapter's
// completion rewards.

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import KonsepConfetti from '../KonsepConfetti'
import type { RevealChapterInfo } from '../../../store/celebrationStore'

// Mirror of api/services/gamification/chapterChest.ts CHAPTER_CHEST_REWARD —
// the 50% + 100% chest totals a chapter pays out when fully grown.
const CHAPTER_XP = 20
const CHAPTER_COINS = 55

interface Props {
  chapter: RevealChapterInfo
  onClose: () => void
}

export default function ChapterRevealModal({ chapter, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <KonsepConfetti />
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Bab baru terbuka — ${chapter.nameId}`}
        className="relative max-h-[85vh] w-full max-w-[21rem] overflow-y-auto rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] motion-safe:animate-rise"
      >
        <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
          Bab baru terbuka!
        </p>

        <span
          className="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-[1.25rem] text-2xl text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)] motion-safe:animate-bob"
          style={{ background: chapter.colorHex }}
          aria-hidden="true"
        >
          <i className={`fa-solid fa-${chapter.iconKey}`} />
        </span>
        <h2 className="mt-3 font-display text-xl font-black leading-tight text-qupu-brand-blue">
          {chapter.nameId}
        </h2>

        {/* Topics — staggered rise-in */}
        <div className="mt-4 space-y-2 text-left">
          {chapter.concepts.map((concept, i) => (
            <div
              key={`${concept.nameId}-${i}`}
              className="flex items-center gap-2.5 rounded-[1rem] bg-qupu-shell px-3 py-2 motion-safe:animate-rise"
              style={{ animationDelay: `${200 + i * 90}ms` }}
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EFE6D6] text-xs text-[#C0A98A]"
                aria-hidden="true"
              >
                <i className="fa-solid fa-egg" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-qupu-brand-blue">
                {concept.nameId}
              </span>
            </div>
          ))}
        </div>

        {/* Chapter completion rewards */}
        <p className="mt-4 text-[0.6875rem] font-extrabold text-qupu-muted">
          Selesaikan bab ini dan dapatkan:
        </p>
        <div className="mt-2 flex justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-1.5 font-display text-sm font-black text-white">
            <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
            +{CHAPTER_XP} XP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-4 py-1.5 font-display text-sm font-black text-white">
            <i className="fa-solid fa-coins text-qupu-brand-yellow" aria-hidden="true" />
            +{CHAPTER_COINS}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="tap-press mt-5 block w-full rounded-full bg-qupu-brand-orange py-3 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
        >
          Mulai Petualangan!
        </button>
      </div>
    </div>,
    document.body,
  )
}
