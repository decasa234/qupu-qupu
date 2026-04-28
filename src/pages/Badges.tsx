import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import Reveal from '../components/Reveal'
import SkeletonCard from '../components/SkeletonCard'
import TrophyShelf from '../components/badges/TrophyShelf'
import type { SubjectBadgeGroup } from '../types'

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
            <i
              className="fa-solid fa-user-plus text-base text-qupu-brand-orange"
              aria-hidden="true"
            />
          </span>
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) {
    return <SkeletonCard />
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
    <div className="space-y-6">
      <Reveal>
        <header className="rounded-3xl border-[3px] border-qupu-cream bg-qupu-brand-blue p-5 text-white shadow-[6px_8px_0_0_#FFD3B1]">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
                Ruang trofi
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold">
                Hebat, {activeChild.name}!
              </div>
              <div className="mt-1 text-xs text-qupu-cream">
                {totalBadges} badge dari {groupsWithAny.length} subject · keep going!
              </div>
            </div>
            <div className="flex gap-2">
              {latestThree.map((u) => (
                <Link
                  key={`${u.subjectId}-${u.videoId}`}
                  to={`/videos/${u.videoSlug}`}
                  className="h-11 w-11 rounded-full border-[3px] border-white"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${u.subjectColor}33, ${u.subjectColor})`,
                  }}
                  aria-label={u.videoTitle}
                />
              ))}
            </div>
          </div>
        </header>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <p className="rounded-3xl bg-white p-6 text-sm font-medium text-qupu-muted shadow-soft">
          Belum ada subject yang tersedia. Cek halaman Video.
        </p>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <Reveal key={group.id} delay={0.05}>
              <TrophyShelf group={group} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
