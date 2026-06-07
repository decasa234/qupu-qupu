import { Link } from 'react-router-dom'
import type { WmiPaperSummary } from '../../types/wmi'

export default function WmiPaperCard({ paper }: { paper: WmiPaperSummary }) {
  const best = paper.best_score === null ? null : Math.round(Number(paper.best_score))
  return (
    <Link
      to={`/latihan/wmi/papers/${paper.id}`}
      className="block rounded-lg border-2 border-qupu-cream-dark bg-white p-4 transition-colors hover:bg-qupu-cream/30"
    >
      <div className="flex items-center justify-between gap-3">
        <strong>
          {paper.year} {paper.round === 'final' ? 'Final' : 'Semifinal'}
        </strong>
        <span className="text-xs text-gray-500">{paper.question_count} soal</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {best !== null ? `Nilai terbaik: ${best}%` : 'Belum dicoba'}
      </div>
    </Link>
  )
}
