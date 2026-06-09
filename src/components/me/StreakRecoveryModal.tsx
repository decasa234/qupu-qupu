// src/components/me/StreakRecoveryModal.tsx
//
// Streak-recovery prompt for the garden (Mythos P0 item 8). The backend has
// supported POST /me/streak-recovery since Plan 1 — this is its first UI.
//
// useStreakRecoveryPrompt(childId) decides WHEN to show the modal: it loads
// the gamification summary on mount, and if `streakRecovery.eligible` it
// returns a prompt unless this eligibility window was already dismissed.
// Dismissals live in localStorage keyed by childId, with the value encoding
// the window identity (previousStreak + WIB date) — so "Nanti saja" silences
// the modal for the rest of today, but a NEW break (different streak value
// or a later day) prompts again.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchGamificationSummary,
  recoverStreak,
  type StreakRecoveryResult,
} from '../../lib/gamificationApi'
import { useGamificationStats } from '../../hooks/useGamificationStats'

export interface StreakRecoveryPrompt {
  previousStreak: number
}

// WIB calendar date (the backend's streak clock — see streakUpdater.ts).
function todayWib(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

function storageKey(childId: string): string {
  return `qupu_streak_recovery_seen:${childId}`
}

function windowIdentity(previousStreak: number): string {
  return `${previousStreak}:${todayWib()}`
}

function readDismissed(childId: string): string | null {
  try {
    return localStorage.getItem(storageKey(childId))
  } catch {
    return null
  }
}

function writeDismissed(childId: string, identity: string): void {
  try {
    localStorage.setItem(storageKey(childId), identity)
  } catch {
    /* private mode — the modal may re-show next visit; harmless */
  }
}

export function useStreakRecoveryPrompt(childId: string | null): {
  prompt: StreakRecoveryPrompt | null
  dismiss: () => void
} {
  const [prompt, setPrompt] = useState<StreakRecoveryPrompt | null>(null)

  useEffect(() => {
    setPrompt(null)
    if (!childId) return
    let cancelled = false
    fetchGamificationSummary(childId)
      .then((summary) => {
        if (cancelled) return
        // Seed the top stat strip if nothing hydrated it yet — the garden is
        // now the landing surface, so Dashboard's fetch may never have run.
        const store = useGamificationStats.getState()
        if (!store.stats) {
          store.setStats({
            streak: summary.streak,
            coinBalance: summary.coinBalance,
            level: summary.level,
            tierName: summary.tierName,
            xp: summary.xpIntoCurrent,
            xpToNext: summary.xpToNext,
          })
        }
        const recovery = summary.streakRecovery
        if (!recovery || !recovery.eligible || recovery.previousStreak <= 0) return
        if (readDismissed(childId) === windowIdentity(recovery.previousStreak)) return
        setPrompt({ previousStreak: recovery.previousStreak })
      })
      .catch(() => {
        /* summary failure must never break the garden — just no prompt */
      })
    return () => {
      cancelled = true
    }
  }, [childId])

  const dismiss = useCallback(() => {
    setPrompt((current) => {
      if (current && childId) writeDismissed(childId, windowIdentity(current.previousStreak))
      return null
    })
  }, [childId])

  return { prompt, dismiss }
}

type Phase = 'idle' | 'busy' | 'success' | 'error' | 'unavailable'

interface Props {
  childId: string
  previousStreak: number
  onClose: () => void
}

export default function StreakRecoveryModal({ childId, previousStreak, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [restoredStreak, setRestoredStreak] = useState<number | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleRecover = async () => {
    setPhase('busy')
    let result: StreakRecoveryResult
    try {
      result = await recoverStreak(childId)
    } catch {
      setPhase('error')
      return
    }
    if (!result.recovered) {
      // Race (cap reached / already cleared) — retrying cannot help.
      setPhase('unavailable')
      return
    }
    // Refresh the stat strip immediately so the fire pill shows the
    // restored count the instant the celebration appears.
    const store = useGamificationStats.getState()
    if (store.stats) store.patchStats({ streak: result.currentStreakDays })
    setRestoredStreak(result.currentStreakDays)
    setPhase('success')
    closeTimerRef.current = setTimeout(onClose, 1800)
  }

  const busy = phase === 'busy'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pulihkan streak"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'success' ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[inset_0_-4px_0_#C46123]">
              <i className="fa-solid fa-fire animate-bounce" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-black leading-tight text-qupu-brand-blue">
              Streak kembali!
            </h2>
            <p className="mt-1 text-sm font-bold text-qupu-muted">
              Streak-mu sekarang{' '}
              <span className="font-display font-black text-qupu-brand-orange">
                {restoredStreak ?? previousStreak + 1} hari
              </span>
              . Lanjutkan terus!
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[inset_0_-4px_0_#C46123]">
              <i className="fa-solid fa-fire" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-black leading-tight text-qupu-brand-blue">
              Streak {previousStreak} harimu putus!
            </h2>
            <p className="mt-1 text-sm font-bold text-qupu-muted">
              Pulihkan dan lanjutkan kebiasaan belajarmu.
            </p>

            {phase === 'error' && (
              <p className="mt-3 rounded-[1rem] bg-[#FFF1F0] px-3 py-2 text-xs font-bold text-[#C0392B] ring-1 ring-[#F5C6C2]">
                Yah, ada gangguan. Coba lagi, ya.
              </p>
            )}
            {phase === 'unavailable' && (
              <p className="mt-3 rounded-[1rem] bg-[#FFF9F4] px-3 py-2 text-xs font-bold text-qupu-muted ring-1 ring-[#FFE3CC]">
                Pemulihan streak sudah tidak tersedia.
              </p>
            )}

            {phase === 'unavailable' ? (
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-full bg-qupu-brand-blue py-3 font-display text-[15px] font-black text-white shadow-[0_4px_0_0_#0E1430] transition-transform active:translate-y-0.5"
              >
                Tutup
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRecover}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange py-3 font-display text-[15px] font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 disabled:opacity-60"
                >
                  {busy ? (
                    <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                  ) : (
                    <i className="fa-solid fa-fire" aria-hidden="true" />
                  )}
                  {phase === 'error' ? 'Coba Lagi' : 'Pulihkan Streak'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onClose}
                  className="mt-2.5 w-full rounded-full py-2.5 text-sm font-bold text-qupu-muted transition-colors hover:text-qupu-brand-blue disabled:opacity-60"
                >
                  Nanti saja
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
