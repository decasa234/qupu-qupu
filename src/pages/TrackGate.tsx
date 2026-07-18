// src/pages/TrackGate.tsx
//
// /latihan/track/:trackId/gerbang/:gateKey — the QUPU track engine's gate
// play page (Plan 2, Task 6). A single-question flow modeled on
// TrackLesson.tsx (same header/card/result ceremony chrome), wired to the
// gate endpoints: one question, no progress bar, and three terminal states
// (already-cleared, locked, or a pass/fail ceremony after submitting).
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import WmiAnswerChoice from '../components/wmi/WmiAnswerChoice'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { fetchTrackGate, submitTrackGate } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import type { TrackGateView } from '../types/wmi'

const GOLD = { background: '#FFE159', color: '#8A6400' }
const LOCKED = { background: '#E7E2D6', color: '#9AA0AC' }

function Medallion({ icon, style, className }: { icon: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)]${
        className ? ` ${className}` : ''
      }`}
      style={style}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </div>
  )
}

function Ceremony({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[28.75rem] p-4">
      <div className="flex min-h-[70vh] flex-col justify-center">
        <div className="animate-rise rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          {children}
        </div>
      </div>
    </div>
  )
}

function BackToMapButton({ trackId }: { trackId: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(`/belajar/track/${trackId}`)}
      className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange py-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
    >
      <i className="fa-solid fa-map" aria-hidden="true" />
      Kembali ke Peta
    </button>
  )
}

export default function TrackGate() {
  const { trackId, gateKey } = useParams()
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()

  const [gate, setGate] = useState<TrackGateView | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)

  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; cleared: boolean } | null>(null)

  useEffect(() => {
    if (!activeChildId || !trackId || !gateKey) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchTrackGate(activeChildId, trackId, gateKey)
      .then((d) => !cancelled && setGate(d))
      // A failed fetch is NOT "gate unavailable" — show a retry state, never
      // a misleading locked/error message.
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, trackId, gateKey, loadTick])

  async function submit() {
    if (!activeChildId || !trackId || !gateKey || !selectedAnswer) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const res = await submitTrackGate(activeChildId, trackId, gateKey, selectedAnswer)
      setResult(res)
    } catch {
      // Answer stays in state — the kid just taps "Jawab" again.
      setSubmitError(true)
    } finally { setSubmitting(false) }
  }

  // "Coba Lagi" on a wrong result: pull a fresh gate question and reset all
  // local session state so they can resubmit.
  function retry() {
    setResult(null)
    setSelectedAnswer('')
    setSubmitError(false)
    setGate(null)
    setLoading(true)
    setLoadTick((t) => t + 1)
  }

  if (!activeChildId) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  if (loading) return (
    <div className="mx-auto w-full max-w-[28.75rem] p-6">
      <Skeleton className="h-9 w-24 rounded-full" />
      <Skeleton className="mt-6 h-64 rounded-[1.5rem]" />
    </div>
  )

  if (loadError) {
    return <ErrorRetry message="Gagal memuat gerbang. Coba lagi." onRetry={() => setLoadTick((t) => t + 1)} />
  }

  if (!gate || !trackId) return null

  // Fresh submit result: correct → gold ceremony (mirrors the already-cleared
  // state below but with confetti); wrong → rose ceremony with a retry.
  if (result) {
    if (result.correct) {
      return (
        <div className="mx-auto w-full max-w-[28.75rem] p-4">
          <KonsepConfetti />
          <div className="flex min-h-[70vh] flex-col justify-center">
            <div className="animate-rise rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
              <Medallion icon="fa-crown" style={GOLD} />
              <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Gerbang terbuka!</h1>
              <BackToMapButton trackId={trackId} />
            </div>
          </div>
        </div>
      )
    }
    return (
      <Ceremony>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-400 text-3xl text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)]">
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Belum tepat</h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">Coba lagi, ya!</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={retry}
            className="flex-1 rounded-full bg-qupu-brand-blue py-3.5 font-display text-base font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={() => navigate(`/belajar/track/${trackId}`)}
            className="flex-1 rounded-full bg-white py-3.5 font-display text-base font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Kembali ke Peta
          </button>
        </div>
      </Ceremony>
    )
  }

  if (gate.cleared) {
    return (
      <Ceremony>
        <Medallion icon="fa-crown" style={GOLD} />
        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Gerbang sudah terbuka!</h1>
        <BackToMapButton trackId={trackId} />
      </Ceremony>
    )
  }

  if (!gate.unlocked) {
    return (
      <Ceremony>
        <Medallion icon="fa-lock" style={LOCKED} />
        <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Masih terkunci</h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">Kuasai semua konsepnya dulu, ya!</p>
        <BackToMapButton trackId={trackId} />
      </Ceremony>
    )
  }

  const question = gate.question
  if (!question) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Soal belum tersedia untuk gerbang ini.</div>

  return (
    <div className="mx-auto w-full max-w-[28.75rem] p-4 pb-8">
      {/* Top row: close button + label — same row as TrackLesson's header,
          minus the progress bar (there's only one question). */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton variant="close" onClick={() => navigate(`/belajar/track/${trackId}`)} />
        <span className="font-display text-base font-black text-qupu-brand-blue">Tes Bab</span>
      </div>

      <div className="mt-4 rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
        <p className="font-display text-lg font-black leading-snug text-qupu-brand-blue">
          {question.bodyId}
        </p>
        <div className="mt-4 grid gap-3">
          {question.answerType === 'multiple_choice' && question.choicesId ? (
            question.choicesId.map((ch) => (
              <WmiAnswerChoice
                key={ch.label}
                choice={ch}
                selected={selectedAnswer === ch.text}
                onPick={() => setSelectedAnswer(ch.text)}
              >
                {ch.text}
              </WmiAnswerChoice>
            ))
          ) : (
            <input
              type="text" inputMode="numeric"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-4 py-3 font-semibold focus:border-qupu-brand-orange focus:outline-none"
              placeholder="Jawabanmu"
            />
          )}
        </div>
      </div>
      {submitError && (
        <p className="mt-3 text-center text-xs font-semibold text-rose-600">
          <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
          Gagal mengirim jawaban. Coba lagi.
        </p>
      )}
      <div className="mt-4">
        <button
          onClick={submit}
          disabled={!selectedAnswer || submitting}
          className="w-full rounded-full bg-[#58A700] py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] transition-transform active:translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? 'Memeriksa…' : 'Jawab'}
        </button>
      </div>
    </div>
  )
}
