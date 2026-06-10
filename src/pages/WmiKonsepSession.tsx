import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import KonsepCeremony from '../components/wmi/KonsepCeremony'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import KonsepSessionShowcase from '../components/wmi/KonsepSessionShowcase'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteButtons from '../components/wmi/WmiVoteButtons'
import { getIllustration } from '../components/wmi/concepts/registry'
import { trackEvent } from '../lib/analytics'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { commitKonsepSession, fetchConceptNext, fetchGarden, gradeConceptAnswer, submitConceptVote } from '../lib/wmiApi'
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

const SESSION_SIZE = 20

function buildPlan(concepts: WmiGardenConcept[]): WmiGardenConcept[] {
  const plan: WmiGardenConcept[] = []
  let prev: string | null = null
  for (let i = 0; i < SESSION_SIZE; i++) {
    const pool = concepts.length > 1 ? concepts.filter((c) => c.slug !== prev) : concepts
    const weights = pool.map((c) => Math.max(1, 100 - c.pct))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let pick = pool[0]
    for (let j = 0; j < pool.length; j++) {
      r -= weights[j]
      if (r <= 0) {
        pick = pool[j]
        break
      }
    }
    plan.push(pick)
    prev = pick.slug
  }
  return plan
}

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
  }
}

export default function WmiKonsepSession() {
  useDocumentTitle('Latihan')
  const { subjectKey } = useParams<{ subjectKey: string }>()
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
      navigate('/latihan/wmi', { replace: true })
    }
  }, [activeChildId, navigate])

  // ── Step 1: load garden → build plan ──────────────────────────────────────
  useEffect(() => {
    if (!activeChildId || !subjectKey) return
    let cancelled = false
    setLoadingGarden(true)
    setGardenError(null)

    fetchGarden(activeChildId, grade)
      .then((garden) => {
        if (cancelled) return
        const chapter = garden.chapters.find((ch) => ch.subjectKey === subjectKey)
        if (!chapter || chapter.concepts.length === 0) {
          setGardenError('Belum ada konsep untuk bab ini.')
          return
        }

        // Interrupted session for this subsection + child? Offer to resume first.
        const saved = readKonsepSession(subjectKey, activeChildId)
        if (saved) {
          const bySlug = new Map(chapter.concepts.map((c) => [c.slug, c]))
          const rebuilt: WmiGardenConcept[] = []
          for (const slug of saved.planSlugs) {
            const concept = bySlug.get(slug)
            if (concept) rebuilt.push(concept)
          }
          // Legit snapshots: mid-session (answers === idx, next question is
          // plan[idx]) or fully answered awaiting commit (20 answers, idx 19).
          const consistent =
            saved.answers.length === saved.idx ||
            (saved.answers.length === SESSION_SIZE && saved.idx === SESSION_SIZE - 1)
          const valid =
            saved.planSlugs.length === SESSION_SIZE &&
            rebuilt.length === SESSION_SIZE &&
            saved.idx >= 0 &&
            saved.idx < SESSION_SIZE &&
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
        setPlan(buildPlan(chapter.concepts))
        // Session actually starts now — remember it per child for resume.
        setLastSubjectKey(subjectKey)
        trackEvent('session_start', { subjectKey })
      })
      .catch((err) => {
        if (!cancelled) setGardenError(toIndonesianErrorMessage(err, 'Gagal memuat data konsep.'))
      })
      .finally(() => { if (!cancelled) setLoadingGarden(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId, subjectKey])

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
    if (answers.length >= SESSION_SIZE) return

    const newAnswers = [...answers, { concept_instance_id: question.concept_instance_id, selected_answer: selected ?? '' }]
    const nextIdx = idx < SESSION_SIZE - 1 ? idx + 1 : idx

    // Snapshot progress so a refresh/crash can offer resume (best-effort).
    saveKonsepSession({
      childId: activeChildId,
      subjectKey,
      sessionId: sessionIdRef.current,
      planSlugs: plan.map((c) => c.slug),
      answers: newAnswers,
      idx: nextIdx,
      startedAt: startedAtRef.current,
    })

    if (idx < SESSION_SIZE - 1) {
      setAnswers(newAnswers)
      setIdx((i) => i + 1)
      // question fetch triggered by idx effect
    } else {
      // 20th question answered — bank the final array ONCE, then commit
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
    setPlan(buildPlan(resumeOffer.concepts))
    setResumeOffer(null)
    trackEvent('session_start', { subjectKey })
  }

  // ── Vote ───────────────────────────────────────────────────────────────────
  const onVote = async (vote: 1 | -1) => {
    if (activeChildId && question) await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  // ── Quit ───────────────────────────────────────────────────────────────────
  const handleQuit = () => {
    if (window.confirm('Keluar sesi? Progres sesi ini akan hilang.')) {
      if (subjectKey && activeChildId) clearKonsepSession(subjectKey, activeChildId)
      navigate('/latihan/wmi')
    }
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
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
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
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-cloud-arrow-up text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">
          Sesi ini sudah tersimpan dari perangkat lain.
        </p>
        <Link
          to="/latihan/wmi"
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
    return <KonsepCeremony result={result} onDone={() => navigate('/latihan/wmi')} />
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadingGarden) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-qupu-peach border-t-qupu-brand-orange" />
        <p className="mt-3 text-sm font-semibold text-qupu-muted">Memuat sesi…</p>
      </div>
    )
  }

  if (gardenError) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">{gardenError}</p>
        <Link to="/latihan/wmi" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali ke Kebun
        </Link>
      </div>
    )
  }

  // ── Resume offer (interrupted session found) ───────────────────────────────
  if (resumeOffer) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6">
        <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-clock-rotate-left text-2xl" aria-hidden="true" />
          </div>
          <h1 className="mt-3 font-display text-xl font-black text-qupu-brand-blue">
            Lanjutkan sesi yang terputus?
          </h1>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            {resumeOffer.saved.answers.length} dari {SESSION_SIZE} terjawab
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
    <div className="relative mx-auto w-full max-w-[460px] pb-8">
      {/* Confetti on correct answer — re-mount per question via key */}
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${idx}`} />}

      {/* Top row: quit button + single progress indicator */}
      <div className="mb-3 px-1">
        <div className="mb-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleQuit}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
            Keluar
          </button>
          <span className="font-display text-xs font-black text-qupu-brand-blue">
            Soal {idx + 1} / {SESSION_SIZE}
          </span>
        </div>
        {/* Slim progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + 1) / SESSION_SIZE) * 100}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
      </div>

      {/* Showcase band: concept info */}
      <KonsepSessionShowcase
        concept={{ nameId: currentPlanItem.nameId, tier: currentPlanItem.tier, tags: currentPlanItem.tags }}
      />

      {/* Question card area */}
      <div className="mt-4">
        {questionError ? (
          /* Inline retry — the session (progress bar + showcase) stays alive */
          <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-wifi text-xl" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-qupu-muted">Gagal memuat soal. Periksa koneksimu.</p>
            <button
              type="button"
              onClick={() => void fetchQuestion(currentPlanItem)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        ) : answers.length >= SESSION_SIZE && !feedback ? (
          /* Restored fully-answered session — nothing left but the commit */
          <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-flag-checkered text-xl" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-qupu-muted">
              Semua {SESSION_SIZE} soal sudah terjawab. Simpan hasil sesimu!
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
              label={question.concept_name_id}
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

            {/* Feedback panel (shown after answer) */}
            {feedback && (
              <div
                className={`rounded-[1.5rem] border-2 p-4 shadow-[0_5px_0_0_#FFD3B1] ${
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

                {/* Vote buttons */}
                <WmiVoteButtons onVote={onVote} />

                {/* Lanjut / commit area */}
                {answers.length >= SESSION_SIZE ? (
                  // Final answer already banked — show commit/loading/retry state only
                  <div className="mt-4 space-y-2">
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
                    className="mt-4 w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
                  >
                    Lanjut
                  </button>
                )}
              </div>
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
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-3 h-6 w-4/5 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
          ))}
        </div>
      </div>
    </div>
  )
}
