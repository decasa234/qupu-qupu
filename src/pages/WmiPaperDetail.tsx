import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchPaperDetail, startExamSession } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import type { WmiPaperDetail as Detail } from '../types/wmi'

export default function WmiPaperDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const [paper, setPaper] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!activeChildId || !id) return
    fetchPaperDetail(activeChildId, id)
      .then(setPaper)
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat')))
  }, [activeChildId, id])

  const startExam = async () => {
    if (!activeChildId || !paper) return
    setStarting(true)
    try {
      const snapshot = await startExamSession(activeChildId, paper.id)
      navigate(`/latihan/wmi/exam/${snapshot.session.id}`)
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memulai'))
      setStarting(false)
    }
  }

  if (error) return <div className="mx-auto max-w-xl p-6 text-center text-red-600">{error}</div>
  if (!paper) return <div className="p-6 text-center">Memuat...</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-center">
      <Link to="/latihan/wmi" className="text-sm font-bold text-qupu-brand-blue underline">
        Kembali
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-qupu-brand-blue">{paper.title}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {paper.questions.length} soal - {paper.recommended_duration_min} menit
      </p>
      <button
        type="button"
        onClick={startExam}
        disabled={starting}
        className="mt-6 rounded-lg bg-qupu-brand-blue px-8 py-3 text-lg font-bold text-white disabled:opacity-50"
      >
        {starting ? 'Memulai...' : 'Mulai Ujian'}
      </button>
    </div>
  )
}
