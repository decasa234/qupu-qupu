import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardKpis from '../components/dashboard/DashboardKpis'
import DashboardInsights from '../components/dashboard/DashboardInsights'
import DashboardActivity from '../components/dashboard/DashboardActivity'
import DashboardSubjects from '../components/dashboard/DashboardSubjects'
import DashboardRecommended from '../components/dashboard/DashboardRecommended'
import DashboardAttempts from '../components/dashboard/DashboardAttempts'
import DashboardBadges from '../components/dashboard/DashboardBadges'

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
        setVm(dashboardFromApi(payload))
      } catch (loadError) {
        if (cancelled) return
        console.error('Failed to load dashboard:', loadError)
        setError('Gagal memuat dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

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
    <div className="space-y-8 sm:space-y-10">
      <Reveal>
        <DashboardHero vm={vm} />
      </Reveal>

      <Reveal delay={0.05}>
        <DashboardKpis tiles={vm.kpis} />
      </Reveal>

      <Reveal delay={0.1}>
        <DashboardInsights items={vm.insights} />
      </Reveal>

      <section className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <DashboardActivity vm={vm} />
        </Reveal>
        <Reveal delay={0.1}>
          <DashboardSubjects subjects={vm.subjects} childName={vm.child.name} />
        </Reveal>
      </section>

      <Reveal delay={0.05}>
        <DashboardRecommended items={vm.recommended} childName={vm.child.name} />
      </Reveal>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal delay={0.05}>
          <DashboardAttempts attempts={vm.attempts} childName={vm.child.name} />
        </Reveal>
        <Reveal delay={0.1}>
          <DashboardBadges badges={vm.badges} />
        </Reveal>
      </section>
    </div>
  )
}
