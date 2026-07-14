import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import KonsepCeremony from '../components/wmi/KonsepCeremony'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteToggle from '../components/wmi/WmiVoteToggle'
import WmiExplainer from '../components/wmi/WmiExplainer'
import ConfirmModal from '../components/ConfirmModal'
import { getIllustration } from '../components/wmi/concepts/registry'
import { trackEvent } from '../lib/analytics'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { commitKonsepSession, fetchConceptNext, fetchGarden, gradeConceptAnswer, submitConceptVote } from '../lib/wmiApi'
import { buildPlan, FOCUS_SESSION_SIZE } from '../lib/konsepPlan'
import {
  clearKonsepSession,
  generateKonsepSessionId,
  readKonsepSession,
  saveKonsepSession,
  type SavedKonsepSession,
} from '../lib/konsepSessionStorage'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import { syncStatStrip } from '../hooks/useGamificationStats'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type {
  WmiConceptQuestion,
  WmiGardenConcept,
  WmiGrade,
  WmiKonsepGradeResult,
  WmiKonsepSessionResult,
  WmiQuestion,
} from '../types/wmi'

interface ResumeOffer {
  saved: SavedKonsepSession
  plan: WmiGardenConcept[]
  /** Chapter concepts, kept so "Mulai baru" can build a fresh plan without refetching. */
  concepts: WmiGardenConcept[]
}

function adaptConceptQuestion(question: WmiConceptQuestion): WmiQuestion {
  return {
    id: question.concept_instance_id,
    paper_id: '',
    number: 0,
    body_en: question.body_en,
    body_id: question.body_id,
    answer_type: question.answer_type,
    choices_en: question.choices_en,
    choices_id: question.choices_id,
    figure_url: null,
    hint_en: question.hint_en,
    hint_id: question.hint_id,
    difficulty: null,
    breakdown: question.breakdown ?? null,
  }
}

