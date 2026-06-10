import { Link } from 'react-router-dom'
import type { WmiPaperSummary } from '../../types/wmi'

export default function WmiPaperCard({ paper }: { paper: WmiPaperSummary }) {
  const best = paper.best_score === null ? null : Math.round(Number(paper.best_score))
  return (
    <Link
      to={`/latihan/wmi/papers/${paper.id}`}
      className="block rounded-[1.5rem] bg-white p-4 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[1rem] bg-qupu-cream text-lg text-qupu-brand-blue">
          <i className="fa-solid fa-file-lines" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <strong className="font-display text-base font-black text-qupu-brand-blue">
              {paper.year} {paper.round === 'final' ? 'Final' : 'Semifinal'}
            </strong>
            <span className="flex-shrink-0 text-xs font-bold text-qupu-muted">
              {paper.question_count} soal
            </span>
          </div>
          <div className="mt-0.5 text-sm font-semibold text-qupu-muted">
            {best !== null ? (
              <>
                <i className="fa-solid fa-star me-1 text-qupu-brand-yellow" aria-hidden="true" />
                Nilai terbaik: {best}%
              </>
            ) : (
              'Belum dicoba'
            )}
          </div>
        </div>
        <i className="fa-solid fa-chevron-right flex-shrink-0 text-sm text-qupu-peach" aria-hidden="true" />
      </div>
    </Link>
  )
}
