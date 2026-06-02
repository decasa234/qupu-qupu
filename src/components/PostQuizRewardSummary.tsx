// src/components/PostQuizRewardSummary.tsx
//
// Post-quiz reward summary modal. Triggered after a successful score
// submission when the API response includes a gamification block.
//
// Display order (decision D3 from /plan-ceo-review):
//   1) Score + video badge
//   2) Level-up (if any)
//   3) Achievement unlock (if any)
//   4) Daily quest completion
//   5) XP total earned
//
// First-quiz variant: when unlockedAchievements contains 'first_quiz',
// the headline becomes the celebration moment for a brand-new learner.

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import BadgeCurve from './BadgeCurve'
import ReferralShareCard from './ReferralShareCard'
import type { ScoreAttemptResult } from '../types'

interface Props {
  open: boolean
  result: ScoreAttemptResult
  childName: string
  onClose: () => void
  onGoToDashboard: () => void
}

// Maps an achievement icon_key to a Font Awesome class.
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

function iconFor(iconKey: string | null): string {
  if (!iconKey) return 'fa-solid fa-medal'
  return ACHIEVEMENT_ICON[iconKey] ?? 'fa-solid fa-medal'
}

export default function PostQuizRewardSummary({
  open,
  result,
  childName,
  onClose,
  onGoToDashboard,
}: Props) {
  // Lock body scroll while the modal is open and allow Esc to dismiss.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const gam = result.gamification
  const isFirstQuiz = gam?.unlockedAchievements.some((a) => a.code === 'first_quiz') ?? false
  const isPerfect = result.attempt.scorePercentage === 100
  const levelUp = gam?.levelUp ?? null
  // Bigger confetti burst for the standout moments.
  const bigCelebration = isFirstQuiz || !!levelUp || isPerfect

  // Mascot headline priority: first-quiz → level-up → perfect score → achievement → quest → default.
  const headline = (() => {
    if (isFirstQuiz) return `Quiz pertama ${childName} selesai!`
    if (levelUp) return `${childName} naik level — ${levelUp.currentTierName}!`
    if (isPerfect) return `Skor sempurna! 100%!`
    if (gam && gam.unlockedAchievements.length > 0) return `Pencapaian baru: ${gam.unlockedAchievements[0].title}`
    if (gam && gam.completedQuests.length > 0) return `Quest selesai untuk ${childName}!`
    if (result.earnedBadgeCount > 0) return `Yes! Badge baru untuk ${childName}.`
    return `Skor disimpan untuk ${childName}.`
  })()

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hadiah quiz"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:py-10"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="animate-reward-fade absolute inset-0 bg-qupu-brand-blue/60 backdrop-blur-sm"
      />

      {/* Celebration confetti — rains over the whole viewport, never blocks taps. */}
      <RewardConfetti pieces={bigCelebration ? 64 : 38} />

      <div className="animate-reward-pop relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] [scrollbar-width:none] sm:p-8 [&::-webkit-scrollbar]:hidden">
        {/* Mascot + headline */}
        <div className="text-center">
          <img
            src="/hero-mascot.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="animate-reward-mascot pointer-events-none mx-auto h-28 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)]"
          />
          <h2 className="mt-3 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
            {headline}
          </h2>
        </div>

        {/* Section 1 — Score + video badge */}
        <section className="mt-5 rounded-[1.5rem] bg-qupu-shell px-5 py-4 text-center">
          <div className="font-display text-5xl font-extrabold leading-none text-qupu-brand-blue">
            {result.attempt.scorePercentage}%
          </div>
          <div className="mt-1 text-xs font-semibold text-qupu-muted">
            {result.attempt.correctAnswers} / {result.attempt.totalQuestions} jawaban benar
          </div>
          {result.earnedBadgeCount > 0 && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <div className="flex justify-center -space-x-3">
                {Array.from({ length: Math.min(result.earnedBadgeCount, 5) }).map((_, idx) => (
                  <BadgeCurve key={idx} color={result.subject.colorHex} size={48} />
                ))}
                {result.earnedBadgeCount > 5 && (
                  <span className="ml-1 inline-flex h-12 items-center rounded-full bg-white px-3 font-display text-sm font-extrabold text-qupu-brand-blue shadow-sm">
                    +{result.earnedBadgeCount - 5}
                  </span>
                )}
              </div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-white shadow-sm"
                style={{ backgroundColor: result.subject.colorHex }}
              >
                <i className="fa-solid fa-trophy text-sm" aria-hidden="true" />
                <span className="font-display text-sm font-extrabold">
                  {result.earnedBadgeCount} badge {result.subject.name}
                </span>
              </span>
            </div>
          )}
        </section>

        {/* Section 2 — Level-up */}
        {levelUp && (
          <section className="mt-4 rounded-[1.5rem] border-[3px] border-qupu-brand-yellow/70 bg-qupu-brand-yellow/15 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-yellow text-2xl text-white shadow-soft" aria-hidden="true">
                <i className="fa-solid fa-star" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Naik level
                </div>
                <div className="font-display text-lg font-extrabold text-qupu-brand-blue">
                  Level {levelUp.previousLevel} → Level {levelUp.currentLevel}
                </div>
                <div className="text-xs font-semibold text-qupu-brand-blue/80">
                  Tier baru: <strong>{levelUp.currentTierName}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 3 — Achievements unlocked */}
        {gam && gam.unlockedAchievements.length > 0 && (
          <section className="mt-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              Pencapaian baru
            </div>
            <div className="space-y-2">
              {gam.unlockedAchievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[1.25rem] border-[2px] border-qupu-brand-orange/40 bg-white px-4 py-3"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-qupu-shell text-2xl text-qupu-brand-orange shadow-soft" aria-hidden="true">
                    <i className={iconFor(a.iconKey)} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm font-extrabold text-qupu-brand-blue">
                      {a.title}
                    </div>
                  </div>
                  {a.xpAwarded > 0 && (
                    <span className="whitespace-nowrap rounded-full bg-qupu-brand-blue px-2.5 py-1 font-display text-[11px] font-extrabold text-white">
                      +{a.xpAwarded} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4 — Quest completions */}
        {gam && gam.completedQuests.length > 0 && (
          <section className="mt-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              Quest selesai
            </div>
            <div className="space-y-2">
              {gam.completedQuests.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 rounded-[1.25rem] bg-emerald-50 border-2 border-emerald-300 px-4 py-2.5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-soft" aria-hidden="true">
                    <i className="fa-solid fa-check text-xs" />
                  </span>
                  <div className="flex-1 min-w-0 font-display text-sm font-bold text-qupu-brand-blue truncate">
                    {q.title}
                  </div>
                  {q.xpAwarded > 0 && (
                    <span className="whitespace-nowrap rounded-full bg-emerald-600 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-white">
                      +{q.xpAwarded} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5 — XP earned + coins + streak */}
        {gam && (gam.xpEarned > 0 || gam.coinsEarned > 0 || gam.streak.current > 0) && (
          <section className="mt-4 grid grid-cols-2 gap-3">
            {gam.xpEarned > 0 && (
              <div className="rounded-[1.25rem] bg-qupu-brand-blue px-4 py-3 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  XP didapat
                </div>
                <div className="mt-0.5 font-display text-2xl font-extrabold">
                  +{gam.xpEarned}
                </div>
                <div className="text-[10px] font-semibold text-white/80">
                  Total {gam.totalXp} XP
                </div>
              </div>
            )}
            {gam.coinsEarned > 0 && (
              <div className="rounded-[1.25rem] bg-amber-500 px-4 py-3 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Koin didapat
                </div>
                <div className="mt-0.5 font-display text-2xl font-extrabold">
                  <i className="fa-solid fa-coins" aria-hidden="true" /> +{gam.coinsEarned}
                </div>
                <div className="text-[10px] font-semibold text-white/80">
                  Total {gam.coinBalance} koin
                </div>
              </div>
            )}
            {gam.streak.current > 0 && (
              <div className="rounded-[1.25rem] bg-rose-500 px-4 py-3 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Streak
                </div>
                <div className="mt-0.5 font-display text-2xl font-extrabold">
                  <i className="fa-solid fa-fire" aria-hidden="true" /> {gam.streak.current}
                </div>
                <div className="text-[10px] font-semibold text-white/80">
                  Hari berturut-turut
                </div>
              </div>
            )}
          </section>
        )}

        {/* Share moment — only on high-value events */}
        {(isFirstQuiz || levelUp) && (
          <ReferralShareCard childName={childName} headline={headline} />
        )}

        {/* CTAs */}
        <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            <i className="fa-solid fa-gauge text-sm" aria-hidden="true" />
            Lihat dashboard
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Brand-palette confetti for the reward moment. Pieces are generated once per
// mount (the modal unmounts when closed, so each open gets a fresh burst) and
// rain down via the shared `fall` keyframe. pointer-events-none so taps fall
// through to the card / backdrop beneath.
const CONFETTI_COLORS = ['#FFDD55', '#F0853A', '#30598A', '#22C55E', '#EF4444', '#FB923C']

function RewardConfetti({ pieces }: { pieces: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.5,
        duration: 2.4 + Math.random() * 1.8,
        size: 7 + Math.random() * 7,
        round: i % 3 === 0,
      })),
    [pieces],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size * 1.4}px`,
            backgroundColor: b.color,
            borderRadius: b.round ? '9999px' : '2px',
            animation: `fall ${b.duration}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
