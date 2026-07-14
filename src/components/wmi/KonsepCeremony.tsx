// src/components/wmi/KonsepCeremony.tsx
//
// Session-end reward ceremony. The konsep commit response already carries
// everything earned (XP + quest/achievement bonuses, coins, streak, completed
// quests, unlocked achievements, concepts grown) — this stage reveals it as a
// sequence of celebration beats instead of one flat screen:
//
//   1. score   — "Sesi selesai!" + correct/total (confetti, once)
//   2. xp      — XP count-up (+ "Naik ke <tier>!" flourish on level-up)
//   3. coins   — coin count-up + new balance
//   4. streak  — flame pulse + current streak
//   5. quests  — completed daily-quest rows        (only if any; rewards are
//                CLAIMED from the Misi Hari Ini panel, not auto-included)
//   6. unlocks — achievement rows                  (only if any)
//   7. growth  — PlantIcon from→to tier morph rows (only if any)
//   8. chests  — "Peti Bab terbuka!" chapter chest (only if any)
//   9. drop    — small end-of-session coin drop    (only if granted)
//  10. family  — "Misi Keluarga selesai!"          (only when this commit
//                completed + paid out the weekly family quest)
//
// Beats auto-advance (~800 ms); tapping anywhere skips ahead immediately.
// Reduced-motion users get every beat at once (no timers, no count-ups —
// the global prefers-reduced-motion CSS already no-ops the keyframes).
// The footer button appears at the last beat.

import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import KonsepConfetti from './KonsepConfetti'
import PlantIcon from './PlantIcon'
import { PLANT_STAGES } from './plantStages'
import type {
  WmiComprehensionTier,
  WmiConceptGrown,
  WmiKonsepSessionResult,
} from '../../types/wmi'

interface Props {
  result: WmiKonsepSessionResult
  onDone: () => void
}

type BeatId =
  | 'score'
  | 'xp'
  | 'coins'
  | 'streak'
  | 'quests'
  | 'unlocks'
  | 'growth'
  | 'chests'
  | 'drop'
  | 'family'

const BEAT_MS = 800

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Same icon_key → Font Awesome mapping the post-quiz reward modal uses.
const ACHIEVEMENT_ICON: Record<string, string> = {
  target: 'fa-solid fa-bullseye',
  fire: 'fa-solid fa-fire',
  star: 'fa-solid fa-star',
  crown: 'fa-solid fa-crown',
  'check-circle': 'fa-solid fa-circle-check',
  shapes: 'fa-solid fa-shapes',
  'arrow-up': 'fa-solid fa-arrow-up',
  medal: 'fa-solid fa-medal',
}

function achievementIcon(iconKey: string | null): string {
  if (!iconKey) return 'fa-solid fa-medal'
  return ACHIEVEMENT_ICON[iconKey] ?? 'fa-solid fa-medal'
}

