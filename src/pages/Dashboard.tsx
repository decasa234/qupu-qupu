import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import BadgeCurve from '../components/BadgeCurve'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import type { MemberProgress } from '../types'

const SUMMARY_ICONS = {
  attempts: 'fa-solid fa-list-check',
  average: 'fa-solid fa-percent',
  videos: 'fa-solid fa-circle-check',
  badges: 'fa-solid fa-medal',
} as const

const INNER_CARD =
  'rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]'

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

  const subjectsWithBadges = progress.subjectTotals.filter((subject) => subject.totalBadges > 0)

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
                Pantau video yang sudah dikerjakan, lihat badge per subject, lalu lanjutkan ke tantangan berikutnya. Ganti profil di navbar untuk lihat progres anak lainnya.
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

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Reveal delay={0.05}>
            <div className={INNER_CARD}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                    Aktivitas terbaru
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">Recent attempts</h2>
                </div>
                <Link
                  to="/badges"
                  className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
                >
                  Semua badge
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
                </Link>
              </div>

              {progress.recentAttempts.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">
                  Belum ada attempt tersimpan untuk {activeChild.name}. Buka halaman Video dan pilih kuis.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {progress.recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="rounded-[1.5rem] bg-qupu-shell px-5 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-bold text-qupu-brand-blue">{attempt.videoTitle}</div>
                          <div className="text-sm font-medium text-qupu-muted">
                            {attempt.correctAnswers}/{attempt.totalQuestions} benar • {formatDateLabel(attempt.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                            style={{ backgroundColor: attempt.subjectColorHex }}
                          >
                            {attempt.subjectName}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-orange shadow-soft">
                            {attempt.scorePercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className={INNER_CARD}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                Best progress
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold text-qupu-brand-blue">Best per video</h2>
              {progress.videoProgress.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">
                  Belum ada video yang dikerjakan {activeChild.name}.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {progress.videoProgress.map((item) => (
                    <Link
                      key={item.videoId}
                      to={`/videos/${item.videoSlug}`}
                      className="rounded-[1.5rem] border-2 border-transparent bg-qupu-shell px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-qupu-brand-orange/40"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-bold text-qupu-brand-blue">{item.videoTitle}</div>
                          <div className="text-sm font-medium text-qupu-muted">
                            Best score {item.bestScore}% • terakhir {formatDateLabel(item.latestAttemptAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                            style={{ backgroundColor: item.subject.colorHex }}
                          >
                            {item.subject.name}
                          </span>
                          {item.badgeCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-blue shadow-soft">
                              <BadgeCurve color={item.subject.colorHex} size={20} />
                              {item.badgeCount}×
                            </span>
                          ) : (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
                              belum unlock
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal delay={0.15}>
            <div className={INNER_CARD}>
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

          <Reveal delay={0.2}>
            <div className={INNER_CARD}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-medal" aria-hidden="true" />
                Badge per subject
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">Koleksi {activeChild.name}</h2>

              {subjectsWithBadges.length === 0 ? (
                <p className="mt-4 text-sm font-medium text-qupu-muted">
                  Belum ada badge yang terkumpul. Selesaikan video di halaman Video untuk dapat badge.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {subjectsWithBadges.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-qupu-shell px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <BadgeCurve color={subject.colorHex} size={36} />
                        <div>
                          <div className="font-display text-base font-extrabold text-qupu-brand-blue">
                            {subject.name}
                          </div>
                          <div className="text-xs font-semibold text-qupu-muted">
                            Dari {subject.videosWithBadges} video
                          </div>
                        </div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 font-display text-sm font-extrabold text-white"
                        style={{ backgroundColor: subject.colorHex }}
                      >
                        {subject.totalBadges}×
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/badges"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-transparent px-4 py-2 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white"
              >
                Lihat semua badge
                <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
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
