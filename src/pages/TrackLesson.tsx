// src/pages/TrackLesson.tsx
//
// /latihan/track/:trackId/sesi/:focusSlug — the QUPU track engine's lesson
// play page. Per-question /belajar parity (mirrors WmiKonsepSession): each
// answer is graded immediately (gradeConceptAnswer — pure, no progress write)
// for a Benar/Belum-tepat verdict, confetti on a correct pick, and the
// animated WmiExplainer walkthrough; the authoritative level-up grade still
// happens once at the end via commitTrackLesson (one-miss rule, server-side).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiExplainer from '../components/wmi/WmiExplainer'
import WmiVoteToggle from '../components/wmi/WmiVoteToggle'
import { getIllustration } from '../components/wmi/concepts/registry'
import { getThemePack } from '../components/wmi/track/themes'
import { buildTrackLesson, commitTrackLesson, gradeConceptAnswer, submitConceptVote } from '../lib/wmiApi'
import { fetchGamificationSummary } from '../lib/gamificationApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import type {
  TrackLessonQuestion,
  TrackLessonResult,
  WmiKonsepGradeResult,
  WmiQuestion,
} from '../types/wmi'

// A track lesson question is a concept instance — adapt it to the shape
// WmiQuestionView renders (same as WmiKonsepSession's adaptConceptQuestion).
function adaptLessonQuestion(q: TrackLessonQuestion): WmiQuestion {
  return {
    id: q.instanceId,
    paper_id: '',
    number: 0,
    body_en: q.bodyEn,
    body_id: q.bodyId,
    answer_type: q.answerType,
    choices_en: q.choicesEn,
    choices_id: q.choicesId,
    figure_url: null,
    hint_en: null,
    hint_id: null,
    difficulty: null,
    // Refined authored breakdown (color-coded) when the concept has one.
    breakdown: q.breakdown,
  }
}

