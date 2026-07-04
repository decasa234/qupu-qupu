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
import QuestsSheet from '../components/wmi/path/QuestsSheet'
import { fetchGarden } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
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

interface SelectedConcept {
  concept: WmiGardenConcept
  chapter: WmiGardenChapter
}

// WMI Claire is a niche, temporary mode — its entry card shows only for these
// parent accounts (the server gates the API to the same allow-list).
const CLAIRE_PARENT_EMAILS = ['johan@decasa.co.id', 'vicopratama449@gmail.com']

export default function BelajarPath() {
  useDocumentTitle('Belajar')
  const { activeChildId, user } = useAuthStore()
  const isClaireParent = CLAIRE_PARENT_EMAILS.includes((user?.email ?? '').trim().toLowerCase())
  const { selectedGrade, gradeByChild, lastSubjectKey, loadGlossary } = useWmiStore()
  const navigate = useNavigate()
  const [garden, setGarden] = useState<WmiGarden | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [fetchTick, setFetchTick] = useState(0)
  const [selected, setSelected] = useState<SelectedConcept | null>(null)
  const [breakdownChapter, setBreakdownChapter] = useState<WmiGardenChapter | null>(null)
  const [questsOpen, setQuestsOpen] = useState(false)
  const [claimableCount, setClaimableCount] = useState(0)
  const currentRef = useRef<HTMLButtonElement | null>(null)
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
      <div className="w-full max-w-[460px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const grownTotal = garden?.chapters.reduce((s, c) => s + c.grownCount, 0) ?? 0
  // Veterans never see the coach-mark, even if the localStorage flag was
  // never set on this device.
  const coachMarkVisible = showCoachMark && !!garden && grownTotal === 0

  const current = garden ? pickCurrentNode(garden, lastSubjectKey) : null
  const sheetOpen = !!selected || questsOpen || !!breakdownChapter

  const startSession = (subjectKey: string, focusSlug?: string) => {
    if (showCoachMark) dismissCoachMark()
    const focus = focusSlug ? `?fokus=${encodeURIComponent(focusSlug)}` : ''
    navigate(`/latihan/wmi/sesi/${subjectKey}${focus}`)
  }

  return (
    <div className="relative w-full max-w-[460px] self-center pb-6">
      <BelajarBackdrop />
      <div className="relative z-10">
      {/* Header row: title + quest chest. No grade chips, no resume hero. */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h1 className="font-display text-2xl font-black leading-none text-qupu-brand-blue">
          Belajar
        </h1>
        <button
          type="button"
          aria-label={
            claimableCount > 0
              ? `Misi Hari Ini — ${claimableCount} hadiah siap diklaim`
              : 'Misi Hari Ini'
          }
          onClick={() => setQuestsOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-lg text-qupu-brand-orange shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-gift" aria-hidden="true" />
          {claimableCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
              {claimableCount}
            </span>
          )}
        </button>
      </div>

      {isClaireParent && (
        <button
          type="button"
          onClick={() => navigate('/latihan/wmi/claire')}
          className="mt-3 flex w-full items-center gap-3 rounded-[1.25rem] bg-qupu-brand-blue px-4 py-3 text-left text-white shadow-[0_4px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-white/15 text-lg">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm font-black">WMI Claire</span>
            <span className="text-[11px] font-bold text-white/75">Warmup final — 10 soal tersulit</span>
          </span>
          <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-white/70" aria-hidden="true" />
        </button>
      )}

      <div className="mt-4">
        {loading ? (
          // Skeleton mirrors the real trail: a banner bar + node circles on
          // the same zigzag lanes (pathLayout LANE) and 96px row rhythm.
          // bg-qupu-peach/40 (house skeleton tint) — the page itself is
          // qupu-cream, so a cream skeleton would be invisible.
          <div aria-hidden="true">
            <div className="h-[60px] animate-pulse rounded-[1.5rem] bg-qupu-peach/40" />
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
            onNode={(concept, chapter) =>
              // Tapping the open node toggles it shut; tapping another switches
              // the sheet to it (no need to close first).
              setSelected((prev) =>
                prev && prev.concept.slug === concept.slug ? null : { concept, chapter },
              )
            }
            onChapter={(chapter) => {
              setSelected(null)
              setBreakdownChapter(chapter)
            }}
            onBoss={(chapter) => navigate(`/latihan/wmi/tes/${chapter.subjectKey}`)}
          />
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada konsep untuk kelas ini.
          </p>
        )}
      </div>
      </div>{/* /relative z-10 content */}

      {/* Floating "Lanjut" — scrolls to + opens the current node's sheet. */}
      {current && !sheetOpen && (
        <button
          type="button"
          onClick={() => {
            scrollToCurrent(true)
            setSelected({ concept: current.concept, chapter: current.chapter })
          }}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-qupu-brand-orange py-3 pl-4 pr-5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 lg:right-[calc(50%-230px+1rem)]"
        >
          <i className="fa-solid fa-play" aria-hidden="true" />
          Lanjut
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

      {/* Curriculum breakdown — opened from a chapter banner. Picking a concept
          hands off to ConceptSheet (which focuses the node + shows progress). */}
      {breakdownChapter && (
        <ChapterSheet
          chapter={breakdownChapter}
          onPick={(concept) => {
            const chapter = breakdownChapter
            setBreakdownChapter(null)
            setSelected({ concept, chapter })
          }}
          onBoss={() => {
            navigate(`/latihan/wmi/tes/${breakdownChapter.subjectKey}`)
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

// Decorative warmth behind the trail — soft blurred colour glows + a few faint
// star sprinkles (brand flair, never a mascot or a flat SVG path). Covers the
// full scroll height; pointer-events-none and behind the z-10 content.
function BelajarBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -left-16 top-[4%] h-56 w-56 rounded-full bg-qupu-brand-yellow/20 blur-3xl" />
      <div className="absolute -right-20 top-[26%] h-64 w-64 rounded-full bg-qupu-brand-orange/15 blur-3xl" />
      <div className="absolute -left-20 top-[52%] h-60 w-60 rounded-full bg-qupu-brand-blue/10 blur-3xl" />
      <div className="absolute -right-16 top-[78%] h-56 w-56 rounded-full bg-qupu-brand-yellow/20 blur-3xl" />

      <i className="fa-solid fa-star absolute left-[8%] top-[12%] text-base text-qupu-brand-yellow/50" />
      <i className="fa-solid fa-star absolute right-[10%] top-[20%] text-xs text-qupu-brand-orange/35" />
      <i className="fa-solid fa-star absolute left-[14%] top-[40%] text-sm text-qupu-brand-yellow/40" />
      <i className="fa-solid fa-star absolute right-[12%] top-[55%] text-base text-qupu-brand-yellow/45" />
      <i className="fa-solid fa-star absolute left-[10%] top-[72%] text-xs text-qupu-brand-orange/35" />
      <i className="fa-solid fa-star absolute right-[14%] top-[86%] text-sm text-qupu-brand-yellow/40" />
    </div>
  )
}
