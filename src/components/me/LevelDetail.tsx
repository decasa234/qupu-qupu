// src/components/me/LevelDetail.tsx
//
// Detailed XP + level-tiering for the active child, shown on the Profil page.
// Fetches GET /me/gamification (self-sufficient — doesn't rely on the top-strip
// store being warm). Renders current tier, XP progress to the next level, quick
// balances, and the full tier ladder with the current level highlighted.
import { useEffect, useRef, useState } from 'react'
import { fetchGamificationSummary, type GamificationSummary } from '../../lib/gamificationApi'

const THEME_COLOR: Record<string, string> = {
  pemula: '#94A3B8',
  penjelajah: '#60A5FA',
  jago_muda: '#34D399',
  bintang: '#F59E0B',
  master: '#A78BFA',
}

// Tiers beyond the original five have their own theme keys; cycle a palette by
// level so the longer ladder stays visually varied.
const TIER_PALETTE = [
  '#60A5FA', '#34D399', '#F59E0B', '#A78BFA', '#F472B6',
  '#FB7185', '#22D3EE', '#FB923C', '#818CF8', '#10B981',
]

function tierColor(key: string | null | undefined, level: number): string {
  return (key && THEME_COLOR[key]) || TIER_PALETTE[(level - 1) % TIER_PALETTE.length]
}

export default function LevelDetail({ childId }: { childId: string }) {
  const [summary, setSummary] = useState<GamificationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const currentRowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchGamificationSummary(childId)
      .then((data) => !cancelled && setSummary(data))
      .catch(() => !cancelled && setSummary(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [childId])

  // Bring the current tier into view within the (scrollable) ladder without
  // moving the page.
  useEffect(() => {
    if (summary) currentRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [summary])

  if (loading) {
    return (
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
      </section>
    )
  }
  if (!summary) return null

  const atMax = summary.xpToNext <= 0
  const pct = atMax
    ? 100
    : summary.levelSpan > 0
      ? Math.min(100, Math.round((summary.xpIntoCurrent / summary.levelSpan) * 100))
      : 0
  const nextTier = summary.tiers.find((tier) => tier.minXp > summary.totalXp) ?? null
  const currentColor = tierColor(
    summary.tiers.find((t) => t.level === summary.level)?.themeKey,
    summary.level,
  )

  return (
    <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Level &amp; XP
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.2rem] font-display text-2xl font-black text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
          style={{ backgroundColor: currentColor }}
        >
          {summary.level}
        </span>
        <div className="min-w-0">
          <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{summary.tierName}</div>
          <div className="text-xs font-semibold text-qupu-muted">
            Level {summary.level} · {summary.totalXp} XP total
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-qupu-muted">
          <span>{atMax ? 'Level maksimal' : `${summary.xpIntoCurrent} / ${summary.levelSpan} XP`}</span>
          <span>{atMax ? 'MAKS' : `${pct}%`}</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-qupu-cream">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, backgroundColor: currentColor }}
          />
        </div>
        {!atMax && nextTier && (
          <p className="mt-1.5 text-[11px] font-semibold text-qupu-muted">
            Kurang {summary.xpToNext} XP menuju{' '}
            <strong className="text-qupu-brand-blue">{nextTier.name}</strong>
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat icon="fa-solid fa-coins" label="Koin" value={summary.coinBalance} />
        <MiniStat icon="fa-solid fa-fire" label="Streak" value={`${summary.streak} hari`} />
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-muted">Tingkatan</div>
        <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {summary.tiers.map((tier) => {
            const reached = summary.totalXp >= tier.minXp
            const isCurrent = tier.level === summary.level
            return (
              <div
                key={tier.level}
                ref={isCurrent ? currentRowRef : undefined}
                className={`flex items-center gap-3 rounded-[1rem] px-3 py-2 ${
                  isCurrent ? 'bg-qupu-brand-blue text-white' : reached ? 'bg-[#E3F4D7]' : 'bg-qupu-shell'
                }`}
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-display text-xs font-black ${
                    isCurrent ? 'bg-white text-qupu-brand-blue' : 'text-white'
                  }`}
                  style={isCurrent ? undefined : { backgroundColor: tierColor(tier.themeKey, tier.level) }}
                >
                  {tier.level}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`font-display text-sm font-extrabold ${
                      isCurrent ? 'text-white' : 'text-qupu-brand-blue'
                    }`}
                  >
                    {tier.name}
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${isCurrent ? 'text-white/80' : 'text-qupu-muted'}`}
                  >
                    {tier.minXp} XP
                  </div>
                </div>
                <i
                  className={`text-sm ${
                    isCurrent
                      ? 'fa-solid fa-location-dot text-qupu-brand-yellow'
                      : reached
                        ? 'fa-solid fa-circle-check text-[#58A700]'
                        : 'fa-solid fa-lock text-qupu-muted/50'
                  }`}
                  aria-hidden="true"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-2 rounded-[1rem] bg-qupu-shell px-3 py-2">
      <i className={`${icon} text-base text-qupu-brand-orange`} aria-hidden="true" />
      <div className="min-w-0">
        <div className="font-display text-sm font-black leading-none text-qupu-brand-blue">{value}</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-qupu-muted">{label}</div>
      </div>
    </div>
  )
}
