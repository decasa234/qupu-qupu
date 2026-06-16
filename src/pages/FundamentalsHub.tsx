import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOutline } from '../lib/fundamentalsApi'
import { useAuthStore } from '../store/authStore'
import type { FundamentalsOutline, OutlineLesson } from '../types/fundamentals'

export default function FundamentalsHub() {
  const { activeChildId } = useAuthStore()
  const [outline, setOutline] = useState<FundamentalsOutline | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChildId) {
      setOutline(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchOutline(activeChildId)
      .then((data) => !cancelled && setOutline(data))
      .catch(() => !cancelled && setOutline(null))
      .finally(() => !cancelled && setLoading(false))
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

  const pct = outline && outline.totalLessons > 0
    ? Math.round((outline.completedLessons / outline.totalLessons) * 100)
    : 0

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
      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-blue p-5 text-white shadow-[0_6px_0_0_#0E1430]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/30" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-blue shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-compass" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-yellow">Bekal Dasar</p>
            <h1 className="font-display text-2xl font-black leading-none">Dasar Olimpiade</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">
              Cara membaca soal, kosakata, &amp; strategi menang.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="relative mt-4 rounded-[1.25rem] bg-white/10 p-3">
          <div className="flex items-center justify-between text-[11px] font-black">
            <span className="inline-flex items-center gap-1.5 text-qupu-brand-yellow">
              <i className="fa-solid fa-flag-checkered" aria-hidden="true" />
              Pelajaran selesai
            </span>
            <span>{outline ? `${outline.completedLessons}/${outline.totalLessons}` : '—'}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-qupu-brand-yellow transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Modules */}
      <div className="mt-5 space-y-5">
        {loading ? (
          <div className="space-y-2.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
            ))}
          </div>
        ) : outline && outline.modules.length > 0 ? (
          outline.modules.map((mod, mi) => (
            <section key={mod.slug}>
              <div className="flex items-center gap-2 px-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-orange text-[11px] font-black text-white">
                  {mi + 1}
                </span>
                <h2 className="font-display text-lg font-black text-qupu-brand-blue">{mod.titleId}</h2>
              </div>
              {mod.summaryId && (
                <p className="mt-0.5 px-1 text-xs font-semibold text-qupu-muted">{mod.summaryId}</p>
              )}
              <div className="mt-2.5 space-y-2">
                {mod.lessons.map((lesson) => (
                  <LessonRow key={lesson.slug} lesson={lesson} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada pelajaran. Periksa lagi nanti ya.
          </p>
        )}
      </div>
    </div>
  )
}

function LessonRow({ lesson }: { lesson: OutlineLesson }) {
  const state = lesson.completed ? 'done' : lesson.locked ? 'locked' : 'next'

  const icon =
    state === 'done'
      ? { cls: 'bg-[#58A700] text-white', glyph: 'fa-check' }
      : state === 'locked'
        ? { cls: 'bg-qupu-cream text-qupu-muted', glyph: 'fa-lock' }
        : { cls: 'bg-qupu-brand-orange text-white', glyph: 'fa-play' }

  const inner = (
    <>
      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs ${icon.cls}`}>
        <i className={`fa-solid ${icon.glyph}`} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`font-display text-sm font-extrabold leading-tight ${state === 'locked' ? 'text-qupu-muted' : 'text-qupu-brand-blue'}`}>
          {lesson.titleId}
        </div>
        {lesson.estMinutes != null && (
          <div className="mt-0.5 text-[11px] font-bold text-qupu-muted">
            <i className="fa-regular fa-clock mr-1" aria-hidden="true" />
            {lesson.estMinutes} menit
          </div>
        )}
      </div>
      {state !== 'locked' && (
        <i className="fa-solid fa-chevron-right text-sm text-qupu-muted/60" aria-hidden="true" />
      )}
    </>
  )

  if (state === 'locked') {
    return (
      <div
        aria-disabled="true"
        title="Selesaikan pelajaran sebelumnya dulu"
        className="flex cursor-not-allowed items-center gap-3 rounded-[1.25rem] bg-white/60 p-3 opacity-70 ring-2 ring-[#FFE3CC]"
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={`/latihan/fundamental/${lesson.slug}`}
      className="flex items-center gap-3 rounded-[1.25rem] bg-white p-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_0_#FFD3B1]"
    >
      {inner}
    </Link>
  )
}
