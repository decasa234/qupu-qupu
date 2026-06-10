// src/pages/WmiPapers.tsx
//
// Dedicated "Latihan Soal Ujian" page — the real WMI exam papers, split out of
// the course hub into its own screen. Grade chips filter the paper list.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import WmiPaperCard from '../components/wmi/WmiPaperCard'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchPapers } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiGrade, WmiPaperSummary } from '../types/wmi'

export default function WmiPapers() {
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade } = useWmiStore()
  const [papers, setPapers] = useState<WmiPaperSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChildId) return
    setError(null)
    setLoading(true)
    fetchPapers(activeChildId, selectedGrade)
      .then(setPapers)
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat')))
      .finally(() => setLoading(false))
  }, [activeChildId, selectedGrade])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[460px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      <div className="mb-3">
        <button
          type="button"
          onClick={() => navigate('/latihan/wmi')}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali
        </button>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-blue p-5 text-white shadow-[0_6px_0_0_#0E1430]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/25" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-blue shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-file-pen" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-yellow">
              WMI · Ujian
            </p>
            <h1 className="font-display text-2xl font-black leading-none">Latihan Soal Ujian</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">Soal ujian WMI asli.</p>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <WmiGradeChips selected={selectedGrade} onSelect={(grade: WmiGrade) => setSelectedGrade(grade)} grades={[0, 1, 2, 3]} labelPrefix="Grade" />
      </div>

      {error && <div className="mt-3 rounded-[1.25rem] bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-3 grid gap-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
          ))
        ) : papers.length === 0 && !error ? (
          <div className="rounded-[1.5rem] border-2 border-dashed border-qupu-peach bg-white p-6 text-center text-sm text-qupu-muted">
            Belum ada soal untuk grade ini.
          </div>
        ) : (
          papers.map((paper) => <WmiPaperCard key={paper.id} paper={paper} />)
        )}
      </div>
    </div>
  )
}
