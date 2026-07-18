// src/components/app-shell/StreakPopup.tsx
//
// Streak popup (design), opened from the top-bar fire pill. Flame medallion
// with the streak count, this week's day strip (from the dashboard heatmap),
// the Perisai Beku count, a "Mantap!" dismiss and a "Lihat detail" link to
// the full /streak page.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../../lib/dashboardData'
import { useAuthStore } from '../../store/authStore'
import { useGamificationStats } from '../../hooks/useGamificationStats'

interface Props {
  onClose: () => void
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function StreakPopup({ onClose }: Props) {
  const navigate = useNavigate()
  const activeChildId = useAuthStore((s) => s.activeChildId)
  const stats = useGamificationStats((s) => s.stats)
  const streak = stats?.streak ?? 0
  const shields = stats?.streakShields ?? 0

  // Week strip needs per-day activity — same view model the /streak page uses.
  // On failure the strip is simply omitted; the popup still works.
  const [vm, setVm] = useState<DashboardViewModel | null>(null)
  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    api
      .get('/me/dashboard', { params: { childId: activeChildId } })
      .then((res) => {
        if (!cancelled) setVm(dashboardFromApi(res.data.data as DashboardApiResponse))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeChildId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Monday-first index of today (0 = Sen … 6 = Min).
  const todayCol = (new Date().getDay() + 6) % 7
  const learnedToday = vm ? vm.heatmap[vm.todayIdx] > 0 : false

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Streak"
        className="relative w-full max-w-[21rem] animate-rise rounded-[1.75rem] bg-white p-6 pt-8 text-center shadow-[0_6px_0_0_#FFD3B1]"
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-qupu-shell text-qupu-muted ring-1 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        {/* Flame medallion + count badge */}
        <span className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-qupu-cream">
          <i className="fa-solid fa-fire text-4xl text-qupu-brand-orange" aria-hidden="true" />
          <span className="absolute -bottom-2 left-1/2 flex h-7 min-w-7 -translate-x-1/2 items-center justify-center rounded-full bg-qupu-brand-orange px-2 font-display text-sm font-black text-white ring-[3px] ring-white">
            {streak}
          </span>
        </span>

        <h2 className="mt-4 font-display text-[1.375rem] font-black leading-tight text-qupu-brand-blue">
          {streak > 0 ? `${streak} Hari Beruntun!` : 'Mulai Streak-mu!'}
        </h2>
        <p className="mt-1 text-sm font-bold text-qupu-muted">
          {learnedToday ? (
            <>Apinya menyala! Sampai besok, ya</>
          ) : (
            <>Belajar lagi hari ini biar apinya nggak padam</>
          )}{' '}
          <i className="fa-solid fa-fire text-qupu-orange" aria-hidden="true" />
        </p>

        {/* This week — one tile per day, lit where the heatmap has activity. */}
        {vm && (
          <div className="mt-4 flex justify-center gap-1.5">
            {DAY_LABELS.map((label, col) => {
              const delta = col - todayCol // negative = past, 0 = today
              const heatIdx = vm.todayIdx + delta
              const lit =
                delta <= 0 && heatIdx >= 0 && heatIdx < vm.heatmap.length && vm.heatmap[heatIdx] > 0
              const isToday = delta === 0
              return (
                <div key={label} className="flex w-10 flex-col items-center gap-1">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[0.875rem] text-base ${
                      isToday
                        ? lit
                          ? 'bg-qupu-brand-orange text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)]'
                          : 'bg-qupu-cream text-[#E5D6BC] ring-2 ring-qupu-brand-orange'
                        : lit
                          ? 'bg-qupu-cream text-qupu-brand-orange'
                          : 'bg-[#EFE6D6]'
                    }`}
                  >
                    {(lit || isToday) && <i className="fa-solid fa-fire" aria-hidden="true" />}
                  </span>
                  <span
                    className={`text-[0.5625rem] font-black uppercase tracking-[0.08em] ${
                      lit || isToday ? 'text-qupu-brand-orange' : 'text-qupu-muted/60'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {shields > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-[1rem] bg-[#EAF2FE] p-3 text-left">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.75rem] bg-[#4A90D9] text-sm text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)]">
              <i className="fa-solid fa-snowflake" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-black text-qupu-brand-blue">Perisai Beku × {shields}</div>
              <div className="text-[0.6875rem] font-bold text-qupu-muted">
                Melindungi streak kalau kamu absen 1 hari
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 block w-full rounded-full bg-qupu-brand-orange py-3 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
        >
          Mantap!
        </button>
        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/streak')
          }}
          className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-qupu-muted transition-colors hover:text-qupu-brand-orange"
        >
          Lihat detail
          <i className="fa-solid fa-chevron-right text-[0.5625rem]" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  )
}
