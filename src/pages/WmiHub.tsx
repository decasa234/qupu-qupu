import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import ChapterGarden from '../components/wmi/ChapterGarden'
import ConceptInfoModal from '../components/wmi/ConceptInfoModal'
import GardenCoachMark from '../components/onboarding/GardenCoachMark'
import DailyQuestsPanel from '../components/me/DailyQuestsPanel'
import StreakRecoveryModal, { useStreakRecoveryPrompt } from '../components/me/StreakRecoveryModal'
import { fetchGarden } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type { WmiGarden, WmiGardenChapter, WmiGardenConcept, WmiGrade } from '../types/wmi'

// One-time coach-mark on the resume hero ("first question is the tutorial").
// Shown until any interaction — bubble tap, X, or the hero button — marks it
// done. Storage failures (private mode) skip it rather than nag every visit.
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

// The single top recommendation: which chapter should the dominant
// "Lanjutkan" hero point at? Priority:
//   1. the last-started subject (per-child, persisted) — if it exists in the
//      current grade's garden, is unlocked and not fully grown;
//   2. the chapter containing the garden's nextConceptSlug;
//   3. the first unlocked chapter that isn't fully grown;
//   4. null — every unlocked chapter is fully grown (campur variant).
function pickResumeChapter(
  garden: WmiGarden,
  lastSubjectKey: string | null,
): WmiGardenChapter | null {
  const resumable = (ch: WmiGardenChapter | undefined) =>
    ch && ch.unlocked && ch.grownCount < ch.total ? ch : null

  const last = resumable(garden.chapters.find((ch) => ch.subjectKey === lastSubjectKey))
  if (last) return last

  if (garden.nextConceptSlug) {
    const next = resumable(
      garden.chapters.find((ch) => ch.concepts.some((c) => c.slug === garden.nextConceptSlug)),
    )
    if (next) return next
  }

  return garden.chapters.find((ch) => ch.unlocked && ch.grownCount < ch.total) ?? null
}

// Garden grades are 1-3 only (grade 0 exists just for the papers page).
function clampGardenGrade(grade: WmiGrade): WmiGrade {
  return grade < 1 ? 1 : grade > 3 ? 3 : grade
}

