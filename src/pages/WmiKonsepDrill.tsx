// src/pages/WmiKonsepDrill.tsx
//
// /wmi-arena/campur — "Latihan Campur". A bounded round of 10 mixed-concept
// questions that mirrors the Belajar session answering experience: green
// progress bar, illustration inside the question card, the Benar!/Belum tepat
// feedback card, the animated "Penjelasan" walkthrough (WmiExplainer) when one
// exists, confetti on correct, a Lanjut flow, and an end-of-round summary.
//
// Unlike the Belajar chapter session this is per-answer scored (each answer
// banks its own reward via submitConceptAttempt) — there is no chapter-keyed
// session commit, so the summary tallies the coins/XP earned across the round
// rather than running the staged growth ceremony. `?concept=<slug>` drills one
// specific concept for the whole round; otherwise the grade's concepts are
// mixed (the engine picks each question).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import WmiQuestionView from '../components/wmi/WmiQuestionView'
import WmiVoteToggle from '../components/wmi/WmiVoteToggle'
import WmiExplainer from '../components/wmi/WmiExplainer'
import KonsepConfetti from '../components/wmi/KonsepConfetti'
import { getIllustration } from '../components/wmi/concepts/registry'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { fetchConceptNext, submitConceptAttempt, submitConceptVote } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { syncStatStrip } from '../hooks/useGamificationStats'
import { useWmiStore } from '../store/wmiStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type { WmiAttemptResult, WmiConceptQuestion, WmiQuestion } from '../types/wmi'

const ROUND_SIZE = 10

