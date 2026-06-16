import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ErrorRetry from '../components/ErrorRetry'
import Skeleton from '../components/Skeleton'
import WmiExamReviewItem from '../components/wmi/WmiExamReviewItem'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchExamSession, startExamSession } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiExamSnapshot } from '../types/wmi'

export default function WmiExamReview() {
  useDocumentTitle('Review Ujian')
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
  const [snapshot, setSnapshot] = useState<WmiExamSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadTick, setLoadTick] = useState(0)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId || !sessionId) return
    setError(null)
    fetchExamSession(activeChildId, sessionId)
      .then(setSnapshot)
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat hasil')))
  }, [activeChildId, sessionId, loadTick])

  const attemptByQid = useMemo(
    () => new Map(snapshot?.submittedAttempts.map((attempt) => [attempt.question_id, attempt]) ?? []),
    [snapshot],
  )

  const restartPaper = async () => {
    if (!activeChildId || !snapshot) return
    try {
      const next = await startExamSession(activeChildId, snapshot.paper.id)
      navigate(`/latihan/wmi/exam/${next.session.id}`)
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memulai ulang'))
    }
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6">
        <ErrorRetry
          message="Gagal memuat hasil. Periksa koneksimu."
          onRetry={() => setLoadTick((t) => t + 1)}
        />
      </div>
    )
  }
  if (!snapshot) {
    return (
      <div className="mx-auto w-full max-w-[460px] space-y-3 p-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  const score = snapshot.session.correct_count ?? snapshot.submittedAttempts.filter((a) => a.is_correct).length
  const total = snapshot.paper.questions.length
  const pct = total ? Math.round((score / total) * 100) : 0

  return (
    <div className="w-full max-w-[460px] self-center pb-8">
      <header className="relative mb-4 overflow-hidden rounded-[2rem] bg-qupu-brand-blue p-5 text-center text-white shadow-[0_6px_0_0_#0E1430]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/25" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-yellow">
            Hasil Ujian
          </p>
          <div className="mt-1 font-display text-4xl font-black">
            {score} / {total}
          </div>
          <p className="mt-1 text-xs font-bold text-white/80">
            {pct}% · {snapshot.paper.title}
          </p>
        </div>
      </header>
      <div className="space-y-3">
        {snapshot.paper.questions.map((question) => (
          <WmiExamReviewItem key={question.id} question={question} attempt={attemptByQid.get(question.id)} />
        ))}
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <BackButton variant="back" to="/latihan/wmi/ujian" />
        <button
          type="button"
          onClick={restartPaper}
          className="rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-rotate-right me-2 text-sm" aria-hidden="true" />
          Coba lagi
        </button>
      </div>
    </div>
  )
}
