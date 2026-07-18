// src/pages/TrackLesson.tsx
//
// /latihan/track/:trackId/sesi/:focusSlug — the QUPU track engine's lesson
// play page (Plan 2, Task 5). Structurally a copy-adaptation of
// WmiChapterTest.tsx (same header/progress/exit-confirm/question-card/result
// ceremony chrome) wired to the track lesson endpoints instead of the
// chapter-test ones: one FOCUS_COUNT+RECALL_COUNT (6+2) lesson, one-miss
// grading server-side, and a level-up (not percent-pass) result.
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import WmiAnswerChoice from '../components/wmi/WmiAnswerChoice'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { getThemePack } from '../components/wmi/track/themes'
import { buildTrackLesson, commitTrackLesson } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import type { TrackLessonQuestion, TrackLessonResult } from '../types/wmi'

export default function TrackLesson() {
  const { trackId, focusSlug } = useParams()
  const location = useLocation()
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()

  // TrackMap doesn't pass router state yet (Plan 2 task 4 navigates bare),
  // so this always resolves to the forest pack for now — safe default until
  // a later task threads the track's real theme through.
  const themeKey = (location.state as { theme?: string } | null)?.theme ?? 'forest'
  const theme = useMemo(() => getThemePack(themeKey), [themeKey])

  const [questions, setQuestions] = useState<TrackLessonQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)
  const [result, setResult] = useState<TrackLessonResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  useEffect(() => {
    if (!activeChildId || !trackId || !focusSlug) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    buildTrackLesson(activeChildId, trackId, focusSlug)
      .then((d) => !cancelled && setQuestions(d.questions))
      // A failed fetch is NOT "no questions exist" — show a retry state,
      // never a misleading empty-lesson message.
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, trackId, focusSlug, loadTick])

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
    () => questions.length > 0 && questions.every((q) => answers[q.instanceId]),
    [questions, answers],
  )

  async function finish() {
    if (!activeChildId || !trackId || !focusSlug) return
    const childId = activeChildId
    setSubmitting(true)
    setSubmitError(false)
    try {
      const payload = questions.map((q) => ({
        instanceId: q.instanceId,
        selectedAnswer: answers[q.instanceId] ?? '',
        recall: q.recall,
      }))
      const lessonResult = await commitTrackLesson(childId, trackId, focusSlug, payload)
      setResult(lessonResult)
    } catch {
      // Answers stay in state — the kid just taps "Selesai" again.
      setSubmitError(true)
    } finally { setSubmitting(false) }
  }

  // "Coba Lagi" on a failed result: pull a fresh lesson (new instance rows at
  // the same still-unlevel-up'd level) and reset all local session state.
  function retry() {
    setResult(null)
    setAnswers({})
    setIdx(0)
    setSubmitError(false)
    setQuestions([])
    setLoading(true)
    setLoadTick((t) => t + 1)
  }

  if (!activeChildId) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Pilih profil anak dulu.</div>
  if (loading) return (
    <div className="mx-auto w-full max-w-[28.75rem] p-6">
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="mt-6 h-64 rounded-[1.5rem]" />
    </div>
  )

  if (loadError) {
    return <ErrorRetry message="Gagal memuat latihan. Coba lagi." onRetry={() => setLoadTick((t) => t + 1)} />
  }

  if (result) {
    const leveledUp = result.passed && result.levelAfter > result.levelBefore
    // "Emas!" is the one-time crossing-into-mastery moment; a later pass that
    // stays at level 5 (already gold) is just a quiet "latihan selesai".
    const justMastered = leveledUp && result.levelAfter === 5
    const stageIdx = Math.min(5, Math.max(0, result.levelAfter))
    const stage = theme.stages[stageIdx]

    let headline: string
    let subline: string | null = null
    if (result.passed) {
      if (justMastered) headline = 'Emas! Konsep dikuasai'
      else if (leveledUp) headline = `Naik ke Level ${result.levelAfter}!`
      else headline = 'Latihan selesai!'
    } else {
      headline = 'Belum lulus'
      subline = 'Maksimal 1 salah pada soal utama. Coba lagi, ya!'
    }

    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-4">
        {result.passed && <KonsepConfetti />}
        <div className="flex min-h-[70vh] flex-col justify-center">
          <div className="animate-rise rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            {result.passed ? (
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)]"
                style={{ background: stage.bg, color: stage.fg }}
              >
                {stage.forest ? (
                  <span className="relative flex items-end" aria-hidden="true">
                    <i className="fa-solid fa-tree text-[0.9375rem] opacity-75" style={{ color: stage.fg }} />
                    <i className="fa-solid fa-tree -ml-[0.3125rem] text-[1.4375rem]" style={{ color: stage.fg }} />
                    <i className="fa-solid fa-tree -ml-[0.3125rem] text-[0.8125rem] opacity-75" style={{ color: stage.fg }} />
                  </span>
                ) : (
                  <i className={`${stage.iconPrefix} ${stage.icon}`} aria-hidden="true" />
                )}
              </div>
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-400 text-3xl text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15)]">
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              </div>
            )}
            <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
              {headline}
            </h1>
            {subline && (
              <p className="mt-1 text-sm font-semibold text-qupu-muted">{subline}</p>
            )}
            {result.passed && (
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#0E1430]">
                  <i className="fa-solid fa-check text-qupu-brand-yellow" aria-hidden="true" />
                  +{result.focusCorrect} benar
                </span>
              </div>
            )}
            {result.passed ? (
              <button
                type="button"
                onClick={() => navigate(`/belajar/track/${trackId}`)}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange py-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
              >
                <i className="fa-solid fa-map" aria-hidden="true" />
                Kembali ke Peta
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!current) return <div className="p-6 text-center text-sm font-semibold text-qupu-muted">Latihan belum tersedia untuk konsep ini.</div>

  const pick = (val: string) => setAnswers((a) => ({ ...a, [current.instanceId]: val }))

  return (
    <div className="mx-auto w-full max-w-[28.75rem] p-4 pb-8">
      <ConfirmModal
        open={showExitConfirm}
        icon="fa-solid fa-triangle-exclamation"
        title="Keluar latihan?"
        message="Jawabanmu di latihan ini akan hilang kalau keluar sekarang."
        cancelLabel="Lanjut Latihan"
        confirmLabel="Keluar Latihan"
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => navigate(`/belajar/track/${trackId}`)}
      />

      {/* Top row: close button + single compact progress element — mirrors
          WmiChapterTest's header. Answers live only in local state, so
          leaving mid-lesson loses them (hence the confirm). */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton
          variant="close"
          onClick={() => {
            if (Object.keys(answers).length === 0) navigate(`/belajar/track/${trackId}`)
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

      <div
        className="mt-4 rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]"
        role={current.recall ? 'group' : undefined}
        aria-label={current.recall ? 'soal ulangan' : undefined}
      >
        {current.recall && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[0.6875rem] font-black text-[#30598A]">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
            Ulangan
          </span>
        )}
        <p className="font-display text-lg font-black leading-snug text-qupu-brand-blue">
          {current.bodyId}
        </p>
        <div className="mt-4 grid gap-3">
          {current.answerType === 'multiple_choice' && current.choicesId ? (
            current.choicesId.map((ch) => (
              <WmiAnswerChoice
                key={ch.label}
                choice={ch}
                selected={answers[current.instanceId] === ch.text}
                onPick={() => pick(ch.text)}
              >
                {ch.text}
              </WmiAnswerChoice>
            ))
          ) : (
            <input
              type="text" inputMode="numeric"
              value={answers[current.instanceId] ?? ''}
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
            disabled={!answers[current.instanceId]}
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
