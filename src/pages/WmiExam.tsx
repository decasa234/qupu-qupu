import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import WmiDots, { type WmiDot } from '../components/wmi/WmiDots'
import WmiExamTimer from '../components/wmi/WmiExamTimer'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { completeExamSession, fetchExamSession, submitAttempt } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiExamSnapshot, WmiSubmittedAttempt } from '../types/wmi'

export default function WmiExam() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
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
      })
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat ujian')))
  }, [activeChildId, sessionId, navigate])

  useEffect(() => {
    setLookedUpTerms([])
    setBreakdown(false)
  }, [currentIndex])

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

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>
  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!snapshot) return <div className="p-6 text-center">Memuat ujian...</div>

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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold text-qupu-brand-blue">{snapshot.paper.title}</h1>
          <WmiExamTimer
            startedAt={snapshot.session.started_at}
            durationMin={snapshot.paper.recommended_duration_min}
            onExpire={finish}
          />
        </div>
        <WmiDots dots={navDots} />
      </header>

      <WmiQuestionView
        question={question}
        selectedChoice={attempt?.selected_answer ?? null}
        fillValue={attempt?.selected_answer ?? ''}
        revealed={Boolean(revealed[question.id])}
        breakdownActive={breakdown}
        onToggleBreakdown={() => setBreakdown((value) => !value)}
        onPickChoice={saveAnswer}
        onSubmitFillIn={saveAnswer}
        onLookupTerm={(slug) => setLookedUpTerms((terms) => Array.from(new Set([...terms, slug])))}
        onRevealTranslation={() => setRevealed((state) => ({ ...state, [question.id]: true }))}
      />

      <div className="mt-5 flex justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          className="rounded-lg bg-gray-100 px-4 py-2 font-bold text-gray-700 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {currentIndex < total - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.min(total - 1, index + 1))}
            className="rounded-lg bg-qupu-brand-blue px-4 py-2 font-bold text-white"
          >
            Lanjut
          </button>
        ) : (
          <button type="button" onClick={finish} className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white">
            Selesai
          </button>
        )}
      </div>
    </div>
  )
}
