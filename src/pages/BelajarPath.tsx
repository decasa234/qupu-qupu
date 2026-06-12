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
  const sheetOpen = !!selected || questsOpen

  const startSession = (subjectKey: string, focusSlug?: string) => {
    if (showCoachMark) dismissCoachMark()
    const focus = focusSlug ? `?fokus=${encodeURIComponent(focusSlug)}` : ''
    navigate(`/latihan/wmi/sesi/${subjectKey}${focus}`)
  }

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
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

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />
            ))}
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
            onNode={(concept, chapter) => setSelected({ concept, chapter })}
            onBoss={(chapter) => navigate(`/latihan/wmi/tes/${chapter.subjectKey}`)}
          />
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada konsep untuk kelas ini.
          </p>
        )}
      </div>

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
