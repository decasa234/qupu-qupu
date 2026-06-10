import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import WmiDots, { type WmiDot } from '../components/wmi/WmiDots'
import WmiExamTimer from '../components/wmi/WmiExamTimer'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { completeExamSession, fetchExamSession, submitAttempt } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiExamSnapshot, WmiSubmittedAttempt } from '../types/wmi'

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
  const [breakdown, setBreakdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId || !sessionId) return
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
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat ujian')))
  }, [activeChildId, sessionId, navigate])

  useEffect(() => {
    setLookedUpTerms([])
    setBreakdown(false)
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

  const finish = useCallback(async () => {
    if (!activeChildId || !sessionId) return
    try {
      await completeExamSession(activeChildId, sessionId)
      navigate(`/latihan/wmi/exam/${sessionId}/review`)
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal menyelesaikan ujian'))
    }
  }, [activeChildId, navigate, sessionId])

  // Explicit exit: the session is NOT abandoned — the paper page offers
  // "Lanjutkan Ujian" and the snapshot restores every submitted answer.
  const exitExam = () => {
    if (!snapshot) return
    if (window.confirm('Keluar ujian? Kamu bisa lanjutkan nanti.')) {
      navigate(`/latihan/wmi/papers/${snapshot.paper.id}`)
    }
  }

  if (!activeChildId) {
    return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  }
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">{error}</p>
      </div>
    )
  }
  if (!snapshot) {
    return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Memuat ujian…</div>
  }

  const question = snapshot.paper.questions[currentIndex]
  const attempt = attemptsByQuestion.get(question.id) as WmiSubmittedAttempt | undefined
  const total = snapshot.paper.questions.length

  // Question navigator: answered (navy) vs not-yet (outline), current ringed,
  // tap to jump. Correctness stays hidden until the review (blind exam).
  const navDots: WmiDot[] = snapshot.paper.questions.map((q, index): WmiDot => ({
    key: q.id,
    state: attemptsByQuestion.has(q.id) ? 'answered' : 'pending',
    current: index === currentIndex,
    onClick: () => setCurrentIndex(index),
    label: `Soal ${index + 1}`,
  }))

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
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal menyimpan jawaban'))
    }
  }

  return (
    <div className="w-full max-w-[460px] self-center pb-8">
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitExam}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
            Keluar
          </button>
          <WmiExamTimer
            startedAt={snapshot.session.started_at}
            durationMin={snapshot.paper.recommended_duration_min}
            onExpire={finish}
          />
        </div>
        <h1 className="font-display text-xl font-black leading-tight text-qupu-brand-blue">
          {snapshot.paper.title}
        </h1>
        <WmiDots dots={navDots} />
      </header>

      <WmiQuestionView
        question={question}
        selectedChoice={attempt?.selected_answer ?? null}
        fillValue={attempt?.selected_answer ?? ''}
        revealed={Boolean(revealed[question.id])}
        breakdownActive={breakdown}
        initialLang={preferredLang}
        onToggleBreakdown={() => setBreakdown((value) => !value)}
        onPickChoice={saveAnswer}
        onSubmitFillIn={saveAnswer}
        onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
        onRevealTranslation={() => setRevealed((state) => ({ ...state, [question.id]: true }))}
        onUserToggleLanguage={setPreferredLang}
      />

      <div className="mt-5 flex justify-between gap-3">
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
