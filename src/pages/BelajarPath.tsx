// src/pages/BelajarPath.tsx
//
// /belajar — the Duolingo-style skill tree (Task 5). Replaces WmiHub's
// chapter-card garden with a winding path of plant-tier nodes: chapter
// banners, concept stops, Tes Bab boss nodes. Near-zero text on the canvas;
// details live in bottom sheets (ConceptSheet per node, QuestsSheet behind
// the chest button). The top stat strip + bottom tabs come from AppShell.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GardenCoachMark from '../components/onboarding/GardenCoachMark'
import StreakRecoveryModal, { useStreakRecoveryPrompt } from '../components/me/StreakRecoveryModal'
import PathTrail, { pickCurrentNode } from '../components/wmi/path/PathTrail'
import ConceptSheet from '../components/wmi/path/ConceptSheet'
import ChapterSheet from '../components/wmi/path/ChapterSheet'
import BossSheet from '../components/wmi/path/BossSheet'
import QuestsSheet from '../components/wmi/path/QuestsSheet'
import { fetchGarden } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useCelebrationStore } from '../store/celebrationStore'
import { useWmiStore } from '../store/wmiStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type { WmiGarden, WmiGardenChapter, WmiGardenConcept, WmiGrade } from '../types/wmi'

// One-time coach-mark ("first question is the tutorial") — same flag the old
// garden used, so veterans who already dismissed it never see it again.
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

// Garden grades are 1-3 only (grade 0 exists just for the papers page).
function clampGardenGrade(grade: WmiGrade): WmiGrade {
  return grade < 1 ? 1 : grade > 3 ? 3 : grade
}

// Per-(child, grade) record of which chapters the kid has already SEEN
// unlocked — a freshly unlocked chapter not in this list triggers the
// "Bab baru terbuka!" reveal. First-ever load just seeds the list quietly.
function seenUnlocksKey(childId: string, grade: WmiGrade): string {
  return `qupu_seen_unlocks:${childId}:${grade}`
}

function diffFreshUnlock(
  garden: WmiGarden,
  childId: string,
  grade: WmiGrade,
): WmiGardenChapter | null {
  try {
    const key = seenUnlocksKey(childId, grade)
    const raw = localStorage.getItem(key)
    const seen: unknown = raw ? JSON.parse(raw) : null
    const unlockedNow = garden.chapters.filter((ch) => ch.unlocked).map((ch) => ch.subjectKey)
    localStorage.setItem(key, JSON.stringify(unlockedNow))
    if (!Array.isArray(seen)) return null // first load — seed quietly
    return garden.chapters.find((ch) => ch.unlocked && !seen.includes(ch.subjectKey)) ?? null
  } catch {
    return null // storage unavailable — skip the ceremony
  }
}

interface SelectedConcept {
  concept: WmiGardenConcept
  chapter: WmiGardenChapter
}

