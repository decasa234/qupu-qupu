// src/pages/TrackMap.tsx
//
// /belajar/track/:trackId — the theme-driven QUPU track map (units/nodes/
// gates) with full /belajar parity: tap-first sheets (concept / gate / unit
// breakdown), the floating "Lanjut" + Misi Hari Ini buttons, quest badge,
// streak-recovery prompt, "Bab baru terbuka!" celebrations and the one-time
// coach mark. Navigation into a lesson or gate happens ONLY from a sheet's
// Mulai button.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GardenCoachMark from '../components/onboarding/GardenCoachMark'
import StreakRecoveryModal, { useStreakRecoveryPrompt } from '../components/me/StreakRecoveryModal'
import QuestsSheet from '../components/wmi/path/QuestsSheet'
import TrackTrail, { pickCheckpoint } from '../components/wmi/track/TrackTrail'
import TrackConceptSheet from '../components/wmi/track/TrackConceptSheet'
import TrackGateSheet from '../components/wmi/track/TrackGateSheet'
import TrackUnitSheet from '../components/wmi/track/TrackUnitSheet'
import { getThemePack } from '../components/wmi/track/themes'
import { fetchTrackState } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useCelebrationStore } from '../store/celebrationStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type {
  TrackConceptNodeState,
  TrackGateNodeState,
  TrackState,
  TrackUnitState,
} from '../types/wmi'

// Same flag the garden path uses — a kid who dismissed the hint there never
// sees it again here (and vice versa).
const COACHMARK_KEY = 'qupu_garden_coachmark'

function isCoachMarkDone(): boolean {
  try {
    return localStorage.getItem(COACHMARK_KEY) === 'done'
  } catch {
    return true
  }
}

function markCoachMarkDone(): void {
  try {
    localStorage.setItem(COACHMARK_KEY, 'done')
  } catch {
    /* storage unavailable — nothing to persist */
  }
}

// Per-(child, track) record of which units the kid has already SEEN
// unlocked — a freshly unlocked unit not in this list triggers the
// "Bab baru terbuka!" reveal. First-ever load just seeds the list quietly.
function seenUnlocksKey(childId: string, trackId: string): string {
  return `qupu_seen_unlocks_track:${childId}:${trackId}`
}

function diffFreshUnlock(
  state: TrackState,
  childId: string,
  trackId: string,
): TrackUnitState | null {
  try {
    const key = seenUnlocksKey(childId, trackId)
    const raw = localStorage.getItem(key)
    const seen: unknown = raw ? JSON.parse(raw) : null
    const unlockedNow = state.units.filter((u) => u.unlocked).map((u) => u.key)
    localStorage.setItem(key, JSON.stringify(unlockedNow))
    if (!Array.isArray(seen)) return null // first load — seed quietly
    return state.units.find((u) => u.unlocked && !seen.includes(u.key)) ?? null
  } catch {
    return null // storage unavailable — skip the ceremony
  }
}

function unitConcepts(unit: TrackUnitState): TrackConceptNodeState[] {
  return unit.nodes.filter((n): n is TrackConceptNodeState => n.kind === 'concept')
}

interface SelectedConcept {
  node: TrackConceptNodeState
  unit: TrackUnitState
}
interface SelectedGate {
  node: TrackGateNodeState
  unit: TrackUnitState
}

