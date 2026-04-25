import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Sparkles, Trophy, UserCircle2 } from 'lucide-react'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import { useAuthStore } from '../store/authStore'
import type { BadgeUnlockFamily } from '../types'

const iconByName: Record<string, typeof Sparkles> = {
  Sparkles,
  Star: Trophy,
  Crown,
}

export default function BadgesPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [families, setFamilies] = useState<BadgeUnlockFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeChildId) {
      setFamilies([])
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
        setFamilies(response.data.data.families ?? [])
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
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-orange">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-qupu-purple">Pilih profil anak dulu</h1>
        <p className="mt-2 text-sm text-qupu-muted">
          Badge dikumpulkan per anak. Pilih profil dari switcher di navbar untuk lihat koleksi badge-nya.
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

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-qupu-peach bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">
          <span
            className="h-6 w-6 rounded-full border-2 border-white"
            style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
          />
          Badge {activeChild.name}
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">
          Semua reward QUPU yang sudah {activeChild.name} buka
        </h1>
        <p className="mt-3 max-w-2xl text-qupu-muted">
          Badge dikumpulkan per family. Tiap video bisa menaikkan tier kalau hasilnya lebih baik. Ganti profil
          di navbar untuk lihat koleksi anak lain.
        </p>
      </section>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">{error}</div>
      )}

      {families.length === 0 ? (
        <section className="rounded-[2rem] border border-qupu-peach bg-white p-10 text-center shadow-soft">
          <h2 className="font-display text-2xl font-bold text-qupu-purple">Belum ada badge</h2>
          <p className="mt-2 text-sm text-qupu-muted">
            {activeChild.name} belum membuka badge apa pun. Selesaikan kuis di halaman Video.
          </p>
          <Link
            to="/videos"
            className="mt-5 inline-flex rounded-full bg-qupu-orange px-5 py-3 text-sm font-bold text-white"
          >
            Jelajahi video
          </Link>
        </section>
      ) : (
        <div className="grid gap-6">
          {families.map((family) => (
            <section
              key={family.id}
              className="rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-soft"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div
                    className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: family.colorHex }}
                  >
                    {family.name}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-bold text-qupu-purple">
                    {family.unlocks.length} unlock tersimpan
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {family.unlocks.map((unlock) => {
                  const Icon = iconByName[unlock.iconName] ?? Sparkles

                  return (
                    <div
                      key={unlock.tierId + unlock.videoId}
                      className="rounded-[1.5rem] bg-qupu-shell px-5 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-full p-3 text-white shadow-soft"
                            style={{ backgroundColor: unlock.colorHex }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-qupu-purple">{unlock.videoTitle}</div>
                            <div className="text-sm text-qupu-muted">
                              Tier {unlock.tier} • {unlock.tierName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-qupu-muted">
                          <div>Unlock</div>
                          <div className="font-semibold">{formatDateLabel(unlock.unlockedAt)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
