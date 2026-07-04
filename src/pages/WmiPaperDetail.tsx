import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ErrorRetry from '../components/ErrorRetry'
import Skeleton from '../components/Skeleton'
import useDocumentTitle from '../hooks/useDocumentTitle'
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
  useDocumentTitle(paper?.title)

  const loadPaper = useCallback(() => {
    if (!activeChildId || !id) return
    setError(null)
    setPaper(null)
    fetchPaperDetail(activeChildId, id)
      .then(setPaper)
      .catch((err) => setError(toIndonesianErrorMessage(err, 'Gagal memuat')))
  }, [activeChildId, id])

  useEffect(() => {
    loadPaper()
  }, [loadPaper])

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

  if (!activeChildId) {
    return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  }
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6">
        <ErrorRetry message={error} onRetry={loadPaper} />
      </div>
    )
  }
  if (!paper) {
    return (
      <div className="mx-auto w-full max-w-[460px] space-y-3 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  const openSession = paper.openSession ?? null

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      <div className="mb-3">
        {/* Always go to the paper list, never navigate(-1): after exiting an
            exam, history-back would land inside the live exam again. */}
        <BackButton variant="back" onClick={() => navigate('/latihan/wmi/ujian')} />
      </div>

      <section className="rounded-[2rem] bg-white p-6 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-qupu-cream text-2xl text-qupu-brand-blue shadow-[inset_0_-4px_0_#FFD3B1]">
          <i className="fa-solid fa-file-pen" aria-hidden="true" />
        </div>
        <h1 className="mt-3 font-display text-2xl font-black leading-tight text-qupu-brand-blue">
          {paper.title}
        </h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-sky px-3 py-1 text-xs font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-list-ol" aria-hidden="true" />
            {paper.questions.length} soal
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-3 py-1 text-xs font-bold text-qupu-brand-orange">
            <i className="fa-solid fa-stopwatch" aria-hidden="true" />
            {paper.recommended_duration_min} menit
          </span>
        </div>

        {openSession ? (
          <>
            <p className="mt-4 text-sm font-semibold text-qupu-muted">
              Ada ujian yang belum selesai — jawabanmu masih tersimpan.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/latihan/wmi/exam/${openSession.id}`)}
              className="mt-3 w-full rounded-full bg-qupu-brand-orange py-3 font-display text-lg font-black text-white shadow-[0_3px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <i className="fa-solid fa-play me-2 text-sm" aria-hidden="true" />
              Lanjutkan Ujian
            </button>
            <button
              type="button"
              onClick={startExam}
              disabled={starting}
              className="mt-2 w-full rounded-full bg-white py-3 font-display font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 disabled:opacity-50"
            >
              {starting ? 'Memulai…' : 'Mulai dari Awal'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startExam}
            disabled={starting}
            className="mt-5 w-full rounded-full bg-qupu-brand-blue py-3 font-display text-lg font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5 disabled:opacity-50"
          >
            <i className="fa-solid fa-play me-2 text-sm" aria-hidden="true" />
            {starting ? 'Memulai…' : 'Mulai Ujian'}
          </button>
        )}
      </section>
    </div>
  )
}
