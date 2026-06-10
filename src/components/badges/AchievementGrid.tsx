// src/components/badges/AchievementGrid.tsx
//
// Achievement tab content for the trophy wall. Fetches the full list
// from GET /api/me/achievements and renders three buckets:
//   - Unlocked (sorted by unlocked_at DESC)
//   - Almost there (progressPercent ≥ 80, not unlocked)
//   - Locked (everything else, sorted by sort_order via API)
//
// Empty state: brand-new child with zero progress sees the encouragement
// card from the surrounding Badges page; this grid handles the case
// where SOME achievements are locked but none are close yet.

import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import Reveal from '../Reveal'
import SkeletonCard from '../SkeletonCard'

interface AchievementListItem {
  code: string
  title: string
  description: string
  iconKey: string | null
  achievementType: string
  targetValue: number
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
  progressValue: number
  progressPercent: number
  almostThere: boolean
}

interface AchievementsResponse {
  achievements: AchievementListItem[]
}

// Maps an achievement icon_key to a Font Awesome class.
const ICON_GLYPH: Record<string, string> = {
  target: 'fa-solid fa-bullseye',
  fire: 'fa-solid fa-fire',
  star: 'fa-solid fa-star',
  crown: 'fa-solid fa-crown',
  'check-circle': 'fa-solid fa-circle-check',
  shapes: 'fa-solid fa-shapes',
  'arrow-up': 'fa-solid fa-arrow-up',
  medal: 'fa-solid fa-medal',
  // WMI garden achievements (0037) + long-arc extensions (0042).
  seedling: 'fa-solid fa-seedling',
  'graduation-cap': 'fa-solid fa-graduation-cap',
  dumbbell: 'fa-solid fa-dumbbell',
  tree: 'fa-solid fa-tree',
  trophy: 'fa-solid fa-trophy',
}

function glyph(iconKey: string | null): string {
  if (!iconKey) return 'fa-solid fa-medal'
  return ICON_GLYPH[iconKey] ?? 'fa-solid fa-medal'
}

function unlockedDateLabel(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

interface Props {
  childId: string | null
}

export default function AchievementGrid({ childId }: Props) {
  const [items, setItems] = useState<AchievementListItem[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/me/achievements', { params: { childId } })
        if (cancelled) return
        const data = response.data?.data as AchievementsResponse | undefined
        setItems(data?.achievements ?? [])
      } catch (loadError) {
        if (cancelled) return
        console.error('Failed to load achievements:', loadError)
        setError('Gagal memuat pencapaian.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [childId])

  const buckets = useMemo(() => {
    if (!items) return { unlocked: [], almost: [], locked: [] }
    const unlocked = items
      .filter((a) => a.unlocked)
      .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
    const almost = items.filter((a) => !a.unlocked && a.almostThere)
    const locked = items.filter((a) => !a.unlocked && !a.almostThere)
    return { unlocked, almost, locked }
  }, [items])

  if (loading) return <SkeletonCard />

  if (error) {
    return (
      <div className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <p className="rounded-3xl bg-white p-6 text-sm font-medium text-qupu-muted shadow-soft">
        Belum ada pencapaian yang aktif.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {buckets.unlocked.length > 0 && (
        <section>
          <SectionHeader
            kicker="Sudah dibuka"
            title={`${buckets.unlocked.length} pencapaian`}
          />
          <div className="mt-3 grid gap-4">
            {buckets.unlocked.map((a, idx) => (
              <Reveal key={a.code} delay={0.03 + idx * 0.03} className="h-full">
                <AchievementCard item={a} state="unlocked" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {buckets.almost.length > 0 && (
        <section>
          <SectionHeader
            kicker="Sedikit lagi"
            title={`${buckets.almost.length} hampir terbuka`}
          />
          <div className="mt-3 grid gap-4">
            {buckets.almost.map((a, idx) => (
              <Reveal key={a.code} delay={0.03 + idx * 0.03} className="h-full">
                <AchievementCard item={a} state="almost" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {buckets.locked.length > 0 && (
        <section>
          <SectionHeader
            kicker="Belum dibuka"
            title={`${buckets.locked.length} pencapaian terkunci`}
          />
          <div className="mt-3 grid gap-4">
            {buckets.locked.map((a, idx) => (
              <Reveal key={a.code} delay={0.03 + idx * 0.02} className="h-full">
                <AchievementCard item={a} state="locked" />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        {kicker}
      </div>
      <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue sm:text-2xl">
        {title}
      </h2>
    </div>
  )
}

type CardState = 'unlocked' | 'almost' | 'locked'

function AchievementCard({ item, state }: { item: AchievementListItem; state: CardState }) {
  const isLocked = state === 'locked' || state === 'almost'
  const accent =
    state === 'unlocked'
      ? 'border-qupu-brand-orange/60'
      : state === 'almost'
        ? 'border-emerald-300/70 bg-emerald-50/60'
        : 'border-qupu-peach bg-qupu-shell/40'

  return (
    <article
      className={`flex h-full flex-col rounded-[2rem] border-[3px] ${accent} bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl shadow-soft ${
            state === 'unlocked'
              ? 'bg-qupu-brand-yellow text-white'
              : 'bg-qupu-shell text-qupu-brand-blue/60 grayscale opacity-70'
          }`}
          aria-hidden="true"
        >
          <i className={glyph(item.iconKey)} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-extrabold text-qupu-brand-blue sm:text-lg">
            {item.title}
          </h3>
          {state === 'unlocked' && item.unlockedAt && (
            <div className="mt-0.5 text-[11px] font-semibold text-qupu-muted">
              {unlockedDateLabel(item.unlockedAt)}
            </div>
          )}
        </div>
        {item.xpReward > 0 && (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-extrabold ${
              state === 'unlocked'
                ? 'bg-qupu-brand-blue text-white'
                : 'bg-qupu-shell text-qupu-brand-blue/70'
            }`}
          >
            +{item.xpReward} XP
          </span>
        )}
      </div>

      <p className="mt-3 flex-1 text-xs font-medium leading-relaxed text-qupu-muted sm:text-sm">
        {item.description}
      </p>

      {isLocked && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
            <span>
              {item.progressValue} / {item.targetValue}
            </span>
            <span>{item.progressPercent}%</span>
          </div>
          <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-qupu-peach bg-white">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${
                state === 'almost' ? 'bg-emerald-500' : 'bg-qupu-brand-orange/70'
              }`}
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </article>
  )
}