export default function WmiHub() {
  useDocumentTitle('Kebun Konsep')
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, gradeByChild, lastSubjectKey, loadGlossary } =
    useWmiStore()
  const navigate = useNavigate()
  const [garden, setGarden] = useState<WmiGarden | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [fetchTick, setFetchTick] = useState(0)
  const [infoConcept, setInfoConcept] = useState<WmiGardenConcept | null>(null)

  // Read the persisted per-child pin directly so a pinned child renders the
  // right grade on cold load even before AppShell's syncChildGrade effect
  // runs (no wrong-grade first fetch). Chip taps still go through
  // setSelectedGrade, which also updates the pin.
  const pinnedGrade = activeChildId ? gradeByChild[activeChildId] : undefined
  const effectiveGrade = clampGardenGrade(pinnedGrade ?? selectedGrade)

  const [showCoachMark, setShowCoachMark] = useState(() => !isCoachMarkDone())
  const dismissCoachMark = () => {
    markCoachMarkDone()
    setShowCoachMark(false)
  }

  // Streak-recovery prompt (modal shows at most once per eligibility window;
  // a summary fetch failure simply means no prompt — the garden is unaffected).
  const { prompt: recoveryPrompt, dismiss: dismissRecovery } =
    useStreakRecoveryPrompt(activeChildId)

  useEffect(() => { loadGlossary().catch(() => {}) }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId) { setGarden(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchGarden(activeChildId, effectiveGrade)
      .then((d) => !cancelled && setGarden(d))
      .catch(() => {
        if (cancelled) return
        setGarden(null)
        setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, effectiveGrade, fetchTick])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[460px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const grownTotal = garden?.chapters.reduce((s, c) => s + c.grownCount, 0) ?? 0
  const conceptTotal = garden?.chapters.reduce((s, c) => s + c.total, 0) ?? 0

  // A garden with any grown concept means this isn't a first-timer — never
  // show the coach-mark there, even if the localStorage flag was never set
  // (e.g. veteran on a fresh device).
  const coachMarkVisible = showCoachMark && grownTotal === 0

  const hasUnlocked = !!garden && garden.chapters.some((ch) => ch.unlocked)
  const resumeChapter = garden ? pickResumeChapter(garden, lastSubjectKey) : null

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-5 text-white shadow-[0_6px_0_0_#C46123]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/35" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Kursus</p>
            <h1 className="font-display text-2xl font-black leading-none">Latihan WMI</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">Tumbuhkan kebunmu, kuasai tiap konsep.</p>
          </div>
        </div>
      </section>

      <div className="mt-4 rounded-[1.5rem] bg-[#FFF8F0] p-3 ring-2 ring-[#FFE3CC]">
        <p className="px-1 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">Pilih kelas</p>
        <WmiGradeChips selected={effectiveGrade} onSelect={(g: WmiGrade) => setSelectedGrade(g)} />
        <p className="mt-2 px-1 text-xs font-semibold text-qupu-muted">
          Kelas 3&ndash;6 mulai dari Tingkat 3.
        </p>
      </div>

      {/* Resume hero — the single dominant "1 tap to a session" recommendation.
          ChapterGarden keeps its contextual per-chapter buttons; this is the
          top-of-page pick (last subject → nextConceptSlug → first unlocked). */}
      {!loading && hasUnlocked && (
        resumeChapter ? (
          <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-orange">
              Lanjutkan belajar
            </p>
            <h2 className="mt-1 font-display text-xl font-black leading-tight text-qupu-brand-blue">
              {resumeChapter.nameId}
            </h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
              <div
                className="h-full rounded-full bg-[#58A700]"
                style={{ width: `${resumeChapter.meanPct}%` }}
              />
            </div>
            {coachMarkVisible && <GardenCoachMark onDismiss={dismissCoachMark} />}
            <button
              type="button"
              onClick={() => {
                if (showCoachMark) dismissCoachMark()
                navigate(`/latihan/wmi/sesi/${resumeChapter.subjectKey}`)
              }}
              className={`${coachMarkVisible ? 'mt-3 animate-tapPop' : 'mt-4'} flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
                <i className="fa-solid fa-play" aria-hidden="true" />
              </span>
              {resumeChapter.grownCount === 0 ? 'Mulai' : 'Lanjutkan'}
            </button>
          </section>
        ) : (
          <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-orange">
              Kebun penuh
            </p>
            <h2 className="mt-1 font-display text-xl font-black leading-tight text-qupu-brand-blue">
              Semua tumbuh! Latihan campur?
            </h2>
            <Link
              to="/latihan/wmi/konsep"
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
                <i className="fa-solid fa-shuffle" aria-hidden="true" />
              </span>
              Latihan Campur
            </Link>
          </section>
        )
      )}

      {/* "Misi Hari Ini" — daily quest goals. Fetches independently and
          renders nothing on failure, so the garden never looks broken
          because quests failed. */}
      <DailyQuestsPanel childId={activeChildId} variant="garden" />

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-black text-qupu-brand-blue">Kebun Konsep</h2>
          {garden && (
            <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue">
              {grownTotal}/{conceptTotal} tumbuh
            </span>
          )}
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />)}
            </div>
          ) : loadError ? (
            <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
              <p className="text-sm font-bold text-qupu-brand-blue">
                Gagal memuat kebun. Periksa koneksimu.
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
            garden.chapters.map((ch, i) => (
              <ChapterGarden
                key={ch.subjectKey}
                chapter={ch}
                index={i}
                onConceptInfo={(c) => setInfoConcept(c)}
                onStartSession={(subjectKey) => {
                  // Any session start counts as having seen the tutorial.
                  if (showCoachMark) dismissCoachMark()
                  navigate(`/latihan/wmi/sesi/${subjectKey}`)
                }}
                onStartTest={(subjectKey) => navigate(`/latihan/wmi/tes/${subjectKey}`)}
              />
            ))
          ) : (
            <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum ada konsep untuk kelas ini.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/latihan/wmi/konsep" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-shuffle text-xl text-qupu-orange" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Latihan Campur</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Soal acak semua konsep</span>
        </Link>
        <Link to="/latihan/wmi/ujian" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-file-pen text-xl text-qupu-brand-blue" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Soal Ujian</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Paper WMI asli per kelas</span>
        </Link>
      </div>

      {infoConcept && (
        <ConceptInfoModal
          childId={activeChildId}
          grade={effectiveGrade}
          concept={infoConcept}
          onClose={() => setInfoConcept(null)}
        />
      )}

      {/* Never stack on top of the concept-info modal. Safe to gate the
          render: useStreakRecoveryPrompt keeps `prompt` set until an explicit
          dismiss/close, so it re-shows once infoConcept closes. */}
      {recoveryPrompt && !infoConcept && (
        <StreakRecoveryModal
          childId={activeChildId}
          previousStreak={recoveryPrompt.previousStreak}
          onClose={dismissRecovery}
        />
      )}
    </div>
  )
}
