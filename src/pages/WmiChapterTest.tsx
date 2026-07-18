import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import WmiAnswerChoice from '../components/wmi/WmiAnswerChoice'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { startChapterTest, submitChapterTest } from '../lib/wmiApi'
import { fetchGamificationSummary } from '../lib/gamificationApi'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import type { WmiChapterTestQuestion, WmiChapterTestResult } from '../types/wmi'

export default function WmiChapterTest() {
  const { subjectKey } = useParams()
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<WmiChapterTestQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)
  const [result, setResult] = useState<WmiChapterTestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  useEffect(() => {
    if (!activeChildId || !subjectKey) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    startChapterTest(activeChildId, subjectKey)
      .then((d) => !cancelled && setQuestions(d.questions))
      // A failed fetch is NOT "no questions exist" — show a retry state,
      // never the misleading "Tes belum tersedia" copy.
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, subjectKey, loadTick])

  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Refresh/close guard while answers are in-flight (local state only).
  const guarded = !result && Object.keys(answers).length > 0
  useEffect(() => {
    if (!guarded) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [guarded])

  const current = questions[idx]
  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q.concept_instance_id]),
    [questions, answers],
  )

  async function finish() {
    if (!activeChildId || !subjectKey) return
    const childId = activeChildId
    setSubmitting(true)
    setSubmitError(false)
    try {
      const payload = questions.map((q) => ({
        concept_instance_id: q.concept_instance_id,
        selected_answer: answers[q.concept_instance_id] ?? '',
      }))
      const testResult = await submitChapterTest(childId, subjectKey, payload)
      setResult(testResult)
      if (testResult.passed) {
        // A pass awards rewards but the test response carries no balances —
        // refresh the top stat strip from the summary endpoint, stamped for
        // the child who took the test. Fire-and-forget: a failure just
        // leaves the strip stale until the next surface fetches.
        fetchGamificationSummary(childId)
          .then((summary) => {
            useGamificationStats.getState().setStats(childId, {
              streak: summary.streak,
              streakShields: summary.streakShields ?? 0,
              coinBalance: summary.coinBalance,
              level: summary.level,
              tierName: summary.tierName,
              xp: summary.xpIntoCurrent,
              xpToNext: summary.xpToNext,
            })
          })
          .catch(() => { /* stat strip refresh is best-effort */ })
      }
    } catch {
      // Answers stay in state — the kid just taps "Selesai" again.
      setSubmitError(true)
    } finally { setSubmitting(false) }
  }

  if (!activeChildId) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  if (loading) return (
    <div className="mx-auto w-full max-w-[28.75rem] p-6">
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="mt-6 h-64 rounded-[1.5rem]" />
    </div>
  )

  if (loadError) {
    return <ErrorRetry message="Gagal memuat tes. Coba lagi." onRetry={() => setLoadTick((t) => t + 1)} />
  }

  if (result) {
    // Ceremony-style close, mirroring the konsep session's finish screen.
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-4">
        {result.passed && <KonsepConfetti />}
        <div className="flex min-h-[70vh] flex-col justify-center">
          <div className="animate-rise rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)] ${result.passed ? 'bg-[#58A700]' : 'bg-rose-400'}`}>
              <i className={`fa-solid ${result.passed ? 'fa-check' : 'fa-rotate-right'}`} aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
              {result.passed ? 'Bab terbuka!' : 'Belum lulus'}
            </h1>
            <p className="mt-1 text-sm font-semibold text-qupu-muted">
              Skor {result.score_pct}% ({result.correct}/{result.total}). {result.passed ? 'Bab ini sekarang terbuka.' : 'Butuh >70%. Coba lagi atau tumbuhkan bab sebelumnya.'}
            </p>
            {/* First-pass reward chips — 0 on repeat passes, so nothing renders */}
            {(result.xp_earned > 0 || result.coins_earned > 0) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                {result.xp_earned > 0 && (
                  <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#0E1430]">
                    <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                    +{result.xp_earned} XP
                  </span>
                )}
                {result.coins_earned > 0 && (
                  <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-4 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#B45309]">
                    <i className="fa-solid fa-coins text-qupu-brand-yellow" aria-hidden="true" />
                    +{result.coins_earned} koin
                  </span>
                )}
              </div>
            )}
            <Link
              to="/belajar"
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange py-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
            >
              <i className="fa-solid fa-seedling" aria-hidden="true" />
              Kembali ke Kebun
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Tes belum tersedia untuk bab ini.</div>

  const pick = (val: string) => setAnswers((a) => ({ ...a, [current.concept_instance_id]: val }))

  return (
    <div className="mx-auto w-full max-w-[28.75rem] p-4 pb-8">
      <ConfirmModal
        open={showExitConfirm}
        icon="fa-solid fa-triangle-exclamation"
        title="Keluar tes?"
        message="Jawabanmu di tes ini akan hilang kalau keluar sekarang."
        cancelLabel="Lanjut Tes"
        confirmLabel="Keluar Tes"
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => navigate('/belajar')}
      />

      {/* Top row: close button + single compact progress element — mirrors
          the konsep session header. Answers live only in local state, so
          leaving mid-test loses them (hence the confirm). */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton
          variant="close"
          onClick={() => {
            if (Object.keys(answers).length === 0) navigate('/belajar')
            else setShowExitConfirm(true)
          }}
        />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + 1) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
        <span className="font-display text-xs font-black text-qupu-brand-blue">
          {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="mt-4 rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
        <p className="font-display text-lg font-black leading-snug text-qupu-brand-blue">
          {current.body_id}
        </p>
        <div className="mt-4 grid gap-3">
          {current.answer_type === 'multiple_choice' && current.choices_id ? (
            current.choices_id.map((ch) => (
              <WmiAnswerChoice
                key={ch.label}
                choice={ch}
                selected={answers[current.concept_instance_id] === ch.text}
                onPick={() => pick(ch.text)}
              >
                {ch.text}
              </WmiAnswerChoice>
            ))
          ) : (
            <input
              type="text" inputMode="numeric"
              value={answers[current.concept_instance_id] ?? ''}
              onChange={(e) => pick(e.target.value)}
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
      <div className="mt-4 flex gap-3">
        {idx > 0 && (
          <button
            onClick={() => setIdx((i) => i - 1)}
            className="flex-1 rounded-full bg-white py-3 font-display font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Sebelumnya
          </button>
        )}
        {idx < questions.length - 1 ? (
          <button
            onClick={() => setIdx((i) => i + 1)}
            disabled={!answers[current.concept_instance_id]}
            className="flex-1 rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5 disabled:opacity-50"
          >
            Lanjut
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={!allAnswered || submitting}
            className="flex-1 rounded-full bg-[#58A700] py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] transition-transform active:translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? 'Memeriksa…' : 'Selesai'}
          </button>
        )}
      </div>
    </div>
  )
}
