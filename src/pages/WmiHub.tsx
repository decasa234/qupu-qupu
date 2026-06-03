import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import ConceptCatalog from '../components/wmi/ConceptCatalog'
import { fetchConceptProgress } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiConceptProgressSummary, WmiGrade } from '../types/wmi'

export default function WmiHub() {
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, loadGlossary } = useWmiStore()
  const [progress, setProgress] = useState<WmiConceptProgressSummary | null>(null)
  const [progressLoading, setProgressLoading] = useState(true)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  // Concept progress is grade-independent (all concepts), so it loads once per child.
  useEffect(() => {
    if (!activeChildId) {
      setProgress(null)
      setProgressLoading(false)
      return
    }
    let cancelled = false
    setProgressLoading(true)
    fetchConceptProgress(activeChildId)
      .then((data) => !cancelled && setProgress(data))
      .catch(() => !cancelled && setProgress(null))
      .finally(() => !cancelled && setProgressLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeChildId])

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
        <Link
          to="/latihan"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali
        </Link>
      </div>

      {/* Course banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-5 text-white shadow-[0_6px_0_0_#C46123]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/35" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Kursus</p>
            <h1 className="font-display text-2xl font-black leading-none">Latihan WMI</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">
              Pikir seperti juara olimpiade.
            </p>
          </div>
        </div>
      </section>

      {/* Grade selector — drives the general Konsep + Drill picks. */}
      <div className="mt-4 rounded-[1.5rem] bg-[#FFF8F0] p-3 ring-2 ring-[#FFE3CC]">
        <p className="px-1 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
          Pilih kelas
        </p>
        <WmiGradeChips selected={selectedGrade} onSelect={(grade: WmiGrade) => setSelectedGrade(grade)} />
      </div>

      {/* Primary CTAs */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          to="/latihan/wmi/konsep"
          className="flex flex-col gap-1 rounded-[1.5rem] bg-qupu-brand-blue p-4 text-white shadow-[0_5px_0_0_#0E1430] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#0E1430]"
        >
          <i className="fa-solid fa-bolt text-xl text-qupu-brand-yellow" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight">Latihan Konsep</span>
          <span className="text-[11px] font-bold text-white/75">Soal tanpa batas · +5 XP</span>
        </Link>
        <Link
          to={`/latihan/wmi/drill?grade=${selectedGrade}`}
          className="flex flex-col gap-1 rounded-[1.5rem] bg-[#FFF8F0] p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1]"
        >
          <i className="fa-solid fa-dumbbell text-xl text-qupu-brand-orange" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">
            Drill
          </span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Soal ujian asli</span>
        </Link>
      </div>

      {/* Concept catalog */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-black text-qupu-brand-blue">Konsep</h2>
          {progress && (
            <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue">
              {progress.mastered}/{progress.totalConcepts} dikuasai
            </span>
          )}
        </div>
        <p className="mt-0.5 px-1 text-xs font-semibold text-qupu-muted">
          Ketuk konsep untuk langsung berlatih.
        </p>
        <div className="mt-3">
          {progressLoading ? (
            <div className="space-y-2.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
              ))}
            </div>
          ) : progress ? (
            <ConceptCatalog summary={progress} />
          ) : (
            <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum bisa memuat progres konsep.
            </p>
          )}
        </div>
      </div>

      {/* Dedicated exam page entry */}
      <Link
        to="/latihan/wmi/ujian"
        className="mt-6 flex items-center gap-3 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1]"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.1rem] bg-qupu-brand-blue text-xl text-white shadow-[0_3px_0_0_#0E1430]">
          <i className="fa-solid fa-file-pen" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-black leading-tight text-qupu-brand-blue">
            Latihan Soal Ujian
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-qupu-muted">Soal ujian WMI asli per kelas.</p>
        </div>
        <i className="fa-solid fa-chevron-right text-sm text-qupu-muted/60" aria-hidden="true" />
      </Link>
    </div>
  )
}
