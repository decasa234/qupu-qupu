import ConceptPlant from './ConceptPlant'
import type { WmiGardenChapter, WmiGardenConcept } from '../../types/wmi'

// Chapter-chest marker (P2.2): a small chest pinned on the growth bar at the
// 50% and 100% milestones. Purely derived from existing garden data — the
// backend grants the chest exactly when grown share reaches the threshold,
// so `grownCount * 100 >= threshold * total` IS the earned state (same
// integer math as chestThresholdsToGrant; no extra fetch).
function ChestMarker({ threshold, earned }: { threshold: 50 | 100; earned: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[9px] ring-2 ${
        earned
          ? 'bg-amber-500 text-white ring-amber-300'
          : 'bg-white text-[#C3B89B] ring-[#EFE2CC]'
      } ${threshold === 50 ? 'left-1/2 -translate-x-1/2' : 'right-0 translate-x-1/4'}`}
      title={earned ? `Peti ${threshold}% terbuka` : `Peti ${threshold}%`}
      aria-hidden="true"
    >
      <i className="fa-solid fa-box-open" />
    </span>
  )
}

interface Props {
  chapter: WmiGardenChapter
  index: number
  onConceptInfo: (concept: WmiGardenConcept) => void
  onStartSession: (subjectKey: string) => void
  onStartTest: (subjectKey: string) => void
}

export default function ChapterGarden({ chapter, index, onConceptInfo, onStartSession, onStartTest }: Props) {
  const locked = !chapter.unlocked
  return (
    <div
      className={`mb-4 rounded-[1.5rem] p-4 ${
        locked ? 'bg-[#FBF4E7] ring-2 ring-[#EFE2CC]' : 'bg-white shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] text-[17px] text-white"
          style={{ background: locked ? '#C3CAD6' : chapter.colorHex }}
        >
          <i className={`fa-solid ${locked ? 'fa-lock' : `fa-${chapter.iconKey}`}`} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className={`font-display text-base font-black leading-tight ${locked ? 'text-[#7C8597]' : 'text-qupu-brand-blue'}`}>
            {chapter.nameId}
          </div>
          <div className="text-[10.5px] font-bold text-qupu-muted">
            Bab {index + 1} · {locked ? `${chapter.total} konsep` : 'ketuk tanaman untuk info'}
          </div>
        </div>
        <div className={`font-display text-sm font-black ${locked ? 'text-[#AAB2BF]' : 'text-[#58A700]'}`}>
          {chapter.grownCount}/{chapter.total}
        </div>
      </div>

      {!locked && (
        <>
          <div className="relative my-3">
            <div className="h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
              <div className="h-full rounded-full bg-[#58A700]" style={{ width: `${chapter.meanPct}%` }} />
            </div>
            <ChestMarker threshold={50} earned={chapter.grownCount * 100 >= 50 * chapter.total && chapter.total > 0} />
            <ChestMarker threshold={100} earned={chapter.total > 0 && chapter.grownCount >= chapter.total} />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chapter.concepts.map((c) => (
              <ConceptPlant key={c.slug} concept={c} onClick={onConceptInfo} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onStartSession(chapter.subjectKey)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-blue p-3 font-display text-[13px] font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[11px] text-qupu-brand-orange">
              <i className={`fa-solid ${chapter.grownCount > 0 ? 'fa-rotate-right' : 'fa-play'}`} aria-hidden="true" />
            </span>
            {chapter.grownCount > 0 ? 'Lanjutkan' : 'Mulai Latihan'}
          </button>
        </>
      )}

      {locked && (
        <>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#8A8068]">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Tumbuhkan bab sebelumnya 70% — atau langsung:
          </div>
          <button
            type="button"
            onClick={() => onStartTest(chapter.subjectKey)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-blue p-3 font-display text-[13px] font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[11px] text-qupu-brand-orange">
              <i className="fa-solid fa-bolt" aria-hidden="true" />
            </span>
            Tes Bab · lulus &gt;70% untuk buka
          </button>
        </>
      )}
    </div>
  )
}
