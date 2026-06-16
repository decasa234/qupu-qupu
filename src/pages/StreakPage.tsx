// src/pages/StreakPage.tsx
//
// /streak — opened from the top-bar fire. Reuses the existing dashboard view
// model (GET /me/dashboard) for streak / longest / shields / heatmap, and the
// existing Heatmap primitive for the activity calendar. No backend change.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import Heatmap, { HeatmapLegend } from '../components/dashboard/primitives/Heatmap'
import { useAuthStore } from '../store/authStore'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function StreakPage() {
  useDocumentTitle('Streak')
  const activeChildId = useAuthStore((s) => s.activeChildId)
  const navigate = useNavigate()
  const [vm, setVm] = useState<DashboardViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!activeChildId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    api
      .get('/me/dashboard', { params: { childId: activeChildId } })
      .then((res) => {
        if (cancelled) return
        setVm(dashboardFromApi(res.data.data as DashboardApiResponse))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeChildId, tick])

  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[460px] pb-8">
      <div className="mb-3 flex items-center gap-3 px-1 pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl font-black leading-none text-qupu-brand-blue">Streak</h1>
      </div>

      {loading ? (
        <div className="mt-4 space-y-4" aria-hidden="true">
          <div className="h-32 animate-pulse rounded-[1.75rem] bg-qupu-peach/40" />
          <div className="h-40 animate-pulse rounded-[1.75rem] bg-qupu-peach/40" />
        </div>
      ) : error || !vm ? (
        <div className="mt-4 rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <p className="text-sm font-bold text-qupu-brand-blue">Gagal memuat streak. Periksa koneksimu.</p>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Hero */}
          <div className="rounded-[1.75rem] bg-gradient-to-br from-qupu-brand-orange to-[#D66B23] p-6 text-center text-white shadow-[0_6px_0_0_#FFD3B1]">
            <i className="fa-solid fa-fire text-4xl" aria-hidden="true" />
            <div className="mt-2 font-display text-5xl font-black leading-none">{vm.streak}</div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85">hari beruntun</p>
            <div className="mt-4 flex justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-sm font-black">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                {vm.longestStreak} terpanjang
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-sm font-black">
                <i className="fa-solid fa-shield-halved text-qupu-brand-yellow" aria-hidden="true" />
                {vm.streakShields} pelindung
              </span>
            </div>
          </div>

          {/* Today nudge */}
          <div className="rounded-[1.5rem] bg-white p-4 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-sm font-bold text-qupu-brand-blue">
              {vm.heatmap[vm.todayIdx] > 0 ? (
                <>
                  <i className="fa-solid fa-circle-check me-1.5 text-[#58A700]" aria-hidden="true" />
                  Sudah belajar hari ini!
                </>
              ) : (
                <>
                  <i className="fa-solid fa-seedling me-1.5 text-qupu-brand-orange" aria-hidden="true" />
                  Belum belajar hari ini — jaga streak-mu!
                </>
              )}
            </p>
          </div>

          {/* Calendar / heatmap */}
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
              Aktivitas
            </p>
            <h2 className="mt-0.5 font-display text-lg font-black text-qupu-brand-blue">4 minggu terakhir</h2>
            <div className="mt-4">
              <Heatmap data={vm.heatmap} todayIdx={vm.todayIdx} />
              <HeatmapLegend />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
