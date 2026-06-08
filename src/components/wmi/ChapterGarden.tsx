import ConceptPlant from './ConceptPlant'
import type { WmiGardenChapter, WmiGardenConcept } from '../../types/wmi'

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
          <div className="my-3 h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
            <div className="h-full rounded-full bg-[#58A700]" style={{ width: `${chapter.meanPct}%` }} />
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
