// src/pages/WmiClaireMock.tsx
//
// /latihan/wmi/claire/mock — "Mock Exam" for WMI Claire. Assembles a fresh
// 25-question mock final from real WMI Final/Semifinal Grade-2 questions
// (15 Paper A multiple_choice + 10 Paper B fill_in), round-robin per child so a
// new set comes up each time. Drill-style: reveals the verdict + explainer on
// answering (like the concept drill), then Lanjut to the next. Fully isolated
// (its own tables, no XP/progress). Questions render identically to a real paper
// (figures included) because they ARE paper questions, minus the withheld answer.
//
// Landing (round filter + Mulai + history) → exam (Soal X/25, part A/B, reveal
// on answer) → summary (score + A/B + review).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ConfirmModal from '../components/ConfirmModal'
import Skeleton from '../components/Skeleton'
import ErrorRetry from '../components/ErrorRetry'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { mockStart, mockAnswer, mockHistory, mockReview } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type {
  WmiMockAnswerResult,
  WmiMockExamSummary,
  WmiMockQuestion,
  WmiMockReview,
  WmiMockRound,
} from '../types/wmi'

type Phase = 'landing' | 'loading' | 'exam' | 'done'

const ROUND_LABEL: Record<WmiMockRound, string> = { final: 'Final', semifinal: 'Semifinal' }

