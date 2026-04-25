import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck, UserCircle2 } from 'lucide-react'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import type { MemberProgress } from '../types'

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
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-orange">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-qupu-purple">Pilih profil anak dulu</h1>
        <p className="mt-2 text-sm text-qupu-muted">
          Gunakan switcher di navbar untuk menambahkan atau memilih profil anak. Setiap anak punya
          progres dan badge sendiri.
        </p>
        <Link
          to="/onboarding/child"
          className="mt-5 inline-flex rounded-full bg-qupu-orange px-5 py-3 text-sm font-bold text-white"
        >
          Tambah profil anak
        </Link>
      </section>
    )
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-[2.5rem] bg-qupu-cream" />
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
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">
              <span
                className="h-6 w-6 rounded-full border-2 border-white"
                style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
              />
              Dashboard {activeChild.name}
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">
              Progres belajar {activeChild.name} di QUPU.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-qupu-muted">
              Pantau video yang sudah dikerjakan, lihat badge terbaru, lalu lanjutkan ke tantangan
              berikutnya. Ganti profil di navbar untuk lihat progres anak lainnya.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard title="Attempt tersimpan" value={progress.summary.attemptsCount} />
            <SummaryCard title="Rata-rata skor" value={`${progress.summary.averageScore}%`} />
            <SummaryCard title="Video selesai" value={progress.summary.videosCompleted} />
            <SummaryCard title="Badge kebuka" value={progress.summary.badgesUnlocked} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-qupu-orange">
                  Recent attempts
                </div>
                <h2 className="mt-1 font-display text-3xl font-bold text-qupu-purple">Aktivitas terbaru</h2>
              </div>
              <Link
                to="/badges"
                className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 text-sm font-bold text-qupu-purple"
              >
                Lihat semua badge
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {progress.recentAttempts.length === 0 ? (
              <p className="mt-5 text-sm text-qupu-muted">
                Belum ada attempt tersimpan untuk {activeChild.name}. Buka halaman Video dan pilih kuis.
              </p>
            ) : (
              <div className="mt-5 grid gap-4">
                {progress.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-[1.5rem] bg-qupu-shell px-5 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-bold text-qupu-purple">{attempt.videoTitle}</div>
                        <div className="text-sm text-qupu-muted">
                          {attempt.correctAnswers}/{attempt.totalQuestions} benar •{' '}
                          {formatDateLabel(attempt.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                          style={{ backgroundColor: attempt.subjectColorHex }}
                        >
                          {attempt.subjectName}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-qupu-orange shadow-soft">
                          {attempt.scorePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-qupu-orange">Best progress</div>
            <h2 className="mt-1 font-display text-3xl font-bold text-qupu-purple">Best per video</h2>
            {progress.videoProgress.length === 0 ? (
              <p className="mt-5 text-sm text-qupu-muted">Belum ada video yang dikerjakan {activeChild.name}.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {progress.videoProgress.map((item) => (
                  <Link
                    key={item.videoId}
                    to={`/videos/${item.videoSlug}`}
                    className="cursor-pointer rounded-[1.5rem] border border-qupu-peach bg-qupu-shell px-5 py-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-bold text-qupu-purple">{item.videoTitle}</div>
                        <div className="text-sm text-qupu-muted">
                          Best score {item.bestScore}% • terakhir {formatDateLabel(item.latestAttemptAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.unlockedTier ? (
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                            style={{ backgroundColor: item.unlockedTier.colorHex }}
                          >
                            {item.unlockedTier.familyName} • Tier {item.unlockedTier.tier}
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
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full border-4 border-white shadow-soft"
                style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
              />
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-qupu-orange">
                  Profil aktif
                </div>
                <div className="font-display text-3xl font-bold text-qupu-purple">{activeChild.name}</div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-qupu-shell px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-3 text-qupu-orange shadow-soft">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-qupu-purple">Tier 3 unlocks</div>
                  <div className="text-sm text-qupu-muted">
                    {activeChild.name} sudah membuka {progress.summary.tierThreeUnlocks} badge tertinggi.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-qupu-muted">
              Ingin lihat progres anak lain? Ganti profil dari switcher di navbar.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[1.75rem] bg-qupu-shell px-5 py-5">
      <div className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">{title}</div>
      <div className="mt-2 font-display text-4xl font-bold text-qupu-purple">{value}</div>
    </div>
  )
}