export default function WmiKonsepDrill() {
  useDocumentTitle('Latihan Campur')
  const { activeChildId } = useAuthStore()
  const { loadGlossary, selectedGrade, preferredLang, setPreferredLang } = useWmiStore()
  // Konsep drills exist for grades 1-3 only (grade 0 is just for the papers
  // page) — clamp like BelajarPath's clampGardenGrade so a stale grade-0 pin
  // can't request a grade the engine has no concepts for.
  const drillGrade = (selectedGrade < 1 ? 1 : selectedGrade > 3 ? 3 : selectedGrade) as typeof selectedGrade
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // When present, drill this specific concept (tapped from the catalog) for the
  // whole round rather than a random mix.
  const conceptSlug = searchParams.get('concept') ?? undefined

  // Round state
  const [round, setRound] = useState(0) // bumped on "Main lagi" to re-arm the fetch
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [done, setDone] = useState(false)

  // Per-question state
  const [question, setQuestion] = useState<WmiConceptQuestion | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<WmiAttemptResult | null>(null)
  const [questionLang, setQuestionLang] = useState<'en' | 'id'>(preferredLang)
  const [error, setError] = useState<string | null>(null)
  const askedAt = useRef(Date.now())
  const submittingRef = useRef(false)

  useEffect(() => { loadGlossary().catch(() => {}) }, [loadGlossary])

  const loadQuestion = useCallback(async () => {
    if (!activeChildId) return
    setSelected(null)
    setFeedback(null)
    setQuestionLang(useWmiStore.getState().preferredLang)
    setError(null)
    setQuestion(null)
    try {
      const q = await fetchConceptNext(activeChildId, drillGrade, conceptSlug)
      setQuestion(q)
      askedAt.current = Date.now()
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'Gagal memuat soal'))
    }
  }, [activeChildId, drillGrade, conceptSlug])

  // Fetch the question for the current slot. Re-runs on idx (Lanjut) and round
  // (Main lagi); never while the summary is up.
  useEffect(() => {
    if (done) return
    void loadQuestion()
  }, [idx, round, loadQuestion, done])

  function handleBack() {
    if (location.key === 'default') navigate('/wmi-arena')
    else navigate(-1)
  }

  function restart() {
    setResults([])
    setCoinsEarned(0)
    setXpEarned(0)
    setIdx(0)
    setDone(false)
    setRound((r) => r + 1)
  }

  const submit = async (answer: string) => {
    if (!activeChildId || !question || feedback || submittingRef.current) return
    submittingRef.current = true
    setSelected(answer)
    try {
      const saved = await submitConceptAttempt({
        childId: activeChildId,
        concept_instance_id: question.concept_instance_id,
        mode: 'concept',
        selected_answer: answer,
        time_taken_ms: Date.now() - askedAt.current,
      })
      setFeedback(saved)
      setResults((prev) => [...prev, saved.is_correct])
      // Per-answer reward is banked server-side; mirror it into the top strip
      // and tally it for the round summary. Stamped with the answering child.
      if (saved.gamification) {
        setCoinsEarned((c) => c + (saved.gamification?.coinsEarned ?? 0))
        setXpEarned((x) => x + (saved.gamification?.xpEarned ?? 0))
        syncStatStrip(activeChildId, {
          streak: saved.gamification.streak.current,
          coinBalance: saved.gamification.coinBalance,
          level: saved.gamification.level,
          tierName: saved.gamification.tierName,
        })
      }
    } catch (err) {
      setSelected(null)
      setError(toIndonesianErrorMessage(err, 'Gagal menyimpan jawaban'))
    } finally {
      submittingRef.current = false
    }
  }

  const handleLanjut = () => {
    if (!feedback) return
    if (idx < ROUND_SIZE - 1) setIdx((i) => i + 1)
    else setDone(true)
  }

  const onVote = async (vote: 1 | -1) => {
    if (!activeChildId || !question) return
    await submitConceptVote(activeChildId, question.concept_instance_id, vote)
  }

  const hint = useMemo(() => {
    if (!feedback) return null
    return questionLang === 'id' ? feedback.hint_id ?? feedback.hint_en : feedback.hint_en ?? feedback.hint_id
  }, [feedback, questionLang])

  // ── No active child ────────────────────────────────────────────────────────
  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-[460px] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-child-reaching text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">Pilih profil anak dulu untuk mulai latihan.</p>
      </div>
    )
  }

  // ── Round summary ──────────────────────────────────────────────────────────
  if (done) {
    const correct = results.filter(Boolean).length
    return (
      <div className="relative mx-auto w-full max-w-[460px] p-6">
        {correct >= 6 && <KonsepConfetti key={`summary-${round}`} />}
        <div className="rounded-[1.75rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-yellow/30 text-3xl text-qupu-brand-orange ring-4 ring-qupu-brand-yellow/50">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black text-qupu-brand-blue">Sesi selesai!</h1>
          <p className="mt-1 font-display text-lg font-black text-[#58A700]">
            {correct} / {ROUND_SIZE} benar
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-black text-qupu-brand-blue ring-1 ring-[#FFE3CC]">
              <i className="fa-solid fa-coins text-qupu-brand-yellow" aria-hidden="true" />
              +{coinsEarned}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-black text-qupu-brand-blue ring-1 ring-[#FFE3CC]">
              <i className="fa-solid fa-star text-qupu-brand-orange" aria-hidden="true" />
              +{xpEarned} XP
            </span>
          </div>

          <button
            type="button"
            onClick={restart}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            </span>
            Main lagi
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="mt-2 w-full rounded-full bg-white py-3 font-display text-sm font-black text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  // ── Active round ───────────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-8">
      {feedback?.is_correct && <KonsepConfetti key={`confetti-${round}-${idx}`} />}

      {/* Top row: close + green progress bar + counter (mirrors Belajar session) */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Keluar"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1E4CC]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + 1) / ROUND_SIZE) * 100}%`,
              background: 'linear-gradient(90deg, #6BCC2A 0%, #58A700 100%)',
            }}
          />
        </div>
        <span className="font-display text-xs font-black text-qupu-brand-blue">
          {idx + 1} / {ROUND_SIZE}
        </span>
      </div>

      <div className="mt-4">
        {error ? (
          <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-wifi text-xl" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-qupu-muted">{error}</p>
            <button
              type="button"
              onClick={() => void loadQuestion()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        ) : !question ? (
          <QuestionSkeleton />
        ) : (
          <div className="space-y-4">
            <WmiQuestionView
              question={adaptConceptQuestion(question)}
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
              onPickChoice={submit}
              onSubmitFillIn={submit}
              onLookupTerm={() => {}}
              onRevealTranslation={() => {}}
              onLanguageChange={setQuestionLang}
              onUserToggleLanguage={setPreferredLang}
            />

            {feedback && (
              <>
                {/* Verdict */}
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
                  <WmiVoteToggle onVote={onVote} />
                </div>

                {/* Animated walkthrough — self-hides when no explainer exists */}
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
                  {idx < ROUND_SIZE - 1 ? 'Lanjut' : 'Selesai'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Adapt the concept question to WmiQuestionView's expected props.
function adaptConceptQuestion(question: WmiConceptQuestion): WmiQuestion {
  return {
    id: question.concept_instance_id,
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

function QuestionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-[1.5rem] border-2 border-qupu-peach bg-white p-4 shadow-[0_5px_0_0_#FFD3B1]">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-3 h-6 w-4/5 animate-pulse rounded-full bg-qupu-cream" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[1.25rem] bg-qupu-cream" />
          ))}
        </div>
      </div>
    </div>
  )
}