export default function KonsepCeremony({ result, onDone }: Props) {
  // Beats with zero data are omitted entirely — they never get a slot.
  const beats = useMemo<BeatId[]>(() => {
    const list: BeatId[] = ['score', 'xp', 'coins', 'streak']
    if (result.completedQuests.length > 0) list.push('quests')
    if (result.unlockedAchievements.length > 0) list.push('unlocks')
    if (result.conceptsGrown.length > 0) list.push('growth')
    if ((result.chests?.length ?? 0) > 0) list.push('chests')
    if ((result.sessionDrop ?? 0) > 0) list.push('drop')
    if (result.familyQuestCompleted) list.push('family')
    return list
  }, [result])

  const lastStep = beats.length - 1
  const reduced = useMemo(prefersReducedMotion, [])
  // Reduced motion = instant content: start on the final beat (all visible).
  const [step, setStep] = useState(reduced ? lastStep : 0)

  // Auto-advance one beat at a time until everything is revealed.
  useEffect(() => {
    if (step >= lastStep) return
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, lastStep)), BEAT_MS)
    return () => clearTimeout(t)
  }, [step, lastStep])

  // Tap anywhere advances immediately; at the last beat the button takes over.
  const advance = () => setStep((s) => Math.min(s + 1, lastStep))

  const visible = (beat: BeatId) => step >= beats.indexOf(beat)
  const atEnd = step >= lastStep

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-qupu-cream"
      onClick={advance}
      role="presentation"
    >
      {/* One-shot confetti rain over the whole stage */}
      <KonsepConfetti pieces={48} />

      <div className="mx-auto flex min-h-full w-full max-w-[28.75rem] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        {/* Beat 1 — score */}
        <div className="animate-reward-pop">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[0_6px_0_0_#C46123]">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Sesi selesai!</h1>
          <div className="mt-1 font-display text-5xl font-black leading-none text-qupu-brand-blue">
            {result.correct}
            <span className="text-2xl text-qupu-muted">/{result.total}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">jawaban benar</p>
        </div>

        {/* Beat 2 — XP count-up (+ level-up flourish) */}
        {visible('xp') && (
          <div className="animate-reward-pop">
            <div className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-xl font-black text-white shadow-[0_3px_0_0_#0E1430]">
              <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
              +<CountUp to={result.xpEarned} instant={reduced} /> XP
            </div>
            {result.levelUp && (
              <div className="mt-3 rounded-[1.5rem] bg-qupu-brand-blue p-3 font-display text-sm font-black text-white shadow-[0_3px_0_0_#0E1430]">
                <i className="fa-solid fa-arrow-up me-1.5" aria-hidden="true" />
                Naik ke {result.levelUp.tierName}! Level {result.levelUp.previousLevel} <i className="fa-solid fa-arrow-right mx-0.5 text-[0.625rem]" aria-hidden="true" /> {result.levelUp.currentLevel}
              </div>
            )}
          </div>
        )}

        {/* Beat 3 — coins count-up */}
        {visible('coins') && (
          <div className="animate-reward-pop">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 font-display text-xl font-black text-white shadow-[0_3px_0_0_#B45309]">
              <i className="fa-solid fa-coins" aria-hidden="true" />
              +<CountUp to={result.coinsEarned} instant={reduced} />
            </div>
            <p className="mt-1 text-xs font-bold text-qupu-muted">Total {result.coinBalance} koin</p>
          </div>
        )}

        {/* Beat 4 — streak flame */}
        {visible('streak') && (
          <div className="animate-reward-pop inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-lg font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <i className="fa-solid fa-fire animate-flame-pop text-rose-500" aria-hidden="true" />
            Streak {result.streak.current} hari
          </div>
        )}

        {/* Beat 5 — completed quests (rewards claim-gated, P2.2) */}
        {visible('quests') && result.completedQuests.length > 0 && (
          <div className="animate-reward-pop w-full space-y-2">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-widest text-qupu-brand-orange">
              Misi selesai — klaim hadiahmu di Kebun!
            </p>
            {result.completedQuests.map((q) => {
              // New results carry the CLAIMABLE amounts; replayed pre-ritual
              // results still have the old auto-granted fields.
              const xp = q.rewardXp ?? q.xpAwarded ?? 0
              const coins = q.rewardCoins ?? q.coinsAwarded ?? 0
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-2.5 rounded-[1.25rem] bg-white p-3 text-left shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#58A700] text-[0.625rem] text-white">
                    <i className="fa-solid fa-check" aria-hidden="true" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-xs font-bold text-qupu-brand-blue">{q.title}</p>
                  {xp > 0 && (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-qupu-brand-blue px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
                      <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                      +{xp} XP
                    </span>
                  )}
                  {coins > 0 && (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
                      <i className="fa-solid fa-coins" aria-hidden="true" />
                      +{coins}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Beat 6 — unlocked achievements */}
        {visible('unlocks') && result.unlockedAchievements.length > 0 && (
          <div className="animate-reward-pop w-full space-y-2">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-widest text-qupu-brand-orange">Pencapaian baru</p>
            <p className="text-[0.5625rem] font-semibold text-qupu-muted">termasuk dalam total XP di atas</p>
            {result.unlockedAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[1.25rem] border-2 border-qupu-brand-orange/40 bg-white p-3 text-left shadow-[0_4px_0_0_#FFD3B1]"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-qupu-shell text-lg text-qupu-brand-orange">
                  <i className={achievementIcon(a.iconKey)} aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 truncate font-display text-sm font-black text-qupu-brand-blue">{a.title}</p>
                {a.xpAwarded > 0 && (
                  <span className="flex-shrink-0 rounded-full bg-qupu-brand-blue px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
                    +{a.xpAwarded} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Beat 7 — concepts grown (plant tier morph) */}
        {visible('growth') && result.conceptsGrown.length > 0 && (
          <div className="animate-reward-pop w-full space-y-2">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-widest text-qupu-brand-orange">Konsep Tumbuh</p>
            {result.conceptsGrown.map((cg) => (
              <GrowthRow key={cg.slug} grown={cg} instant={reduced} />
            ))}
          </div>
        )}

        {/* Beat 8 — chapter chest(s) opened (50% / 100% grown). Rewards are
            already folded into the XP/coin beats above. fa-treasure-chest is
            Pro-only, so the free fa-box-open plays the chest. */}
        {visible('chests') && (result.chests?.length ?? 0) > 0 && (
          <div className="animate-reward-pop w-full space-y-2">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-widest text-qupu-brand-orange">Peti Bab terbuka!</p>
            {(result.chests ?? []).map((chest) => (
              <div
                key={chest.threshold}
                className="flex items-center gap-3 rounded-[1.25rem] border-2 border-amber-300 bg-amber-50 p-3 text-left shadow-[0_4px_0_0_#FFD3B1]"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-base text-white">
                  <i className="fa-solid fa-box-open" aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 font-display text-[0.8125rem] font-black leading-tight text-qupu-brand-blue">
                  Kebun bab {chest.threshold}% tumbuh!
                </p>
                {chest.coins > 0 && (
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
                    <i className="fa-solid fa-coins" aria-hidden="true" />
                    +{chest.coins}
                  </span>
                )}
                {chest.xp > 0 && (
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-qupu-brand-blue px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
                    <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                    +{chest.xp} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Beat 9 — variable session drop: a small chest right before the
            button. Already folded into the coin beat's total. */}
        {visible('drop') && (result.sessionDrop ?? 0) > 0 && (
          <div className="animate-reward-pop inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <i className="fa-solid fa-box-open text-amber-500" aria-hidden="true" />
            Bonus sesi
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
              <i className="fa-solid fa-coins" aria-hidden="true" />
              +{result.sessionDrop} koin
            </span>
          </div>
        )}

        {/* Beat 10 — Misi Keluarga completed by THIS session (P2.3). Every
            child was paid server-side; this child's share is already in the
            coin beat's total. */}
        {visible('family') && result.familyQuestCompleted && (
          <div className="animate-reward-pop inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <i className="fa-solid fa-people-group text-qupu-brand-orange" aria-hidden="true" />
            Misi Keluarga selesai! Hadiah koin untuk semua.
          </div>
        )}

        {/* Footer — appears at the last beat */}
        {atEnd && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              // The kid sat through (or skipped to) the full ceremony and is
              // heading back — the habit-loop beat completed.
              trackEvent('ceremony_done', { correct: result.correct, total: result.total })
              onDone()
            }}
            className="animate-reward-pop mt-2 inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-seedling text-sm" aria-hidden="true" />
            Kembali ke Kebun
          </button>
        )}
      </div>
    </div>
  )
}

// rAF count-up to `to` over ~600 ms. `instant` (reduced motion) renders the
// final value with no animation.
function CountUp({ to, instant, durationMs = 600 }: { to: number; instant: boolean; durationMs?: number }) {
  const [value, setValue] = useState(instant || to <= 0 ? to : 0)

  useEffect(() => {
    if (instant || to <= 0) {
      setValue(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(to * progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, instant, durationMs])

  return <>{value}</>
}

// One grown concept: the plant tile mounts at fromTier, then swaps to toTier
// with a reward-pop (keyed remount restarts the keyframe).
function GrowthRow({ grown, instant }: { grown: WmiConceptGrown; instant: boolean }) {
  const fromTier = grown.fromTier as WmiComprehensionTier
  const toTier = grown.toTier as WmiComprehensionTier
  const [showTo, setShowTo] = useState(instant)

  useEffect(() => {
    if (instant) return
    const t = setTimeout(() => setShowTo(true), 650)
    return () => clearTimeout(t)
  }, [instant])

  const tier = showTo ? toTier : fromTier
  const stage = PLANT_STAGES[tier]
  const from = PLANT_STAGES[fromTier]
  const to = PLANT_STAGES[toTier]
  // One-time tier-up bonus XP (P2.1) — already folded into the XP beat's
  // total; this chip explains WHY the number jumped.
  const bonusXp = grown.bonusXp ?? 0

  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] bg-white p-3 text-left shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <span
        key={tier}
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${showTo ? 'animate-reward-pop' : ''}`}
        style={{ background: stage.bg, color: stage.fg }}
      >
        <PlantIcon tier={tier} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[0.8125rem] font-black leading-tight text-qupu-brand-blue">{grown.nameId}</div>
        <div className="mt-0.5 text-[0.625rem] font-bold text-qupu-muted">
          {from.labelId} <i className="fa-solid fa-arrow-right mx-0.5 text-[0.5rem]" aria-hidden="true" /> {to.labelId}
        </div>
      </div>
      {bonusXp > 0 && (
        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-qupu-brand-blue px-2 py-0.5 text-[0.625rem] font-extrabold text-white">
          <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
          +{bonusXp} XP — {to.labelId}!
        </span>
      )}
    </div>
  )
}
