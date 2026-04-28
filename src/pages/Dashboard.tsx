import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import SubjectMasteryCard from '../components/dashboard/SubjectMasteryCard'
import RecentAttemptsCompact from '../components/dashboard/RecentAttemptsCompact'
import type { MemberProgress } from '../types'

const SUMMARY_ICONS = {
  attempts: 'fa-solid fa-list-check',
  average: 'fa-solid fa-percent',
  videos: 'fa-solid fa-circle-check',
  badges: 'fa-solid fa-medal',
} as const

export default function DashboardPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeChildId) {
      setProgress(null)
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get('/me/progress', {
          params: { childId: activeChildId },
        })
        setProgress(response.data.data as MemberProgress)
      } catch (loadError) {
        console.error('Failed to load dashboard:', loadError)
        setError('Gagal memuat dashboard.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [activeChildId])

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

  if (error || !progress) {
    return (
      <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error || 'Gagal memuat dashboard.'}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
          <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute left-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
          <i className="fa-solid fa-star pointer-events-none absolute right-5 bottom-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <span
                  className="h-6 w-6 rounded-full border-2 border-white shadow-soft"
                  style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
                />
                Dashboard {activeChild.name}
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
                Progres belajar {activeChild.name} di QUPU.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
                Pantau performa per subject, lihat rapor lengkap, lalu lanjutkan ke tantangan berikutnya. Ganti profil di navbar untuk lihat progres anak lainnya.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryCard icon={SUMMARY_ICONS.attempts} title="Attempt tersimpan" value={progress.summary.attemptsCount} />
              <SummaryCard icon={SUMMARY_ICONS.average} title="Rata-rata skor" value={`${progress.summary.averageScore}%`} />
              <SummaryCard icon={SUMMARY_ICONS.videos} title="Video selesai" value={progress.summary.videosCompleted} />
              <SummaryCard icon={SUMMARY_ICONS.badges} title="Total badge" value={progress.summary.badgesTotal} />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <SubjectMasteryCard stats={progress.subjectStats} childName={activeChild.name} />
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal delay={0.1}>
          <RecentAttemptsCompact attempts={progress.recentAttempts} childName={activeChild.name} />
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full border-4 border-white shadow-soft"
                style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Profil aktif
                </div>
                <div className="font-display text-3xl font-bold text-qupu-brand-blue">{activeChild.name}</div>
              </div>
            </div>

            <div className="mt-5 text-sm font-medium text-qupu-muted">
              Ingin lihat progres anak lain? Ganti profil dari switcher di navbar.
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: string
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.75rem] bg-qupu-shell px-5 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-qupu-brand-orange shadow-soft">
          <i className={`${icon} text-base`} aria-hidden="true" />
        </span>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{title}</div>
      </div>
      <div className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue">{value}</div>
    </div>
  )
}
