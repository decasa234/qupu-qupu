import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import ErrorRetry from '../components/ErrorRetry'
import Skeleton from '../components/Skeleton'
import WmiDots, { type WmiDot } from '../components/wmi/WmiDots'
import WmiExamTimer from '../components/wmi/WmiExamTimer'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { completeExamSession, fetchExamSession, submitAttempt } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiAttemptResult, WmiExamSnapshot, WmiSubmittedAttempt } from '../types/wmi'

export default function WmiExam() {
  useDocumentTitle('Ujian')
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { loadGlossary, preferredLang, setPreferredLang } = useWmiStore()
  const [snapshot, setSnapshot] = useState<WmiExamSnapshot | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lookedUpTerms, setLookedUpTerms] = useState<string[]>([])
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  // Instant per-question scoring: the submit result (with correct_answer) is
  // kept per question so the picked choice colors green/red immediately.
  // Resumed sessions lack this for earlier answers (the snapshot only carries
  // is_correct) — those still show the verdict, just without the green key.
  const [feedback, setFeedback] = useState<Record<string, WmiAttemptResult>>({})
  const [breakdown, setBreakdown] = useState(false)
  // Two distinct error channels: loadError is FATAL (the exam never loaded) and
  // gates the whole page with a retry; actionError is NON-FATAL (a per-answer
  // save or the final submit failed) and shows inline so the live exam stays on
  // screen — a transient blip must never wipe the exam UI to a dead end.
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loadTick, setLoadTick] = useState(0)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId || !sessionId) return
    setLoadError(null)
    fetchExamSession(activeChildId, sessionId)
      .then((snap) => {
        if (snap.session.completed_at) {
          navigate(`/latihan/wmi/exam/${sessionId}/review`, { replace: true })
          return
        }
        setSnapshot(snap)
        // Resuming an open session lands on the first unanswered question
        // (prior answers are restored from submittedAttempts).
        const answered = new Set(snap.submittedAttempts.map((a) => a.question_id))
        const firstOpen = snap.paper.questions.findIndex((q) => !answered.has(q.id))
        if (firstOpen > 0) setCurrentIndex(firstOpen)
      })
      .catch((err) => setLoadError(toIndonesianErrorMessage(err, 'Gagal memuat ujian')))
  }, [activeChildId, sessionId, navigate, loadTick])

  useEffect(() => {
    setLookedUpTerms([])
    setBreakdown(false)
    setActionError(null)
  }, [currentIndex])

  // Refresh/close guard while the exam is live. The session itself stays
  // resumable (completed_at IS NULL) — this only prevents accidental exits.
  const examActive = snapshot != null && !snapshot.session.completed_at
  useEffect(() => {
    if (!examActive) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Chrome requires returnValue to be set for the confirmation dialog.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [examActive])

  const attemptsByQuestion = useMemo(() => {
    return new Map(snapshot?.submittedAttempts.map((attempt) => [attempt.question_id, attempt]) ?? [])
  }, [snapshot])

  // Fired-once guard: the timer's expiry, the timeout beat below, and the
  // "Selesai" button can all reach finish() — only the first call submits.
  const finishingRef = useRef(false)
  const finish = useCallback(async () => {
    if (!activeChildId || !sessionId || finishingRef.current) return
    finishingRef.current = true
    try {
      await completeExamSession(activeChildId, sessionId)
      // replace: the finished exam must not linger in history — back from the
      // review should NOT re-enter the live exam screen.
      navigate(`/latihan/wmi/exam/${sessionId}/review`, { replace: true })
    } catch (err) {
      // Non-fatal: keep the exam on screen (the Selesai button stays) so the
      // kid can re-tap. finishingRef reset allows the retry.
      finishingRef.current = false
      setActionError(toIndonesianErrorMessage(err, 'Gagal menyelesaikan ujian. Coba lagi.'))
    }
  }, [activeChildId, navigate, sessionId])

  // Time's up (live expiry OR resuming an already-expired session): never
  // silently auto-submit — show a brief "Waktu habis" beat so the kid sees
  // WHY the exam ends, then complete ONCE and route to the review.
  const [timeUp, setTimeUp] = useState(false)
  const handleExpire = useCallback(() => setTimeUp(true), [])
  useEffect(() => {
    if (!timeUp) return
    const id = window.setTimeout(() => {
      void finish()
    }, 1800)
    return () => window.clearTimeout(id)
  }, [timeUp, finish])

  // Explicit exit: the session is NOT abandoned — the paper page offers
  // "Lanjutkan Ujian" and the snapshot restores every submitted answer.
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const confirmExit = () => {
    // replace: drop the exam from history so back on the paper page doesn't
    // step straight back into the live exam.
    if (snapshot) navigate(`/latihan/wmi/papers/${snapshot.paper.id}`, { replace: true })
  }

  if (!activeChildId) {
    return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  }
  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6">
        <ErrorRetry message={loadError} onRetry={() => setLoadTick((t) => t + 1)} />
      </div>
    )
  }
  if (!snapshot) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] space-y-3 p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  if (timeUp) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-hourglass-end text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 font-display text-lg font-black text-qupu-brand-blue">
          Waktu habis — ujian dikumpulkan otomatis.
        </p>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">Menyiapkan hasil ujianmu…</p>
      </div>
    )
  }

  const question = snapshot.paper.questions[currentIndex]
  const attempt = attemptsByQuestion.get(question.id) as WmiSubmittedAttempt | undefined
  const total = snapshot.paper.questions.length

  // WMI's real exam structure: 25 questions = Paper A (soal 1–15) + Paper B
  // (soal 1–10). Only 25-question papers split; other lengths stay flat.
  const PAPER_A_SIZE = 15
  const isSplit = total === 25
  const partLabel = (position: number) =>
    isSplit
      ? position < PAPER_A_SIZE
        ? `Paper A · Soal ${position + 1}`
        : `Paper B · Soal ${position - PAPER_A_SIZE + 1}`
      : `Soal ${position + 1}`

  // Question navigator: per-number scoring is live — answered dots show
  // green/red right away; not-yet stays outline. Current ringed, tap to jump.
  const navDots: WmiDot[] = snapshot.paper.questions.map((q, index): WmiDot => {
    const done = attemptsByQuestion.get(q.id)
    return {
      key: q.id,
      state: done ? (done.is_correct ? 'correct' : 'wrong') : 'pending',
      current: index === currentIndex,
      onClick: () => setCurrentIndex(index),
      label: partLabel(index),
      number: isSplit && index >= PAPER_A_SIZE ? index - PAPER_A_SIZE + 1 : index + 1,
    }
  })

  const saveAnswer = async (answer: string) => {
    if (!activeChildId || !sessionId) return
    try {
      const result = await submitAttempt({
        childId: activeChildId,
        question_id: question.id,
        mode: 'exam',
        session_id: sessionId,
        selected_answer: answer,
        revealed_id_translation: Boolean(revealed[question.id]),
        looked_up_terms: lookedUpTerms,
      })
      const saved: WmiSubmittedAttempt = {
        question_id: question.id,
        selected_answer: answer,
        is_correct: result.is_correct,
        revealed_id_translation: Boolean(revealed[question.id]),
        looked_up_terms: lookedUpTerms,
      }
      setSnapshot((current) =>
        current
          ? {
              ...current,
              submittedAttempts: [
                ...current.submittedAttempts.filter((item) => item.question_id !== saved.question_id),
                saved,
              ],
            }
          : current,
      )
      setFeedback((map) => ({ ...map, [question.id]: result }))
      setActionError(null)
    } catch (err) {
      // Non-fatal: the exam stays on screen; re-picking the answer retries.
      setActionError(toIndonesianErrorMessage(err, 'Gagal menyimpan jawaban. Pilih lagi untuk mencoba.'))
    }
  }

  return (
    <div className="w-full max-w-[28.75rem] self-center pb-8">
      <ConfirmModal
        open={showExitConfirm}
        icon="fa-solid fa-door-open"
        title="Keluar ujian?"
        message="Tenang, jawabanmu tersimpan — kamu bisa lanjutkan nanti."
        cancelLabel="Lanjut Ujian"
        confirmLabel="Keluar Ujian"
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
      />
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <BackButton variant="close" onClick={() => setShowExitConfirm(true)} />
          <WmiExamTimer
            startedAt={snapshot.session.started_at}
            durationMin={snapshot.paper.recommended_duration_min}
            onExpire={handleExpire}
          />
        </div>
        <h1 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
          {snapshot.paper.title}
        </h1>
        {isSplit ? (
          <div className="space-y-2">
            <div>
              <p className="mb-1 px-1 text-[0.625rem] font-black uppercase tracking-[0.18em] text-qupu-muted">
                Paper A
              </p>
              <WmiDots dots={navDots.slice(0, PAPER_A_SIZE)} />
            </div>
            <div>
              <p className="mb-1 px-1 text-[0.625rem] font-black uppercase tracking-[0.18em] text-qupu-muted">
                Paper B
              </p>
              <WmiDots dots={navDots.slice(PAPER_A_SIZE)} />
            </div>
          </div>
        ) : (
          <WmiDots dots={navDots} />
        )}
      </header>

      <WmiQuestionView
        question={question}
        label={partLabel(currentIndex)}
        selectedChoice={attempt?.selected_answer ?? null}
        fillValue={attempt?.selected_answer ?? ''}
        highlight={
          attempt
            ? {
                correct:
                  feedback[question.id]?.correct_answer ??
                  (attempt.is_correct ? attempt.selected_answer : null),
                wrongPicked: attempt.is_correct ? null : attempt.selected_answer,
              }
            : undefined
        }
        disabled={Boolean(attempt)}
        // A wrong answer opens the full walkthrough (steps + trap + animated
        // explainer) right here; correct answers keep the card compact.
        revealed={Boolean(revealed[question.id]) || (attempt != null && !attempt.is_correct)}
        breakdownActive={breakdown}
        initialLang={preferredLang}
        onToggleBreakdown={() => setBreakdown((value) => !value)}
        onPickChoice={saveAnswer}
        onSubmitFillIn={saveAnswer}
        onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
        onRevealTranslation={() => setRevealed((state) => ({ ...state, [question.id]: true }))}
        onUserToggleLanguage={setPreferredLang}
      />

      {attempt && (
        <div
          className={`mt-4 rounded-[1.5rem] border-2 p-4 shadow-[0_5px_0_0_#FFD3B1] ${
            attempt.is_correct ? 'border-[#58A700]/40 bg-[#E8F5D6]' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${
                attempt.is_correct ? 'bg-[#58A700]' : 'bg-rose-400'
              }`}
            >
              <i
                className={`fa-solid ${attempt.is_correct ? 'fa-check' : 'fa-xmark'} text-sm`}
                aria-hidden="true"
              />
            </span>
            <span
              className={`font-display font-black ${attempt.is_correct ? 'text-[#2D6B00]' : 'text-rose-600'}`}
            >
              {attempt.is_correct ? 'Benar!' : 'Belum tepat'}
            </span>
          </div>
          {!attempt.is_correct && feedback[question.id]?.correct_answer && (
            <p className="mt-2 text-sm font-semibold text-rose-700">
              Jawaban benar:{' '}
              <span className="font-black">{feedback[question.id].correct_answer}</span>
            </p>
          )}
        </div>
      )}

      {actionError && (
        <div className="mt-4 rounded-[1.25rem] border-2 border-rose-200 bg-rose-50 p-3 text-center">
          <p className="text-sm font-bold text-rose-600">
            <i className="fa-solid fa-circle-exclamation me-1.5" aria-hidden="true" />
            {actionError}
          </p>
        </div>
      )}

      {/* Nav bar floats at the viewport bottom while there's content below it,
          then settles into place at the end of the scroll — the wrapper's pb-8
          is its resting room. -mx-1/px-1 lets the backdrop span the column
          gutter so scrolling content doesn't peek past the buttons' edges. */}
      <div className="sticky bottom-0 z-20 -mx-1 mt-5 flex justify-between gap-3 bg-gradient-to-t from-qupu-cream from-60% to-transparent px-1 pb-2 pt-4 lg:from-[#FFF8F0]">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          className="rounded-full bg-white px-5 py-3 font-display font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {currentIndex < total - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.min(total - 1, index + 1))}
            className="rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            Lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="rounded-full bg-[#58A700] px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] transition-transform active:translate-y-0.5"
          >
            Selesai
          </button>
        )}
      </div>
    </div>
  )
}
