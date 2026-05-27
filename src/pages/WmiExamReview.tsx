import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import WmiExamReviewItem from '../components/wmi/WmiExamReviewItem'
import { fetchExamSession, startExamSession } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiExamSnapshot } from '../types/wmi'

export default function WmiExamReview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const { loadGlossary } = useWmiStore()
  const [snapshot, setSnapshot] = useState<WmiExamSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId || !sessionId) return
    fetchExamSession(activeChildId, sessionId)
      .then(setSnapshot)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat hasil'))
  }, [activeChildId, sessionId])

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
      setError(err instanceof Error ? err.message : 'Gagal memulai ulang')
    }
  }

  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!snapshot) return <div className="p-6 text-center">Memuat hasil...</div>

  const score = snapshot.session.correct_count ?? snapshot.submittedAttempts.filter((a) => a.is_correct).length
  const total = snapshot.paper.questions.length
  const pct = total ? Math.round((score / total) * 100) : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 rounded-lg bg-qupu-cream/60 p-4 text-center">
        <div className="text-3xl font-bold text-qupu-brand-blue">
          {score} / {total}
        </div>
        <div className="text-sm text-gray-600">
          {pct}% - {snapshot.paper.title}
        </div>
      </header>
      <div className="space-y-3">
        {snapshot.paper.questions.map((question) => (
          <WmiExamReviewItem key={question.id} question={question} attempt={attemptByQid.get(question.id)} />
        ))}
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <Link to="/latihan/wmi" className="rounded-lg bg-gray-100 px-4 py-2 font-bold text-gray-700">
          Kembali ke Latihan
        </Link>
        <button type="button" onClick={restartPaper} className="rounded-lg bg-qupu-brand-blue px-4 py-2 font-bold text-white">
          Coba lagi
        </button>
      </div>
    </div>
  )
}
