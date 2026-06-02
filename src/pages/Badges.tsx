import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import BadgeCurve from '../components/BadgeCurve'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import TrophyShelf from '../components/badges/TrophyShelf'
import AchievementGrid from '../components/badges/AchievementGrid'
import type { SubjectBadgeGroup } from '../types'

type BadgesTab = 'videos' | 'achievements'

export default function BadgesPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [groups, setGroups] = useState<SubjectBadgeGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<BadgesTab>('videos')

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
      <div className="mx-auto w-full max-w-4xl">
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
              <i
                className="fa-solid fa-user-plus text-base text-qupu-brand-orange"
                aria-hidden="true"
              />
            </span>
            Tambah profil anak
          </Link>
        </AuthCard>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <SkeletonCard />
      </div>
    )
  }

  const totalBadges = groups.reduce(
    (acc, g) => acc + g.unlocks.reduce((a, u) => a + u.badgeCount, 0),
    0,
  )
  const groupsWithAny = groups.filter((g) => g.unlocks.length > 0)
  const latestThree = groups
    .flatMap((g) =>
      g.unlocks.map((u) => ({
        subjectId: g.id,
        subjectColor: g.colorHex,
        videoId: u.videoId,
        videoSlug: u.videoSlug,
        videoTitle: u.videoTitle,
        unlockedAt: u.unlockedAt,
      })),
    )
    .sort((a, b) => (a.unlockedAt < b.unlockedAt ? 1 : -1))
    .slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <Reveal>
        <header className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/70 bg-gradient-to-br from-qupu-cream via-qupu-shell to-qupu-peach/60 p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8">
          <i
            className="fa-solid fa-star pointer-events-none absolute left-6 top-5 text-base text-qupu-brand-yellow drop-shadow-sm"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-star pointer-events-none absolute right-6 top-6 text-sm text-qupu-orange/70"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-sparkles pointer-events-none absolute left-1/3 bottom-5 text-sm text-qupu-brand-yellow/80"
            aria-hidden="true"
          />

          <div className="relative grid gap-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-qupu-brand-orange">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                Ruang Trofi
              </div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-qupu-brand-blue sm:text-5xl">
                Hebat, {activeChild.name}!
              </h1>
              <p className="mt-2 text-sm font-semibold text-qupu-muted sm:text-base">
                {totalBadges} badge dari {groupsWithAny.length} subject · ayo kumpulin lebih banyak!
              </p>
            </div>

            {latestThree.length > 0 && (
              <div className="flex items-end justify-start gap-3 sm:justify-end">
                {latestThree.map((u, idx) => (
                  <Link
                    key={`${u.subjectId}-${u.videoId}`}
                    to={`/videos/${u.videoSlug}`}
                    aria-label={u.videoTitle}
                    className="transition-transform hover:-translate-y-1"
                    style={{
                      transform: idx === 1 ? 'translateY(-6px)' : undefined,
                    }}
                  >
                    <BadgeCurve color={u.subjectColor} size={64} label={u.videoTitle} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <div
          role="tablist"
          aria-label="Pilih tampilan badge"
          className="inline-flex items-center gap-1 rounded-full bg-qupu-shell p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'videos'}
            onClick={() => setTab('videos')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-extrabold transition-colors ${
              tab === 'videos'
                ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                : 'text-qupu-brand-blue/70 hover:text-qupu-brand-blue'
            }`}
          >
            <i className="fa-solid fa-trophy text-xs" aria-hidden="true" />
            Lencana Video
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'achievements'}
            onClick={() => setTab('achievements')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-extrabold transition-colors ${
              tab === 'achievements'
                ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                : 'text-qupu-brand-blue/70 hover:text-qupu-brand-blue'
            }`}
          >
            <i className="fa-solid fa-medal text-xs" aria-hidden="true" />
            Pencapaian
          </button>
        </div>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {tab === 'videos' ? (
        groups.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-sm font-medium text-qupu-muted shadow-soft">
            Belum ada subject yang tersedia. Cek halaman Video.
          </p>
        ) : (
          <div className="grid gap-4">
            {groups.map((group, idx) => (
              <Reveal key={group.id} delay={0.05 + idx * 0.04} className="h-full">
                <TrophyShelf group={group} />
              </Reveal>
            ))}
          </div>
        )
      ) : (
        <AchievementGrid childId={activeChildId} />
      )}
    </div>
  )
}
