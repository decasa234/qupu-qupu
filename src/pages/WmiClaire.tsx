// src/pages/WmiClaire.tsx
//
// /latihan/wmi/claire — "WMI Claire". A niche, temporary warmup mode for a
// single finalist, gated (server + card) to one parent account. A bounded
// 10-question round drawn from the hardest grade-2 concepts, always freshly
// generated. Fully isolated: no XP/coins/quests/garden — the only persistence
// is the round + score, surfaced back here as a history so a parent can review.
//
// Landing (Mulai + history) → round (per-question feedback + explainer) →
// summary (score + Main lagi). Questions are fetched once at round start.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiExplainer from '../components/wmi/WmiExplainer'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { getIllustration } from '../components/wmi/concepts/registry'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { claireStart, claireAnswer, claireHistory, claireRoundReview } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type {
  WmiClaireAnswerResult,
  WmiClaireQuestion,
  WmiClaireRoundReview,
  WmiClaireRoundSummary,
  WmiQuestion,
} from '../types/wmi'

type Phase = 'landing' | 'loading' | 'round' | 'done'

export default function WmiClaire() {
  useDocumentTitle('WMI Claire')
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const preferredLang = useWmiStore((s) => s.preferredLang)
  const setPreferredLang = useWmiStore((s) => s.setPreferredLang)

  const [phase, setPhase] = useState<Phase>('landing')
  const [roundId, setRoundId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<WmiClaireQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [finalScore, setFinalScore] = useState(0)

  // Per-question state
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiClaireAnswerResult | null>(null)
  const [questionLang, setQuestionLang] = useState<'en' | 'id'>(preferredLang)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const [history, setHistory] = useState<WmiClaireRoundSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  // What to run when the exit confirm is accepted — set per exit trigger (the
  // X goes back to the landing; browser-back leaves to /belajar).
  const pendingExitRef = useRef<null | (() => void)>(null)

  const requestExit = (action: () => void) => {
    if (phase === 'round' && results.length > 0) {
      pendingExitRef.current = action
      setShowExitConfirm(true)
    } else {
      action()
    }
  }

  // Expandable per-round review (mistakes), lazily fetched + cached by round id.
  const [openReviewId, setOpenReviewId] = useState<string | null>(null)
  const [reviewCache, setReviewCache] = useState<Record<string, WmiClaireRoundReview>>({})
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null)

  const toggleReview = useCallback(
    async (roundId: string) => {
      if (openReviewId === roundId) {
        setOpenReviewId(null)
        return
      }
      setOpenReviewId(roundId)
      if (reviewCache[roundId] || !activeChildId) return
      setReviewLoadingId(roundId)
      try {
        const review = await claireRoundReview(activeChildId, roundId)
        setReviewCache((prev) => ({ ...prev, [roundId]: review }))
      } catch {
        setOpenReviewId(null)
      } finally {
        setReviewLoadingId(null)
      }
    },
    [openReviewId, reviewCache, activeChildId],
  )

  const loadHistory = useCallback(async () => {
    if (!activeChildId) return
    setLoadingHistory(true)
    try {
      setHistory(await claireHistory(activeChildId))
    } catch {
      /* history is non-critical — leave the last known list */
    } finally {
      setLoadingHistory(false)
    }
  }, [activeChildId])

  useEffect(() => {
    if (phase === 'landing') void loadHistory()
  }, [phase, loadHistory])

  const startRound = useCallback(async () => {
    if (!activeChildId) return
    setPhase('loading')
    setError(null)
    try {
      const { roundId: id, questions: qs } = await claireStart(activeChildId)
      setRoundId(id)
      setQuestions(qs)
      setIdx(0)
      setResults([])
      setFinalScore(0)
      setSelected(null)
      setFeedback(null)
      setQuestionLang(useWmiStore.getState().preferredLang)
      setPhase('round')
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memulai warmup.'))
      setPhase('landing')
    }
  }, [activeChildId])

  // Refresh/close guard mid-round (local progress only).
  const guardActive = phase === 'round' && results.length > 0
  useEffect(() => {
    if (!guardActive) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [guardActive])

  // Browser/hardware back mid-round: trap it with a sentinel history entry and
  // ask for confirmation (BrowserRouter has no useBlocker). Accepting leaves to
  // /belajar; cancelling stays put (the sentinel keeps us on the page).
  useEffect(() => {
    if (!guardActive) return
    window.history.pushState(null, '', window.location.href)
    const onPop = () => {
      pendingExitRef.current = () => navigate('/belajar')
      setShowExitConfirm(true)
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [guardActive, navigate])

  const submit = async (answer: string) => {
    if (!activeChildId || !roundId || feedback || submittingRef.current) return
    const question = questions[idx]
    if (!question) return
    submittingRef.current = true
    setSelected(answer)
    try {
      const fb = await claireAnswer(activeChildId, roundId, question.index, answer)
      setFeedback(fb)
      setResults((prev) => [...prev, fb.is_correct])
      if (fb.done && fb.score !== null) setFinalScore(fb.score)
    } catch (err) {
      // Keep `selected` so the ErrorRetry below can resubmit the same answer.
      setError(toIndonesianErrorMessage(err, 'Gagal menyimpan jawaban.'))
    } finally {
      submittingRef.current = false
    }
  }

  const handleLanjut = () => {
    if (!feedback) return
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1)
      setSelected(null)
      setFeedback(null)
      setError(null)
    } else {
      setPhase('done')
    }
  }

  const hint = useMemo(() => {
    if (!feedback) return null
    return questionLang === 'id'
      ? feedback.hint_id ?? feedback.hint_en
      : feedback.hint_en ?? feedback.hint_id
  }, [feedback, questionLang])

  // ── No active child ────────────────────────────────────────────────────────
  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-child-reaching text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">
          Pilih profil anak dulu untuk mulai warmup.
        </p>
      </div>
    )
  }

  // ── Landing (start + history) ───────────────────────────────────────────────
  if (phase === 'landing' || phase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-4 pb-10">
        <div className="mb-3 flex items-center gap-3 px-1">
          <BackButton />
          <h1 className="font-display text-xl font-black text-qupu-brand-blue">WMI Claire</h1>
        </div>

        <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-blue/10 text-3xl text-qupu-brand-blue ring-4 ring-qupu-brand-blue/15">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
            Warmup Final
          </h2>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            10 soal pilihan tersulit — selalu baru. Latih cara berpikir sebelum final.
          </p>
          <button
            type="button"
            onClick={startRound}
            disabled={phase === 'loading'}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 disabled:opacity-60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
              <i className={`fa-solid ${phase === 'loading' ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" />
            </span>
            {phase === 'loading' ? 'Menyiapkan…' : 'Mulai Warmup'}
          </button>
          {error && <p className="mt-3 text-xs font-bold text-rose-600">{error}</p>}
        </div>

        {/* Mock exam — full 25-question simulation */}
        <button
          type="button"
          onClick={() => navigate('/latihan/wmi/claire/mock')}
          className="mt-4 flex w-full items-center gap-3 rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 text-left shadow-[0_4px_0_0_#FFD3B1] transition-transform active:translate-y-0.5"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-qupu-brand-orange/10 text-lg text-qupu-brand-orange">
            <i className="fa-solid fa-file-pen" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-black text-qupu-brand-blue">
              Mock Exam
            </span>
            <span className="text-xs font-semibold text-qupu-muted">
              25 soal simulasi ujian (Final / Semifinal)
            </span>
          </span>
          <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/70" aria-hidden="true" />
        </button>

        {/* History for parents */}
        <div className="mt-6">
          <h3 className="px-1 font-display text-sm font-black text-qupu-brand-blue">
            Riwayat Latihan
          </h3>
          {loadingHistory && history.length === 0 ? (
            <div className="mt-2 space-y-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 rounded-[1.25rem]" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="mt-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum ada riwayat. Selesaikan satu ronde untuk mulai mencatat skor.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((r) => {
                const open = openReviewId === r.id
                const review = reviewCache[r.id]
                return (
                  <li
                    key={r.id}
                    className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_3px_0_0_#FFD3B1] ring-1 ring-[#FFE3CC]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleReview(r.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-transform active:translate-y-0.5"
                    >
                      <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-black ${
                          (r.score ?? 0) >= 6 ? 'bg-[#E8F5D6] text-[#2D6B00]' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {r.score ?? 0}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm font-black text-qupu-brand-blue">
                          {r.score ?? 0} / {r.total} benar
                        </span>
                        <span className="text-[0.6875rem] font-bold text-qupu-muted">
                          {formatWhen(r.completed_at ?? r.created_at)}
                        </span>
                      </span>
                      <i
                        className={`fa-solid fa-chevron-down flex-shrink-0 text-xs text-qupu-muted/70 transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    {open && (
                      <div className="border-t border-[#FFE3CC] px-3 py-3">
                        {reviewLoadingId === r.id && !review ? (
                          <div className="space-y-2" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                              <Skeleton key={i} className="h-14 rounded-[1rem]" />
                            ))}
                          </div>
                        ) : review ? (
                          <ReviewList review={review} />
                        ) : (
                          <p className="text-xs font-semibold text-qupu-muted">Gagal memuat rincian.</p>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    // Per-concept report: results[i] is the verdict for questions[i] (answered
    // in order). Concepts in a round are distinct, so one chip per concept.
    const perConcept = questions.map((q, i) => ({
      name: q.concept_name_id,
      correct: results[i] ?? false,
    }))
    const good = perConcept.filter((p) => p.correct)
    const wrong = perConcept.filter((p) => !p.correct)
    return (
      <div className="relative mx-auto w-full max-w-[28.75rem] p-6">
        {finalScore >= 6 && <KonsepConfetti key={`summary-${roundId}`} />}
        <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-yellow/30 text-3xl text-qupu-brand-orange ring-4 ring-qupu-brand-yellow/50">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Selesai!</h1>
          <p className="mt-1 font-display text-lg font-black text-[#58A700]">
            {finalScore} / {questions.length} benar
          </p>

          {/* Per-concept report */}
          <div className="mt-5 space-y-3 text-left">
            {good.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-black text-[#2D6B00]">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Sudah bagus
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {good.map((p, i) => (
                    <span
                      key={`g-${i}`}
                      className="rounded-full bg-[#E8F5D6] px-2.5 py-1 text-[0.6875rem] font-bold text-[#2D6B00]"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {wrong.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-black text-rose-600">
                  <i className="fa-solid fa-circle-xmark" aria-hidden="true" /> Perlu latihan
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {wrong.map((p, i) => (
                    <span
                      key={`w-${i}`}
                      className="rounded-full bg-rose-50 px-2.5 py-1 text-[0.6875rem] font-bold text-rose-600"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={startRound}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            </span>
            Main lagi
          </button>
          <button
            type="button"
            onClick={() => setPhase('landing')}
            className="mt-2 w-full rounded-full bg-white py-3 font-display text-sm font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  // ── Active round ───────────────────────────────────────────────────────────
  const question = questions[idx]
  return (
    <div className="relative mx-auto w-full max-w-[28.75rem] pb-8">
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${roundId}-${idx}`} />}

      <ConfirmModal
        open={showExitConfirm}
        title="Keluar warmup?"
        message="Progres ronde ini akan hilang kalau keluar sekarang."
        cancelLabel="Lanjut"
        confirmLabel="Keluar"
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false)
          const action = pendingExitRef.current
          pendingExitRef.current = null
          ;(action ?? (() => setPhase('landing')))()
        }}
      />

      <div className="mb-3 flex items-center gap-3 px-1">
        <BackButton variant="close" onClick={() => requestExit(() => setPhase('landing'))} />
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

      <div className="mt-4">
        {error ? (
          <ErrorRetry
            message={error}
            onRetry={() => {
              setError(null)
              if (selected) void submit(selected)
            }}
          />
        ) : !question ? (
          <QuestionSkeleton />
        ) : (
          <div className="space-y-4">
            <WmiQuestionView
              question={adaptClaireQuestion(question, roundId)}
              hideConceptTitle
              conceptIllustration={getIllustration(question.concept_slug)}
              conceptIllustrationParams={question.params}
              selectedChoice={selected}
              highlight={
                feedback
                  ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
                  : undefined
              }
              disabled={Boolean(feedback)}
              initialLang={preferredLang}
              numericFillIn={question.numeric_answer}
              onPickChoice={submit}
              onSubmitFillIn={submit}
              onLookupTerm={() => {}}
              onRevealTranslation={() => {}}
              onLanguageChange={setQuestionLang}
              onUserToggleLanguage={setPreferredLang}
            />

            {feedback && (
              <>
                <div
                  className={`relative rounded-[1.5rem] border-2 p-4 shadow-[0_5px_0_0_#FFD3B1] ${
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
                  {hint && <p className="mt-2 text-xs font-semibold text-qupu-muted">{hint}</p>}
                </div>

                <WmiExplainer
                  slug={question.concept_slug}
                  params={question.params}
                  correctAnswer={feedback.correct_answer}
                  lang={questionLang}
                />

                <button
                  type="button"
                  onClick={handleLanjut}
                  className="w-full rounded-full bg-qupu-brand-blue py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
                >
                  {idx < questions.length - 1 ? 'Lanjut' : 'Selesai'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

// Adapt the Claire question to WmiQuestionView's expected props.
function adaptClaireQuestion(question: WmiClaireQuestion, roundId: string | null): WmiQuestion {
  return {
    id: `${roundId ?? 'claire'}-${question.index}`,
    paper_id: '',
    number: 0,
    body_en: question.body_en,
    body_id: question.body_id,
    answer_type: question.answer_type,
    choices_en: question.choices_en,
    choices_id: question.choices_id,
    figure_url: null,
    hint_en: question.hint_en,
    hint_id: question.hint_id,
    difficulty: null,
    breakdown: question.breakdown ?? null,
  }
}

function ReviewList({ review }: { review: WmiClaireRoundReview }) {
  return (
    <ul className="space-y-2">
      {review.items.map((it) => {
        const wrong = it.is_correct === false
        return (
          <li
            key={it.index}
            className={`rounded-[1rem] border p-3 ${
              wrong ? 'border-rose-200 bg-rose-50' : 'border-[#DCEFC6] bg-[#F3FAEA]'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.625rem] text-white ${
                  wrong ? 'bg-rose-400' : 'bg-[#58A700]'
                }`}
              >
                <i className={`fa-solid ${wrong ? 'fa-xmark' : 'fa-check'}`} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.625rem] font-black uppercase tracking-wide text-qupu-muted">
                  {it.concept_name_id}
                </p>
                <p className="mt-0.5 whitespace-pre-line text-xs font-semibold text-qupu-brand-blue">
                  {it.body_id}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] font-bold">
                  {wrong && <span className="text-rose-600">Jawab: {it.selected ?? '—'}</span>}
                  <span className="text-[#2D6B00]">Benar: {it.correct_answer}</span>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function QuestionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-3 h-6 w-4/5" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    </div>
  )
}
