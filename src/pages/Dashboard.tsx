import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import { logSessionEvent } from '../lib/sessionLogger'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import AuthCard from '../components/AuthCard'
import SkeletonCard from '../components/SkeletonCard'
import MissionStrip from '../components/dashboard/MissionStrip'
import ShopTeaser from '../components/dashboard/ShopTeaser'

export default function DashboardPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [vm, setVm] = useState<DashboardViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeChildId || !activeChild) {
      setVm(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/me/dashboard', { params: { childId: activeChildId } })
        if (cancelled) return
        const payload = response.data.data as DashboardApiResponse
        const vmNew = dashboardFromApi(payload)
        if (cancelled) return
        setVm(vmNew)
        useGamificationStats.getState().setStats({
          streak: vmNew.streak,
          coinBalance: vmNew.coinBalance,
          level: vmNew.level,
          tierName: vmNew.tierName,
          xp: vmNew.xp,
          xpToNext: vmNew.xpToNext,
        })
      } catch (loadError) {
        if (cancelled) return
        console.error('Failed to load dashboard:', loadError)
        setError('Gagal memuat dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    // Fire-and-forget activation analytics. No duration; we don't track
    // dashboard time-on-page in Plan 5a.
    logSessionEvent({ childId: activeChildId, eventKind: 'dashboard_open' })

    return () => {
      cancelled = true
    }
  }, [activeChildId, activeChild])

  if (!activeChildId || !activeChild) {
    return (
      <AuthCard
        mascotSrc="/hero-mascot.png"
        eyebrow="Dashboard"
        title="Pilih profil anak dulu"
        subtitle="Gunakan switcher di navbar untuk menambahkan atau memilih profil anak. Setiap anak punya progres dan badge sendiri."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <i className="fa-solid fa-user-plus text-base text-qupu-brand-blue" aria-hidden="true" />
          </span>
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return <SkeletonCard />
  }

  if (error || !vm) {
    return (
      <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error || 'Gagal memuat dashboard.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Profile hero */}
      <section className="rounded-[2rem] bg-gradient-to-br from-qupu-brand-blue to-[#2c3f74] p-5 text-white shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-qupu-peach text-2xl text-qupu-brand-blue">
            <i className="fa-solid fa-user-astronaut" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              {vm.tierName}
            </div>
            <h2 className="font-display text-xl font-extrabold">Hai, {vm.child.name}!</h2>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-qupu-brand-yellow"
                style={{ width: `${Math.min(100, Math.round((vm.xp / Math.max(1, vm.xpToNext)) * 100))}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] font-medium text-white/70">
              {vm.xp} / {vm.xpToNext} XP · Level {vm.level}
            </div>
          </div>
        </div>
      </section>

      <MissionStrip quests={vm.quests} childName={vm.child.name} />
      <ShopTeaser coinBalance={vm.coinBalance} />

      <Link
        to="/report"
        className="self-start text-xs font-bold uppercase tracking-[0.18em] text-qupu-brand-orange underline-offset-4 hover:underline"
      >
        Lihat rapor lengkap →
      </Link>
    </div>
  )
}
