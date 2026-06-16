// src/pages/LatihanHub.tsx
//
// "Main" tab landing — a playful course catalog for kids. Today there's one
// course (Latihan WMI), modelled as a list so more can be added. Each card
// carries its description, why-it's-good-for-kids points, and the child's
// overall concept-mastery progress, and links into the course.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchConceptProgress } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import type { WmiConceptProgressSummary } from '../types/wmi'

export default function LatihanHub() {
  const { activeChildId } = useAuthStore()
  const [progress, setProgress] = useState<WmiConceptProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChildId) {
      setProgress(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchConceptProgress(activeChildId)
      .then((data) => !cancelled && setProgress(data))
      .catch(() => !cancelled && setProgress(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeChildId])

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      {/* Playful hero with the mascot */}
      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-5 pr-28 text-white shadow-[0_6px_0_0_#C46123]">
        <div className="absolute -left-6 -top-8 h-24 w-24 rounded-full bg-qupu-brand-yellow/30" />
        <img
          src="/hero-mascot.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute -bottom-2 right-1 h-28 w-auto select-none drop-shadow-[0_8px_18px_rgba(120,60,0,0.25)]"
        />
        <p className="relative text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
          Ayo main &amp; belajar
        </p>
        <h1 className="relative mt-1 font-display text-3xl font-black leading-none">Waktunya Main!</h1>
        <p className="relative mt-2 max-w-[14rem] text-xs font-bold leading-tight text-white/85">
          Pilih petualanganmu, taklukkan konsep, dan kumpulkan XP setiap hari.
        </p>
      </section>

      <div className="mt-5">
        <WmiCourseCard progress={progress} loading={loading} />
      </div>
    </div>
  )
}

const WHY_GOOD = [
  { icon: 'fa-solid fa-medal', text: 'Soal bergaya olimpiade matematika internasional.' },
  { icon: 'fa-solid fa-lightbulb', text: 'Melatih logika & pemecahan masalah, bukan sekadar hafalan.' },
  { icon: 'fa-solid fa-stairs', text: 'Bertahap dari Grade 0–3 — cocok untuk TK hingga SD awal.' },
  { icon: 'fa-solid fa-comments', text: 'Umpan balik langkah-demi-langkah saat jawaban belum tepat.' },
]

function WmiCourseCard({
  progress,
  loading,
}: {
  progress: WmiConceptProgressSummary | null
  loading: boolean
}) {
  const pct = progress ? Math.round(progress.overallProgress * 100) : 0
  const allDone = !!progress && progress.totalConcepts > 0 && progress.mastered === progress.totalConcepts

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-[5px_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      {/* Course banner */}
      <div className="relative bg-qupu-brand-blue p-5 text-white">
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-qupu-brand-yellow/30" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-yellow">
              Petualangan
            </p>
            <h2 className="font-display text-xl font-black leading-tight">Olimpiade Matematika</h2>
            <p className="text-[11px] font-bold text-white/80">Latihan bergaya olimpiade internasional</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold leading-snug text-qupu-muted">
          Latihan konsep menyajikan soal otomatis tanpa batas yang terinspirasi dari kompetisi
          matematika internasional, untuk mengasah dasar berhitung dan cara berpikir anak.
        </p>

        <ul className="mt-4 space-y-2.5">
          {WHY_GOOD.map((item) => (
            <li key={item.text} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-qupu-cream text-xs text-qupu-brand-orange">
                <i className={item.icon} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold leading-snug text-qupu-brand-blue/85">
                {item.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Overall mastery progress — framed as conquering concepts */}
        <div className="mt-5 rounded-[1.25rem] bg-qupu-shell p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
              <i className={allDone ? 'fa-solid fa-trophy' : 'fa-solid fa-flag-checkered'} aria-hidden="true" />
              Konsep ditaklukkan
            </span>
            {loading ? (
              <span className="h-4 w-16 animate-pulse rounded-full bg-qupu-cream" />
            ) : (
              <span className="font-display text-sm font-black text-qupu-brand-blue">
                {progress ? `${progress.mastered}/${progress.totalConcepts}` : '—'}
              </span>
            )}
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-qupu-cream">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${allDone ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          <Link
            to="/latihan/wmi/konsep"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3.5 font-display text-lg font-black text-white shadow-[0_5px_0_0_#B8541A] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_0_#B8541A]"
          >
            <i className="fa-solid fa-play text-base" aria-hidden="true" />
            Main Sekarang!
          </Link>
          <Link
            to="/latihan/wmi"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-blue/20 bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-shell"
          >
            <i className="fa-solid fa-list-check text-sm" aria-hidden="true" />
            Lihat semua konsep & ujian
          </Link>
        </div>
      </div>
    </article>
  )
}