export default function WmiKonsepSession() {
  useDocumentTitle('Latihan')
  const { subjectKey } = useParams<{ subjectKey: string }>()
  // `?fokus=<conceptSlug>` (from a Belajar skill-tree node): shorter session
  // concentrated on that concept (~80%) with the rest as chapter review.
  const [searchParams] = useSearchParams()
  const focusSlug = searchParams.get('fokus') ?? undefined
  const { activeChildId } = useAuthStore()
  const setLastSubjectKey = useWmiStore((state) => state.setLastSubjectKey)
  const preferredLang = useWmiStore((state) => state.preferredLang)
  const setPreferredLang = useWmiStore((state) => state.setPreferredLang)
  const navigate = useNavigate()

  // Derive grade from subjectKey prefix (g1-…, g2-…, g3-…)
  const grade = (subjectKey ? Number(subjectKey[1]) : 0) as WmiGrade

  // Garden loading
  const [loadingGarden, setLoadingGarden] = useState(true)
  const [plan, setPlan] = useState<WmiGardenConcept[] | null>(null)
  const [gardenError, setGardenError] = useState<string | null>(null)

  // Interrupted-session resume offer (set before plan when a fresh record exists)
  const [resumeOffer, setResumeOffer] = useState<ResumeOffer | null>(null)

  // Per-question state
  const [idx, setIdx] = useState(0)
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [loadingQ, setLoadingQ] = useState(false)
  const [questionError, setQuestionError] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiKonsepGradeResult | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [gradeError, setGradeError] = useState(false)
  const [answers, setAnswers] = useState<{ concept_instance_id: string; selected_answer: string }[]>([])

  // Session commit state
  const [committing, setCommitting] = useState(false)
  const [commitError, setCommitError] = useState(false)
  // 409: the session id was already committed by a DIFFERENT child/subject
  // (e.g. another device) — terminal, no retry loop.
  const [commitConflict, setCommitConflict] = useState(false)
  const [result, setResult] = useState<WmiKonsepSessionResult | null>(null)

  // Prevent double-submit
  const submittingRef = useRef(false)

  // When this session started — written into every persisted snapshot
  const startedAtRef = useRef(Date.now())

  // Commit idempotency key, generated when the session STARTS and persisted
  // in the snapshot: a retried or resumed commit sends the SAME id, so the
  // server returns the stored result instead of re-banking 20 attempts.
  const sessionIdRef = useRef(generateKonsepSessionId())

  // The child this in-memory session belongs to, captured when the session
  // starts. If the parent switches profiles mid-session, child A's answers
  // must never commit as child B: bail back to the garden (the unmount drops
  // all in-memory state; A's snapshot stays resumable under A's storage key).
  const sessionChildIdRef = useRef(activeChildId)
  useEffect(() => {
    if (sessionChildIdRef.current === null) {
      // No child was active when we mounted — adopt the first one selected.
      sessionChildIdRef.current = activeChildId
      return
    }
    if (activeChildId !== sessionChildIdRef.current) {
      navigate('/belajar', { replace: true })
    }
  }, [activeChildId, navigate])

  // ── Step 1: load garden → build plan ──────────────────────────────────────
  useEffect(() => {
    if (!activeChildId || !subjectKey) return
    let cancelled = false
    setLoadingGarden(true)
    setGardenError(null)
    // The effect re-runs when ?fokus (or the subject) changes while this page
    // stays mounted — drop any prior session state before building a new plan.
    setPlan(null)
    setResumeOffer(null)
    setIdx(0)
    setAnswers([])

    fetchGarden(activeChildId, grade)
      .then((garden) => {
        if (cancelled) return
        const chapter = garden.chapters.find((ch) => ch.subjectKey === subjectKey)
        if (!chapter || chapter.concepts.length === 0) {
          setGardenError('Belum ada konsep untuk bab ini.')
          return
        }

        // Interrupted session for this subsection + child? Offer to resume
        // first — but ONLY if it targets the same ?fokus node (null = full
        // chapter session). Tapping node B must never resume node A's
        // half-done focus session: on a mismatch we skip the offer and build
        // a fresh plan; the old snapshot is overwritten on the first save.
        const saved = readKonsepSession(subjectKey, activeChildId)
        if (saved && saved.focusSlug === (focusSlug ?? null)) {
          const bySlug = new Map(chapter.concepts.map((c) => [c.slug, c]))
          const rebuilt: WmiGardenConcept[] = []
          for (const slug of saved.planSlugs) {
            const concept = bySlug.get(slug)
            if (concept) rebuilt.push(concept)
          }
          // Legit snapshots: mid-session (answers === idx, next question is
          // plan[idx]) or fully answered awaiting commit (total answers,
          // idx total-1). The plan length IS the session size — snapshots of
          // focus sessions (10) and full sessions (20) both resume.
          const total = saved.planSlugs.length
          const consistent =
            saved.answers.length === saved.idx ||
            (saved.answers.length === total && saved.idx === total - 1)
          const valid =
            total > 0 &&
            rebuilt.length === total &&
            saved.idx >= 0 &&
            saved.idx < total &&
            saved.answers.length > 0 &&
            consistent
          if (valid) {
            setResumeOffer({ saved, plan: rebuilt, concepts: chapter.concepts })
            setLastSubjectKey(subjectKey)
            trackEvent('session_resume_offered', { subjectKey, answered: saved.answers.length })
            return
          }
          // Concept content changed or record is unusable — start fresh.
          clearKonsepSession(subjectKey, activeChildId)
        }

        // Build the plan ONCE here; never rebuild
        startedAtRef.current = Date.now()
        sessionIdRef.current = generateKonsepSessionId()
        setPlan(buildPlan(chapter.concepts, focusSlug ? { focusSlug, size: FOCUS_SESSION_SIZE } : undefined))
        // Session actually starts now — remember it per child for resume.
        setLastSubjectKey(subjectKey)
        trackEvent('session_start', { subjectKey, ...(focusSlug ? { focusSlug } : {}) })
      })
      .catch((err) => {
        if (!cancelled) setGardenError(toIndonesianErrorMessage(err, 'Gagal memuat data konsep.'))
      })
      .finally(() => { if (!cancelled) setLoadingGarden(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId, subjectKey, focusSlug])

  // ── Step 2: load question for plan[idx] whenever plan/idx changes ─────────
  const fetchQuestion = useCallback(async (planItem: WmiGardenConcept) => {
    if (!activeChildId) return
    setLoadingQ(true)
    setQuestion(null)
    setSelected(null)
    setFeedback(null)
    setQuestionError(false)
    setGradeError(false)
    try {
      const q = await fetchConceptNext(activeChildId, grade, planItem.slug)
      setQuestion(q)
    } catch {
      // Inline retry inside the live session — never the fatal screen.
      setQuestionError(true)
    } finally {
      setLoadingQ(false)
    }
  }, [activeChildId, grade])

  useEffect(() => {
    if (!plan) return
    // All answers already banked (restored fully-answered session) — the
    // commit panel owns the UI; there is no next question to fetch.
    if (answers.length > idx) return
    fetchQuestion(plan[idx])
  }, [plan, idx, answers.length, fetchQuestion])

  // ── Answer submission ──────────────────────────────────────────────────────
  const handleAnswer = async (answer: string) => {
    if (!question || feedback || submittingRef.current) return
    submittingRef.current = true
    setSubmittingAnswer(true)
    setSelected(answer)
    setGradeError(false)
    try {
      const fb = await gradeConceptAnswer(activeChildId!, question.concept_instance_id, answer)
      setFeedback(fb)
    } catch {
      // Keep the selection and surface the failure — the kid re-submits.
      setGradeError(true)
    } finally {
      submittingRef.current = false
      setSubmittingAnswer(false)
    }
  }

  // ── Session commit (dedicated, retryable) ─────────────────────────────────
  const commitSession = useCallback(async (finalAnswers: { concept_instance_id: string; selected_answer: string }[]) => {
    if (!activeChildId || !subjectKey || committing) return
    // Airtight cross-child guard: the child-switch effect navigates away on a
    // mismatch, but never let a race commit child A's answers under child B.
    if (activeChildId !== sessionChildIdRef.current) return
    setCommitError(false)
    setCommitting(true)
    try {
      const sessionResult = await commitKonsepSession(
        activeChildId,
        subjectKey,
        sessionIdRef.current,
        finalAnswers,
      )
      clearKonsepSession(subjectKey, activeChildId)
      // The commit response carries fresh streak/coins/level — push them into
      // the top stat strip immediately, stamped for the committing child.
      // Skipped on a REPLAY (idempotency hit): the stored numbers are from
      // the original commit and may be staler than what the strip shows now.
      if (!sessionResult.replayed) {
        syncStatStrip(activeChildId, {
          streak: sessionResult.streak.current,
          coinBalance: sessionResult.coinBalance,
          level: sessionResult.level,
          tierName: sessionResult.tierName,
          ...(typeof sessionResult.streakShields === 'number'
            ? { streakShields: sessionResult.streakShields }
            : {}),
        })
      }
      setResult(sessionResult)
      if (!sessionResult.replayed) {
        trackEvent('session_commit', {
          subjectKey,
          correct: sessionResult.correct,
          total: sessionResult.total,
        })
      }
    } catch (err) {
      // 409 = this session id belongs to another child/subject (committed
      // from a different device/profile). Retrying can never succeed —
      // drop the snapshot and show the terminal screen.
      if (isAxiosError(err) && err.response?.status === 409) {
        clearKonsepSession(subjectKey, activeChildId)
        setCommitConflict(true)
        trackEvent('session_commit_conflict', { subjectKey })
        return
      }
      setCommitError(true)
      trackEvent('session_commit_failed', { subjectKey })
    } finally {
      setCommitting(false)
    }
  }, [activeChildId, subjectKey, committing])

  // ── "Lanjut" button ────────────────────────────────────────────────────────
  const handleLanjut = () => {
    if (!question || !feedback || !plan || !subjectKey || !activeChildId) return
    // Guard: if answers are already fully banked, the commit path owns this UI — never append again
    if (answers.length >= plan.length) return

    const newAnswers = [...answers, { concept_instance_id: question.concept_instance_id, selected_answer: selected ?? '' }]
    const nextIdx = idx < plan.length - 1 ? idx + 1 : idx

    // Snapshot progress so a refresh/crash can offer resume (best-effort).
    saveKonsepSession({
      childId: activeChildId,
      subjectKey,
      sessionId: sessionIdRef.current,
      focusSlug: focusSlug ?? null,
      planSlugs: plan.map((c) => c.slug),
      answers: newAnswers,
      idx: nextIdx,
      startedAt: startedAtRef.current,
    })

    if (idx < plan.length - 1) {
      setAnswers(newAnswers)
      setIdx((i) => i + 1)
      // question fetch triggered by idx effect
    } else {
      // Last question answered — bank the final array ONCE, then commit
      setAnswers(newAnswers)
      void commitSession(newAnswers)
    }
  }

  // ── Resume offer handlers ──────────────────────────────────────────────────
  const handleResume = () => {
    if (!resumeOffer) return
    startedAtRef.current = resumeOffer.saved.startedAt
    // Same id as the interrupted run — a fully-answered snapshot whose
    // commit already landed server-side replays the stored result.
    sessionIdRef.current = resumeOffer.saved.sessionId
    setAnswers(resumeOffer.saved.answers)
    setIdx(resumeOffer.saved.idx)
    setPlan(resumeOffer.plan)
    setResumeOffer(null)
    trackEvent('session_resumed', { subjectKey, answered: resumeOffer.saved.answers.length })
    // Question fetch for plan[idx] fires via the idx effect (skipped when all
    // answers are already banked — the commit panel takes over instead).
  }

  const handleStartFresh = () => {
    if (!resumeOffer || !subjectKey || !activeChildId) return
    clearKonsepSession(subjectKey, activeChildId)
    startedAtRef.current = Date.now()
    sessionIdRef.current = generateKonsepSessionId()
    setPlan(buildPlan(resumeOffer.concepts, focusSlug ? { focusSlug, size: FOCUS_SESSION_SIZE } : undefined))
    setResumeOffer(null)
    trackEvent('session_start', { subjectKey, ...(focusSlug ? { focusSlug } : {}) })
  }

  // ── Vote ───────────────────────────────────────────────────────────────────
  const onVote = async (vote: 1 | -1) => {
    if (activeChildId && question) await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  // ── Quit ───────────────────────────────────────────────────────────────────
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const handleQuit = () => setShowQuitConfirm(true)
  const confirmQuit = () => {
    setShowQuitConfirm(false)
    if (subjectKey && activeChildId) clearKonsepSession(subjectKey, activeChildId)
    navigate('/belajar')
  }

  // ── Unload guard while progress is at stake ────────────────────────────────
  const sessionActive = answers.length > 0 && !result
  useEffect(() => {
    if (!sessionActive) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Chrome requires returnValue to be set for the confirmation dialog.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [sessionActive])

  // ── No active child ────────────────────────────────────────────────────────
  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-child-reaching text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">Pilih profil anak dulu untuk mulai latihan.</p>
      </div>
    )
  }

  // ── Commit conflict (409): session already saved elsewhere — terminal ──────
  if (commitConflict) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-cloud-arrow-up text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">
          Sesi ini sudah tersimpan dari perangkat lain.
        </p>
        <Link
          to="/belajar"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-seedling text-sm" aria-hidden="true" />
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  // ── Result screen: staged reward ceremony ──────────────────────────────────
  if (result) {
    return <KonsepCeremony result={result} onDone={() => navigate('/belajar')} />
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadingGarden) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="mt-6 h-64 rounded-[1.5rem]" />
      </div>
    )
  }

  if (gardenError) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">{gardenError}</p>
        <Link to="/belajar" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  // ── Resume offer (interrupted session found) ───────────────────────────────
  if (resumeOffer) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6">
        <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-clock-rotate-left text-2xl" aria-hidden="true" />
          </div>
          <h1 className="mt-3 font-display text-xl font-black text-qupu-brand-blue">
            Lanjutkan sesi yang terputus?
          </h1>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            {resumeOffer.saved.answers.length} dari {resumeOffer.plan.length} terjawab
          </p>
          <button
            type="button"
            onClick={handleResume}
            className="mt-4 w-full rounded-full bg-qupu-brand-orange py-3 font-display font-black text-white shadow-[0_3px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-play me-2 text-sm" aria-hidden="true" />
            Lanjutkan
          </button>
          <button
            type="button"
            onClick={handleStartFresh}
            className="mt-2 w-full rounded-full bg-white py-3 font-display font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Mulai baru
          </button>
        </div>
      </div>
    )
  }

  if (!plan) return null

  const currentPlanItem = plan[idx]

  // ── Main session UI ────────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto w-full max-w-[28.75rem] pb-8">
      {/* Confetti on correct answer — re-mount per question via key */}
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${idx}`} />}

      <ConfirmModal
        open={showQuitConfirm}
        icon="fa-solid fa-triangle-exclamation"
        title="Keluar sesi?"
        message="Progresmu di sesi ini akan hilang kalau keluar sekarang."
        cancelLabel="Lanjut Belajar"
        confirmLabel="Keluar Sesi"
        onClose={() => setShowQuitConfirm(false)}
        onConfirm={confirmQuit}
      />

      {/* Top row: close button + single compact progress element */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton variant="close" onClick={handleQuit} />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + 1) / plan.length) * 100}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
        <span className="font-display text-xs font-black text-qupu-brand-blue">
          {idx + 1} / {plan.length}
        </span>
      </div>

      {/* Question card area */}
      <div className="mt-4">
        {questionError ? (
          /* Inline retry — the session (progress bar + showcase) stays alive */
          <ErrorRetry message="Gagal memuat soal. Periksa koneksimu." onRetry={() => void fetchQuestion(currentPlanItem)} />
        ) : answers.length >= plan.length && !feedback ? (
          /* Restored fully-answered session — nothing left but the commit */
          <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-flag-checkered text-xl" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-qupu-muted">
              Semua {plan.length} soal sudah terjawab. Simpan hasil sesimu!
            </p>
            {commitError && (
              <p className="mt-2 text-xs font-semibold text-rose-600">
                <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                Gagal menyimpan sesi. Coba lagi.
              </p>
            )}
            <button
              type="button"
              onClick={() => void commitSession(answers)}
              disabled={committing}
              className="mt-4 w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] disabled:opacity-50 transition-transform active:translate-y-0.5"
            >
              {committing ? 'Menyimpan…' : commitError ? 'Coba lagi' : 'Selesaikan Sesi'}
            </button>
          </div>
        ) : loadingQ || !question ? (
          <QuestionSkeleton />
        ) : (
          <div className="space-y-4">
            <WmiQuestionView
              question={adaptConceptQuestion(question)}
              hideConceptTitle
              conceptIllustration={getIllustration(question.concept_slug)}
              conceptIllustrationParams={question.params}
              selectedChoice={selected}
              highlight={
                feedback
                  ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
                  : undefined
              }
              disabled={Boolean(feedback) || submittingAnswer}
              initialLang={preferredLang}
              onPickChoice={handleAnswer}
              onSubmitFillIn={handleAnswer}
              onLookupTerm={() => {}}
              onRevealTranslation={() => {}}
              onUserToggleLanguage={setPreferredLang}
            />

            {/* Grading failed — keep the question interactive and say so */}
            {gradeError && !feedback && (
              <div className="rounded-[1.25rem] border-2 border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-sm font-bold text-rose-600">
                  <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                  Jawaban belum terkirim. Coba lagi.
                </p>
                {selected && (
                  <button
                    type="button"
                    onClick={() => void handleAnswer(selected)}
                    disabled={submittingAnswer}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#C46123] disabled:opacity-50 transition-transform active:translate-y-0.5"
                  >
                    <i className="fa-solid fa-rotate-right text-xs" aria-hidden="true" />
                    Kirim lagi
                  </button>
                )}
              </div>
            )}

            {/* Feedback (after answer): verdict card → animated walkthrough → action */}
            {feedback && (
              <>
                <div
                  className={`relative rounded-[1.5rem] border-2 p-4 shadow-[0_5px_0_0_#FFD3B1] ${
                    feedback.is_correct
                      ? 'border-[#58A700]/40 bg-[#E8F5D6]'
                      : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  {/* Correct / wrong badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${
                        feedback.is_correct ? 'bg-[#58A700]' : 'bg-rose-400'
                      }`}
                    >
                      <i
                        className={`fa-solid ${feedback.is_correct ? 'fa-check' : 'fa-xmark'} text-sm`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className={`font-display font-black ${feedback.is_correct ? 'text-[#2D6B00]' : 'text-rose-600'}`}>
                      {feedback.is_correct ? 'Benar!' : 'Belum tepat'}
                    </span>
                  </div>

                  {/* Correct answer (shown on wrong) */}
                  {!feedback.is_correct && (
                    <p className="mt-2 text-sm font-semibold text-rose-700">
                      Jawaban benar: <span className="font-black">{feedback.correct_answer}</span>
                    </p>
                  )}

                  {/* Hint */}
                  {(feedback.hint_id ?? feedback.hint_en) && (
                    <p className="mt-2 text-xs font-semibold text-qupu-muted">
                      {feedback.hint_id ?? feedback.hint_en}
                    </p>
                  )}

                  {/* Vote controls — collapsed behind a flag icon in the corner */}
                  <WmiVoteToggle onVote={onVote} />
                </div>

                {/* Animated step-by-step walkthrough — self-hides when the
                    concept has no explainer registered. */}
                <WmiExplainer
                  slug={question.concept_slug}
                  params={question.params}
                  correctAnswer={feedback.correct_answer}
                  lang={preferredLang}
                />

                {/* Lanjut / commit area */}
                {answers.length >= plan.length ? (
                  // Final answer already banked — show commit/loading/retry state only
                  <div className="space-y-2">
                    {commitError && (
                      <p className="text-center text-xs font-semibold text-rose-600">
                        <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                        Gagal menyimpan sesi. Coba lagi.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => void commitSession(answers)}
                      disabled={committing}
                      className="w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] disabled:opacity-50 transition-transform active:translate-y-0.5"
                    >
                      {committing
                        ? 'Menyimpan…'
                        : commitError
                        ? 'Coba lagi'
                        : 'Selesaikan Sesi'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLanjut}
                    className="w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
                  >
                    Lanjut
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-3 h-6 w-4/5" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    </div>
  )
}
