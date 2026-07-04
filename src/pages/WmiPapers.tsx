// src/pages/WmiPapers.tsx
//
// Dedicated "Latihan Soal Ujian" page — the real WMI exam papers, split out of
// the course hub into its own screen. Grade chips filter the paper list.
import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import WmiPaperCard from '../components/wmi/WmiPaperCard'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchPapers } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiGrade, WmiPaperSummary } from '../types/wmi'

export default function WmiPapers() {
  useDocumentTitle('Soal Ujian')
  const { activeChildId } = useAuthStore()
  // Default to the child's resolved grade (synced by AppShell from the school
  // grade / manual pin). Chip taps are a LOCAL browse pick only — looking at
  // another grade's papers must not re-pin the child's sticky garden grade,
  // and the page re-opens on the child's own grade next visit.
  const selectedGrade = useWmiStore((state) => state.selectedGrade)
  const [pick, setPick] = useState<WmiGrade | null>(null)
  const grade = pick ?? selectedGrade
  const [papers, setPapers] = useState<WmiPaperSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChildId) return
    setError(null)
    setLoading(true)
    fetchPapers(activeChildId, grade)
      .then(setPapers)
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat')))
      .finally(() => setLoading(false))
  }, [activeChildId, grade])

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
        <BackButton variant="back" to="/main" />
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
        <WmiGradeChips selected={grade} onSelect={setPick} grades={[0, 1, 2, 3]} labelPrefix="Grade" />
      </div>

      {error && <div className="mt-3 rounded-[1.25rem] bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-3 grid gap-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
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