export default function BelajarPath() {
  useDocumentTitle('Belajar')
  const { activeChildId } = useAuthStore()
  const { selectedGrade, gradeByChild, lastSubjectKey, loadGlossary } = useWmiStore()
  const navigate = useNavigate()
  const [garden, setGarden] = useState<WmiGarden | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [fetchTick, setFetchTick] = useState(0)
  const [selected, setSelected] = useState<SelectedConcept | null>(null)
  const [bossChapter, setBossChapter] = useState<WmiGardenChapter | null>(null)
  const [breakdownChapter, setBreakdownChapter] = useState<WmiGardenChapter | null>(null)
  const [questsOpen, setQuestsOpen] = useState(false)
  const [claimableCount, setClaimableCount] = useState(0)
  // Quest FAB ducks out of the way (scale 0) while the trail is scrolling.
  const [scrolling, setScrolling] = useState(false)
  const scrollTimerRef = useRef<number | undefined>(undefined)
  const currentRef = useRef<HTMLButtonElement | null>(null)
  // The "Lanjut" FAB shows only while the current node is OFF screen —
  // when the node (and its Mulai chip) is visible, the FAB is redundant.
  const [currentOnScreen, setCurrentOnScreen] = useState(true)
  // Auto-scroll fires once per (child, grade) path identity — switching the
  // active child or grade re-arms it, but refetches of the same path don't.
  // gardenKeyRef records which path the current `garden` state belongs to, so
  // a key change never scrolls against (and burns its one shot on) the
  // previous path's still-rendered trail.
  const autoScrolledForRef = useRef<string | null>(null)
  const gardenKeyRef = useRef<string | null>(null)

  // Read the persisted per-child pin directly so a pinned child renders the
  // right grade on cold load (no wrong-grade first fetch).
  const pinnedGrade = activeChildId ? gradeByChild[activeChildId] : undefined
  const effectiveGrade = clampGardenGrade(pinnedGrade ?? selectedGrade)

  const [showCoachMark, setShowCoachMark] = useState(() => !isCoachMarkDone())
  const dismissCoachMark = () => {
    markCoachMarkDone()
    setShowCoachMark(false)
  }

  // Streak-recovery prompt (at most once per eligibility window; a summary
  // fetch failure simply means no prompt — the path is unaffected).
  const { prompt: recoveryPrompt, dismiss: dismissRecovery } =
    useStreakRecoveryPrompt(activeChildId)

  useEffect(() => { loadGlossary().catch(() => {}) }, [loadGlossary])

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

  // Track whether the current node is in the viewport. Re-observes whenever a
  // fresh trail renders (the anchor ref moves to the new current node).
  useEffect(() => {
    const node = currentRef.current
    if (!garden || !node) {
      setCurrentOnScreen(true) // no node to jump to — keep the FAB hidden
      return
    }
    const observer = new IntersectionObserver(([entry]) =>
      setCurrentOnScreen(entry.isIntersecting),
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [garden, lastSubjectKey])

  const pathKey = `${activeChildId}:${effectiveGrade}`

  useEffect(() => {
    if (!activeChildId) { setGarden(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchGarden(activeChildId, effectiveGrade)
      .then((d) => {
        if (cancelled) return
        gardenKeyRef.current = `${activeChildId}:${effectiveGrade}`
        setGarden(d)
        // "Bab baru terbuka!" — enqueue a persistent celebration for a chapter
        // this child has never seen unlocked before (e.g. right after passing
        // the previous Tes Bab). CelebrationHost shows it until dismissed.
        const fresh = diffFreshUnlock(d, activeChildId, effectiveGrade)
        if (fresh) {
          useCelebrationStore.getState().enqueue(activeChildId, {
            id: `chapter:${effectiveGrade}:${fresh.subjectKey}`,
            kind: 'chapter',
            chapter: {
              nameId: fresh.nameId,
              colorHex: fresh.colorHex,
              iconKey: fresh.iconKey,
              concepts: fresh.concepts.map((c) => ({ nameId: c.nameId })),
            },
          })
        }
      })
      .catch(() => {
        if (cancelled) return
        setGarden(null)
        setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, effectiveGrade, fetchTick])

  const scrollToCurrent = useCallback((smooth: boolean) => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    currentRef.current?.scrollIntoView({
      block: 'center',
      behavior: smooth && !reduced ? 'smooth' : 'auto',
    })
  }, [])

  // Auto-scroll each freshly loaded path to the "you are here" node.
  useEffect(() => {
    if (!garden || gardenKeyRef.current !== pathKey || autoScrolledForRef.current === pathKey) {
      return
    }
    autoScrolledForRef.current = pathKey
    scrollToCurrent(false)
  }, [garden, pathKey, scrollToCurrent])

  const handleClaimableCount = useCallback((count: number) => setClaimableCount(count), [])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[28.75rem] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const grownTotal = garden?.chapters.reduce((s, c) => s + c.grownCount, 0) ?? 0
  // Veterans never see the coach-mark, even if the localStorage flag was
  // never set on this device.
  const coachMarkVisible = showCoachMark && !!garden && grownTotal === 0

  const current = garden ? pickCurrentNode(garden, lastSubjectKey) : null
  const sheetOpen = !!selected || questsOpen || !!breakdownChapter || !!bossChapter

  const startSession = (subjectKey: string, focusSlug?: string) => {
    if (showCoachMark) dismissCoachMark()
    const focus = focusSlug ? `?fokus=${encodeURIComponent(focusSlug)}` : ''
    navigate(`/latihan/wmi/sesi/${subjectKey}${focus}`)
  }

  return (
    <div className="relative w-full max-w-[28.75rem] self-center pb-6">
      <div className="relative z-10">
      <div className="mt-1">
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
        ) : garden && garden.chapters.length > 0 ? (
          <PathTrail
            garden={garden}
            lastSubjectKey={lastSubjectKey}
            currentRef={currentRef}
            coachMark={
              coachMarkVisible ? <GardenCoachMark onDismiss={dismissCoachMark} /> : undefined
            }
            selectedSlug={selected?.concept.slug ?? null}
            selectedBossKey={bossChapter?.subjectKey ?? null}
            onNode={(concept, chapter) => {
              // Tapping a node selects it; tapping the selected node again is
              // a no-op (the sheet closes via ×, drag, or Escape only —
              // never by bouncing the spotlight back to another node).
              setBossChapter(null)
              setSelected({ concept, chapter })
            }}
            onChapter={(chapter) => {
              setSelected(null)
              setBossChapter(null)
              setBreakdownChapter(chapter)
            }}
            onBoss={(chapter) => {
              // Same tap model as concept nodes: spotlight + sheet first, the
              // test only starts from the sheet's Mulai.
              setSelected(null)
              setBossChapter(chapter)
            }}
          />
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada konsep untuk kelas ini.
          </p>
        )}
      </div>
      </div>{/* /relative z-10 content */}

      {/* Floating "Lanjut" — bottom-left twin of the quest chest. Scrolls the
          path to the latest active node; shown only while that node is off
          screen. Same duck-away while scrolling. */}
      {current && !sheetOpen && !currentOnScreen && (
        <button
          type="button"
          aria-label={`Lanjut belajar — ${current.concept.nameId}`}
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
        <ConceptSheet
          concept={selected.concept}
          chapter={selected.chapter}
          onStart={() => startSession(selected.chapter.subjectKey, selected.concept.slug)}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Tes Bab confirmation — mirrors the concept flow; navigation to the
          chapter test happens only from here. */}
      {bossChapter && (
        <BossSheet
          chapter={bossChapter}
          onStart={() => navigate(`/latihan/wmi/tes/${bossChapter.subjectKey}`)}
          onClose={() => setBossChapter(null)}
        />
      )}

      {/* Curriculum breakdown — opened from a chapter banner. Picking a concept
          hands off to ConceptSheet (which focuses the node + shows progress). */}
      {breakdownChapter && (
        <ChapterSheet
          chapter={breakdownChapter}
          hasCurrentNode={current?.chapter.subjectKey === breakdownChapter.subjectKey}
          onPick={(concept) => {
            const chapter = breakdownChapter
            setBreakdownChapter(null)
            setSelected({ concept, chapter })
          }}
          onBoss={() => {
            // Hand off to the Tes Bab sheet (same confirm-first flow as the
            // boss node) instead of jumping straight into the test.
            const chapter = breakdownChapter
            setBreakdownChapter(null)
            setBossChapter(chapter)
          }}
          onClose={() => setBreakdownChapter(null)}
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
