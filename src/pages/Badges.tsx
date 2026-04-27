import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import BadgeCurve from '../components/BadgeCurve'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import type { SubjectBadgeGroup } from '../types'

const INNER_CARD =
  'rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]'

const BADGE_PREVIEW_LIMIT = 8

export default function BadgesPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [groups, setGroups] = useState<SubjectBadgeGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeChildId) {
      setGroups([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get('/me/badges', {
          params: { childId: activeChildId },
        })
        setGroups(response.data.data.families ?? [])
      } catch (loadError) {
        console.error('Failed to load badges:', loadError)
        setError('Gagal memuat badge.')
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
        eyebrow="Badge"
        title="Pilih profil anak dulu"
        subtitle="Badge dikumpulkan per anak. Pilih profil dari switcher di navbar untuk lihat koleksi badge-nya."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <i className="fa-solid fa-user-plus text-base text-qupu-brand-orange" aria-hidden="true" />
          </span>
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return <SkeletonCard />
  }

  const totalBadges = groups.reduce((sum, group) => sum + group.totalBadges, 0)
  const subjectsWithBadges = groups.filter((group) => group.totalBadges > 0)

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
                Badge {activeChild.name}
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold text-qupu-brand-blue sm:text-5xl">
                {totalBadges} badge dikumpulkan {activeChild.name}.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-qupu-muted">
                Setiap subject punya satu desain badge. Skor lebih tinggi di tiap video = lebih banyak badge subject itu. Ganti profil di navbar untuk lihat koleksi anak lain.
              </p>
            </div>

            <div className="relative hidden h-44 lg:block">
              <img
                src="/achievement-right.png"
                alt=""
                draggable={false}
                className="pointer-events-none absolute -right-6 -top-4 h-48 w-auto select-none drop-shadow-[0_18px_30px_rgba(120,60,0,0.18)]"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">{error}</div>
      )}

      {subjectsWithBadges.length === 0 ? (
        <Reveal delay={0.05}>
          <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-10 text-center shadow-[5px_6px_0_0_#FFD3B1]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-medal text-xl" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-qupu-brand-blue">Belum ada badge</h2>
            <p className="mt-2 text-sm font-medium text-qupu-muted">
              {activeChild.name} belum membuka badge apa pun. Selesaikan kuis di halaman Video.
            </p>
            <Link
              to="/videos"
              className="mt-5 inline-flex items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                <i className="fa-solid fa-compass text-base text-qupu-brand-orange" aria-hidden="true" />
              </span>
              Jelajahi video
            </Link>
          </section>
        </Reveal>
      ) : (
        <div className="grid gap-6">
          {subjectsWithBadges.map((group, groupIndex) => (
            <Reveal key={group.id} delay={0.05 + groupIndex * 0.05}>
              <section className={INNER_CARD}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <BadgeCurve color={group.colorHex} size={64} label={`Badge ${group.name}`} />
                    <div>
                      <div
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                        style={{ backgroundColor: group.colorHex }}
                      >
                        <i className="fa-solid fa-medal" aria-hidden="true" />
                        {group.name}
                      </div>
                      <h2 className="mt-2 font-display text-3xl font-bold text-qupu-brand-blue">
                        {group.totalBadges} badge
                      </h2>
                      <p className="text-sm font-semibold text-qupu-muted">
                        Dari {group.unlocks.length} video {group.name}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {group.unlocks.map((unlock) => (
                    <Link
                      key={unlock.videoId}
                      to={`/videos/${unlock.videoSlug}`}
                      className="rounded-[1.5rem] border-2 border-transparent bg-qupu-shell px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-qupu-brand-orange/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-2">
                            {Array.from({ length: Math.min(unlock.badgeCount, BADGE_PREVIEW_LIMIT) }).map((_, idx) => (
                              <BadgeCurve key={idx} color={group.colorHex} size={28} />
                            ))}
                            {unlock.badgeCount > BADGE_PREVIEW_LIMIT && (
                              <span className="ml-1 inline-flex h-7 items-center rounded-full bg-white px-2 font-display text-[11px] font-extrabold text-qupu-brand-blue shadow-sm">
                                +{unlock.badgeCount - BADGE_PREVIEW_LIMIT}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-qupu-brand-blue">{unlock.videoTitle}</div>
                            <div className="text-sm font-medium text-qupu-muted">
                              {unlock.bestCorrectAnswers}/{unlock.totalQuestions} benar
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs font-medium text-qupu-muted">
                          <div className="font-display text-lg font-extrabold text-qupu-brand-orange">
                            {unlock.badgeCount}×
                          </div>
                          <div className="font-semibold text-qupu-brand-blue">
                            {formatDateLabel(unlock.unlockedAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