export default function WmiClaireMock() {
  useDocumentTitle('Mock Exam · WMI Claire')
  const navigate = useNavigate()
  const { activeChildId } = useAuthStore()
  const preferredLang = useWmiStore((s) => s.preferredLang)
  const setPreferredLang = useWmiStore((s) => s.setPreferredLang)

  const [phase, setPhase] = useState<Phase>('landing')
  const [round, setRound] = useState<WmiMockRound>('final')
  const [examId, setExamId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<WmiMockQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [finalScore, setFinalScore] = useState(0)

  // Per-question state (drill-style reveal).
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiMockAnswerResult | null>(null)
  const [questionLang, setQuestionLang] = useState<'en' | 'id'>(preferredLang)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const [history, setHistory] = useState<WmiMockExamSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const pendingExitRef = useRef<null | (() => void)>(null)

  // Final summary/history review (fetched by exam id).
  const [review, setReview] = useState<WmiMockReview | null>(null)
  const [openReviewId, setOpenReviewId] = useState<string | null>(null)
  const [reviewCache, setReviewCache] = useState<Record<string, WmiMockReview>>({})
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null)

  const requestExit = (action: () => void) => {
    if (phase === 'exam' && results.length > 0) {
      pendingExitRef.current = action
      setShowExitConfirm(true)
    } else {
      action()
    }
  }

  const toggleReview = useCallback(
    async (id: string) => {
      if (openReviewId === id) {
        setOpenReviewId(null)
        return
      }
      setOpenReviewId(id)
      if (reviewCache[id] || !activeChildId) return
      setReviewLoadingId(id)
      try {
        const r = await mockReview(activeChildId, id)
        setReviewCache((prev) => ({ ...prev, [id]: r }))
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
      setHistory(await mockHistory(activeChildId))
    } catch {
      /* non-critical */
    } finally {
      setLoadingHistory(false)
    }
  }, [activeChildId])

  useEffect(() => {
    if (phase === 'landing') void loadHistory()
  }, [phase, loadHistory])

  const startExam = useCallback(async () => {
    if (!activeChildId) return
    setPhase('loading')
    setError(null)
    try {
      const { examId: id, questions: qs } = await mockStart(activeChildId, round)
      setExamId(id)
      setQuestions(qs)
      setIdx(0)
      setResults([])
      setFinalScore(0)
      setSelected(null)
      setFeedback(null)
      setQuestionLang(useWmiStore.getState().preferredLang)
      setReview(null)
      setPhase('exam')
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memulai mock exam.'))
      setPhase('landing')
    }
  }, [activeChildId, round])

  // Refresh/close + browser-back guard mid-exam (server persists answers, but a
  // reload loses local position — confirm before leaving).
  const guardActive = phase === 'exam' && results.length > 0
  useEffect(() => {
    if (!guardActive) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [guardActive])

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

  // Drill-style: record the answer, reveal the verdict + explainer. The final
  // response carries the score (done=true); we surface it on Lanjut.
  const submit = async (answer: string) => {
    if (!activeChildId || !examId || feedback || submittingRef.current) return
    const question = questions[idx]
    if (!question) return
    submittingRef.current = true
    setSelected(answer)
    setError(null)
    try {
      const fb = await mockAnswer(activeChildId, examId, question.index, answer)
      setFeedback(fb)
      setResults((prev) => [...prev, fb.is_correct])
      if (fb.done && fb.score !== null) setFinalScore(fb.score)
    } catch (err) {
      // Keep `selected` so ErrorRetry can resubmit the same answer.
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
      if (activeChildId && examId) {
        void mockReview(activeChildId, examId).then(setReview).catch(() => {})
      }
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
          Pilih profil anak dulu untuk mulai mock exam.
        </p>
      </div>
    )
  }

  // ── Landing (round filter + start + history) ────────────────────────────────
  if (phase === 'landing' || phase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[28.75rem] p-4 pb-10">
        <div className="mb-3 flex items-center gap-3 px-1">
          <BackButton />
          <h1 className="font-display text-xl font-black text-qupu-brand-blue">Mock Exam</h1>
        </div>

        <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange/10 text-3xl text-qupu-brand-orange ring-4 ring-qupu-brand-orange/15">
            <i className="fa-solid fa-file-pen" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">
            Simulasi Ujian
          </h2>
          <p className="mt-1 text-sm font-semibold text-qupu-muted">
            25 soal seperti ujian sungguhan — 15 Paper A + 10 Paper B. Tanpa bantuan sampai selesai.
          </p>

          {/* Round filter */}
          <div className="mt-4 flex gap-2">
            {(['final', 'semifinal'] as WmiMockRound[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRound(r)}
                aria-pressed={round === r}
                className={`flex-1 rounded-full py-2.5 font-display text-sm font-black transition-transform active:translate-y-0.5 ${
                  round === r
                    ? 'bg-qupu-brand-blue text-white shadow-[0_3px_0_0_#0E1430]'
                    : 'bg-qupu-shell text-qupu-muted ring-1 ring-[#FFE3CC]'
                }`}
              >
                {ROUND_LABEL[r]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={startExam}
            disabled={phase === 'loading'}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5 disabled:opacity-60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
              <i className={`fa-solid ${phase === 'loading' ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" />
            </span>
            {phase === 'loading' ? 'Menyiapkan…' : `Mulai Mock ${ROUND_LABEL[round]}`}
          </button>
          {error && <p className="mt-3 text-xs font-bold text-rose-600">{error}</p>}
        </div>

        {/* History for parents */}
        <div className="mt-6">
          <h3 className="px-1 font-display text-sm font-black text-qupu-brand-blue">
            Riwayat Mock Exam
          </h3>
          {loadingHistory && history.length === 0 ? (
            <div className="mt-2 space-y-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 rounded-[1.25rem]" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="mt-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum ada riwayat. Selesaikan satu mock exam untuk mulai mencatat skor.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((r) => {
                const open = openReviewId === r.id
                const rev = reviewCache[r.id]
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
                          (r.score ?? 0) >= r.total * 0.6
                            ? 'bg-[#E8F5D6] text-[#2D6B00]'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {r.score ?? 0}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm font-black text-qupu-brand-blue">
                          {r.score ?? 0} / {r.total} benar
                        </span>
                        <span className="text-[0.6875rem] font-bold text-qupu-muted">
                          {ROUND_LABEL[(r.round as WmiMockRound) ?? 'final'] ?? r.round} ·{' '}
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
                        {reviewLoadingId === r.id && !rev ? (
                          <div className="space-y-2" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                              <Skeleton key={i} className="h-14 rounded-[1rem]" />
                            ))}
                          </div>
                        ) : rev ? (
                          <ReviewList review={rev} />
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
    const total = questions.length
    const partA = review?.items.filter((it) => it.part === 'A') ?? []
    const partB = review?.items.filter((it) => it.part === 'B') ?? []
    const correctA = partA.filter((it) => it.is_correct).length
    const correctB = partB.filter((it) => it.is_correct).length
    const passed = finalScore >= total * 0.6
    return (
      <div className="relative mx-auto w-full max-w-[28.75rem] p-4 pb-10">
        {passed && <KonsepConfetti key={`summary-${examId}`} />}
        <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-yellow/30 text-3xl text-qupu-brand-orange ring-4 ring-qupu-brand-yellow/50">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Selesai!</h1>
          <p className="mt-1 font-display text-lg font-black text-[#58A700]">
            {finalScore} / {total} benar
          </p>

          {review && (
            <div className="mt-4 flex gap-2">
              <div className="flex-1 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5">
                <p className="text-[0.625rem] font-black uppercase tracking-wide text-qupu-muted">Paper A</p>
                <p className="font-display text-lg font-black text-qupu-brand-blue">
                  {correctA} / {partA.length}
                </p>
              </div>
              <div className="flex-1 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5">
                <p className="text-[0.625rem] font-black uppercase tracking-wide text-qupu-muted">Paper B</p>
                <p className="font-display text-lg font-black text-qupu-brand-blue">
                  {correctB} / {partB.length}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={startExam}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            </span>
            Mock exam baru
          </button>
          <button
            type="button"
            onClick={() => setPhase('landing')}
            className="mt-2 w-full rounded-full bg-white py-3 font-display text-sm font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Kembali
          </button>
        </div>

        {/* Full review */}
        <div className="mt-6">
          <h3 className="px-1 font-display text-sm font-black text-qupu-brand-blue">Pembahasan</h3>
          {review ? (
            <div className="mt-2">
              <ReviewList review={review} />
            </div>
          ) : (
            <div className="mt-2 space-y-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 rounded-[1rem]" />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Active exam ─────────────────────────────────────────────────────────────
  const question = questions[idx]
  return (
    <div className="relative mx-auto w-full max-w-[28.75rem] pb-8">
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${examId}-${idx}`} />}

      <ConfirmModal
        open={showExitConfirm}
        title="Keluar mock exam?"
        message="Progres ujian ini akan hilang kalau keluar sekarang."
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
              background: 'linear-gradient(90deg, #FFB35C 0%, #F5892E 100%)',
            }}
          />
        </div>
        <span className="font-display text-xs font-black text-qupu-brand-blue">
          {idx + 1} / {questions.length}
        </span>
      </div>

      {question && (
        <div className="mb-2 px-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-black ${
              question.part === 'A'
                ? 'bg-qupu-brand-blue/10 text-qupu-brand-blue'
                : 'bg-qupu-brand-orange/10 text-qupu-brand-orange'
            }`}
          >
            <i className="fa-solid fa-layer-group" aria-hidden="true" />
            Paper {question.part}
          </span>
        </div>
      )}

      <div className="mt-2">
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
              key={question.id}
              question={question}
              selectedChoice={selected}
              highlight={
                feedback
                  ? { correct: feedback.correct_answer, wrongPicked: feedback.is_correct ? null : selected }
                  : undefined
              }
              disabled={Boolean(feedback)}
              revealed={Boolean(feedback)}
              initialLang={preferredLang}
              // Pin language so reveal shows the explainer WITHOUT flipping the
              // question text to id (revealed would otherwise force 'id').
              previewLang={questionLang}
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

function ReviewList({ review }: { review: WmiMockReview }) {
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
                  Paper {it.part} · Soal {it.number}
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
