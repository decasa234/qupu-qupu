// src/components/app-shell/CelebrationHost.tsx
//
// Member-wide host for the persistent celebration queue (celebrationStore):
// level ups, new streak days, and newly unlocked chapters each show as a
// one-at-a-time popup — tap "Lanjut" to reveal the next. The queue is
// persisted, so an unacknowledged popup re-appears after a reload.
//
// This component also DETECTS level/streak jumps: it watches the shared
// gamification stats and compares them against the per-child last-seen
// snapshot in localStorage — whatever surface refreshed the stats (session
// commit, quest claim, purchase, dashboard), the jump is caught here.
// Chapter unlocks are detected by BelajarPath's garden diff and enqueued
// into the same queue. Mounted by AppShell outside play routes, so popups
// never interrupt a running session — they greet the kid right after.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '../../store/authStore'
import { useCelebrationStore, type Celebration } from '../../store/celebrationStore'
import { useGamificationStats } from '../../hooks/useGamificationStats'
import { avatarForLevel } from '../../lib/avatars'
import ChapterRevealModal from '../wmi/path/ChapterRevealModal'
import KonsepConfetti from '../wmi/KonsepConfetti'

function seenProgressKey(childId: string): string {
  return `qupu_seen_progress:${childId}`
}

export default function CelebrationHost() {
  const activeChildId = useAuthStore((s) => s.activeChildId)
  const stats = useGamificationStats((s) => s.stats)
  const statsChildId = useGamificationStats((s) => s.statsChildId)
  const enqueue = useCelebrationStore((s) => s.enqueue)
  const dismissHead = useCelebrationStore((s) => s.dismissHead)
  const head = useCelebrationStore((s) =>
    activeChildId ? s.queues[activeChildId]?.[0] : undefined,
  )

  // Level / streak jump detection against the per-child last-seen snapshot.
  // First sight seeds quietly (no celebrating history); enqueue() dedupes by
  // id, so re-runs (StrictMode, repeated hydrations) are harmless.
  useEffect(() => {
    if (!stats || !statsChildId || statsChildId !== activeChildId) return
    try {
      const key = seenProgressKey(statsChildId)
      const raw = localStorage.getItem(key)
      const seen: unknown = raw ? JSON.parse(raw) : null
      localStorage.setItem(key, JSON.stringify({ level: stats.level, streak: stats.streak }))
      if (
        typeof seen !== 'object' || seen === null ||
        typeof (seen as { level?: unknown }).level !== 'number' ||
        typeof (seen as { streak?: unknown }).streak !== 'number'
      ) {
        return // first sight — seed quietly
      }
      const prev = seen as { level: number; streak: number }
      if (stats.level > prev.level) {
        enqueue(statsChildId, {
          id: `level:${stats.level}`,
          kind: 'level',
          level: stats.level,
          tierName: stats.tierName,
        })
      }
      if (stats.streak > prev.streak) {
        enqueue(statsChildId, { id: `streak:${stats.streak}`, kind: 'streak', streak: stats.streak })
      }
    } catch {
      /* storage unavailable — no celebrations, no harm */
    }
  }, [stats, statsChildId, activeChildId, enqueue])

  if (!activeChildId || !head) return null
  const dismiss = () => dismissHead(activeChildId)

  if (head.kind === 'chapter') {
    return <ChapterRevealModal chapter={head.chapter} onClose={dismiss} />
  }
  return <ProgressPopup celebration={head} onClose={dismiss} />
}

// Level-up / streak popup — same celebration shell as the chapter reveal.
function ProgressPopup({
  celebration,
  onClose,
}: {
  celebration: Extract<Celebration, { kind: 'level' | 'streak' }>
  onClose: () => void
}) {
  const isLevel = celebration.kind === 'level'
  const character = isLevel ? avatarForLevel(celebration.level) : undefined

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <KonsepConfetti />
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isLevel ? `Naik ke Level ${celebration.level}` : `Streak ${celebration.streak} hari`}
        className="relative w-full max-w-[21rem] rounded-[1.75rem] bg-white p-6 pt-8 text-center shadow-[0_6px_0_0_#FFD3B1] motion-safe:animate-rise"
      >
        {isLevel ? (
          <>
            <span className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-[#FB923C] text-4xl text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)] motion-safe:animate-bob">
              <i
                className={character?.icon ?? 'fa-solid fa-star'}
                aria-hidden="true"
              />
              <span className="absolute -bottom-2 left-1/2 flex h-7 min-w-7 -translate-x-1/2 items-center justify-center rounded-full bg-qupu-brand-blue px-2 font-display text-sm font-black text-white ring-[3px] ring-white">
                {celebration.level}
              </span>
            </span>
            <h2 className="mt-4 font-display text-[1.375rem] font-black leading-tight text-qupu-brand-blue">
              Naik ke Level {celebration.level}!
            </h2>
            <p className="mt-1 text-sm font-bold text-qupu-muted">
              {celebration.tierName ? `${celebration.tierName} · ` : ''}
              {character ? `Karakter baru terbuka: ${character.label}!` : 'Terus berpetualang!'}
            </p>
          </>
        ) : (
          <>
            <span className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-qupu-cream">
              <i className="fa-solid fa-fire text-4xl text-qupu-brand-orange" aria-hidden="true" />
              <span className="absolute -bottom-2 left-1/2 flex h-7 min-w-7 -translate-x-1/2 items-center justify-center rounded-full bg-qupu-brand-orange px-2 font-display text-sm font-black text-white ring-[3px] ring-white">
                {celebration.streak}
              </span>
            </span>
            <h2 className="mt-4 font-display text-[1.375rem] font-black leading-tight text-qupu-brand-blue">
              Streak {celebration.streak} Hari!
            </h2>
            <p className="mt-1 text-sm font-bold text-qupu-muted">
              Api semangatmu menyala — sampai besok, ya{' '}
              <i className="fa-solid fa-fire text-qupu-orange" aria-hidden="true" />
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="tap-press mt-5 block w-full rounded-full bg-qupu-brand-orange py-3 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
        >
          Lanjut
        </button>
      </div>
    </div>,
    document.body,
  )
}