export default function TrackMap({ trackId: trackIdProp }: { trackId?: string } = {}) {
  useDocumentTitle('Belajar')
  // Always call useParams (hook-order safety) even when a caller (e.g.
  // MemberHome's cutover branch) already knows the track id.
  const params = useParams()
  const trackId = trackIdProp ?? params.trackId
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()
  const [state, setState] = useState<TrackState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [fetchTick, setFetchTick] = useState(0)
  const [selected, setSelected] = useState<SelectedConcept | null>(null)
  const [gateSel, setGateSel] = useState<SelectedGate | null>(null)
  const [unitSheet, setUnitSheet] = useState<TrackUnitState | null>(null)
  const [questsOpen, setQuestsOpen] = useState(false)
  const [claimableCount, setClaimableCount] = useState(0)
  // FABs duck out of the way (scale 0) while the trail is scrolling.
  const [scrolling, setScrolling] = useState(false)
  const scrollTimerRef = useRef<number | undefined>(undefined)
  const currentRef = useRef<HTMLButtonElement | null>(null)
  // The "Lanjut" FAB shows only while the checkpoint node is OFF screen.
  const [currentOnScreen, setCurrentOnScreen] = useState(true)
  // Auto-scroll fires once per (child, track) identity — switching the
  // active child re-arms it, refetches of the same track don't.
  const autoScrolledForRef = useRef<string | null>(null)
  const stateKeyRef = useRef<string | null>(null)

  const [showCoachMark, setShowCoachMark] = useState(() => !isCoachMarkDone())
  const dismissCoachMark = () => {
    markCoachMarkDone()
    setShowCoachMark(false)
  }

  // Streak-recovery prompt (at most once per eligibility window; a summary
  // fetch failure simply means no prompt — the map is unaffected).
  const { prompt: recoveryPrompt, dismiss: dismissRecovery } =
    useStreakRecoveryPrompt(activeChildId ?? null)

  // Window is the scroll container (AppShell's column has no inner scroller).
  useEffect(() => {
    const onScroll = () => {
      setScrolling(true)
      window.clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = window.setTimeout(() => setScrolling(false), 240)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(scrollTimerRef.current)
    }
  }, [])

  // Track whether the checkpoint node is in the viewport. Re-observes
  // whenever a fresh trail renders (the anchor ref moves with it).
  useEffect(() => {
    const node = currentRef.current
    if (!state || !node) {
      setCurrentOnScreen(true) // no node to jump to — keep the FAB hidden
      return
    }
    const observer = new IntersectionObserver(([entry]) =>
      setCurrentOnScreen(entry.isIntersecting),
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [state])

  const stateKey = `${activeChildId}:${trackId}`

  useEffect(() => {
    if (!activeChildId || !trackId) { setState(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchTrackState(activeChildId, trackId)
      .then((d) => {
        if (cancelled) return
        stateKeyRef.current = `${activeChildId}:${trackId}`
        setState(d)
        // "Bab baru terbuka!" — enqueue a persistent celebration for a unit
        // this child has never seen unlocked before (e.g. right after
        // passing the previous Tes Bab). CelebrationHost shows it until
        // dismissed.
        const fresh = diffFreshUnlock(d, activeChildId, trackId)
        if (fresh) {
          useCelebrationStore.getState().enqueue(activeChildId, {
            id: `track:${trackId}:${fresh.key}`,
            kind: 'chapter',
            chapter: {
              nameId: fresh.nameId,
              colorHex: fresh.colorHex,
              iconKey: fresh.iconKey,
              concepts: unitConcepts(fresh).map((c) => ({ nameId: c.nameId })),
            },
          })
        }
      })
      .catch(() => {
        if (cancelled) return
        setState(null)
        setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, trackId, fetchTick])

  const scrollToCurrent = useCallback((smooth: boolean) => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    currentRef.current?.scrollIntoView({
      block: 'center',
      behavior: smooth && !reduced ? 'smooth' : 'auto',
    })
  }, [])

  // Auto-scroll each freshly loaded track to the "you are here" node.
  useEffect(() => {
    if (!state || stateKeyRef.current !== stateKey || autoScrolledForRef.current === stateKey) {
      return
    }
    autoScrolledForRef.current = stateKey
    scrollToCurrent(false)
  }, [state, stateKey, scrollToCurrent])

  const handleClaimableCount = useCallback((count: number) => setClaimableCount(count), [])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[28.75rem] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const theme = getThemePack(state?.theme ?? 'forest')
  const checkpointSlug = state ? pickCheckpoint(state.units) : null
  const checkpoint = state && checkpointSlug
    ? state.units.flatMap(unitConcepts).find((n) => n.slug === checkpointSlug) ?? null
    : null
  const levelTotal = state
    ? state.units.flatMap(unitConcepts).reduce((s, n) => s + n.level, 0)
    : 0
  // Veterans never see the coach-mark, even if the localStorage flag was
  // never set on this device.
  const coachMarkVisible = showCoachMark && !!state && levelTotal === 0
  const sheetOpen = !!selected || !!gateSel || !!unitSheet || questsOpen
  const selectedKey = selected
    ? selected.node.slug
    : gateSel
      ? `gate:${gateSel.node.key}`
      : null

  const startLesson = (slug: string) => {
    if (showCoachMark) dismissCoachMark()
    navigate(`/latihan/track/${trackId}/sesi/${slug}`, { state: { theme: state?.theme } })
  }
  const startGate = (key: string) => {
    navigate(`/latihan/track/${trackId}/gerbang/${key}`, { state: { theme: state?.theme } })
  }
  const requireNames = (node: TrackGateNodeState): string[] => {
    if (!state) return []
    const bySlug = new Map(state.units.flatMap(unitConcepts).map((n) => [n.slug, n.nameId]))
    return node.requires.map((slug) => bySlug.get(slug) ?? slug)
  }

  return (
    <div className="relative w-full max-w-[28.75rem] self-center pb-6">
      {/* Draft/review tracks stay testable without misleading anyone that
          they're the live curriculum. */}
      {state && state.status !== 'published' && (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-3 py-1 text-xs font-black text-qupu-brand-blue">
            <i className="fa-solid fa-flask" aria-hidden="true" />
            {state.status}
          </span>
        </div>
      )}

      <div className="relative z-10 mt-1">
        {loading ? (
          // Skeleton mirrors the real trail: a banner bar + node circles on
          // the same zigzag lanes (pathLayout LANE) and 96px row rhythm.
          // bg-qupu-peach/40 (house skeleton tint) — the page itself is
          // qupu-cream, so a cream skeleton would be invisible.
          <div aria-hidden="true">
            <div className="h-[3.75rem] animate-pulse rounded-[1.5rem] bg-qupu-peach/40" />
            <div className="relative" style={{ height: 5 * 104 }}>
              {[0.5, 0.22, 0.5, 0.78, 0.5].map((x, i) => (
                <div
                  key={i}
                  className="absolute h-16 w-16 -translate-x-1/2 animate-pulse rounded-full bg-qupu-peach/40"
                  style={{ left: `${x * 100}%`, top: i * 104 + 16 }}
                />
              ))}
            </div>
          </div>
        ) : loadError ? (
          <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-sm font-bold text-qupu-brand-blue">
              Gagal memuat jalur belajar. Periksa koneksimu.
            </p>
            <button
              type="button"
              onClick={() => setFetchTick((t) => t + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        ) : state && state.units.length > 0 ? (
          <TrackTrail
            units={state.units}
            theme={theme}
            selectedKey={selectedKey}
            checkpointSlug={checkpointSlug}
            currentRef={currentRef}
            coachMark={
              coachMarkVisible ? <GardenCoachMark onDismiss={dismissCoachMark} /> : undefined
            }
            onConcept={(node, unit) => {
              // Tapping a node selects it; the lesson only starts from the
              // sheet's Mulai. Tapping the selected node again is a no-op.
              setGateSel(null)
              setSelected({ node, unit })
            }}
            onGate={(node, unit) => {
              // Every gate is attemptable now (test-out jump) — no lock guard.
              setSelected(null)
              setGateSel({ node, unit })
            }}
            onUnit={(unit) => {
              setSelected(null)
              setGateSel(null)
              setUnitSheet(unit)
            }}
          />
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada konsep untuk track ini.
          </p>
        )}
      </div>

      {/* Floating "Lanjut" — bottom-left twin of the quest chest. Scrolls the
          map to the checkpoint node; shown only while that node is off
          screen. Same duck-away while scrolling. */}
      {checkpoint && !sheetOpen && !currentOnScreen && (
        <button
          type="button"
          aria-label={`Lanjut belajar — ${checkpoint.nameId}`}
          onClick={() => scrollToCurrent(true)}
          className={`fixed bottom-24 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-qupu-brand-orange text-xl text-white shadow-[0_5px_0_0_#C46123] tap-press active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123] lg:bottom-32 lg:left-[calc(50%-230px+1rem)] ${
            scrolling ? 'pointer-events-none scale-0' : 'scale-100'
          }`}
        >
          <i className="fa-solid fa-chevron-up" aria-hidden="true" />
        </button>
      )}

      {/* Floating quest chest — Misi Hari Ini. Ducks away while scrolling and
          whenever a sheet is open. */}
      {!sheetOpen && (
        <button
          type="button"
          aria-label={
            claimableCount > 0
              ? `Misi Hari Ini — ${claimableCount} hadiah siap diklaim`
              : 'Misi Hari Ini'
          }
          onClick={() => setQuestsOpen(true)}
          className={`fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-qupu-brand-orange shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] tap-press active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1] lg:bottom-32 lg:right-[calc(50%-230px+1rem)] ${
            scrolling ? 'pointer-events-none scale-0' : 'scale-100'
          }`}
        >
          <i className="fa-solid fa-gift" aria-hidden="true" />
          {claimableCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full bg-red-500 px-1 text-[0.6875rem] font-black text-white ring-2 ring-white">
              {claimableCount}
            </span>
          )}
        </button>
      )}

      {selected && (
        <TrackConceptSheet
          node={selected.node}
          unit={selected.unit}
          theme={theme}
          onStart={() => startLesson(selected.node.slug)}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Tes Bab confirmation — mirrors the concept flow; navigation to the
          gate happens only from here. */}
      {gateSel && (
        <TrackGateSheet
          node={gateSel.node}
          unit={gateSel.unit}
          requireNames={requireNames(gateSel.node)}
          onStart={() => startGate(gateSel.node.key)}
          onClose={() => setGateSel(null)}
        />
      )}

      {/* Curriculum breakdown — opened from a unit banner. Picking a concept
          or the gate hands off to the matching confirm-first sheet. */}
      {unitSheet && (
        <TrackUnitSheet
          unit={unitSheet}
          theme={theme}
          onPick={(node) => {
            const unit = unitSheet
            setUnitSheet(null)
            setSelected({ node, unit })
          }}
          onGate={(node) => {
            const unit = unitSheet
            setUnitSheet(null)
            setGateSel({ node, unit })
          }}
          onClose={() => setUnitSheet(null)}
        />
      )}

      {/* Mounted while closed so the quest fetch feeds the chest badge. */}
      <QuestsSheet
        childId={activeChildId}
        open={questsOpen}
        onClose={() => setQuestsOpen(false)}
        onClaimableCount={handleClaimableCount}
      />

      {/* Never stack on top of an open sheet — useStreakRecoveryPrompt keeps
          `prompt` set until an explicit dismiss, so it re-shows after close. */}
      {recoveryPrompt && !sheetOpen && (
        <StreakRecoveryModal
          childId={activeChildId}
          previousStreak={recoveryPrompt.previousStreak}
          onClose={dismissRecovery}
        />
      )}
    </div>
  )
}
