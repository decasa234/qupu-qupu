import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  claimLoginBonus,
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import { fetchShopItems, type ShopItemForChild } from '../lib/shopApi'
import { logSessionEvent } from '../lib/sessionLogger'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { avatarIconClass, DEFAULT_AVATAR_COLOR } from '../lib/avatars'
import AuthCard from '../components/AuthCard'
import SkeletonCard from '../components/SkeletonCard'
import DailyQuestsPanel from '../components/me/DailyQuestsPanel'
import HomeActionCards from '../components/dashboard/HomeActionCards'
import DashboardHighlights from '../components/dashboard/DashboardHighlights'
import ShopTeaser from '../components/dashboard/ShopTeaser'

export default function DashboardPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [vm, setVm] = useState<DashboardViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [affordable, setAffordable] = useState<ShopItemForChild[]>([])
  const [loginClaimed, setLoginClaimed] = useState(false)
  const [claimingLogin, setClaimingLogin] = useState(false)

  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    fetchShopItems(activeChildId)
      .then((items) => {
        if (cancelled) return
        const list = items
          // Exclude owned items and shields already at the 2-cap.
          .filter((i) => !i.owned && i.affordable && (i.shieldCount ?? 0) < 2)
          .sort((a, b) => a.coinPrice - b.coinPrice)
          .slice(0, 3)
        setAffordable(list)
      })
      .catch(() => { /* shop endpoint failure must not break dashboard */ })
    return () => { cancelled = true }
  }, [activeChildId])

  useEffect(() => {
    if (!activeChildId || !activeChild) {
      setVm(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const childId = activeChildId

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/me/dashboard', { params: { childId } })
        if (cancelled) return
        const payload = response.data.data as DashboardApiResponse
        const vmNew = dashboardFromApi(payload)
        if (cancelled) return
        setVm(vmNew)
        setLoginClaimed(vmNew.loginBonus.claimedToday)
        useGamificationStats.getState().setStats(childId, {
          streak: vmNew.streak,
          streakShields: vmNew.streakShields,
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
          to="/onboard/child"
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
    return (
      <div className="w-full">
        <SkeletonCard />
      </div>
    )
  }

  if (error || !vm) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error || 'Gagal memuat dashboard.'}
        </div>
      </div>
    )
  }

  const recommended = vm.recommended[0] ?? null

  // vm.xp = XP earned into the current level; vm.xpToNext = XP still needed
  // for the next level. The progress bar spans the WHOLE level, so the
  // denominator is the level span (into + remaining), not the remaining
  // alone — otherwise the bar pegs at 100% the moment xp passes the midpoint.
  const atMaxLevel = vm.xpToNext <= 0
  const levelSpan = vm.xp + vm.xpToNext
  const xpPercent = atMaxLevel
    ? 100
    : Math.min(100, Math.round((vm.xp / Math.max(1, levelSpan)) * 100))

  async function handleClaimLoginBonus() {
    if (!activeChildId || loginClaimed || claimingLogin) return
    const childId = activeChildId
    setClaimingLogin(true)
    try {
      const result = await claimLoginBonus(childId)
      setLoginClaimed(true)
      useGamificationStats.getState().patchCoinBalance(childId, result.coinBalance)
    } catch (claimError) {
      console.error('Failed to claim login bonus:', claimError)
    } finally {
      setClaimingLogin(false)
    }
  }

  return (
    <div className="w-full max-w-[390px] self-center pb-6">
      <section className="relative overflow-hidden rounded-[2.25rem] bg-qupu-brand-orange p-4 text-white shadow-[0_7px_0_0_#C46123]">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-qupu-brand-yellow/35" />
        <div className="absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-white/12" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 pt-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">
              {vm.tierName}
            </p>
            <h1 className="mt-1 font-display text-[2rem] font-black leading-[0.95] tracking-tight">
              Hai, {vm.child.name}!
            </h1>
            <p className="mt-2 max-w-[13rem] text-xs font-bold leading-tight text-white/80">
              Pilih satu aksi, kumpulkan XP, dan buka hadiah berikutnya.
            </p>
          </div>
          <Link
            to="/me"
            aria-label="Ubah avatar di Profil"
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[1.6rem] text-4xl text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-0.5"
            style={{ backgroundColor: activeChild.avatarColor ?? DEFAULT_AVATAR_COLOR }}
          >
            <i className={avatarIconClass(activeChild.avatarIcon)} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative mt-5 rounded-[1.5rem] bg-qupu-brand-blue p-3 shadow-[0_4px_0_0_#0E1430]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-yellow">
                Level {vm.level}
              </div>
              <div className="mt-1 text-xs font-bold text-white/80">
                {atMaxLevel ? `${vm.xp} XP · level maks` : `${vm.xp} / ${levelSpan} XP`}
              </div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-qupu-brand-blue">
              {atMaxLevel ? 'MAKS' : `${xpPercent}%`}
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-qupu-brand-yellow"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </section>

      <div className="mt-4 space-y-4">
        {/* "Misi Hari Ini" — first card. Fetches /me/quests itself: the
            dashboard payload's vm.quests uses a different shape
            (progressValue/targetValue/status), so an independent fetch is
            simpler than adapting it. Renders nothing on failure. */}
        <DailyQuestsPanel childId={activeChildId} variant="dashboard" />
        <HomeActionCards
          streak={vm.streak}
          streakShields={vm.streakShields}
          recommended={recommended}
          loginBonusReward={vm.loginBonus.coinReward}
          loginBonusClaimed={loginClaimed}
          loginBonusClaiming={claimingLogin}
          onClaimLoginBonus={handleClaimLoginBonus}
        />
        <DashboardHighlights vm={vm} />
        <ShopTeaser coinBalance={vm.coinBalance} affordableItems={affordable} />
      </div>
    </div>
  )
}