export default function TrackLesson() {
  const { trackId, focusSlug } = useParams()
  const location = useLocation()
  const { activeChildId } = useAuthStore()
  const preferredLang = useWmiStore((s) => s.preferredLang)
  const setPreferredLang = useWmiStore((s) => s.setPreferredLang)
  const navigate = useNavigate()

  // TrackMap threads the track's theme via router state; forest is the safe
  // default when navigated to bare.
  const themeKey = (location.state as { theme?: string } | null)?.theme ?? 'forest'
  const theme = useMemo(() => getThemePack(themeKey), [themeKey])

  const [questions, setQuestions] = useState<TrackLessonQuestion[]>([])
  const [lessonId, setLessonId] = useState<string | null>(null)
  // Banked answers, appended one-per-question as the kid taps Lanjut.
  const [answers, setAnswers] = useState<{ instanceId: string; selectedAnswer: string; recall: boolean }[]>([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)

  // Per-question feedback state (reset on every idx change).
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiKonsepGradeResult | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [gradeError, setGradeError] = useState(false)
  const gradingRef = useRef(false)

  // End-of-lesson commit state.
  const [result, setResult] = useState<TrackLessonResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (!activeChildId || !trackId || !focusSlug) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    buildTrackLesson(activeChildId, trackId, focusSlug)
      .then((d) => {
        if (cancelled) return
        setQuestions(d.questions)
        setLessonId(d.lessonId)
      })
      // A failed fetch is NOT "no questions exist" — show a retry state,
      // never a misleading empty-lesson message.
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, trackId, focusSlug, loadTick])

  // Fresh question → clear the previous verdict/selection.
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setGradeError(false)
  }, [idx])

  // Refresh/close guard while answers are in-flight (local state only).
  const guarded = !result && answers.length > 0
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
  const isLast = idx >= questions.length - 1

  // ── Grade one answer for immediate feedback (no progress write) ──
  async function handleAnswer(answer: string) {
    if (!current || !activeChildId || feedback || gradingRef.current) return
    gradingRef.current = true
    setSubmittingAnswer(true)
    setSelected(answer)
    setGradeError(false)
    try {
      const fb = await gradeConceptAnswer(activeChildId, current.instanceId, answer)
      setFeedback(fb)
    } catch {
      setGradeError(true)
    } finally {
      gradingRef.current = false
      setSubmittingAnswer(false)
    }
  }

  // ── Commit the whole lesson (authoritative level-up grade) ──
  async function finish(finalAnswers: { instanceId: string; selectedAnswer: string; recall: boolean }[]) {
    if (!activeChildId || !trackId || !focusSlug || !lessonId) return
    const childId = activeChildId
    setSubmitting(true)
    setSubmitError(false)
    try {
      const lessonResult = await commitTrackLesson(childId, trackId, focusSlug, lessonId, finalAnswers)
      setResult(lessonResult)
      if (lessonResult.xpEarned > 0 || lessonResult.coinsEarned > 0) {
        // A level-up awards rewards but the commit response carries no
        // balances — refresh the top stat strip. Fire-and-forget.
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
      // Answers stay banked — the kid taps "Coba lagi".
      setSubmitError(true)
    } finally { setSubmitting(false) }
  }

  // ── Bank the current answer, then advance or commit ──
  function handleLanjut() {
    if (!current || !feedback) return
    const newAnswers = [
      ...answers,
      { instanceId: current.instanceId, selectedAnswer: selected ?? '', recall: current.recall },
    ]
    setAnswers(newAnswers)
    if (!isLast) setIdx((i) => i + 1)
    else void finish(newAnswers)
  }

  // Flag the current question as good/bad (same as /belajar's vote).
  async function onVote(vote: 1 | -1) {
    if (activeChildId && current) await submitConceptVote(activeChildId, current.instanceId, vote)
  }

  // "Coba Lagi" on a failed result: pull a fresh lesson and reset all state.
  function retry() {
    setResult(null)
    setAnswers([])
    setIdx(0)
    setSelected(null)
    setFeedback(null)
    setSubmitError(false)
    setQuestions([])
    setLessonId(null)
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
            {/* Level-up reward chips — 0/0 on a repeat pass at an
                already-cleared level, so nothing renders */}
            {(result.xpEarned > 0 || result.coinsEarned > 0) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                {result.xpEarned > 0 && (
                  <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-blue px-4 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#0E1430]">
                    <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                    +{result.xpEarned} XP
                  </span>
                )}
                {result.coinsEarned > 0 && (
                  <span className="animate-reward-pop inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-4 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#B45309]">
                    <i className="fa-solid fa-coins text-qupu-brand-yellow" aria-hidden="true" />
                    +{result.coinsEarned} koin
                  </span>
                )}
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

  return (
    <div className="relative mx-auto w-full max-w-[28.75rem] p-4 pb-8">
      {/* Confetti on a correct pick — re-mount per question via key */}
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${idx}`} />}

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

      {/* Top row: close button + compact progress. */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton
          variant="close"
          onClick={() => {
            if (answers.length === 0 && !feedback) navigate(`/belajar/track/${trackId}`)
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

      <div className="space-y-4">
        {current.recall && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[0.6875rem] font-black text-[#30598A]">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
            Ulangan
          </span>
        )}

        <WmiQuestionView
          question={adaptLessonQuestion(current)}
          hideConceptTitle
          conceptIllustration={getIllustration(current.conceptSlug)}
          conceptIllustrationParams={current.params}
          selectedChoice={selected}
          highlight={
            feedback
              ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
              : undefined
          }
          disabled={Boolean(feedback) || submittingAnswer}
          initialLang={preferredLang}
          onPickChoice={handleAnswer}
          onSubmitFillIn={handleAnswer}
          onLookupTerm={() => {}}
          onRevealTranslation={() => {}}
          onUserToggleLanguage={setPreferredLang}
        />

        {/* Grading failed — keep the question interactive and say so */}
        {gradeError && !feedback && (
          <div className="rounded-[1.25rem] border-2 border-rose-200 bg-rose-50 p-3 text-center">
            <p className="text-sm font-bold text-rose-600">
              <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
              Jawaban belum terkirim. Coba lagi.
            </p>
            {selected && (
              <button
                type="button"
                onClick={() => void handleAnswer(selected)}
                disabled={submittingAnswer}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2 font-display text-sm font-black text-white shadow-[0_3px_0_0_#C46123] disabled:opacity-50 transition-transform active:translate-y-0.5"
              >
                <i className="fa-solid fa-rotate-right text-xs" aria-hidden="true" />
                Kirim lagi
              </button>
            )}
          </div>
        )}

        {/* Feedback (after answer): verdict → animated walkthrough → action */}
        {feedback && (
          <>
            <div
              className={`relative rounded-[1.5rem] border-2 p-4 pe-12 shadow-[0_5px_0_0_#FFD3B1] ${
                feedback.is_correct ? 'border-[#58A700]/40 bg-[#E8F5D6]' : 'border-rose-200 bg-rose-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${
                    feedback.is_correct ? 'bg-[#58A700]' : 'bg-rose-400'
                  }`}
                >
                  <i className={`fa-solid ${feedback.is_correct ? 'fa-check' : 'fa-xmark'} text-sm`} aria-hidden="true" />
                </span>
                <span className={`font-display font-black ${feedback.is_correct ? 'text-[#2D6B00]' : 'text-rose-600'}`}>
                  {feedback.is_correct ? 'Benar!' : 'Belum tepat'}
                </span>
              </div>
              {!feedback.is_correct && (
                <p className="mt-2 text-sm font-semibold text-rose-700">
                  Jawaban benar: <span className="font-black">{feedback.correct_answer}</span>
                </p>
              )}
              {(feedback.hint_id ?? feedback.hint_en) && (
                <p className="mt-2 text-xs font-semibold text-qupu-muted">
                  {feedback.hint_id ?? feedback.hint_en}
                </p>
              )}
              {/* Flag this question good/bad — same control as /belajar. */}
              <WmiVoteToggle onVote={onVote} />
            </div>

            {/* Animated step-by-step walkthrough — self-hides when the concept
                has no explainer registered. */}
            <WmiExplainer
              slug={current.conceptSlug}
              params={current.params}
              correctAnswer={feedback.correct_answer}
              lang={preferredLang}
            />

            {submitError && (
              <p className="text-center text-xs font-semibold text-rose-600">
                <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
                Gagal menyimpan latihan. Coba lagi.
              </p>
            )}
            {answers.length >= questions.length ? (
              // Final answer banked — commit / loading / retry only.
              <button
                type="button"
                onClick={() => void finish(answers)}
                disabled={submitting}
                className="w-full rounded-full bg-[#58A700] py-3 font-display font-black text-white shadow-[0_3px_0_0_#3C7400] disabled:opacity-50 transition-transform active:translate-y-0.5"
              >
                {submitting ? 'Memeriksa…' : submitError ? 'Coba lagi' : 'Selesaikan Latihan'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLanjut}
                className="w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
              >
                {isLast ? 'Selesai' : 'Lanjut'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
